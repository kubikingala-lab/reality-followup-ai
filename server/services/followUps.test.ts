import { describe, expect, it } from "vitest";
import type { CompanyProfile, Lead } from "../../drizzle/schema";
import { buildFollowUp, resolveDueStage } from "./followUps";

const baseLead = {
  id: 1, ownerId: 1, name: "Jana Malá", email: "jana@example.cz", phone: "777 111 222",
  location: "Brno", propertyType: "byt 3+kk", budget: "8 000 000 Kč", lookingFor: "Byt pro rodinu",
  notes: null, status: "answered", isDemo: false, clientRepliedAt: null, lastOutboundAt: new Date("2026-01-01T08:00:00Z"),
  followUpStartedAt: new Date("2026-01-01T08:00:00Z"), followUp1SentAt: null, followUp3SentAt: null, followUp7SentAt: null,
  createdAt: new Date("2026-01-01T07:00:00Z"), updatedAt: new Date("2026-01-01T08:00:00Z"),
} as Lead;

const profile = { senderName: "Eva Horáková" } as CompanyProfile;

describe("follow-up časová logika", () => {
  it("vrací správně splatný interval 1, 3 a 7 dnů", () => {
    expect(resolveDueStage(baseLead, new Date("2026-01-02T08:01:00Z"))).toBe(1);
    expect(resolveDueStage({ ...baseLead, followUp1SentAt: new Date() }, new Date("2026-01-04T08:01:00Z"))).toBe(3);
    expect(resolveDueStage({ ...baseLead, followUp1SentAt: new Date(), followUp3SentAt: new Date() }, new Date("2026-01-08T08:01:00Z"))).toBe(7);
  });

  it("zastaví automatizaci po odpovědi klienta", () => {
    expect(resolveDueStage({ ...baseLead, clientRepliedAt: new Date() }, new Date("2026-01-09T08:01:00Z"))).toBeNull();
  });

  it("vytvoří český text bez odrážek s návrhem dalšího kroku", () => {
    const result = buildFollowUp(baseLead, profile, 3);
    expect(result.body).toContain("telefonát");
    expect(result.body).toContain("Eva Horáková");
    expect(result.body).not.toMatch(/^\s*[-*•]\s/m);
  });
});
