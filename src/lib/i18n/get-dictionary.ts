import "server-only";
import type { AppLocale } from "./config";

const dictionaries = {
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["fr"]>>;

export async function getDictionary(locale: AppLocale): Promise<Dictionary> {
  const loader = dictionaries[locale] ?? dictionaries.fr;
  return loader();
}
