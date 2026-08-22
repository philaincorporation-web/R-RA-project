import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getAccommodations, getActivities, getPackages } from "@/lib/sheetdb/queries";

const staticRoutes = [
  "",
  "/discover",
  "/history",
  "/packages",
  "/accommodation",
  "/activities",
  "/business",
  "/booking",
  "/practical-info",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rera-pointedenis.com";
  const [packages, activities, accommodations] = await Promise.all([
    getPackages(),
    getActivities(),
    getAccommodations(),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of staticRoutes) {
      entries.push({ url: `${siteUrl}/${locale}${route}`, lastModified: new Date() });
    }
    for (const pkg of packages) {
      entries.push({ url: `${siteUrl}/${locale}/packages/${pkg.slug}`, lastModified: new Date() });
    }
    for (const activity of activities) {
      entries.push({ url: `${siteUrl}/${locale}/activities/${activity.slug}`, lastModified: new Date() });
    }
    for (const acc of accommodations) {
      entries.push({ url: `${siteUrl}/${locale}/accommodation/${acc.slug}`, lastModified: new Date() });
    }
  }

  return entries;
}
