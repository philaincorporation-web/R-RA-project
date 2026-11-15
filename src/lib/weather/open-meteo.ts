import "server-only";

/**
 * Météo et état de la mer à Pointe Denis via Open-Meteo (https://open-meteo.com).
 * Données mises en cache 30 minutes côté serveur.
 * OPEN_METEO_API_KEY (facultatif) : clé d'un abonnement Open-Meteo, requise pour un usage commercial.
 * En cas d'erreur, renvoie null : la page s'affiche sans le bloc météo.
 */

export const POINTE_DENIS = { latitude: 0.29, longitude: 9.3 };
const TIMEZONE = "Africa/Libreville";
const REVALIDATE_SECONDS = 1800;

export type WeatherDay = {
  date: string; // AAAA-MM-JJ
  code: number;
  tempMax: number;
  tempMin: number;
  rainProbability: number | null;
  windMax: number;
  uvMax: number | null;
  waveMax: number | null;
};

export type WeatherData = {
  current: {
    time: string;
    temperature: number;
    apparent: number;
    humidity: number;
    code: number;
    isDay: boolean;
    windSpeed: number;
    windDirection: number;
  };
  sea: {
    waveHeight: number | null;
    wavePeriod: number | null;
    waveDirection: number | null;
    temperature: number | null;
  } | null;
  days: WeatherDay[];
};

function endpoint(kind: "forecast" | "marine") {
  const key = process.env.OPEN_METEO_API_KEY?.trim();
  const host =
    kind === "forecast"
      ? key ? "customer-api.open-meteo.com" : "api.open-meteo.com"
      : key ? "customer-marine-api.open-meteo.com" : "marine-api.open-meteo.com";
  const url = new URL(`https://${host}/v1/${kind}`);
  url.searchParams.set("latitude", String(POINTE_DENIS.latitude));
  url.searchParams.set("longitude", String(POINTE_DENIS.longitude));
  url.searchParams.set("timezone", TIMEZONE);
  url.searchParams.set("forecast_days", "7");
  if (key) url.searchParams.set("apikey", key);
  return url;
}

async function getJson<T>(url: URL): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      console.error("[météo] réponse", res.status, url.host);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error("[météo] requête impossible", url.host, error instanceof Error ? error.message : error);
    return null;
  }
}

type ForecastResponse = {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    is_day: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
    wind_speed_10m_max: number[];
    uv_index_max: (number | null)[];
  };
};

type MarineResponse = {
  current?: {
    wave_height: number | null;
    wave_period: number | null;
    wave_direction: number | null;
    sea_surface_temperature: number | null;
  };
  daily?: { time: string[]; wave_height_max: (number | null)[] };
};

export async function getPointeDenisWeather(): Promise<WeatherData | null> {
  const forecastUrl = endpoint("forecast");
  forecastUrl.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day,wind_speed_10m,wind_direction_10m"
  );
  forecastUrl.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max"
  );

  const marineUrl = endpoint("marine");
  marineUrl.searchParams.set("current", "wave_height,wave_period,wave_direction,sea_surface_temperature");
  marineUrl.searchParams.set("daily", "wave_height_max");

  const [forecast, marine] = await Promise.all([
    getJson<ForecastResponse>(forecastUrl),
    getJson<MarineResponse>(marineUrl),
  ]);
  if (!forecast?.current || !forecast.daily) return null;

  const c = forecast.current;
  const d = forecast.daily;
  const waveByDate = new Map<string, number | null>();
  marine?.daily?.time.forEach((date, i) => waveByDate.set(date, marine.daily!.wave_height_max[i] ?? null));

  return {
    current: {
      time: c.time,
      temperature: c.temperature_2m,
      apparent: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      code: c.weather_code,
      isDay: c.is_day === 1,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
    },
    sea: marine?.current
      ? {
          waveHeight: marine.current.wave_height,
          wavePeriod: marine.current.wave_period,
          waveDirection: marine.current.wave_direction,
          temperature: marine.current.sea_surface_temperature,
        }
      : null,
    days: d.time.map((date, i) => ({
      date,
      code: d.weather_code[i],
      tempMax: d.temperature_2m_max[i],
      tempMin: d.temperature_2m_min[i],
      rainProbability: d.precipitation_probability_max[i] ?? null,
      windMax: d.wind_speed_10m_max[i],
      uvMax: d.uv_index_max[i] ?? null,
      waveMax: waveByDate.get(date) ?? null,
    })),
  };
}
