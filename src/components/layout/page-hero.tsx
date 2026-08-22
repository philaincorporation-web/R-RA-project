import { Container } from "@/components/ui/primitives";
import { HeroBackgroundCarousel } from "@/components/layout/hero-background-carousel";

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
    <section className="relative min-h-[320px] overflow-hidden py-28 sm:py-32">
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
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-2xl text-lg text-white/85 sm:text-xl">
              {subtitle}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}