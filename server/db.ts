import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { communications, companyProfiles, InsertCommunication, InsertLead, InsertUser, leads, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function ensureCrmWorkspace(ownerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Databáze není dostupná");

  await db.insert(companyProfiles).values({ ownerId, licenseKey: "demo" }).onDuplicateKeyUpdate({
    set: { ownerId },
  });

  const demo = await db.select({ id: leads.id }).from(leads).where(and(eq(leads.ownerId, ownerId), eq(leads.isDemo, true))).limit(1);
  if (!demo.length) {
    await db.insert(leads).values({
      ownerId,
      name: "Petr Novák",
      email: "petr.novak@email.cz",
      phone: "777 123 456",
      location: "Praha",
      propertyType: "byt 2+kk",
      budget: "do 7 000 000 Kč",
      lookingFor: "Chtěl by koupit byt pro sebe.",
      notes: "Ideálně do konce letošního roku.",
      status: "new",
      isDemo: true,
    });
  }
}

export async function getDashboard(ownerId: number) {
  await ensureCrmWorkspace(ownerId);
  const db = await getDb();
  if (!db) throw new Error("Databáze není dostupná");
  const [profile] = await db.select().from(companyProfiles).where(eq(companyProfiles.ownerId, ownerId)).limit(1);
  const allLeads = await db.select().from(leads).where(eq(leads.ownerId, ownerId)).orderBy(desc(leads.createdAt));
  return { profile, leads: allLeads };
}

export async function getLeadDetail(ownerId: number, leadId: number) {
  const db = await getDb();
  if (!db) throw new Error("Databáze není dostupná");
  const [lead] = await db.select().from(leads).where(and(eq(leads.id, leadId), eq(leads.ownerId, ownerId))).limit(1);
  if (!lead) return null;
  const history = await db.select().from(communications).where(and(eq(communications.leadId, leadId), eq(communications.ownerId, ownerId))).orderBy(asc(communications.createdAt));
  return { lead, history };
}

export async function createLead(ownerId: number, data: Omit<InsertLead, "ownerId">) {
  const db = await getDb();
  if (!db) throw new Error("Databáze není dostupná");
  const result = await db.insert(leads).values({ ...data, ownerId });
  return Number(result[0].insertId);
}

export async function setLeadStatus(ownerId: number, leadId: number, status: "new" | "answered" | "qualified" | "meeting_scheduled" | "lost") {
  const db = await getDb();
  if (!db) throw new Error("Databáze není dostupná");
  await db.update(leads).set({ status }).where(and(eq(leads.id, leadId), eq(leads.ownerId, ownerId)));
}

export async function addCommunication(data: InsertCommunication) {
  const db = await getDb();
  if (!db) throw new Error("Databáze není dostupná");
  await db.insert(communications).values(data);
}

export async function recordClientReply(ownerId: number, leadId: number, body: string) {
  const db = await getDb();
  if (!db) throw new Error("Databáze není dostupná");
  const now = new Date();
  await db.transaction(async tx => {
    await tx.update(leads).set({ clientRepliedAt: now, status: "qualified" }).where(and(eq(leads.id, leadId), eq(leads.ownerId, ownerId)));
    await tx.insert(communications).values({ ownerId, leadId, direction: "inbound", kind: "manual", body, deliveryStatus: "received", sentAt: now });
  });
}

export async function updateBranding(ownerId: number, data: { companyName: string; primaryColor: string; senderName: string; senderEmail?: string | null; logoUrl?: string | null; logoKey?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Databáze není dostupná");
  await ensureCrmWorkspace(ownerId);
  await db.update(companyProfiles).set(data).where(eq(companyProfiles.ownerId, ownerId));
}

export async function getProfile(ownerId: number) {
  await ensureCrmWorkspace(ownerId);
  const db = await getDb();
  if (!db) throw new Error("Databáze není dostupná");
  return (await db.select().from(companyProfiles).where(eq(companyProfiles.ownerId, ownerId)).limit(1))[0];
}

export async function getProfileByTaskUid(taskUid: string) {
  const db = await getDb();
  if (!db) throw new Error("Databáze není dostupná");
  return (await db.select().from(companyProfiles).where(eq(companyProfiles.scheduleCronTaskUid, taskUid)).limit(1))[0];
}

export async function setProfileTaskUid(ownerId: number, taskUid: string) {
  const db = await getDb();
  if (!db) throw new Error("Databáze není dostupná");
  await db.update(companyProfiles).set({ scheduleCronTaskUid: taskUid }).where(eq(companyProfiles.ownerId, ownerId));
}

export async function recordSentEmail(input: { ownerId: number; leadId: number; subject: string; body: string; kind: "initial_reply" | "follow_up" | "manual"; followUpDay?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Databáze není dostupná");
  const now = new Date();
  await db.transaction(async tx => {
    const leadUpdate: Partial<typeof leads.$inferInsert> = { lastOutboundAt: now };
    if (input.kind === "initial_reply") {
      leadUpdate.followUpStartedAt = now;
      leadUpdate.status = "answered";
    }
    if (input.kind === "follow_up" && input.followUpDay) {
      if (input.followUpDay >= 1) leadUpdate.followUp1SentAt = now;
      if (input.followUpDay >= 3) leadUpdate.followUp3SentAt = now;
      if (input.followUpDay >= 7) leadUpdate.followUp7SentAt = now;
    }
    await tx.update(leads).set(leadUpdate).where(and(eq(leads.id, input.leadId), eq(leads.ownerId, input.ownerId)));
    await tx.insert(communications).values({ ownerId: input.ownerId, leadId: input.leadId, direction: "outbound", kind: input.kind, subject: input.subject, body: input.body, deliveryStatus: "sent", followUpDay: input.followUpDay, sentAt: now });
  });
}

export async function getFollowUpCandidates(ownerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Databáze není dostupná");
  const rows = await db.select().from(leads).where(eq(leads.ownerId, ownerId));
  return rows.filter(lead => !lead.isDemo && !lead.clientRepliedAt && lead.followUpStartedAt && lead.status !== "lost" && lead.status !== "meeting_scheduled" && !lead.followUp7SentAt);
}

export async function claimFollowUp(ownerId: number, leadId: number, stage: 1 | 3 | 7, claimedAt = new Date()) {
  const db = await getDb();
  if (!db) throw new Error("Databáze není dostupná");
  const column = stage === 1 ? leads.followUp1SentAt : stage === 3 ? leads.followUp3SentAt : leads.followUp7SentAt;
  const values = stage === 1 ? { followUp1SentAt: claimedAt } : stage === 3 ? { followUp3SentAt: claimedAt } : { followUp7SentAt: claimedAt };
  const result = await db.update(leads).set(values).where(and(eq(leads.id, leadId), eq(leads.ownerId, ownerId), isNull(column), isNull(leads.clientRepliedAt)));
  return Number(result[0].affectedRows) === 1;
}

export async function releaseFollowUpClaim(ownerId: number, leadId: number, stage: 1 | 3 | 7) {
  const db = await getDb();
  if (!db) throw new Error("Databáze není dostupná");
  const values = stage === 1 ? { followUp1SentAt: null } : stage === 3 ? { followUp3SentAt: null } : { followUp7SentAt: null };
  await db.update(leads).set(values).where(and(eq(leads.id, leadId), eq(leads.ownerId, ownerId)));
}
