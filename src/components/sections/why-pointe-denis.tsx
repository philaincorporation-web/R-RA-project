import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, CalendarDays, Compass, MapPin, Ship, Utensils, type LucideIcon } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/aceternity/reveal";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type L = { fr: string; en: string };

/**
 * Raccourcis d'action : chaque carte mène directement à la page
 * où le visiteur peut agir (réserver, demander un devis, découvrir…).
 */
const actions: { icon: LucideIcon; title: L; text: L; href: string }[] = [
  {
    icon: BedDouble,
    title: { fr: "Séjourner", en: "Stay" },
    text: { fr: "Hôtels et hébergements", en: "Hotels and accommodation" },
    href: "/accommodation",
  },
  {
    icon: Utensils,
    title: { fr: "Manger", en: "Eat" },
    text: { fr: "Restaurants et gastronomie", en: "Restaurants and local cuisine" },
    href: "/activities/restauration",
  },
  {
    icon: Compass,
    title: { fr: "Explorer", en: "Explore" },
    text: { fr: "Activités et excursions", en: "Activities and excursions" },
    href: "/activities",
  },
  {
    icon: Ship,
    title: { fr: "Se déplacer", en: "Get around" },
    text: { fr: "Transport et traversée", en: "Transport and boat crossing" },
    href: "/activities/navette",
  },
  {
    icon: CalendarDays,
    title: { fr: "Organiser", en: "Organise" },
    text: { fr: "Événements et séminaires", en: "Events and seminars" },
    href: "/business#devis",
  },
  {
    icon: MapPin,
    title: { fr: "Découvrir", en: "Discover" },
    text: { fr: "Lieux incontournables", en: "Must-see places" },
    href: "/discover",
  },
];

export function WhyPointeDenis({ locale, dict }: { locale: AppLocale; dict: Dictionary }) {
  const fr = locale === "fr";

  return (
    <section className="relative isolate overflow-hidden bg-rera-mist py-24 dark:bg-rera-navy-900">
      {/* Photo de Pointe Denis en fond, uniquement en mode clair, voilée de blanc pour garder le texte lisible. */}
      <div className="absolute inset-0 -z-10 dark:hidden" aria-hidden>
        <Image
          src="/images/bg-why-pointe-denis.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-white/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/60" />
      </div>

      <Container>
        <SectionHeading eyebrow={dict.why.eyebrow} title={dict.why.title} subtitle={dict.why.subtitle} />

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Reveal key={action.href} index={i % 3} className="h-full">
                <Link
                  href={`/${locale}${action.href}`}
                  className="group card-surface flex h-full flex-col items-center rounded-xl2 px-4 py-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rera-gold-400/60 hover:shadow-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rera-gold-500 sm:px-6"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-rera-gold-gradient text-rera-navy-900 shadow-glow-gold transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-4 font-heading text-base font-semibold text-rera-navy-800 dark:text-white sm:text-lg">
                    {fr ? action.title.fr : action.title.en}
                  </h3>
                  <p className="mt-1 text-xs text-rera-navy-500 dark:text-rera-mist/70 sm:text-sm">
                    {fr ? action.text.fr : action.text.en}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-rera-lagoon-600 opacity-80 transition-all group-hover:gap-2 group-hover:opacity-100 dark:text-rera-lagoon-300">
                    {fr ? "Y aller" : "Go"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
