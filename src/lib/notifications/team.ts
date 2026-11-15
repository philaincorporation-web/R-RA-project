import "server-only";
import { getSiteUrl } from "@/lib/utils/site-url";
import { BRAND, escapeHtml, layout, rowsTable, rowsText, sendMail, teamRecipients } from "./mailer";

/**
 * Prévient l'équipe d'une nouvelle demande (via Gmail).
 * Destinataires : CONTACT_NOTIFICATION_EMAIL (séparés par des virgules), sinon GMAIL_USER.
 * « Répondre » écrit directement au visiteur (replyTo).
 * Ne lève jamais d'erreur : la demande est déjà enregistrée dans Neon.
 */
export async function notifyTeam(input: {
  subject: string;
  lines: [string, string][];
  adminPath: string;
  replyTo?: string;
}) {
  const to = teamRecipients();
  if (to.length === 0) return;

  const url = `${getSiteUrl().replace(/\/$/, "")}${input.adminPath}`;
  const content = `
<h2 style="color:${BRAND.navy};margin:0 0 16px;font-size:18px">${escapeHtml(input.subject)}</h2>
${rowsTable(input.lines)}
<p style="margin:0 0 16px"><a href="${escapeHtml(url)}" style="display:inline-block;background:${BRAND.navy};color:#ffffff;padding:10px 22px;border-radius:24px;text-decoration:none;font-size:14px;font-weight:600">Ouvrir dans le back-office</a></p>
${input.replyTo ? `<p style="color:${BRAND.muted};font-size:13px;margin:0">Répondez directement à cet e-mail pour écrire au demandeur.</p>` : ""}`;

  await sendMail({
    to,
    replyTo: input.replyTo,
    subject: `[${BRAND.name}] ${input.subject}`,
    html: layout(input.subject, content),
    text: `${input.subject}\n\n${rowsText(input.lines)}\n\nBack-office : ${url}`,
  });
}
