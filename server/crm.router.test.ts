import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  getLeadDetail: vi.fn(), getProfile: vi.fn(), setLeadStatus: vi.fn(), recordSentEmail: vi.fn(),
  setProfileTaskUid: vi.fn(), generateLeadReply: vi.fn(), sendTransactionalEmail: vi.fn(), createHeartbeatJob: vi.fn(),
}));

vi.mock("./db", async importOriginal => ({ ...(await importOriginal<typeof import("./db")>()), getLeadDetail: mocks.getLeadDetail, getProfile: mocks.getProfile, setLeadStatus: mocks.setLeadStatus, recordSentEmail: mocks.recordSentEmail, setProfileTaskUid: mocks.setProfileTaskUid }));
vi.mock("./services/aiLead", () => ({ generateLeadReply: mocks.generateLeadReply }));
vi.mock("./services/email", () => ({ sendTransactionalEmail: mocks.sendTransactionalEmail }));
vi.mock("./_core/heartbeat", () => ({ createHeartbeatJob: mocks.createHeartbeatJob }));

import { appRouter } from "./routers";

function context(): TrpcContext {
  return {
    user: { id: 42, openId: "owner", name: "Eva", email: "eva@example.cz", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { headers: { cookie: "app_session_id=test-session" }, protocol: "https" } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const lead = { id: 7, ownerId: 42, name: "Petr Novák", email: "petr@example.cz", location: "Praha", propertyType: "byt 2+kk" };
const profile = { ownerId: 42, senderName: "Eva Horáková", senderEmail: "eva@example.cz", scheduleCronTaskUid: null };

describe("CRM tRPC API", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.getLeadDetail.mockResolvedValue({ lead, history: [] }); mocks.getProfile.mockResolvedValue(profile); });

  it("generuje personalizovaný předmět a AI text", async () => {
    mocks.generateLeadReply.mockResolvedValue("Dobrý den, děkuji za Váš zájem.");
    const result = await appRouter.createCaller(context()).crm.generateReply({ id: 7 });
    expect(result.subject).toContain("byt 2+kk, Praha");
    expect(mocks.generateLeadReply).toHaveBeenCalledWith(lead, "Eva Horáková");
  });

  it("nepovolí čtení leadu mimo vlastnictví uživatele", async () => {
    mocks.getLeadDetail.mockResolvedValue(null);
    await expect(appRouter.createCaller(context()).crm.generateReply({ id: 999 })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("odešle reply a zapíše jej do historie", async () => {
    mocks.sendTransactionalEmail.mockResolvedValue({ id: "mail_7" });
    const result = await appRouter.createCaller(context()).crm.sendReply({ id: 7, subject: "Vaše poptávka", body: "Dobrý den, děkuji Vám za Vaši poptávku." });
    expect(result).toEqual({ success: true, messageId: "mail_7" });
    expect(mocks.sendTransactionalEmail).toHaveBeenCalledWith(expect.objectContaining({ to: "petr@example.cz" }));
    expect(mocks.recordSentEmail).toHaveBeenCalledWith(expect.objectContaining({ ownerId: 42, leadId: 7 }));
  });

  it("vyžaduje nastavený ověřený e-mail odesílatele", async () => {
    mocks.getProfile.mockResolvedValue({ ...profile, senderEmail: null });
    await expect(appRouter.createCaller(context()).crm.sendReply({ id: 7, subject: "Vaše poptávka", body: "Dobrý den, děkuji Vám za Vaši poptávku." })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  it("mění stav pouze přes vlastnický kontext", async () => {
    await expect(appRouter.createCaller(context()).crm.updateStatus({ id: 7, status: "qualified" })).resolves.toEqual({ success: true });
    expect(mocks.setLeadStatus).toHaveBeenCalledWith(42, 7, "qualified");
  });

  it("vrací existující cron úlohu bez vytvoření duplicity", async () => {
    mocks.getProfile.mockResolvedValue({ ...profile, scheduleCronTaskUid: "task_existing" });
    await expect(appRouter.createCaller(context()).crm.activateFollowUps()).resolves.toEqual({ taskUid: "task_existing", alreadyActive: true });
    expect(mocks.createHeartbeatJob).not.toHaveBeenCalled();
  });
});
