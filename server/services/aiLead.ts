import type { Lead } from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";

const SYSTEM_PROMPT = `Jsi zkušený realitní konzultant a profesionální copywriter. Napiš krátkou, profesionální a přirozenou odpověď na poptávku zájemce o nemovitost v češtině. Odpověď má být stručná, slušná a má vést k dalšímu kroku. Poděkuj za zájem, stručně shrň, co klient hledá, polož 3 až 5 kvalifikačních otázek, včetně typu nemovitosti, lokality, rozpočtu a časového horizontu, a nabídni telefonát nebo krátkou schůzku. Buď profesionální, přátelský a sebevědomý. Nepoužívej odrážky, číslované seznamy, emoji ani marketingové fráze. Vrať pouze hotový text e-mailu.`;

export async function generateLeadReply(lead: Lead, senderName: string) {
  const response = await invokeLLM({
    model: "gpt-4o-mini",
    maxTokens: 700,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Připrav odpověď pro tento lead. Jméno: ${lead.name}. Lokalita: ${lead.location}. Typ nemovitosti: ${lead.propertyType}. Rozpočet: ${lead.budget}. Co hledá: ${lead.lookingFor}. Poznámka: ${lead.notes || "bez poznámky"}. Podepiš e-mail jako ${senderName}.` },
    ],
  });
  const content = response.choices[0]?.message.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("AI nevrátila text odpovědi");
  return content
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .trim();
}
