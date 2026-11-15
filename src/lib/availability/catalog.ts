import "server-only";
import { getAccommodations, getActivities, getPackages } from "@/lib/sheetdb/queries";
import type { OfferType } from "./types";

/**
 * Liste unifiée des offres réservables (catalogue actuel).
 * Quand le catalogue sera migré dans Neon (phase 3), seule cette fonction changera.
 */
export interface CatalogOffer {
  slug: string;
  type: OfferType;
  name: string;
  /** Personnes par logement (hébergements). */
  capacity?: number;
  category?: string;
}

export async function listCatalogOffers(): Promise<CatalogOffer[]> {
  const [accommodations, activities, packages] = await Promise.all([getAccommodations(), getActivities(), getPackages()]);
  return [
    ...accommodations.map((a) => ({ slug: a.slug, type: "accommodation" as const, name: a.name.fr, capacity: a.capacity })),
    ...activities.map((a) => ({ slug: a.slug, type: "activity" as const, name: a.name.fr, category: a.category })),
    ...packages.map((p) => ({ slug: p.slug, type: "package" as const, name: p.name.fr })),
  ];
}

export const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  accommodation: "Hébergements",
  activity: "Activités",
  package: "Séjours & forfaits",
};
