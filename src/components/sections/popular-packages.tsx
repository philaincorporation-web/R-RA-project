import type { Package } from "@/types";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { PackageCard } from "@/components/packages/package-card";
import { Reveal } from "@/components/ui/aceternity/reveal";
import { Button } from "@/components/ui/button";

export function PopularPackages({
  packages,
  locale,
  dict,
}: {
  packages: Package[];
  locale: AppLocale;
  dict: Dictionary;
}) {
  const featured = packages.filter((p) => p.featured).slice(0, 3);
  const list = featured.length > 0 ? featured : packages.slice(0, 3);

  return (
    <section className="bg-white py-24 dark:bg-rera-navy-800/40">
      <Container>
        <div className="flex flex-col items-end justify-between gap-6 sm:flex-row">
          <SectionHeading
            align="left"
            eyebrow={dict.packages.eyebrow}
            title={dict.packages.title}
            subtitle={dict.packages.subtitle}
            className="mx-0"
          />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {list.map((pkg, i) => (
            <Reveal key={pkg.id} index={i}>
              <PackageCard pkg={pkg} locale={locale} dict={dict} />
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button href={`/${locale}/packages`} variant="secondary">
            {dict.packages.viewAll}
          </Button>
        </div>
      </Container>
    </section>
  );
}
