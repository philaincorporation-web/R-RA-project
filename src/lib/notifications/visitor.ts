import "server-only";
import { getSiteUrl } from "@/lib/utils/site-url";
import { BRAND, escapeHtml, layout, rowsTable, rowsText, sendMail } from "./mailer";

/**
 * Accusé de réception envoyé au visiteur après l'enregistrement de sa demande.
 * Ne lève jamais d'erreur.
 */
export async function acknowledgeVisitor(input: {
  to: string;
  name: string;
  /** Ex. « votre message », « votre demande de réservation ». */
  what: string;
  reference: string;
  lines: [string, string][];
}) {
  const site = getSiteUrl().replace(/\/$/, "");
  const lines: [string, string][] = [["Référence", input.reference], ...input.lines];
  // Les messages de contact n'ont pas de suivi : on renvoie alors simplement vers le site.
  const trackUrl = input.reference.startsWith("RERA-MSG") ? site : `${site}/fr/track?ref=${encodeURIComponent(input.reference)}`;

  const content = `
<h2 style="color:${BRAND.navy};margin:0 0 8px;font-size:18px">Bonjour ${escapeHtml(input.name)},</h2>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px">Merci, nous avons bien reçu ${escapeHtml(input.what)}. Notre équipe reviendra vers vous dans les meilleurs délais.</p>
<p style="color:${BRAND.navy};font-size:14px;font-weight:600;margin:0 0 10px">Récapitulatif</p>
${rowsTable(lines)}
<p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">Conservez la référence <strong>${escapeHtml(input.reference)}</strong> : elle permet de retrouver votre demande rapidement.</p>
<p style="color:#374151;font-size:14px;line-height:1.6;margin:0">Cordialement,<br><strong style="color:${BRAND.navy}">${escapeHtml(BRAND.signature)}</strong></p>`;

  const footer = `
<tr><td style="background:${BRAND.navy};padding:16px 30px;text-align:center"><a href="${escapeHtml(trackUrl)}" style="display:inline-block;background:#ffffff;color:${BRAND.navy};padding:10px 26px;border-radius:24px;text-decoration:none;font-size:14px;font-weight:600">Suivre ma demande</a></td></tr>
<tr><td style="padding:16px 30px;border-top:1px solid #e5e7eb"><p style="color:#9ca3af;font-size:11px;margin:0;line-height:1.5">Cet e-mail a été envoyé automatiquement suite à votre demande sur ${escapeHtml(site.replace(/^https?:\/\//, ""))}.</p></td></tr>`;

  await sendMail({
    to: input.to,
    subject: `${BRAND.name} — Nous avons bien reçu ${input.what} (${input.reference})`,
    html: layout("Confirmation de réception", content, footer),
    text: `Bonjour ${input.name},\n\nMerci, nous avons bien reçu ${input.what}. Notre équipe reviendra vers vous dans les meilleurs délais.\n\n${rowsText(lines)}\n\nSuivre votre demande : ${trackUrl}\n\nCordialement,\n${BRAND.signature}\n${site}`,
  });
}
