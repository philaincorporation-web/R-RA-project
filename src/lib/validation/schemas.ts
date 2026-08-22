import { z } from "zod";

export const bookingSchema = z.object({
  offerType: z.enum(["package", "activity", "accommodation"]),
  offerSlug: z.string().min(1),
  offerName: z.string().min(1),
  startDate: z.string().min(1, "La date de début est requise"),
  endDate: z.string().optional(),
  adults: z.coerce.number().int().min(1).max(30),
  children: z.coerce.number().int().min(0).max(30),
  options: z.array(z.string()).default([]),
  fullName: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(6, "Numéro de téléphone invalide"),
  country: z.string().min(2),
  notes: z.string().optional(),
  totalEstimate: z.coerce.number().min(0),
  currency: z.string().default("XAF"),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const businessRequestSchema = z.object({
  companyName: z.string().min(2, "Nom de l'entreprise requis"),
  contactName: z.string().min(2, "Nom du contact requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(6, "Numéro de téléphone invalide"),
  eventType: z.string().min(2),
  attendees: z.coerce.number().int().min(1).max(2000),
  preferredDate: z.string().optional(),
  budgetRange: z.string().optional(),
  message: z.string().min(10, "Merci de détailler votre demande (10 caractères min.)"),
});

export type BusinessRequestInput = z.infer<typeof businessRequestSchema>;

export const contactSchema = z.object({
  fullName: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  subject: z.string().min(2, "Sujet requis"),
  message: z.string().min(10, "Message trop court (10 caractères min.)"),
});

export type ContactInput = z.infer<typeof contactSchema>;
