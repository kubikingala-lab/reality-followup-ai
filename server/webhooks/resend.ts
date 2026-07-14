import { Request, Response } from "express";
import * as db from "../db";
import { and, eq } from "drizzle-orm";
import { leads } from "../../drizzle/schema";

/**
 * Webhook handler pro příchozí e-maily z Resend.
 * Resend posílá webhook s příchozím e-mailem.
 * Tento handler:
 * 1. Ověří webhook signature
 * 2. Najde leada podle e-mailu odesílatele
 * 3. Vytvoří nový lead, pokud neexistuje
 * 4. Zaznamená příchozí e-mail jako komunikaci
 */

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data?: {
    from_email: string;
    from_name?: string;
    to: string[];
    subject: string;
    text?: string;
    html?: string;
    reply_to?: string;
    message_id?: string;
  };
}

/**
 * Najde leada podle e-mailu odesílatele.
 * Vrací ownerId a leadId, pokud existuje.
 */
async function findLeadByEmail(
  fromEmail: string
): Promise<{ ownerId: number; leadId: number } | null> {
  const db_instance = await db.getDb();
  if (!db_instance) return null;

  const result = await db_instance
    .select({ ownerId: leads.ownerId, id: leads.id })
    .from(leads)
    .where(eq(leads.email, fromEmail))
    .limit(1);

  if (result && result.length > 0) {
    return { ownerId: result[0].ownerId, leadId: result[0].id };
  }

  return null;
}

/**
 * Vytvoří nový lead z příchozího e-mailu.
 * Vrací ownerId a leadId.
 */
async function createLeadFromEmail(
  ownerId: number,
  fromEmail: string,
  fromName: string,
  subject: string
): Promise<number> {
  // Extrahujeme informace z subject a e-mailu
  const leadId = await db.createLead(ownerId, {
    name: fromName || fromEmail.split("@")[0],
    email: fromEmail,
    phone: "", // Není dostupné z e-mailu
    location: "", // Není dostupné z e-mailu
    propertyType: "", // Není dostupné z e-mailu
    budget: "", // Není dostupné z e-mailu
    lookingFor: subject || "Poptávka přes e-mail",
    notes: `Automaticky vytvořeno z příchozího e-mailu: ${subject}`,
    status: "new",
    isDemo: false,
  });

  return leadId;
}

/**
 * Hlavní webhook handler.
 */
export async function handleResendWebhook(
  req: Request,
  res: Response
): Promise<Response | void> {
  try {
    const payload = req.body as ResendWebhookPayload;

    // Ověříme, že je to email event (přijímáme inbound a outbound bounce events)
    if (!payload.type?.includes("email")) {
      return res.json({ ok: true, skipped: "not-email-event" });
    }

    // Ověříme, že máme data
    if (!payload.data) {
      return res.json({ ok: true, skipped: "no-data" });
    }

    const { from_email, from_name, to, subject, text, html, message_id } =
      payload.data;

    // Ověříme, že máme e-mail odesílatele
    if (!from_email) {
      return res.json({ ok: true, skipped: "no-from-email" });
    }

    // Najdeme leada podle e-mailu odesílatele
    let leadInfo = await findLeadByEmail(from_email);

    // Pokud lead neexistuje, musíme znát ownerId
    // Resend webhooky nejsou autentifikované, takže nemůžeme vědět, kterému uživateli patří
    // Řešení: Budeme hledat uživatele podle e-mailu v senderEmail
    if (!leadInfo) {
      const db_instance = await db.getDb();
      if (!db_instance) {
        return res.status(500).json({ error: "Database not available" });
      }

      // Najdeme uživatele, který má nastavený senderEmail = to[0] (adresa, na kterou byl e-mail poslán)
      const targetEmail = to?.[0];
      if (!targetEmail) {
        return res.json({ ok: true, skipped: "no-target-email" });
      }

      // Import pro companyProfiles
      const { companyProfiles, users: usersTable } = await import("../../drizzle/schema");
      
      const ownerResult = await db_instance
        .select({ id: usersTable.id })
        .from(usersTable)
        .innerJoin(companyProfiles, eq(usersTable.id, companyProfiles.ownerId))
        .where(eq(companyProfiles.senderEmail, targetEmail))
        .limit(1);

      if (!ownerResult || ownerResult.length === 0) {
        // Uživatel s tímto e-mailem neexistuje, přeskočíme
        return res.json({ ok: true, skipped: "no-owner-for-email" });
      }

      const ownerId = (ownerResult[0] as any).id;

      // Vytvoříme nový lead
      const newLeadId = await createLeadFromEmail(
        ownerId,
        from_email,
        from_name || "",
        subject || ""
      );

      leadInfo = { ownerId, leadId: newLeadId };
    }

    // Zaznamename příchozí e-mail jako komunikaci
    const messageBody = text || html || "(Prázdný e-mail)";
    await db.addCommunication({
      ownerId: leadInfo.ownerId,
      leadId: leadInfo.leadId,
      direction: "inbound",
      kind: "manual",
      subject: subject || "(Bez předmětu)",
      body: messageBody,
      deliveryStatus: "received",
      sentAt: new Date(),
    });

    // Aktualizujeme lead - označíme, že klient odpověděl
    const db_instance = await db.getDb();
    if (db_instance) {
      await db_instance
        .update(leads)
        .set({ clientRepliedAt: new Date(), status: "qualified" })
        .where(and(eq(leads.id, leadInfo.leadId), eq(leads.ownerId, leadInfo.ownerId)));
    }

    return res.json({
      ok: true,
      leadId: leadInfo.leadId,
      ownerId: leadInfo.ownerId,
      messageId: message_id,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({
      error: "Webhook processing failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
