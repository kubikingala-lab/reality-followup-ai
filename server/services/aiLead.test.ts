import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Lead } from "../../drizzle/schema";

const { invokeLLM } = vi.hoisted(() => ({ invokeLLM: vi.fn() }));
vi.mock("../_core/llm", () => ({ invokeLLM }));

import { generateLeadReply } from "./aiLead";

describe("AI odpověď", () => {
  beforeEach(() => invokeLLM.mockReset());

  it("použije úsporný model a odstraní případné odrážky z výstupu", async () => {
    invokeLLM.mockResolvedValue({ choices: [{ message: { content: "Dobrý den, Petře,\n\n- děkuji za Váš zájem.\n\nHodí se Vám krátký telefonát?\n\nJan Novák" } }] });
    const lead = { name: "Petr Novák", location: "Praha", propertyType: "byt 2+kk", budget: "do 7 000 000 Kč", lookingFor: "byt pro sebe", notes: "do konce roku" } as Lead;
    const result = await generateLeadReply(lead, "Jan Novák");
    expect(invokeLLM).toHaveBeenCalledWith(expect.objectContaining({ model: "claude-haiku-4-5", maxTokens: 700 }));
    expect(result).not.toMatch(/^\s*[-*•]\s/m);
    expect(result).toContain("telefonát");
  });
});
