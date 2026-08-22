import { Compass, Ship } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/aceternity/reveal";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export function MapAccessSection({ locale, dict }: { locale: AppLocale; dict: Dictionary }) {
  return (
    <section className="bg-rera-mist py-24 dark:bg-rera-navy-900">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow={dict.map.eyebrow}
              title={dict.map.title}
              subtitle={dict.map.subtitle}
              className="mx-0"
            />
            <div className="mt-6 flex items-center gap-3 text-sm text-rera-navy-600 dark:text-rera-mist/75">
              <Ship className="h-5 w-5 text-rera-lagoon-500" />
              <span>Libreville → Pointe Denis · ~30 min</span>
            </div>
            <Button href={`/${locale}/practical-info`} variant="secondary" className="mt-8">
              <Compass className="h-4 w-4" />
              {dict.map.cta}
            </Button>
          </Reveal>

          <Reveal index={1}>
            <div className="relative h-80 w-full overflow-hidden rounded-xl2 border border-rera-navy-100/60 shadow-premium dark:border-white/10">
              <iframe
                title="Carte Pointe Denis, Gabon"
                src="https://www.google.com/maps?q=Pointe+Denis,+Gabon&output=embed"
                className="h-full w-full grayscale-[15%]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
