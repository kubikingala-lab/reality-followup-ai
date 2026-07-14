import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { generateLeadReply } from "./services/aiLead";
import { sendTransactionalEmail } from "./services/email";
import { createHeartbeatJob } from "./_core/heartbeat";
import { parse as parseCookie } from "cookie";
import { companyProfiles } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  crm: router({
    dashboard: protectedProcedure.query(({ ctx }) => db.getDashboard(ctx.user.id)),
    leadDetail: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const detail = await db.getLeadDetail(ctx.user.id, input.id);
      if (!detail) throw new TRPCError({ code: "NOT_FOUND", message: "Lead nebyl nalezen" });
      return detail;
    }),
    generateReply: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const detail = await db.getLeadDetail(ctx.user.id, input.id);
      if (!detail) throw new TRPCError({ code: "NOT_FOUND", message: "Lead nebyl nalezen" });
      const profile = await db.getProfile(ctx.user.id);
      const body = await generateLeadReply(detail.lead, profile.senderName);
      return { subject: `Re: Poptávka – ${detail.lead.propertyType}, ${detail.lead.location}`, body };
    }),
    sendReply: protectedProcedure.input(z.object({ id: z.number().int().positive(), subject: z.string().min(1).max(240), body: z.string().min(10).max(20000) })).mutation(async ({ ctx, input }) => {
      const detail = await db.getLeadDetail(ctx.user.id, input.id);
      if (!detail) throw new TRPCError({ code: "NOT_FOUND", message: "Lead nebyl nalezen" });
      const profile = await db.getProfile(ctx.user.id);
      if (!profile.senderEmail) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Nejprve nastavte ověřený e-mail odesílatele v Nastavení" });
      const result = await sendTransactionalEmail({ fromName: profile.senderName, fromEmail: profile.senderEmail, to: detail.lead.email, subject: input.subject, text: input.body });
      await db.recordSentEmail({ ownerId: ctx.user.id, leadId: input.id, kind: "initial_reply", subject: input.subject, body: input.body });
      return { success: true, messageId: result.id } as const;
    }),
    activateFollowUps: protectedProcedure.mutation(async ({ ctx }) => {
      const profile = await db.getProfile(ctx.user.id);
      if (profile.scheduleCronTaskUid) return { taskUid: profile.scheduleCronTaskUid, alreadyActive: true };
      const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
      const job = await createHeartbeatJob({ name: `reality-followups-${ctx.user.id}`, cron: "0 0 * * * *", path: "/api/scheduled/run-follow-ups", description: "Hodinová kontrola realitních follow-upů po 1, 3 a 7 dnech" }, sessionToken);
      await db.setProfileTaskUid(ctx.user.id, job.taskUid);
      return { taskUid: job.taskUid, alreadyActive: false };
    }),
    createLead: protectedProcedure.input(z.object({
      name: z.string().min(2).max(160),
      email: z.string().email().max(320),
      phone: z.string().min(5).max(64),
      location: z.string().min(2).max(180),
      propertyType: z.string().min(2).max(140),
      budget: z.string().min(1).max(140),
      lookingFor: z.string().min(3).max(4000),
      notes: z.string().max(4000).optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.createLead(ctx.user.id, { ...input, status: "new", isDemo: false });
      await notifyOwner({ title: "Nový realitní lead", content: `${input.name} hledá ${input.propertyType} v lokalitě ${input.location}. Kontakt: ${input.email}, ${input.phone}.` });
      return { id };
    }),
    updateStatus: protectedProcedure.input(z.object({
      id: z.number().int().positive(),
      status: z.enum(["new", "answered", "qualified", "meeting_scheduled", "lost"]),
    })).mutation(async ({ ctx, input }) => {
      await db.setLeadStatus(ctx.user.id, input.id, input.status);
      return { success: true } as const;
    }),
    recordClientReply: protectedProcedure.input(z.object({ id: z.number().int().positive(), body: z.string().min(1).max(10000) })).mutation(async ({ ctx, input }) => {
      await db.recordClientReply(ctx.user.id, input.id, input.body);
      return { success: true } as const;
    }),
    updateBranding: protectedProcedure.input(z.object({
      companyName: z.string().min(2).max(160),
      primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      senderName: z.string().min(2).max(160),
      senderEmail: z.string().email().max(320).or(z.literal("")).optional(),
    })).mutation(async ({ ctx, input }) => {
      await db.updateBranding(ctx.user.id, { ...input, senderEmail: input.senderEmail || null });
      return { success: true } as const;
    }),
    uploadLogo: protectedProcedure.input(z.object({
      fileName: z.string().min(1).max(180),
      mimeType: z.enum(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]),
      base64: z.string().min(1).max(4_000_000),
    })).mutation(async ({ ctx, input }) => {
      const bytes = Buffer.from(input.base64, "base64");
      if (bytes.byteLength > 2_000_000) throw new TRPCError({ code: "BAD_REQUEST", message: "Logo může mít maximálně 2 MB" });
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
      const key = `company-logos/${ctx.user.id}/${Date.now()}-${safeName}`;
      const uploaded = await storagePut(key, bytes, input.mimeType);
      const profile = await db.getProfile(ctx.user.id);
      await db.updateBranding(ctx.user.id, {
        companyName: profile.companyName,
        primaryColor: profile.primaryColor,
        senderName: profile.senderName,
        senderEmail: profile.senderEmail,
        logoUrl: uploaded.url,
        logoKey: uploaded.key,
      });
      return { url: uploaded.url };
    }),
    saveResendApiKey: protectedProcedure.input(z.object({
      apiKey: z.string().min(10),
    })).mutation(async ({ ctx, input }) => {
      const dbConnection = await db.getDb();
      if (!dbConnection) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await dbConnection.update(companyProfiles).set({ resendApiKey: input.apiKey }).where(eq(companyProfiles.ownerId, ctx.user.id));
      return { success: true };
    }),
    connectGoogleCalendar: protectedProcedure.mutation(async ({ ctx }) => {
      const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
      const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI;
      if (!clientId || !redirectUri) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Google Calendar není nakonfigurován" });
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/calendar&access_type=offline`;
      return { authUrl };
    }),
  }),
});

export type AppRouter = typeof appRouter;
