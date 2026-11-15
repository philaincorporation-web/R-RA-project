import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import { PageHero } from "@/components/layout/page-hero";
import { TrackForm } from "@/components/account/track-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "en" ? "Track my request" : "Suivre ma demande",
    description:
      locale === "en"
        ? "Check the status of your RÈRA booking or request with your reference."
        : "Consultez l'état de votre réservation ou demande RÈRA avec votre référence.",
  };
}

export default async function TrackPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const { ref } = await searchParams;
  const fr = locale === "fr";

  return (
    <>
      <PageHero
        title={fr ? "Suivre ma demande" : "Track my request"}
        subtitle={fr ? "L'état de votre réservation, sans créer de compte." : "Your booking status, no account needed."}
        backgroundImages={["/images/bg-home.jpg"]}
      />
      <section className="bg-rera-mist py-16 dark:bg-rera-navy-900">
        <div className="container-rera">
          <TrackForm locale={locale} initialReference={typeof ref === "string" ? ref.slice(0, 64).toUpperCase() : undefined} />
          <p className="mx-auto mt-6 max-w-md text-center text-sm text-rera-navy-500 dark:text-rera-mist/70">
            {fr ? "Vous avez un compte ? " : "Have an account? "}
            <Link href={`/${locale}/account`} className="font-medium text-rera-lagoon-700 hover:underline dark:text-rera-lagoon-300">
              {fr ? "Retrouvez toutes vos réservations dans votre espace client." : "Find all your bookings in your account."}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
