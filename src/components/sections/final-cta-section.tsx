import { Container } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/aceternity/reveal";
import { AuroraBackground } from "@/components/ui/aceternity/aurora-background";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { ArrowRight } from "lucide-react";

export function FinalCtaSection({ locale, dict }: { locale: AppLocale; dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden bg-rera-navy-900 py-24 text-white">
      <AuroraBackground />
      <Container className="relative text-center">
        <Reveal>
          <h2 className="mx-auto max-w-2xl font-heading text-3xl font-bold sm:text-4xl">
            {dict.finalCta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">{dict.finalCta.subtitle}</p>
          <Button href={`/${locale}/booking`} size="lg" className="mt-8">
            {dict.finalCta.cta}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
