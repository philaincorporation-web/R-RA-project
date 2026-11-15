import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSun,
  Droplets,
  Moon,
  Navigation,
  Sun,
  Thermometer,
  Umbrella,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/aceternity/reveal";
import { cn } from "@/lib/utils/cn";
import type { AppLocale } from "@/lib/i18n/config";
import { getPointeDenisWeather } from "@/lib/weather/open-meteo";

const t = {
  fr: {
    eyebrow: "Météo & mer",
    title: "Le temps à Pointe Denis",
    subtitle: "Conditions actuelles et prévisions sur 7 jours, mises à jour toutes les 30 minutes.",
    now: "En ce moment",
    feels: "Ressenti",
    humidity: "Humidité",
    wind: "Vent",
    sea: "État de la mer",
    waves: "Vagues",
    period: "Période",
    water: "Eau",
    rain: "Pluie",
    uv: "UV",
    seaUnavailable: "Données marines indisponibles pour le moment.",
    updated: "Mis à jour à",
    source: "Données",
    disclaimer: "Prévisions indicatives : notre équipe confirme toujours les conditions avant chaque sortie en mer.",
    seaLevels: [
      { label: "Mer calme", advice: "Idéal pour la baignade, le jet-ski et les sorties en bateau." },
      { label: "Mer peu agitée", advice: "Bonnes conditions pour la plupart des activités nautiques." },
      { label: "Mer agitée", advice: "Activités nautiques possibles selon l'avis de nos moniteurs." },
      { label: "Mer forte", advice: "Sorties en mer susceptibles d'être reportées par sécurité." },
    ],
  },
  en: {
    eyebrow: "Weather & sea",
    title: "Weather in Pointe Denis",
    subtitle: "Current conditions and 7-day forecast, refreshed every 30 minutes.",
    now: "Right now",
    feels: "Feels like",
    humidity: "Humidity",
    wind: "Wind",
    sea: "Sea conditions",
    waves: "Waves",
    period: "Period",
    water: "Water",
    rain: "Rain",
    uv: "UV",
    seaUnavailable: "Marine data is currently unavailable.",
    updated: "Updated at",
    source: "Data",
    disclaimer: "Forecasts are indicative: our team always confirms conditions before any boat trip.",
    seaLevels: [
      { label: "Calm sea", advice: "Perfect for swimming, jet-skiing and boat trips." },
      { label: "Slight sea", advice: "Good conditions for most water activities." },
      { label: "Moderate sea", advice: "Water activities possible at our instructors' discretion." },
      { label: "Rough sea", advice: "Boat trips may be postponed for safety." },
    ],
  },
};

/** Codes météo WMO → libellé et icône. */
function describe(code: number, isDay = true, locale: AppLocale): { label: string; icon: LucideIcon } {
  const fr = locale === "fr";
  if (code === 0) return { label: fr ? "Ciel dégagé" : "Clear sky", icon: isDay ? Sun : Moon };
  if (code <= 2) return { label: fr ? "Partiellement nuageux" : "Partly cloudy", icon: isDay ? CloudSun : CloudMoon };
  if (code === 3) return { label: fr ? "Couvert" : "Overcast", icon: Cloud };
  if (code <= 48) return { label: fr ? "Brouillard" : "Fog", icon: CloudFog };
  if (code <= 57) return { label: fr ? "Bruine" : "Drizzle", icon: CloudDrizzle };
  if (code <= 67 || (code >= 80 && code <= 82)) return { label: fr ? "Pluie" : "Rain", icon: CloudRain };
  if (code >= 95) return { label: fr ? "Orages" : "Thunderstorms", icon: CloudLightning };
  return { label: fr ? "Averses" : "Showers", icon: CloudRain };
}

function seaLevel(waveHeight: number | null) {
  if (waveHeight === null) return null;
  if (waveHeight < 0.5) return 0;
  if (waveHeight < 1.25) return 1;
  if (waveHeight < 2.5) return 2;
  return 3;
}

const seaColors = [
  "bg-rera-emerald-500/10 text-rera-emerald-700 border-rera-emerald-500/30 dark:text-rera-emerald-300",
  "bg-rera-lagoon-500/10 text-rera-lagoon-700 border-rera-lagoon-500/30 dark:text-rera-lagoon-300",
  "bg-rera-gold-400/15 text-rera-gold-700 border-rera-gold-400/40 dark:text-rera-gold-300",
  "bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-300",
];

const round = (n: number) => Math.round(n);

/** Date "AAAA-MM-JJ" → nom du jour, sans décalage de fuseau. */
function dayName(date: string, locale: AppLocale, index: number) {
  if (index === 0) return locale === "fr" ? "Aujourd'hui" : "Today";
  return new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${date}T12:00:00Z`)
  );
}

export async function WeatherSection({ locale }: { locale: AppLocale }) {
  const data = await getPointeDenisWeather();
  if (!data) return null;

  const l = t[locale];
  const now = describe(data.current.code, data.current.isDay, locale);
  const level = seaLevel(data.sea?.waveHeight ?? null);
  const NowIcon = now.icon;

  return (
    <section id="meteo" className="scroll-mt-24 bg-rera-mist py-20 dark:bg-rera-navy-900">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={l.eyebrow} title={l.title} subtitle={l.subtitle} />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Météo actuelle */}
          <Reveal>
            <div className="h-full rounded-xl2 border border-rera-navy-100/60 bg-white p-6 shadow-premium dark:border-white/10 dark:bg-rera-navy-800/60">
              <p className="text-xs font-semibold uppercase tracking-wider text-rera-navy-400 dark:text-rera-mist/60">{l.now}</p>
              <div className="mt-4 flex items-center gap-5">
                <NowIcon className="h-14 w-14 shrink-0 text-rera-gold-500" aria-hidden />
                <div>
                  <p className="text-5xl font-semibold text-rera-navy dark:text-white">{round(data.current.temperature)}°C</p>
                  <p className="mt-1 text-rera-navy-500 dark:text-rera-mist/75">{now.label}</p>
                </div>
              </div>
              <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
                <Stat icon={Thermometer} label={l.feels} value={`${round(data.current.apparent)}°C`} />
                <Stat icon={Droplets} label={l.humidity} value={`${round(data.current.humidity)} %`} />
                <Stat
                  icon={Wind}
                  label={l.wind}
                  value={
                    <span className="inline-flex items-center gap-1">
                      {round(data.current.windSpeed)} km/h
                      <Navigation
                        className="h-3.5 w-3.5"
                        style={{ transform: `rotate(${data.current.windDirection + 180}deg)` }}
                        aria-hidden
                      />
                    </span>
                  }
                />
              </dl>
            </div>
          </Reveal>

          {/* État de la mer */}
          <Reveal index={1}>
            <div className="h-full rounded-xl2 border border-rera-navy-100/60 bg-white p-6 shadow-premium dark:border-white/10 dark:bg-rera-navy-800/60">
              <p className="text-xs font-semibold uppercase tracking-wider text-rera-navy-400 dark:text-rera-mist/60">{l.sea}</p>
              {data.sea && level !== null ? (
                <>
                  <div className={cn("mt-4 rounded-xl border p-4", seaColors[level])}>
                    <p className="flex items-center gap-2 font-semibold">
                      <Waves className="h-5 w-5" aria-hidden />
                      {l.seaLevels[level].label}
                    </p>
                    <p className="mt-1 text-sm opacity-90">{l.seaLevels[level].advice}</p>
                  </div>
                  <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
                    <Stat icon={Waves} label={l.waves} value={`${data.sea.waveHeight!.toFixed(1)} m`} />
                    <Stat icon={Wind} label={l.period} value={data.sea.wavePeriod !== null ? `${round(data.sea.wavePeriod)} s` : "—"} />
                    <Stat icon={Thermometer} label={l.water} value={data.sea.temperature !== null ? `${round(data.sea.temperature)}°C` : "—"} />
                  </dl>
                </>
              ) : (
                <p className="mt-4 text-sm text-rera-navy-500 dark:text-rera-mist/75">{l.seaUnavailable}</p>
              )}
            </div>
          </Reveal>
        </div>

        {/* Prévisions 7 jours */}
        <Reveal index={2}>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {data.days.map((day, i) => {
              const d = describe(day.code, true, locale);
              const DayIcon = d.icon;
              return (
                <li
                  key={day.date}
                  className="rounded-xl2 border border-rera-navy-100/60 bg-white p-4 text-center dark:border-white/10 dark:bg-rera-navy-800/60"
                >
                  <p className="text-sm font-semibold capitalize text-rera-navy dark:text-white">{dayName(day.date, locale, i)}</p>
                  <DayIcon className="mx-auto my-3 h-8 w-8 text-rera-lagoon-500" aria-label={d.label} />
                  <p className="text-sm text-rera-navy dark:text-white">
                    <span className="font-semibold">{round(day.tempMax)}°</span>{" "}
                    <span className="text-rera-navy-400 dark:text-rera-mist/60">{round(day.tempMin)}°</span>
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-rera-navy-500 dark:text-rera-mist/70">
                    {day.rainProbability !== null && (
                      <p className="flex items-center justify-center gap-1" title={l.rain}>
                        <Umbrella className="h-3 w-3" aria-hidden /> {day.rainProbability} %
                      </p>
                    )}
                    <p className="flex items-center justify-center gap-1" title={l.wind}>
                      <Wind className="h-3 w-3" aria-hidden /> {round(day.windMax)} km/h
                    </p>
                    {day.waveMax !== null && (
                      <p className="flex items-center justify-center gap-1" title={l.waves}>
                        <Waves className="h-3 w-3" aria-hidden /> {day.waveMax.toFixed(1)} m
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <p className="mt-6 text-center text-xs text-rera-navy-400 dark:text-rera-mist/60">
          {l.disclaimer} · {l.updated} {data.current.time.slice(11, 16)} · {l.source} :{" "}
          <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-rera-lagoon-600">
            Open-Meteo.com
          </a>
        </p>
      </Container>
    </section>
  );
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-rera-mist p-3 dark:bg-white/5">
      <dt className="flex items-center gap-1 text-xs text-rera-navy-400 dark:text-rera-mist/60">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-rera-navy dark:text-white">{value}</dd>
    </div>
  );
}
