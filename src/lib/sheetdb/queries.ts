import "server-only";
import type { Accommodation, Activity, Package, Testimonial } from "@/types";
import { sheetdbGetAll, sheetdbGetBy } from "./client";
import { safeImage } from "@/lib/images";
import { demoAccommodations, demoActivities, demoPackages, demoTestimonials } from "./demo-data";

/**
 * Convention de colonnes attendue dans Google Sheets pour la feuille "packages" :
 * id | slug | name_fr | name_en | tagline_fr | tagline_en | description_fr | description_en
 * duration_days | nights | price | currency | image | badge_fr | badge_en
 * inclusions_fr (séparées par "|") | inclusions_en (séparées par "|") | featured (TRUE/FALSE)
 *
 * Cette convention "colonne_fr / colonne_en" est utilisée pour toutes les feuilles,
 * ce qui permet de gérer le FR/EN directement depuis Google Sheets sans code additionnel.
 */

type RawRow = Record<string, string | undefined>;

/** Ignore les lignes sans slug (lignes vides ou incomplètes dans Google Sheets) : elles produiraient des liens cassés. */
function withSlug<T extends { slug: string }>(items: T[], fallback: T[]): T[] {
  const valid = items.filter((item) => item.slug.trim() !== "");
  return valid.length > 0 ? valid : fallback;
}

function splitList(value?: string): string[] {
  if (!value) return [];
  return value
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);
}

function mapPackage(row: RawRow): Package {
  return {
    id: row.id ?? row.slug ?? "",
    slug: row.slug ?? "",
    name: { fr: row.name_fr ?? "", en: row.name_en ?? row.name_fr ?? "" },
    tagline: { fr: row.tagline_fr ?? "", en: row.tagline_en ?? row.tagline_fr ?? "" },
    description: { fr: row.description_fr ?? "", en: row.description_en ?? row.description_fr ?? "" },
    durationDays: Number(row.duration_days ?? 0),
    nights: Number(row.nights ?? 0),
    price: Number(row.price ?? 0),
    currency: row.currency ?? "XAF",
    image: safeImage(row.image, "/plagebleu.jpg"),
    badge: row.badge_fr ? { fr: row.badge_fr, en: row.badge_en ?? row.badge_fr } : undefined,
    inclusions: splitList(row.inclusions_fr).map((fr, i) => ({
      fr,
      en: splitList(row.inclusions_en)[i] ?? fr,
    })),
    featured: String(row.featured ?? "").toUpperCase() === "TRUE",
  };
}

function mapActivity(row: RawRow): Activity {
  return {
    id: row.id ?? row.slug ?? "",
    slug: row.slug ?? "",
    name: { fr: row.name_fr ?? "", en: row.name_en ?? row.name_fr ?? "" },
    description: { fr: row.description_fr ?? "", en: row.description_en ?? row.description_fr ?? "" },
    price: Number(row.price ?? 0),
    currency: row.currency ?? "XAF",
    duration: { fr: row.duration_fr ?? "", en: row.duration_en ?? row.duration_fr ?? "" },
    availability: { fr: row.availability_fr ?? "", en: row.availability_en ?? row.availability_fr ?? "" },
    image: safeImage(row.image, "/plagebleu.jpg"),
    category: row.category ?? "general",
  };
}

function mapAccommodation(row: RawRow): Accommodation {
  return {
    id: row.id ?? row.slug ?? "",
    slug: row.slug ?? "",
    name: { fr: row.name_fr ?? "", en: row.name_en ?? row.name_fr ?? "" },
    description: { fr: row.description_fr ?? "", en: row.description_en ?? row.description_fr ?? "" },
    price: Number(row.price ?? 0),
    currency: row.currency ?? "XAF",
    capacity: Number(row.capacity ?? 1),
    amenities: splitList(row.amenities_fr).map((fr, i) => ({
      fr,
      en: splitList(row.amenities_en)[i] ?? fr,
    })),
    availability: { fr: row.availability_fr ?? "", en: row.availability_en ?? row.availability_fr ?? "" },
    image: safeImage(row.image, "/etoile.jpg"),
  };
}

export async function getPackages(): Promise<Package[]> {
  const rows = await sheetdbGetAll<RawRow>({ sheet: process.env.SHEETDB_PACKAGES_SHEET });
  if (!rows || rows.length === 0) return demoPackages;
  return withSlug(rows.map(mapPackage), demoPackages);
}

export async function getPackageBySlug(slug: string): Promise<Package | null> {
  const rows = await sheetdbGetBy<RawRow>("slug", slug, { sheet: process.env.SHEETDB_PACKAGES_SHEET });
  if (rows && rows.length > 0) return mapPackage(rows[0]);
  return demoPackages.find((p) => p.slug === slug) ?? null;
}

export async function getActivities(): Promise<Activity[]> {
  const rows = await sheetdbGetAll<RawRow>({ sheet: process.env.SHEETDB_ACTIVITIES_SHEET });
  if (!rows || rows.length === 0) return demoActivities;
  return withSlug(rows.map(mapActivity), demoActivities);
}

export async function getActivityBySlug(slug: string): Promise<Activity | null> {
  const rows = await sheetdbGetBy<RawRow>("slug", slug, { sheet: process.env.SHEETDB_ACTIVITIES_SHEET });
  if (rows && rows.length > 0) return mapActivity(rows[0]);
  return demoActivities.find((a) => a.slug === slug) ?? null;
}

export async function getAccommodations(): Promise<Accommodation[]> {
  const rows = await sheetdbGetAll<RawRow>({ sheet: process.env.SHEETDB_ACCOMMODATION_SHEET });
  if (!rows || rows.length === 0) return demoAccommodations;
  return withSlug(rows.map(mapAccommodation), demoAccommodations);
}

export async function getAccommodationBySlug(slug: string): Promise<Accommodation | null> {
  const rows = await sheetdbGetBy<RawRow>("slug", slug, { sheet: process.env.SHEETDB_ACCOMMODATION_SHEET });
  if (rows && rows.length > 0) return mapAccommodation(rows[0]);
  return demoAccommodations.find((a) => a.slug === slug) ?? null;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  // Source unique : src/data/testimonials.ts (modifiable facilement dans le code)
  const { testimonials } = await import("@/data/testimonials");
  return testimonials;
}

export async function getContent(key: string): Promise<string | null> {
  const rows = await sheetdbGetBy<RawRow>("key", key, { sheet: "content" });
  if (rows && rows.length > 0) return rows[0].value ?? null;
  return null;
}
