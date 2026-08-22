import Image from "next/image";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/aceternity/reveal";
import { galleryImages } from "@/data";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { AppLocale } from "@/lib/i18n/config";

export function GallerySection({ dict, locale = "fr" }: { dict: Dictionary; locale?: AppLocale }) {
  return (
    <section className="bg-rera-mist py-24 dark:bg-rera-navy-900">
      <Container>
        <SectionHeading eyebrow={dict.gallery.eyebrow} title={dict.gallery.title} subtitle={dict.gallery.subtitle} />
        <div className="mt-12 grid auto-rows-[160px] grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {galleryImages.map((img, i) => (
            <Reveal key={img.src} index={i} className={`relative overflow-hidden rounded-xl2 ${img.span}`}>
              <div className="group relative h-full w-full overflow-hidden rounded-xl2">
                <Image
                  src={img.src}
                  alt={img.alt[locale] ?? img.alt.fr}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-rera-navy-900/0 transition-colors duration-300 group-hover:bg-rera-navy-900/20" />
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
