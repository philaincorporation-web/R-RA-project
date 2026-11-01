import { Container } from "@/components/ui/primitives";
import { HeroBackgroundCarousel } from "@/components/layout/hero-background-carousel";
import { AnimatedText } from "@/components/ui/animated-text";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  backgroundImages?: string[];
  overlayOpacity?: number;
};

export function PageHero({
  eyebrow,
  title,
  subtitle,
  backgroundImages = [],
  overlayOpacity = 0.55,
}: PageHeroProps) {
  return (
    <section className="relative min-h-[320px] overflow-hidden py-28 text-white sm:py-32">
      <HeroBackgroundCarousel
        images={backgroundImages}
        overlayOpacity={overlayOpacity}
        intervalMs={5000}
      />

      <Container>
        <div className="relative z-10 max-w-3xl">
          {eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-rera-gold-400">
              {eyebrow}
            </p>
          )}

          <AnimatedText
            as="h1"
            text={title}
            className="mt-3 font-heading text-3xl font-bold sm:text-5xl"
          />

          {subtitle && (
            <AnimatedText
              as="p"
              text={subtitle}
              className="mt-4 max-w-2xl text-lg text-white/85 sm:text-xl"
            />
          )}
        </div>
      </Container>
    </section>
  );
}