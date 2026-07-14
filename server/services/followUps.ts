import type { CompanyProfile, Lead } from "../../drizzle/schema";
import * as db from "../db";
import { sendTransactionalEmail } from "./email";

export function resolveDueStage(lead: Lead, now = new Date()): 1 | 3 | 7 | null {
  if (!lead.followUpStartedAt || lead.clientRepliedAt || lead.followUp7SentAt) return null;
  const elapsedDays = (now.getTime() - lead.followUpStartedAt.getTime()) / 86_400_000;
  if (elapsedDays >= 7 && !lead.followUp7SentAt) return 7;
  if (elapsedDays >= 3 && !lead.followUp3SentAt) return 3;
  if (elapsedDays >= 1 && !lead.followUp1SentAt) return 1;
  return null;
}

export function buildFollowUp(lead: Lead, profile: CompanyProfile, day: 1 | 3 | 7) {
  const firstName = lead.name.split(" ")[0] || lead.name;
  const intro = day === 1 ? "navazuji na svou včerejší zprávu" : day === 3 ? "rád bych se krátce vrátil k Vaší poptávce" : "ještě jednou se vracím k Vaší poptávce";
  const body = `Dobrý den, ${firstName},\n\n${intro} ohledně ${lead.propertyType} v lokalitě ${lead.location}. Pokud je pro Vás hledání stále aktuální, rád s Vámi během krátkého telefonátu projdu priority, rozpočet a časový horizont, abychom mohli vybrat vhodné možnosti.\n\nHodí se Vám v nejbližších dnech krátký telefonát nebo schůzka?\n\nS pozdravem\n${profile.senderName}`;
  return { subject: `Vaše poptávka: ${lead.propertyType} – ${lead.location}`, body };
}

export async function runCentralFollowUps(taskUid: string, now = new Date()) {
  const profile = await db.getProfileByTaskUid(taskUid);
  if (!profile) return { sent: 0, skipped: "orphan" as const };
  if (!profile.senderEmail) return { sent: 0, skipped: "missing-sender" as const };
  const candidates = await db.getFollowUpCandidates(profile.ownerId);
  let sent = 0;
  const failures: Array<{ leadId: number; error: string }> = [];
  for (const lead of candidates.slice(0, 50)) {
    const stage = resolveDueStage(lead, now);
    if (!stage) continue;
    const claimed = await db.claimFollowUp(profile.ownerId, lead.id, stage, now);
    if (!claimed) continue;
    const message = buildFollowUp(lead, profile, stage);
    try {
      await sendTransactionalEmail({ fromName: profile.senderName, fromEmail: profile.senderEmail, to: lead.email, subject: message.subject, text: message.body });
      await db.recordSentEmail({ ownerId: profile.ownerId, leadId: lead.id, kind: "follow_up", followUpDay: stage, ...message });
      sent += 1;
    } catch (error) {
      await db.releaseFollowUpClaim(profile.ownerId, lead.id, stage);
      failures.push({ leadId: lead.id, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return { sent, failures };
}
