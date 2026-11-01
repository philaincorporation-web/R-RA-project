import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { siteConfig } from "@/data";
import type { AppLocale } from "@/lib/i18n/config";

const BACKGROUND = "/images/bg-home.jpg";

/**
 * Mise en page plein écran des pages Connexion / Inscription :
 * photo en fond, accroche à gauche, carte du formulaire à droite (empilées sur mobile).
 */
export function AuthShell({
  locale,
  title,
  subtitle,
  subtitleMobile,
  children,
}: {
  locale: AppLocale;
  title: string;
  subtitle: string;
  /** Version courte du sous-titre affichée sur mobile. */
  subtitleMobile?: string;
  children: ReactNode;
}) {
  const fr = locale === "fr";
  const year = new Date().getFullYear();

  return (
    <div className="relative min-h-svh bg-rera-navy-900 lg:flex lg:items-center lg:justify-center lg:p-8 xl:p-12">
      {/* Fond flouté autour de la carte (desktop) */}
      <div aria-hidden className="absolute inset-0 hidden overflow-hidden lg:block">
        <Image src={BACKGROUND} alt="" fill sizes="100vw" className="scale-110 object-cover blur-2xl" />
        <div className="absolute inset-0 bg-rera-navy-950/40" />
      </div>

      <div className="relative isolate flex min-h-svh w-full max-w-[100rem] flex-col overflow-hidden lg:min-h-[calc(100svh-4rem)] lg:rounded-[2rem] lg:shadow-premium xl:min-h-[calc(100svh-6rem)]">
        {/* Photo + voile */}
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image src={BACKGROUND} alt="" fill priority sizes="100vw" className="object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-b from-rera-navy-900/50 via-rera-navy-900/95 via-45% to-rera-navy-900 lg:bg-gradient-to-r lg:from-rera-navy-900/85 lg:via-rera-navy-900/70 lg:via-50% lg:to-rera-navy-900/50" />
        </div>

        {/* En-tête */}
        <header className="flex items-center justify-between gap-4 px-6 pt-6 sm:px-10 lg:px-14 lg:pt-10">
          <Link href={`/${locale}`} className="group flex items-center gap-3" aria-label={`${siteConfig.name} — ${fr ? "Accueil" : "Home"}`}>
            <Image
              src={siteConfig.images.logo}
              alt=""
              width={56}
              height={56}
              className="h-12 w-12 rounded-full object-cover ring-4 ring-white/15 transition-transform duration-300 group-hover:scale-105 lg:h-14 lg:w-14"
            />
            <span className="font-heading text-2xl font-bold tracking-wide text-white">{siteConfig.name}</span>
          </Link>

          <div className="flex items-center gap-6">
            <LanguageSwitcher locale={locale} dark size="lg" />
            <Link
              href={`/${locale}`}
              className="hidden items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-rera-gold-400 lg:flex"
            >
              <ArrowLeft className="h-4 w-4" />
              {fr ? "Retour au site" : "Back to site"}
            </Link>
          </div>
        </header>

        {/* Contenu */}
        <div className="flex flex-1 flex-col gap-10 px-6 pb-10 pt-16 sm:px-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-center lg:gap-16 lg:px-14 lg:py-12">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-white/30 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm sm:text-sm">
              Pointe Denis · Gabon
            </span>
            <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              {fr ? "Votre escapade commence ici." : "Your getaway starts here."}
            </h1>
            <p className="mt-6 hidden max-w-xl text-lg leading-relaxed text-white/90 lg:block xl:text-xl">
              {fr
                ? "Une destination entre océan, nature, histoire et expériences uniques au cœur du Gabon."
                : "A destination of ocean, nature, history and unique experiences in the heart of Gabon."}
            </p>
            <p className="mt-5 hidden max-w-xl leading-relaxed text-white/70 lg:block">
              {fr
                ? "Connectez-vous pour réserver vos séjours, suivre vos réservations et accéder aux offres RÈRA Business."
                : "Sign in to book your stays, track your reservations and access RÈRA Business offers."}
            </p>
          </div>

          <div className="w-full lg:rounded-[1.75rem] lg:border lg:border-white/10 lg:bg-rera-navy-900/80 lg:p-10 lg:shadow-premium lg:backdrop-blur-xl">
            <h2 className="font-heading text-3xl font-bold text-white lg:text-4xl">{title}</h2>
            <p className="mt-2 text-white/70 lg:text-white/85">
              {subtitleMobile ? (
                <>
                  <span className="lg:hidden">{subtitleMobile}</span>
                  <span className="hidden lg:inline">{subtitle}</span>
                </>
              ) : (
                subtitle
              )}
            </p>
            <div className="mt-6">{children}</div>
          </div>
        </div>

        <footer className="hidden px-14 pb-8 text-sm text-white/70 lg:block">
          © {year} {siteConfig.name} · Pointe Denis, Estuaire, Gabon
        </footer>
      </div>
    </div>
  );
}
