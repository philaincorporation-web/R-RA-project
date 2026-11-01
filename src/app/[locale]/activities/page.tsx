import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getActivities } from "@/lib/sheetdb/queries";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/aceternity/reveal";
import { ActivityCard } from "@/components/activities/activity-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: AppLocale = isValidLocale(locale) ? locale : "fr";
  const dict = await getDictionary(safeLocale);
  return {
    title: dict.pages?.activities?.title ?? dict.nav.activities,
    description: dict.pages?.activities?.subtitle ?? "",
  };
}

export default async function ActivitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const activities = await getActivities();

  return (
    <>
      <PageHero
        eyebrow={locale === "fr" ? "Expériences" : "Experiences"}
        title={dict.pages?.activities?.title ?? dict.nav.activities}
        subtitle={
          dict.pages?.activities?.subtitle ??
          (locale === "fr"
            ? "Vivez Pointe Denis sous toutes ses facettes."
            : "Experience Pointe Denis in every way.")
        }
        backgroundImages={[
          "/images/bg-activities-1.jpg",
          "/images/bg-activities-2.jpg",
          "/images/bg-activities-3.jpg",
        ]}
      />

      <section className="bg-rera-mist py-20 dark:bg-rera-navy-900">
        <Container>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity, i) => (
              <Reveal key={activity.id} index={i % 3}>
                <ActivityCard activity={activity} locale={locale} dict={dict} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}