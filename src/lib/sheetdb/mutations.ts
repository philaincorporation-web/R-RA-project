import "server-only";
import { sheetdbInsert } from "./client";
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
  const result = await sheetdbInsert(
    {
      reference,
      created_at: new Date().toISOString(),
      company_name: input.companyName,
      contact_name: input.contactName,
      email: input.email,
      phone: input.phone,
      event_type: input.eventType,
      attendees: input.attendees,
      preferred_date: input.preferredDate ?? "",
      budget_range: input.budgetRange ?? "",
      message: input.message,
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
