import type { Accommodation } from "@/types";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { AccommodationCard } from "@/components/accommodation/accommodation-card";
import { Reveal } from "@/components/ui/aceternity/reveal";
import { Button } from "@/components/ui/button";

export function AccommodationPreview({
  items,
  locale,
  dict,
}: {
  items: Accommodation[];
  locale: AppLocale;
  dict: Dictionary;
}) {
  return (
    <section className="bg-white py-24 dark:bg-rera-navy-800/40">
      <Container>
        <SectionHeading
          eyebrow={dict.accommodation.eyebrow}
          title={dict.accommodation.title}
          subtitle={dict.accommodation.subtitle}
        />
        <div className="mt-12 space-y-6">
          {items.slice(0, 3).map((item, i) => (
            <Reveal key={item.id} index={i}>
              <AccommodationCard item={item} locale={locale} dict={dict} />
            </Reveal>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Button href={`/${locale}/accommodation`} variant="secondary">
            {dict.accommodation.viewAll}
          </Button>
        </div>
      </Container>
    </section>
  );
}
