import { afterEach, describe, expect, it, vi } from "vitest";
import { sendTransactionalEmail } from "./email";

describe("transakční e-mail", () => {
  afterEach(() => vi.restoreAllMocks());

  it("odesílá pouze prostý text přes serverové API", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "mail_1" }), { status: 200 }));
    const result = await sendTransactionalEmail({ fromName: "Domov Reality", fromEmail: "info@example.cz", to: "klient@example.cz", subject: "Vaše poptávka", text: "Dobrý den, děkujeme za Váš zájem." });
    const request = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(request.text).toContain("Dobrý den");
    expect(request.html).toBeUndefined();
    expect(result.id).toBe("mail_1");
  });
});
