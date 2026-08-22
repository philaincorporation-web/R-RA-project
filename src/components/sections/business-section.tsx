import { Briefcase, Users2, Sparkles, PartyPopper, Utensils, Building2 } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/aceternity/reveal";
import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const icons = [Briefcase, Users2, Sparkles, PartyPopper, Utensils, Building2];

export function BusinessSection({ locale, dict }: { locale: AppLocale; dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden bg-rera-gradient py-24 text-white">
      <Container className="relative">
        <SectionHeading
          eyebrow={dict.business.eyebrow}
          title={dict.business.title}
          subtitle={dict.business.subtitle}
          className="[&_h2]:text-white [&_p]:text-white/75"
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dict.business.services.map((service, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Reveal key={service.title} index={i}>
                <div className="h-full rounded-xl2 border border-white/15 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:bg-white/10">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rera-gold-gradient text-rera-navy-900">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{service.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <Button href={`/${locale}/business`} variant="outline" size="lg">
            {dict.business.cta}
          </Button>
        </div>
      </Container>
    </section>
  );
}
