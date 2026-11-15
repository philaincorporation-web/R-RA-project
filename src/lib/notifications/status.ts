import "server-only";
import { getSiteUrl } from "@/lib/utils/site-url";
import { BRAND, escapeHtml, layout, rowsTable, rowsText, sendMail } from "./mailer";

/**
 * E-mails envoyés au client quand l'équipe change le statut d'une réservation.
 * Uniquement après un changement réellement enregistré en base : jamais à partir d'une demande en attente.
 */

export type StatusEmailKind = "confirmed" | "refused" | "cancelled";

const FIRM = new Set(["confirmed", "paid", "completed"]);

/** Quel e-mail envoyer pour ce changement de statut (ou aucun) ? */
export function statusEmailFor(previous: string, next: string): StatusEmailKind | null {
  if (previous === next) return null;
  if ((next === "confirmed" || next === "paid") && !FIRM.has(previous)) return "confirmed";
  if (next === "refused") return "refused";
  if (next === "cancelled") return "cancelled";
  return null;
}

const COPY: Record<StatusEmailKind, { subject: string; title: string; intro: string; outro: string }> = {
  confirmed: {
    subject: "Votre réservation est confirmée",
    title: "Réservation confirmée",
    intro: "Bonne nouvelle : votre réservation est confirmée par notre équipe. Nous avons hâte de vous accueillir à Pointe Denis.",
    outro: "Nous restons à votre disposition pour toute question sur votre séjour (navette, horaires, options).",
  },
  refused: {
    subject: "Votre demande de réservation",
    title: "Demande non retenue",
    intro: "Nous sommes désolés : nous ne pouvons pas donner suite à votre demande de réservation pour ces dates.",
    outro: "Nous serions heureux de vous proposer d'autres dates ou une autre offre : répondez simplement à cet e-mail.",
  },
  cancelled: {
    subject: "Annulation de votre réservation",
    title: "Réservation annulée",
    intro: "Nous vous confirmons l'annulation de votre réservation.",
    outro: "Pour toute question, ou pour réserver de nouvelles dates, répondez simplement à cet e-mail.",
  },
};

export async function sendStatusEmail(input: {
  kind: StatusEmailKind;
  to: string;
  name: string;
  reference: string;
  lines: [string, string][];
}) {
  const copy = COPY[input.kind];
  const site = getSiteUrl().replace(/\/$/, "");
  const lines: [string, string][] = [["Référence", input.reference], ...input.lines];
  const replyTo = process.env.CONTACT_NOTIFICATION_EMAIL?.split(",")[0]?.trim() || undefined;

  const content = `
<h2 style="color:${BRAND.navy};margin:0 0 8px;font-size:18px">Bonjour ${escapeHtml(input.name)},</h2>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px">${escapeHtml(copy.intro)}</p>
<p style="color:${BRAND.navy};font-size:14px;font-weight:600;margin:0 0 10px">${escapeHtml(copy.title)}</p>
${rowsTable(lines)}
<p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">${escapeHtml(copy.outro)}</p>
<p style="color:#374151;font-size:14px;line-height:1.6;margin:0">Cordialement,<br><strong style="color:${BRAND.navy}">${escapeHtml(BRAND.signature)}</strong></p>`;

  const footer = `
<tr><td style="background:${BRAND.navy};padding:16px 30px;text-align:center"><a href="${escapeHtml(site)}/fr/account" style="display:inline-block;background:#ffffff;color:${BRAND.navy};padding:10px 26px;border-radius:24px;text-decoration:none;font-size:14px;font-weight:600">Mon espace client</a></td></tr>`;

  return sendMail({
    to: input.to,
    replyTo,
    subject: `${BRAND.name} — ${copy.subject} (${input.reference})`,
    html: layout(copy.title, content, footer),
    text: `Bonjour ${input.name},\n\n${copy.intro}\n\n${rowsText(lines)}\n\n${copy.outro}\n\nCordialement,\n${BRAND.signature}\n${site}`,
  });
}
