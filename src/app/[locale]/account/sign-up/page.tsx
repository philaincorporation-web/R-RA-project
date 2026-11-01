import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import { getCurrentUser } from "@/lib/auth/server";
import { AuthShell } from "@/components/account/auth-shell";
import { AuthForm } from "@/components/account/auth-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "en" ? "Create my account" : "Créer mon compte", robots: { index: false } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  // Déjà connecté : direction l'espace client.
  if (await getCurrentUser()) redirect(`/${locale}/account`);
  const fr = locale === "fr";

  return (
    <AuthShell
      locale={locale}
      title={fr ? "Créer mon compte" : "Create my account"}
      subtitle={fr ? "Suivez vos réservations et retrouvez chaque récapitulatif." : "Track your bookings and keep every summary."}
      subtitleMobile={fr ? "Suivez vos réservations en un coup d'œil." : "Track your bookings at a glance."}
    >
      <AuthForm mode="sign-up" locale={locale} />
    </AuthShell>
  );
}
