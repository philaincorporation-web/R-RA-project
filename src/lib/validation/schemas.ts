import { z } from "zod";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export const bookingSchema = z
  .object({
  offerType: z.enum(["package", "activity", "accommodation"]),
  offerSlug: z.string().min(1),
  offerName: z.string().min(1),
  startDate: z.string().regex(isoDate, "La date de début est requise"),
  endDate: z.string().regex(isoDate).optional(),
  adults: z.coerce.number().int().min(1).max(30),
  children: z.coerce.number().int().min(0).max(30),
  options: z.array(z.string()).default([]),
  fullName: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(6, "Numéro de téléphone invalide"),
  country: z.string().min(2),
  notes: z.string().max(3000).optional(),
  paymentMethod: z.string().max(40).optional(),
  totalEstimate: z.coerce.number().min(0),
  currency: z.string().default("XAF"),
  })
  .refine(
    (d) => {
      // Tolérance d'un jour pour les écarts de fuseau horaire entre client et serveur.
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
      return d.startDate >= yesterday;
    },
    { path: ["startDate"], message: "La date ne peut pas être passée" }
  )
  .refine((d) => !d.endDate || d.endDate > d.startDate, {
    path: ["endDate"],
    message: "La date de départ doit être après la date d'arrivée",
  });

export type BookingInput = z.infer<typeof bookingSchema>;

export const businessServiceIds = [
  "seminars",
  "team-building",
  "corporate-events",
  "private-hire",
  "catering",
  "group-accommodation",
] as const;

export const businessRequestSchema = z.object({
  service: z.enum(businessServiceIds),
  contactName: z.string().trim().min(2, "Nom du contact requis").max(120),
  organization: z.string().trim().max(160).optional(),
  email: z.string().trim().email("Email invalide"),
  phone: z.string().trim().min(6, "Numéro de téléphone invalide").max(30),
  preferredDate: z.string().max(20).optional(),
  attendees: z.coerce.number().int().min(1).max(5000).optional(),
  budget: z.string().max(120).optional(),
  /** Réponses aux champs propres à la rubrique (libellé lisible + valeur). */
  details: z
    .array(z.object({ label: z.string().max(120), value: z.string().max(500) }))
    .max(40)
    .default([]),
  message: z.string().max(3000).optional(),
});

export type BusinessRequestInput = z.infer<typeof businessRequestSchema>;

export const contactSchema = z.object({
  fullName: z.string().min(2, "Nom trop court").max(120),
  email: z.string().email("Email invalide").max(200),
  subject: z.string().min(2, "Sujet requis").max(200),
  message: z.string().min(10, "Message trop court (10 caractères min.)").max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
