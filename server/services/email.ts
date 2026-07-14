type EmailInput = {
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  text: string;
};

export async function sendTransactionalEmail(input: EmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY není nastaven");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `${input.fromName} <${input.fromEmail}>`,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      reply_to: input.fromEmail,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Odeslání e-mailu selhalo (${response.status}): ${detail}`);
  }
  return await response.json() as { id: string };
}
