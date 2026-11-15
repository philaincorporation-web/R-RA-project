import "server-only";
import { BRAND, escapeHtml, layout, sendMail } from "./mailer";

/** Code à 6 chiffres pour consulter une demande sans compte. */
export async function sendTrackingCode(input: { to: string; name: string; reference: string; code: string; locale: "fr" | "en" }) {
  const fr = input.locale === "fr";
  const title = fr ? "Votre code de suivi" : "Your tracking code";
  const intro = fr
    ? `Voici votre code pour consulter la demande ${input.reference}. Il est valable 10 minutes.`
    : `Here is your code to view request ${input.reference}. It is valid for 10 minutes.`;
  const warning = fr
    ? "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail : personne ne pourra accéder à votre réservation sans ce code."
    : "If you did not request this, simply ignore this email: nobody can access your booking without this code.";

  const content = `
<h2 style="color:${BRAND.navy};margin:0 0 8px;font-size:18px">${fr ? "Bonjour" : "Hello"} ${escapeHtml(input.name)},</h2>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px">${escapeHtml(intro)}</p>
<p style="text-align:center;margin:0 0 20px"><span style="display:inline-block;background:${BRAND.light};color:${BRAND.navy};font-size:32px;font-weight:700;letter-spacing:10px;padding:14px 24px;border-radius:12px;font-family:Consolas,Menlo,monospace">${escapeHtml(input.code)}</span></p>
<p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0">${escapeHtml(warning)}</p>`;

  return sendMail({
    to: input.to,
    subject: `${BRAND.name} — ${title} : ${input.code}`,
    html: layout(title, content),
    text: `${fr ? "Bonjour" : "Hello"} ${input.name},\n\n${intro}\n\n${input.code}\n\n${warning}\n\n${BRAND.signature}`,
  });
}
