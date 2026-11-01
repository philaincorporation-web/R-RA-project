import "server-only";
import { sheetdbInsert } from "./client";
import { businessServices } from "@/data/business-services";
import type { BookingInput, BusinessRequestInput, ContactInput } from "@/lib/validation/schemas";

function generateReference(prefix: string) {
  const now = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${now}-${rand}`;
}

export async function createBooking(input: BookingInput) {
  const reference = generateReference("RERA-BK");
  const result = await sheetdbInsert(
    {
      reference,
      created_at: new Date().toISOString(),
      offer_type: input.offerType,
      offer_slug: input.offerSlug,
      offer_name: input.offerName,
      start_date: input.startDate,
      end_date: input.endDate ?? "",
      adults: input.adults,
      children: input.children,
      options: input.options.join("|"),
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      country: input.country,
      notes: input.notes ?? "",
      total_estimate: input.totalEstimate,
      currency: input.currency,
      status: "pending",
    },
    { sheet: process.env.SHEETDB_BOOKINGS_SHEET }
  );
  return { ...result, reference };
}

export async function createBusinessRequest(input: BusinessRequestInput) {
  const reference = generateReference("RERA-BIZ");
  const service = businessServices.find((s) => s.id === input.service);

  // Les détails propres à la rubrique sont regroupés dans la colonne "message"
  // (une ligne par champ) pour rester compatibles avec les colonnes existantes de la feuille.
  const detailLines = input.details
    .filter((d) => d.value.trim() !== "")
    .map((d) => `• ${d.label} : ${d.value}`);
  const message = [
    detailLines.join("\n"),
    input.message?.trim() ? `Précisions complémentaires :\n${input.message.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const result = await sheetdbInsert(
    {
      reference,
      created_at: new Date().toISOString(),
      company_name: input.organization ?? "",
      contact_name: input.contactName,
      email: input.email,
      phone: input.phone,
      event_type: service?.title.fr ?? input.service,
      attendees: input.attendees ?? "",
      preferred_date: input.preferredDate ?? "",
      budget_range: input.budget ?? "",
      message,
      status: "new",
    },
    { sheet: process.env.SHEETDB_BUSINESS_SHEET }
  );
  return { ...result, reference };
}

export async function createContactMessage(input: ContactInput) {
  const reference = generateReference("RERA-MSG");
  const result = await sheetdbInsert(
    {
      reference,
      created_at: new Date().toISOString(),
      full_name: input.fullName,
      email: input.email,
      subject: input.subject,
      message: input.message,
      status: "new",
    },
    { sheet: process.env.SHEETDB_CONTACT_SHEET }
  );
  return { ...result, reference };
}
