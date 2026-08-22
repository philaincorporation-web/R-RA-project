import Image from "next/image";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/aceternity/reveal";
import { siteConfig } from "@/data";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export function HistorySection({ locale, dict }: { locale: AppLocale; dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden bg-rera-navy-900 py-24 text-white">
      <div className="pointer-events-none absolute inset-0 bg-rera-aurora opacity-30" />
      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative h-[420px] w-full overflow-hidden rounded-xl2 shadow-premium">
              <Image
                src={siteConfig.images.history}
                alt="Patrimoine de Pointe Denis"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rera-navy-900/70 via-transparent to-transparent" />
            </div>
          </Reveal>

          <div>
            <SectionHeading
              align="left"
              eyebrow={dict.history.eyebrow}
              title={dict.history.title}
              subtitle={dict.history.subtitle}
              className="mx-0 [&_h2]:text-white [&_p]:text-white/70"
            />

            <div className="mt-10 space-y-6 border-l border-white/15 pl-6">
              {dict.history.timeline.map((item, i) => (
                <Reveal key={item.title} index={i}>
                  <div className="relative">
                    <span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-rera-gold-gradient" />
                    <p className="text-xs font-semibold uppercase tracking-widest text-rera-gold-400">
                      {item.year}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/65">{item.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Link
              href={`/${locale}/history`}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-rera-gold-400 hover:text-rera-gold-300"
            >
              {dict.history.readMore} →
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
