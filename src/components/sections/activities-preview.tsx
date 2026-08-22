import type { Activity } from "@/types";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { ActivityCard } from "@/components/activities/activity-card";
import { Reveal } from "@/components/ui/aceternity/reveal";
import { Button } from "@/components/ui/button";

export function ActivitiesPreview({
  activities,
  locale,
  dict,
}: {
  activities: Activity[];
  locale: AppLocale;
  dict: Dictionary;
}) {
  return (
    <section className="bg-rera-mist py-24 dark:bg-rera-navy-900">
      <Container>
        <SectionHeading eyebrow={dict.activities.eyebrow} title={dict.activities.title} subtitle={dict.activities.subtitle} />
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {activities.slice(0, 4).map((activity, i) => (
            <Reveal key={activity.id} index={i}>
              <ActivityCard activity={activity} locale={locale} dict={dict} />
            </Reveal>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Button href={`/${locale}/activities`} variant="secondary">
            {dict.activities.viewAll}
          </Button>
        </div>
      </Container>
    </section>
  );
}
