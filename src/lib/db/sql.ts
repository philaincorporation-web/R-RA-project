import "server-only";
import { neon } from "@neondatabase/serverless";

/** Client SQL Neon (HTTP). Lève une erreur claire si DATABASE_URL est absent. */
export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquant");
  return neon(url);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Évite d'envoyer à Postgres un identifiant mal formé (erreur 22P02). */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}
