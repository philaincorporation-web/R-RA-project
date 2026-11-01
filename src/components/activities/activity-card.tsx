import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import type { Activity } from "@/types";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { formatPrice, pick } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";

export function ActivityCard({
  activity,
  locale,
  dict,
}: {
  activity: Activity;
  locale: AppLocale;
  dict: Dictionary;
}) {
  return (
    <div className="group card-surface flex flex-col overflow-hidden rounded-xl2 shadow-premium transition-transform duration-300 hover:-translate-y-1.5">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={activity.image}
          alt={pick(activity.name, locale)}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-lg font-semibold text-rera-navy-800 dark:text-white">
          <Link href={`/${locale}/activities/${activity.slug}`} className="hover:text-rera-lagoon-600 dark:hover:text-rera-lagoon-300">
            {pick(activity.name, locale)}
          </Link>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-rera-navy-500 dark:text-rera-mist/70">
          {pick(activity.description, locale)}
        </p>
        <div className="mt-4 space-y-1.5 text-xs text-rera-navy-500 dark:text-rera-mist/60">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-rera-lagoon-500" />
            {dict.activities.duration}: {pick(activity.duration, locale)}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-rera-lagoon-500" />
            {dict.activities.availability}: {pick(activity.availability, locale)}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-rera-navy-100/60 pt-4 dark:border-white/10">
          <span className="text-lg font-bold text-rera-navy-800 dark:text-white">
            {formatPrice(activity.price, activity.currency, locale)}
          </span>
          <Button href={`/${locale}/activities/${activity.slug}`} size="sm" variant="secondary">
            {dict.activities.cta}
          </Button>
        </div>
      </div>
    </div>
  );
}
