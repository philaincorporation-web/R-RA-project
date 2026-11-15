import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { getAccommodations, getActivities, getPackages } from "@/lib/sheetdb/queries";
import { addDays, checkAvailability, getInventory, getUsage, isManaged, nightsBetween, periodFor, todayLibreville } from "@/lib/availability/engine";
import type { AvailabilityResult, OfferType } from "@/lib/availability/types";
import { estimateTotal } from "@/lib/pricing";
import { bookingSchema } from "@/lib/validation/schemas";
import { getReservationByReference, normalizeReference, statusExplanation, verifyAccessToken } from "@/lib/tracking/server";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Outils mis à disposition du modèle. Règles :
 *  - lecture seule, données réelles (catalogue + Neon) ;
 *  - aucun outil n'enregistre de demande : prepareReservationRequest renvoie un BROUILLON,
 *    que le visiteur transmet lui-même en cliquant sur la carte récapitulative ;
 *  - aucun outil ne confirme, refuse ou annule (réservé au back-office) ;
 *  - le statut d'une demande n'est donné qu'à un visiteur vérifié par code e-mail.
 */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format AAAA-MM-JJ");
const offerTypeSchema = z.enum(["accommodation", "activity", "package"]);

interface OfferInfo {
  slug: string;
  type: OfferType;
  name: string;
  price: number;
  currency: string;
  priceUnit: string;
  url: string;
  capacityPerUnit?: number;
  duration?: string;
  summary: string;
  details: string[];
}

async function loadOffers(locale: AppLocale): Promise<OfferInfo[]> {
  const fr = locale === "fr";
  const pick = (t: { fr: string; en: string }) => (fr ? t.fr : t.en) || t.fr;
  const [accommodations, activities, packages] = await Promise.all([getAccommodations(), getActivities(), getPackages()]);
  return [
    ...accommodations.map((a) => ({
      slug: a.slug,
      type: "accommodation" as const,
      name: pick(a.name),
      price: a.price,
      currency: a.currency,
      priceUnit: fr ? "par nuit et par logement" : "per night per unit",
      url: `/${locale}/accommodation/${a.slug}`,
      capacityPerUnit: a.capacity,
      summary: pick(a.description),
      details: a.amenities.map(pick),
    })),
    ...activities.map((a) => ({
      slug: a.slug,
      type: "activity" as const,
      name: pick(a.name),
      price: a.price,
      currency: a.currency,
      priceUnit: fr ? "par personne (enfant : -50 %)" : "per person (children: -50%)",
      url: `/${locale}/activities/${a.slug}`,
      duration: pick(a.duration),
      summary: pick(a.description),
      details: [pick(a.availability), `${fr ? "Catégorie" : "Category"} : ${a.category}`],
    })),
    ...packages.map((p) => ({
      slug: p.slug,
      type: "package" as const,
      name: pick(p.name),
      price: p.price,
      currency: p.currency,
      priceUnit: p.price > 0 ? (fr ? "par personne (enfant : -50 %)" : "per person (children: -50%)") : fr ? "sur devis" : "on quote",
      url: `/${locale}/packages/${p.slug}`,
      duration: `${p.durationDays} ${fr ? "jour(s)" : "day(s)"} / ${p.nights} ${fr ? "nuit(s)" : "night(s)"}`,
      summary: pick(p.tagline) || pick(p.description),
      details: p.inclusions.map(pick),
    })),
  ];
}

/** Résumé d'une vérification, sans détail interne (pas de stock exact au-delà de 3). */
function publicAvailability(r: AvailabilityResult) {
  return {
    status: r.status,
    reason: r.reason ?? null,
    minNights: r.reason === "min_nights" ? r.minNights : undefined,
    unitsLeft: r.status === "available" && r.unitsLeft !== null && r.unitsLeft <= 3 ? r.unitsLeft : undefined,
    meaning:
      r.status === "available"
        ? "Disponible à ce jour (sous réserve de validation par l'équipe)."
        : r.status === "on_request"
        ? "Stock non géré en ligne : l'équipe confirmera la disponibilité après la demande. Ne pas affirmer que c'est disponible."
        : r.status === "unavailable"
        ? r.reason === "held"
          ? "Complet pour le moment à cause de demandes en attente : une place peut se libérer."
          : r.reason === "closed"
          ? "Fermé sur tout ou partie de la période."
          : "Complet sur ces dates."
        : "Demande invalide (voir reason).",
  };
}

/** Jusqu'à 3 autres dates possibles (même durée) autour de la période demandée, en une seule requête. */
async function alternatives(offerSlug: string, startDate: string, endDate: string | undefined, guests: number) {
  const inventory = await getInventory(offerSlug);
  if (!isManaged(inventory)) return [];
  const { start, end } = periodFor(inventory.mode, startDate, endDate);
  const length = nightsBetween(start, end);
  const today = todayLibreville();
  const rangeStart = addDays(start, -7) < today ? today : addDays(start, -7);
  const rangeEnd = addDays(end, 21);
  const usage = await getUsage(offerSlug, rangeStart, rangeEnd);
  const leftByDate = new Map(
    usage.map((n) => [n.date, n.closed ? 0 : inventory.unitsTotal - n.firm - n.held - n.blocked])
  );
  const units = inventory.mode === "daily" ? guests : inventory.guestsPerUnit ? Math.ceil(guests / inventory.guestsPerUnit) : 1;

  const found: { startDate: string; endDate?: string }[] = [];
  const offsets = [1, -1, 2, -2, 3, -3, 4, 5, 6, 7, -4, -5, -6, -7, 8, 9, 10, 11, 12, 13, 14];
  for (const offset of offsets) {
    const s = addDays(start, offset);
    if (s < today) continue;
    let ok = true;
    for (let i = 0; i < length; i++) {
      if ((leftByDate.get(addDays(s, i)) ?? 0) < units) {
        ok = false;
        break;
      }
    }
    if (ok) found.push(inventory.mode === "nightly" ? { startDate: s, endDate: addDays(s, length) } : { startDate: s });
    if (found.length === 3) break;
  }
  return found.sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function estimate(offer: OfferInfo, startDate: string, endDate: string | undefined, adults: number, children: number) {
  if (offer.type === "accommodation") {
    const nights = endDate ? nightsBetween(startDate, endDate) : 1;
    const units = offer.capacityPerUnit ? Math.max(1, Math.ceil((adults + children) / offer.capacityPerUnit)) : 1;
    return Math.round(offer.price * Math.max(1, nights) * units);
  }
  return estimateTotal({ basePrice: offer.price, adults, children });
}

export function buildAssistantTools(ctx: { locale: AppLocale; trackingCookie?: string }) {
  const { locale } = ctx;
  let offersCache: Promise<OfferInfo[]> | null = null;
  const offers = () => (offersCache ??= loadOffers(locale));
  const findOffer = async (slug: string) => (await offers()).find((o) => o.slug === slug) ?? null;

  return {
    searchOffers: tool({
      description:
        "Liste les offres réelles de RÈRA (hébergements, activités, séjours) avec leurs prix. Si des dates sont fournies, indique aussi la disponibilité de chaque offre. À utiliser avant de proposer quoi que ce soit.",
      inputSchema: z.object({
        type: offerTypeSchema.optional().describe("Filtrer par type d'offre"),
        startDate: isoDate.optional().describe("Date d'arrivée ou de l'activité (AAAA-MM-JJ)"),
        endDate: isoDate.optional().describe("Date de départ pour un hébergement (AAAA-MM-JJ), jour du départ exclu des nuits"),
        adults: z.number().int().min(1).max(30).optional(),
        children: z.number().int().min(0).max(30).optional(),
      }),
      execute: async ({ type, startDate, endDate, adults = 2, children = 0 }) => {
        try {
          const list = (await offers()).filter((o) => !type || o.type === type).slice(0, 15);
          const withAvailability = await Promise.all(
            list.map(async (o) => {
              const base = { slug: o.slug, type: o.type, name: o.name, price: o.price, currency: o.currency, priceUnit: o.priceUnit, capacityPerUnit: o.capacityPerUnit, duration: o.duration, url: o.url };
              if (!startDate) return base;
              const check = await checkAvailability({
                offerSlug: o.slug,
                startDate,
                endDate: o.type === "accommodation" ? endDate : undefined,
                guests: adults + children,
              });
              return { ...base, availability: publicAvailability(check) };
            })
          );
          return { today: todayLibreville(), offers: withAvailability };
        } catch (error) {
          console.error("[assistant] searchOffers", error);
          return { error: "Impossible de consulter le catalogue ou les disponibilités pour le moment. Ne rien inventer : proposer de réessayer ou de contacter l'équipe." };
        }
      },
    }),

    getOfferDetails: tool({
      description: "Détails d'une offre précise (description, inclusions ou équipements, durée, prix, lien vers sa page).",
      inputSchema: z.object({ offerSlug: z.string().min(1).max(120) }),
      execute: async ({ offerSlug }) => {
        try {
          const offer = await findOffer(offerSlug);
          return offer ?? { error: "Offre introuvable. Utiliser searchOffers pour obtenir les identifiants (slug) valides." };
        } catch (error) {
          console.error("[assistant] getOfferDetails", error);
          return { error: "Catalogue momentanément indisponible." };
        }
      },
    }),

    checkAvailability: tool({
      description:
        "Vérifie en temps réel la disponibilité d'une offre pour des dates et un nombre de voyageurs. Si c'est complet, propose jusqu'à 3 autres dates proches. Ne jamais annoncer une disponibilité sans cet outil.",
      inputSchema: z.object({
        offerSlug: z.string().min(1).max(120),
        startDate: isoDate.describe("Date d'arrivée ou de l'activité"),
        endDate: isoDate.optional().describe("Date de départ (hébergement uniquement)"),
        adults: z.number().int().min(1).max(30),
        children: z.number().int().min(0).max(30).default(0),
      }),
      execute: async ({ offerSlug, startDate, endDate, adults, children }) => {
        try {
          const offer = await findOffer(offerSlug);
          if (!offer) return { error: "Offre introuvable : utiliser searchOffers." };
          const end = offer.type === "accommodation" ? endDate : undefined;
          if (offer.type === "accommodation" && !end) return { error: "Pour un hébergement, la date de départ est nécessaire." };
          const guests = adults + children;
          const result = await checkAvailability({ offerSlug, startDate, endDate: end, guests });
          return {
            offer: offer.name,
            startDate,
            endDate: end,
            ...publicAvailability(result),
            estimatedTotal: result.status === "invalid" ? undefined : estimate(offer, startDate, end, adults, children),
            currency: offer.currency,
            otherDates: result.status === "unavailable" ? await alternatives(offerSlug, startDate, end, guests) : undefined,
          };
        } catch (error) {
          console.error("[assistant] checkAvailability", error);
          return { error: "La disponibilité ne peut pas être vérifiée pour le moment. Le dire clairement au client, sans rien inventer." };
        }
      },
    }),

    prepareReservationRequest: tool({
      description:
        "Prépare le RÉCAPITULATIF d'une demande de réservation, affiché au client avec un bouton « Transmettre ma demande ». N'enregistre rien et ne confirme rien : c'est le client qui transmet. À appeler uniquement quand toutes les informations sont réunies.",
      inputSchema: z.object({
        offerSlug: z.string().min(1).max(120),
        startDate: isoDate,
        endDate: isoDate.optional().describe("Date de départ (hébergement uniquement)"),
        adults: z.number().int().min(1).max(30),
        children: z.number().int().min(0).max(30).default(0),
        fullName: z.string().min(2).max(120),
        email: z.string().max(200),
        phone: z.string().min(6).max(30),
        country: z.string().min(2).max(80),
        notes: z.string().max(1000).optional().describe("Préférences ou informations complémentaires du client"),
      }),
      execute: async (input) => {
        try {
          const offer = await findOffer(input.offerSlug);
          if (!offer) return { ok: false as const, error: "Offre introuvable : utiliser searchOffers." };
          const endDate = offer.type === "accommodation" ? input.endDate : undefined;
          const draft = {
            offerType: offer.type,
            offerSlug: offer.slug,
            offerName: offer.name,
            startDate: input.startDate,
            endDate,
            adults: input.adults,
            children: input.children,
            options: [] as string[],
            fullName: input.fullName.trim(),
            email: input.email.trim(),
            phone: input.phone.trim(),
            country: input.country.trim(),
            notes: input.notes?.trim() || undefined,
            totalEstimate: estimate(offer, input.startDate, endDate, input.adults, input.children),
            currency: offer.currency,
          };
          const parsed = bookingSchema.safeParse(draft);
          if (!parsed.success) {
            return { ok: false as const, error: "Informations à corriger avant le récapitulatif.", fields: parsed.error.flatten().fieldErrors };
          }
          const check = await checkAvailability({ offerSlug: offer.slug, startDate: input.startDate, endDate, guests: input.adults + input.children });
          if (check.status === "unavailable" || check.status === "invalid") {
            return { ok: false as const, error: "Ces dates ne sont pas réservables.", availability: publicAvailability(check) };
          }
          return {
            ok: true as const,
            draft,
            availability: publicAvailability(check),
            instructions:
              "Le récapitulatif est affiché au client. Lui demander de le vérifier puis de cliquer sur « Transmettre ma demande ». La demande sera ensuite validée par l'équipe : ne pas parler de réservation confirmée.",
          };
        } catch (error) {
          console.error("[assistant] prepareReservationRequest", error);
          return { ok: false as const, error: "Impossible de préparer la demande pour le moment. Proposer le formulaire de réservation du site." };
        }
      },
    }),

    getReservationStatus: tool({
      description:
        "Donne l'état réel d'une demande existante à partir de sa référence (RERA-…). Ne fonctionne que si le visiteur a vérifié son identité par code e-mail ; sinon renvoie le lien de vérification.",
      inputSchema: z.object({ reference: z.string().min(6).max(64) }),
      execute: async ({ reference }) => {
        const ref = normalizeReference(reference);
        const trackUrl = `/${locale}/track?ref=${encodeURIComponent(ref)}`;
        try {
          if (!verifyAccessToken(ctx.trackingCookie, ref)) {
            return {
              verified: false,
              trackUrl,
              instructions:
                "Pour protéger les données du client, son identité doit d'abord être vérifiée : lui donner ce lien (référence + e-mail, puis code reçu par e-mail). Ne rien dire sur l'existence ou l'état de la demande.",
            };
          }
          const r = await getReservationByReference(ref);
          if (!r) return { verified: true, error: "Demande introuvable." };
          return {
            verified: true,
            reference: r.reference,
            title: r.title,
            startDate: r.start_date,
            endDate: r.end_date,
            status: r.status,
            explanation: statusExplanation(r.status, locale),
            trackUrl,
          };
        } catch (error) {
          console.error("[assistant] getReservationStatus", error);
          return { error: "Le statut ne peut pas être consulté pour le moment.", trackUrl };
        }
      },
    }),
  };
}

export type AssistantTools = ReturnType<typeof buildAssistantTools>;
