"use client";

import { useEffect, useState } from "react";
import { CalendarCheck2, CalendarClock, CalendarX2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type AvailabilityInfo = {
  status: "available" | "unavailable" | "on_request" | "invalid";
  reason: string | null;
  minNights: number | null;
  unitsLeft: number | null;
  mode: "nightly" | "daily" | "on_request";
};

/** Interroge /api/availability (indicatif : revérifié par le serveur à l'envoi). */
export function useAvailability(query: {
  offer?: string;
  type?: string;
  start: string;
  end?: string;
  guests: number;
  enabled: boolean;
}) {
  const { offer, type, start, end, guests, enabled } = query;
  const active = Boolean(enabled && offer && type && start);
  const params = new URLSearchParams({ offer: offer ?? "", type: type ?? "", start, guests: String(guests) });
  if (end) params.set("end", end);
  const key = active ? params.toString() : "";

  // Résultat associé à la requête qui l'a produit : un résultat périmé n'est jamais affiché.
  const [result, setResult] = useState<{ key: string; info: AvailabilityInfo | null } | null>(null);

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/availability?${key}`, { signal: controller.signal });
        const json = await res.json();
        setResult({ key, info: json.ok ? (json as AvailabilityInfo) : null });
      } catch {
        if (!controller.signal.aborted) setResult({ key, info: null });
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key]);

  const current = key && result?.key === key ? result : null;
  return { info: current?.info ?? null, loading: Boolean(key) && !current };
}

/** Le visiteur peut-il continuer avec ces dates ? (Sans réponse du serveur : oui, l'équipe vérifiera.) */
export function availabilityBlocks(info: AvailabilityInfo | null) {
  return info?.status === "unavailable" || (info?.status === "invalid" && info.reason === "min_nights");
}

export function AvailabilityBadge({ info, loading, fr }: { info: AvailabilityInfo | null; loading: boolean; fr: boolean }) {
  if (loading) {
    return (
      <p className="mt-4 flex items-center gap-2 text-sm text-rera-navy-500 dark:text-rera-mist/70" role="status">
        <Loader2 className="h-4 w-4 animate-spin" /> {fr ? "Vérification des disponibilités…" : "Checking availability…"}
      </p>
    );
  }
  if (!info) return null;

  let tone = "border-rera-lagoon-200 bg-rera-lagoon-50 text-rera-lagoon-800 dark:border-rera-lagoon-400/30 dark:bg-rera-lagoon-400/10 dark:text-rera-lagoon-200";
  let Icon = CalendarClock;
  let text: string;

  if (info.status === "available") {
    tone = "border-rera-emerald-200 bg-rera-emerald-50 text-rera-emerald-800 dark:border-rera-emerald-400/30 dark:bg-rera-emerald-400/10 dark:text-rera-emerald-200";
    Icon = CalendarCheck2;
    text =
      info.unitsLeft !== null
        ? fr
          ? `Disponible à ces dates : plus que ${info.unitsLeft} ${info.mode === "daily" ? "place(s)" : "disponible(s)"}.`
          : `Available on these dates: only ${info.unitsLeft} left.`
        : fr
        ? "Disponible à ces dates."
        : "Available on these dates.";
    text += fr ? " Votre demande sera validée par notre équipe." : " Your request will be validated by our team.";
  } else if (info.status === "unavailable") {
    tone = "border-red-200 bg-red-50 text-red-800 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200";
    Icon = CalendarX2;
    text =
      info.reason === "closed"
        ? fr
          ? "Cette offre est fermée sur une partie de ces dates. Essayez d'autres dates."
          : "This offer is closed on some of these dates. Please try other dates."
        : info.reason === "held"
        ? fr
          ? "Complet pour le moment : des demandes sont en cours de traitement sur ces dates. Essayez d'autres dates ou contactez-nous."
          : "Fully booked for now: requests are being processed for these dates. Try other dates or contact us."
        : fr
        ? "Complet à ces dates. Essayez d'autres dates ou une autre offre."
        : "Fully booked on these dates. Try other dates or another offer.";
  } else if (info.status === "invalid" && info.reason === "min_nights") {
    tone = "border-rera-gold-300 bg-rera-gold-50 text-rera-gold-800 dark:border-rera-gold-400/30 dark:bg-rera-gold-400/10 dark:text-rera-gold-200";
    text = fr ? `Séjour minimum : ${info.minNights} nuits.` : `Minimum stay: ${info.minNights} nights.`;
  } else if (info.status === "on_request") {
    text = fr
      ? "Disponibilité confirmée par notre équipe après réception de votre demande."
      : "Availability will be confirmed by our team once we receive your request.";
  } else {
    return null;
  }

  return (
    <p className={cn("mt-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm", tone)} role="status">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" /> {text}
    </p>
  );
}
