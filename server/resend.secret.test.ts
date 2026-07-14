import { describe, expect, it } from "vitest";

describe("Resend konfigurace", () => {
  it("přijímá uložený API klíč", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey, "RESEND_API_KEY musí být nastaven").toBeTruthy();

    const response = await fetch("https://api.resend.com/domains?limit=1", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    expect(
      response.ok,
      `Resend odmítl klíč se stavem ${response.status}`,
    ).toBe(true);
  }, 15_000);
});
