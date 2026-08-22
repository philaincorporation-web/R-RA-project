import type { Testimonial } from "@/types";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { InfiniteMovingCards } from "@/components/ui/aceternity/infinite-moving-cards";

export function TestimonialsSection({
  testimonials,
  locale,
  dict,
}: {
  testimonials: Testimonial[];
  locale: AppLocale;
  dict: Dictionary;
}) {
  return (
    <section className="bg-white py-24 dark:bg-rera-navy-800/40">
      <SectionHeading eyebrow={dict.testimonials.eyebrow} title={dict.testimonials.title} className="container-rera" />
      <div className="mt-12">
        <InfiniteMovingCards items={testimonials} locale={locale} />
      </div>
    </section>
  );
}
