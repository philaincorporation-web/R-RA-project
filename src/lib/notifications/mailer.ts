import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { getSiteUrl } from "@/lib/utils/site-url";

/**
 * Envoi d'e-mails via un compte Gmail (Nodemailer + mot de passe d'application).
 * Variables : GMAIL_USER, GMAIL_APP_PASSWORD.
 * Sans ces variables, rien n'est envoyé : les demandes restent visibles dans le back-office.
 */

export const BRAND = {
  name: "RÈRA",
  tagline: "Pointe Denis, Gabon",
  signature: "L'équipe RÈRA",
  navy: "#0D2B45",
  muted: "#456B8A",
  light: "#E8EDF1",
};

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (!user || !pass) return null;
  transporter ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return transporter;
}

export function teamRecipients(): string[] {
  const raw = process.env.CONTACT_NOTIFICATION_EMAIL || process.env.GMAIL_USER || "";
  return raw.split(",").map((a) => a.trim()).filter(Boolean);
}

/** Envoie un e-mail. Ne lève jamais d'erreur : renvoie false en cas d'échec. */
export async function sendMail(message: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[mail] GMAIL_USER ou GMAIL_APP_PASSWORD manquant : e-mail non envoyé");
    return false;
  }
  try {
    await transport.sendMail({
      from: { name: BRAND.name, address: process.env.GMAIL_USER!.trim() },
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject.replace(/[\r\n]+/g, " ").slice(0, 200),
      html: message.html,
      text: message.text,
    });
    return true;
  } catch (error) {
    console.error("[mail] envoi impossible", error instanceof Error ? error.message : error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Gabarits (tableaux + styles en ligne : compatibles Gmail / Outlook)
// ---------------------------------------------------------------------------

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function rowsTable(lines: [string, string][]): string {
  const rows = lines
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 10px;background:${BRAND.light};border:1px solid #d5dee6;font-weight:600;color:${BRAND.navy};width:150px;font-size:13px;vertical-align:top">${escapeHtml(label)}</td><td style="padding:8px 10px;border:1px solid #d5dee6;font-size:13px;color:#1f2937;white-space:pre-line">${escapeHtml(value || "—")}</td></tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 20px">${rows}</table>`;
}

export function rowsText(lines: [string, string][]): string {
  return lines.map(([label, value]) => `${label} : ${value || "—"}`).join("\n");
}

export function layout(title: string, content: string, footer = ""): string {
  const site = getSiteUrl().replace(/\/$/, "");
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8"><tr><td align="center" style="padding:20px 10px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:${BRAND.navy};padding:24px 30px;text-align:center">
<a href="${escapeHtml(site)}" style="color:#ffffff;text-decoration:none;font-size:22px;font-weight:700;letter-spacing:2px">${escapeHtml(BRAND.name)}</a>
<p style="color:${BRAND.light};margin:6px 0 0;font-size:13px">${escapeHtml(BRAND.tagline)}</p>
</td></tr>
<tr><td style="padding:30px">${content}</td></tr>
${footer}
</table></td></tr></table></body></html>`;
}
