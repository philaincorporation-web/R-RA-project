import "server-only";
import { getSiteUrl } from "@/lib/utils/site-url";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Prévient l'équipe d'une nouvelle demande (via l'API Resend).
 * Facultatif : sans RESEND_API_KEY ou sans destinataire, rien n'est envoyé.
 * Ne lève jamais d'erreur : la demande est déjà enregistrée dans Neon.
 */
export async function notifyTeam(input: { subject: string; lines: [string, string][]; adminPath: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFICATION_EMAIL;
  if (!apiKey || !to) return;

  const url = `${getSiteUrl().replace(/\/$/, "")}${input.adminPath}`;
  const rows = input.lines
    .map(([label, value]) => `<tr><td style="padding:4px 12px 4px 0;color:#456B8A">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`)
    .join("");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "RÈRA <onboarding@resend.dev>",
        to: to.split(",").map((a) => a.trim()).filter(Boolean),
        subject: input.subject.replace(/[\r\n]+/g, " ").slice(0, 200),
        html: `<div style="font-family:Arial,sans-serif;color:#0D2B45"><table>${rows}</table><p><a href="${escapeHtml(url)}">Ouvrir dans le back-office</a></p></div>`,
        text: `${input.lines.map(([l, v]) => `${l} : ${v}`).join("\n")}\n\n${url}`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[notifications] envoi refusé", res.status);
  } catch (error) {
    console.error("[notifications] envoi impossible", error);
  }
}
