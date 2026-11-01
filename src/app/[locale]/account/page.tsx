import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, ChevronRight, LogOut, Mail, MapPin, Phone, Inbox } from "lucide-react";
import { isValidLocale } from "@/lib/i18n/config";
import { getCurrentUser } from "@/lib/auth/server";
import { getProfile, listUserReservations, type Reservation } from "@/lib/db/reservations";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { ClearPendingClaim } from "@/components/account/client-helpers";
import { kindLabel, ReservationMeta, StatusBadge } from "@/components/account/reservation-view";
import { signOutAction } from "./actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "en" ? "My account" : "Mon compte", robots: { index: false } };
}

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ welcome?: string; claimed?: string }>;
}) {
  const { locale } = await params;
  const { welcome, claimed } = await searchParams;
  if (!isValidLocale(locale)) notFound();

  // Page protégée : vérification de la session côté serveur.
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/account/sign-in`);

  const fr = locale === "fr";
  let reservations: Reservation[] = [];
  let profile: { phone: string | null; country: string | null } | null = null;
  let loadError = false;
  try {
    [reservations, profile] = await Promise.all([listUserReservations(user.id), getProfile(user.id)]);
  } catch (error) {
    console.error("[account] lecture impossible", error);
    loadError = true;
  }

  const firstName = user.name?.split(" ")[0] ?? "";

  return (
    <>
      <ClearPendingClaim />
      <PageHero
        eyebrow={fr ? "Espace client" : "My account"}
        title={fr ? `Bonjour ${firstName}` : `Hello ${firstName}`}
        subtitle={fr ? "Retrouvez vos réservations, demandes et récapitulatifs." : "Find your bookings, requests and summaries."}
        backgroundImages={["/images/bg-home.jpg"]}
      />

      <section className="bg-rera-mist py-16 dark:bg-rera-navy-900">
        <div className="container-rera grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ===== Profil ===== */}
          <aside className="space-y-4 lg:col-span-1">
            {welcome || claimed ? (
              <div className="flex items-start gap-2 rounded-xl2 border border-rera-emerald-400/40 bg-rera-emerald-50 p-4 text-sm text-rera-navy-700 dark:bg-white/5 dark:text-rera-mist">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-rera-emerald-500" />
                <span>
                  {welcome ? (fr ? "Votre compte est créé. " : "Your account is ready. ") : ""}
                  {claimed
                    ? fr
                      ? "Votre dernière demande a été ajoutée à votre historique."
                      : "Your latest request was added to your history."
                    : ""}
                </span>
              </div>
            ) : null}

            <div className="card-surface rounded-xl2 p-6 shadow-sm">
              <p className="font-heading text-lg font-semibold text-rera-navy-800 dark:text-white">{user.name}</p>
              <ul className="mt-4 space-y-2.5 text-sm text-rera-navy-600 dark:text-rera-mist/80">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-rera-lagoon-500" />
                  <span className="truncate">{user.email}</span>
                </li>
                {profile?.phone ? (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-rera-lagoon-500" />
                    {profile.phone}
                  </li>
                ) : null}
                {profile?.country ? (
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-rera-lagoon-500" />
                    {profile.country}
                  </li>
                ) : null}
              </ul>
              <form action={signOutAction} className="mt-6 border-t border-rera-navy-100/60 pt-4 dark:border-white/10">
                <input type="hidden" name="locale" value={locale} />
                <Button type="submit" variant="ghost" size="sm" className="w-full">
                  <LogOut className="h-4 w-4" />
                  {fr ? "Se déconnecter" : "Sign out"}
                </Button>
              </form>
            </div>

            <div className="card-surface rounded-xl2 p-5 text-sm text-rera-navy-500 shadow-sm dark:text-rera-mist/70">
              {fr
                ? "Une question ou une réclamation ? Indiquez la référence de votre demande à notre équipe."
                : "A question or a claim? Give our team your request reference."}
              <Button href={`/${locale}/contact`} variant="ghost" size="sm" className="mt-3 w-full">
                {fr ? "Contacter RÈRA" : "Contact RÈRA"}
              </Button>
            </div>
          </aside>

          {/* ===== Historique ===== */}
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="font-heading text-2xl font-bold text-rera-navy-800 dark:text-white">
                {fr ? "Mes réservations et demandes" : "My bookings and requests"}
              </h2>
              <Button href={`/${locale}/booking`} size="sm">
                {fr ? "Nouvelle réservation" : "New booking"}
              </Button>
            </div>

            {loadError ? (
              <p className="card-surface rounded-xl2 p-6 text-sm text-red-600 dark:text-red-300">
                {fr ? "Impossible de charger votre historique pour le moment. Réessayez plus tard." : "Your history could not be loaded right now. Please try again later."}
              </p>
            ) : reservations.length === 0 ? (
              <div className="card-surface flex flex-col items-center rounded-xl2 p-10 text-center shadow-sm">
                <Inbox className="h-10 w-10 text-rera-navy-300 dark:text-rera-mist/40" />
                <p className="mt-4 font-semibold text-rera-navy-700 dark:text-white">
                  {fr ? "Aucune réservation pour l'instant" : "No bookings yet"}
                </p>
                <p className="mt-1 max-w-sm text-sm text-rera-navy-500 dark:text-rera-mist/70">
                  {fr
                    ? "Vos prochaines réservations et demandes Business apparaîtront ici, avec leur récapitulatif complet."
                    : "Your upcoming bookings and Business requests will appear here, with their full summary."}
                </p>
                <Button href={`/${locale}/packages`} variant="secondary" size="sm" className="mt-5">
                  {fr ? "Découvrir les séjours" : "Browse stays"}
                </Button>
              </div>
            ) : (
              <ul className="space-y-4">
                {reservations.map((r) => (
                  <li key={r.reference}>
                    <Link
                      href={`/${locale}/account/reservations/${encodeURIComponent(r.reference)}`}
                      className="group card-surface flex items-center gap-4 rounded-xl2 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-premium"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-rera-gold-600 dark:text-rera-gold-400">
                            {kindLabel(r, locale)}
                          </span>
                          <StatusBadge status={r.status} locale={locale} />
                        </div>
                        <p className="mt-1.5 truncate font-heading text-lg font-semibold text-rera-navy-800 dark:text-white">{r.title}</p>
                        <ReservationMeta r={r} locale={locale} />
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-rera-navy-300 transition-transform group-hover:translate-x-1 dark:text-rera-mist/40" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
