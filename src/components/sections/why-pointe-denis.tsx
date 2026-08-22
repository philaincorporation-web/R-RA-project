import { Waves, Trees, Landmark, Sparkles } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { BentoGrid, BentoItem } from "@/components/ui/aceternity/bento-grid";
import { Reveal } from "@/components/ui/aceternity/reveal";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const icons = [Waves, Trees, Landmark, Sparkles];

export function WhyPointeDenis({ dict }: { dict: Dictionary }) {
  return (
    <section className="relative bg-rera-mist py-24 dark:bg-rera-navy-900">
      <Container>
        <SectionHeading eyebrow={dict.why.eyebrow} title={dict.why.title} subtitle={dict.why.subtitle} />
        <Reveal index={1} className="mt-12">
          <BentoGrid>
            {dict.why.items.map((item, i) => {
              const Icon = icons[i % icons.length];
              return (
                <BentoItem
                  key={item.title}
                  title={item.title}
                  text={item.text}
                  icon={<Icon className="h-5 w-5" />}
                  span={i === 0 ? "2" : undefined}
                />
              );
            })}
          </BentoGrid>
        </Reveal>
      </Container>
    </section>
  );
}
