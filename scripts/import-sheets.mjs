// Importe l'historique Google Sheets (SheetDB) dans Neon. Ne modifie jamais les feuilles.
// Usage : npm run import:sheets            → simulation, n'écrit rien
//         npm run import:sheets -- --apply → écrit dans Neon
// Peut être relancé sans risque : une référence déjà présente n'est jamais recopiée.
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadEnvLocal() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // pas de .env.local : on utilise l'environnement courant
  }
}

loadEnvLocal();
const apply = process.argv.includes("--apply");
const { DATABASE_URL, SHEETDB_API_URL, SHEETDB_API_KEY } = process.env;
if (!DATABASE_URL || !SHEETDB_API_URL) {
  console.error("DATABASE_URL ou SHEETDB_API_URL manquant.");
  process.exit(1);
}
const sql = neon(DATABASE_URL);

async function fetchSheet(sheet) {
  const url = new URL(`${SHEETDB_API_URL.replace(/\/$/, "")}/`);
  if (sheet) url.searchParams.set("sheet", sheet);
  const res = await fetch(url, { headers: SHEETDB_API_KEY ? { Authorization: `Bearer ${SHEETDB_API_KEY}` } : {} });
  if (!res.ok) throw new Error(`SheetDB a répondu ${res.status} pour la feuille « ${sheet} »`);
  const rows = await res.json();
  if (!Array.isArray(rows)) throw new Error(`Réponse inattendue pour la feuille « ${sheet} »`);
  return rows;
}

const text = (v) => String(v ?? "").trim();
const isoDate = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(text(v)) && !Number.isNaN(Date.parse(text(v))) ? text(v) : null);
const timestamp = (v) => (text(v) && !Number.isNaN(Date.parse(text(v))) ? new Date(text(v)).toISOString() : null);
const intOr = (v, fallback) => (Number.isFinite(Number.parseInt(text(v), 10)) ? Number.parseInt(text(v), 10) : fallback);
function amount(v) {
  const cleaned = text(v).replace(/\s/g, "").replace(",", ".");
  return cleaned !== "" && Number.isFinite(Number(cleaned)) ? Number(cleaned) : null;
}

const BOOKING_STATUS = {
  pending: "pending", confirmed: "confirmed", paid: "paid", completed: "completed", cancelled: "cancelled", canceled: "cancelled",
  "en attente": "pending", "confirmée": "confirmed", "confirmee": "confirmed", "payée": "paid", "payee": "paid", "terminée": "completed", "terminee": "completed", "annulée": "cancelled", "annulee": "cancelled",
};
const BUSINESS_STATUS = {
  new: "new", pending: "new", in_progress: "in_progress", quote_sent: "quote_sent", accepted: "accepted", refused: "refused",
  nouvelle: "new", "en cours": "in_progress", "devis envoyé": "quote_sent", "devis envoye": "quote_sent", "acceptée": "accepted", "acceptee": "accepted", "refusée": "refused", "refusee": "refused",
};
const MESSAGE_STATUS = { new: "new", handled: "handled", archived: "archived", nouveau: "new", "traité": "handled", traite: "handled", "archivé": "archived", archive: "archived" };

/** Statut reconnu, sinon le statut initial ; la valeur d'origine reste conservée. */
const mapStatus = (map, raw, fallback) => map[text(raw).toLowerCase()] ?? fallback;

const report = { reservations: 0, business: 0, messages: 0, statusSynced: 0, alreadyPresent: 0, skipped: [] };

async function importReservation(kind, row, index, fields) {
  const reference = text(row.reference);
  const label = `${kind} ligne ${index + 2}`;
  if (!reference) return report.skipped.push(`${label} : référence vide`);
  if (!fields.fullName || !fields.email || !fields.title) return report.skipped.push(`${label} (${reference}) : nom, e-mail ou offre manquant`);

  const existing = await sql`SELECT status FROM reservations WHERE reference = ${reference}`;
  if (existing.length > 0) {
    report.alreadyPresent++;
    // Le travail fait dans Sheets prime tant que Neon n'a pas quitté son statut initial.
    const initial = kind === "booking" ? ["pending"] : ["new", "pending"];
    if (initial.includes(existing[0].status) && !initial.includes(fields.status)) {
      report.statusSynced++;
      if (apply) await sql`UPDATE reservations SET status = ${fields.status} WHERE reference = ${reference}`;
    }
    return;
  }

  report[kind === "booking" ? "reservations" : "business"]++;
  if (!apply) return;
  await sql`
    INSERT INTO reservations
      (reference, kind, status, full_name, email, phone, country, title, start_date, end_date,
       total_estimate, currency, summary, source, created_at)
    VALUES
      (${reference}, ${kind}, ${fields.status}, ${fields.fullName}, ${fields.email}, ${fields.phone || null},
       ${fields.country || null}, ${fields.title}, ${fields.startDate}, ${fields.endDate}, ${fields.total}, ${fields.currency || null},
       ${JSON.stringify(fields.summary)}::jsonb, 'sheets', ${timestamp(row.created_at) ?? new Date().toISOString()})
    ON CONFLICT (reference) DO NOTHING
  `;
}

const bookings = await fetchSheet(process.env.SHEETDB_BOOKINGS_SHEET);
for (const [i, row] of bookings.entries()) {
  await importReservation("booking", row, i, {
    status: mapStatus(BOOKING_STATUS, row.status, "pending"),
    fullName: text(row.full_name),
    email: text(row.email),
    phone: text(row.phone),
    country: text(row.country),
    title: text(row.offer_name),
    startDate: isoDate(row.start_date),
    endDate: isoDate(row.end_date),
    total: amount(row.total_estimate),
    currency: text(row.currency),
    summary: {
      offerType: text(row.offer_type),
      offerSlug: text(row.offer_slug),
      adults: intOr(row.adults, 1),
      children: intOr(row.children, 0),
      options: text(row.options).split("|").map((o) => o.trim()).filter(Boolean),
      paymentMethod: null,
      notes: text(row.notes),
      sheetStatus: text(row.status),
    },
  });
}

const business = await fetchSheet(process.env.SHEETDB_BUSINESS_SHEET);
for (const [i, row] of business.entries()) {
  await importReservation("business", row, i, {
    status: mapStatus(BUSINESS_STATUS, row.status, "new"),
    fullName: text(row.contact_name),
    email: text(row.email),
    phone: text(row.phone),
    country: "",
    title: text(row.event_type) || "Demande Business",
    startDate: isoDate(row.preferred_date),
    endDate: null,
    total: null,
    currency: "",
    summary: {
      organization: text(row.company_name),
      attendees: text(row.attendees) || null,
      budget: text(row.budget_range),
      details: [],
      message: text(row.message),
      sheetStatus: text(row.status),
    },
  });
}

const messages = await fetchSheet(process.env.SHEETDB_CONTACT_SHEET);
for (const [i, row] of messages.entries()) {
  const reference = text(row.reference);
  const label = `message ligne ${i + 2}`;
  if (!reference) { report.skipped.push(`${label} : référence vide`); continue; }
  if (!text(row.full_name) || !text(row.email) || !text(row.message)) { report.skipped.push(`${label} (${reference}) : nom, e-mail ou message manquant`); continue; }
  const existing = await sql`SELECT 1 FROM contact_messages WHERE reference = ${reference}`;
  if (existing.length > 0) { report.alreadyPresent++; continue; }
  report.messages++;
  if (!apply) continue;
  await sql`
    INSERT INTO contact_messages (reference, full_name, email, subject, message, status, source, created_at)
    VALUES (${reference}, ${text(row.full_name)}, ${text(row.email)}, ${text(row.subject) || "(sans sujet)"}, ${text(row.message)},
            ${mapStatus(MESSAGE_STATUS, row.status, "new")}, 'sheets', ${timestamp(row.created_at) ?? new Date().toISOString()})
    ON CONFLICT (reference) DO NOTHING
  `;
}

console.log(apply ? "IMPORT EFFECTUÉ" : "SIMULATION (rien n'a été écrit ; ajoutez --apply pour importer)");
console.log(`Lignes lues : ${bookings.length} réservations, ${business.length} demandes Business, ${messages.length} messages`);
console.log(`À importer / importées : ${report.reservations} réservations, ${report.business} demandes Business, ${report.messages} messages`);
console.log(`Déjà présentes dans Neon : ${report.alreadyPresent} (statuts repris de Sheets : ${report.statusSynced})`);
console.log(`Ignorées : ${report.skipped.length}`);
for (const line of report.skipped) console.log(`  - ${line}`);
