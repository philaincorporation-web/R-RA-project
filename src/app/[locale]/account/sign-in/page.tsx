import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isValidLocale } from "@/lib/i18n/config";
import { getCurrentUser } from "@/lib/auth/server";
import { AuthShell } from "@/components/account/auth-shell";
import { AuthForm } from "@/components/account/auth-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "en" ? "Sign in" : "Connexion", robots: { index: false } };
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
      title={fr ? "Connexion" : "Sign in"}
      subtitle={fr ? "Heureux de vous revoir. Accédez à votre espace RÈRA." : "Welcome back. Access your RÈRA space."}
      subtitleMobile={fr ? "Accédez à votre espace RÈRA." : "Access your RÈRA space."}
    >
      <AuthForm mode="sign-in" locale={locale} />
    </AuthShell>
  );
}
