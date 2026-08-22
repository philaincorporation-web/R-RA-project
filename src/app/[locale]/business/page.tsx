import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, type AppLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/primitives";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: AppLocale = isValidLocale(locale) ? locale : "fr";
  const dict = await getDictionary(safeLocale);
  return {
    title: "RÈRA Business",
    description:
      dict.business?.subtitle ??
      (locale === "fr"
        ? "Séminaires, forums et événements d'exception."
        : "Seminars, forums and exceptional events."),
  };
}

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  const services =
    locale === "fr"
      ? [
          "Séminaires & forums",
          "Team building",
          "Événements d'entreprise",
          "Privatisation",
          "Restauration sur mesure",
          "Hébergement groupe",
        ]
      : [
          "Seminars & forums",
          "Team building",
          "Corporate events",
          "Private hire",
          "Custom catering",
          "Group accommodation",
        ];

  return (
    <>
      <PageHero
        eyebrow="RÈRA Business"
        title={dict.business?.title ?? "RÈRA Business"}
        subtitle={
          dict.business?.subtitle ??
          (locale === "fr"
            ? "Séminaires, forums et événements d'exception."
            : "Seminars, forums and exceptional events.")
        }
        backgroundImages={[
          "/images/bg-business-1.png",
          "/images/bg-business-2.png",
          "/images/bg-business-3.png",
        ]}
      />

      <section className="bg-rera-mist py-20 dark:bg-rera-navy-900">
        <Container>
          <ul className="grid gap-3 sm:grid-cols-2">
            {services.map((s) => (
              <li
                key={s}
                className="rounded-xl border border-border bg-card px-5 py-4 font-medium"
              >
                {s}
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}