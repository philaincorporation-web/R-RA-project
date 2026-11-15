"use server";

import { revalidatePath } from "next/cache";
import { isValidLocale } from "@/lib/i18n/config";
import { authorize, logAudit } from "@/lib/admin/server";
import { deleteBlock, insertBlock, upsertInventory } from "@/lib/availability/admin";
import { listCatalogOffers } from "@/lib/availability/catalog";
import type { InventoryMode } from "@/lib/availability/types";
import type { AdminFormState } from "../actions";

const DENIED = { error: "Vous n'avez pas les droits nécessaires pour cette action." };
const FAILED = { error: "Une erreur est survenue. Réessayez dans un instant." };
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MODES = new Set<InventoryMode>(["on_request", "nightly", "daily"]);

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

/** Entier positif optionnel : null si vide, NaN si invalide. */
function optionalInt(value: string, min: number, max: number) {
  if (value === "") return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : Number.NaN;
}

function refresh(fd: FormData) {
  const locale = isValidLocale(str(fd, "locale")) ? str(fd, "locale") : "fr";
  revalidatePath(`/${locale}/admin`, "layout");
}

/** Règles de stock d'une offre (mode, nombre d'unités, voyageurs par logement, nuits minimum). */
export async function saveInventoryAction(_prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const ctx = await authorize("reservations.manage");
  if (!ctx) return DENIED;

  const offerSlug = str(fd, "offerSlug");
  const mode = str(fd, "mode") as InventoryMode;
  const unitsTotal = optionalInt(str(fd, "unitsTotal"), 0, 10_000);
  const guestsPerUnit = optionalInt(str(fd, "guestsPerUnit"), 1, 100);
  const minNights = optionalInt(str(fd, "minNights"), 1, 60) ?? 1;

  if (!MODES.has(mode)) return { error: "Mode invalide." };
  if (Number.isNaN(unitsTotal) || Number.isNaN(guestsPerUnit) || Number.isNaN(minNights)) {
    return { error: "Vérifiez les nombres saisis (entiers positifs)." };
  }
  if (mode !== "on_request" && unitsTotal === null) {
    return { error: mode === "nightly" ? "Indiquez le nombre de logements." : "Indiquez le nombre de places par jour." };
  }

  try {
    const offer = (await listCatalogOffers()).find((o) => o.slug === offerSlug);
    if (!offer) return { error: "Cette offre n'existe plus dans le catalogue." };
    if (mode === "nightly" && offer.type !== "accommodation") {
      return { error: "Le mode « par nuit » est réservé aux hébergements." };
    }

    const previous = await upsertInventory({
      offerSlug,
      offerType: offer.type,
      mode,
      unitsTotal: mode === "on_request" ? null : unitsTotal,
      guestsPerUnit: mode === "nightly" ? guestsPerUnit : null,
      minNights: mode === "nightly" ? minNights : 1,
      updatedBy: ctx.user.id,
    });
    await logAudit(ctx, "availability.inventory", { type: "offer", id: offerSlug }, {
      previous,
      next: { mode, unitsTotal, guestsPerUnit, minNights },
    });
  } catch (error) {
    console.error("[admin] stock de l'offre", error);
    return FAILED;
  }
  refresh(fd);
  return { ok: "Règles enregistrées." };
}

/** Fermeture ou blocage manuel d'une offre sur une période. */
export async function addBlockAction(_prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const ctx = await authorize("reservations.manage");
  if (!ctx) return DENIED;

  const offerSlug = str(fd, "offerSlug");
  const startDate = str(fd, "startDate");
  const lastDate = str(fd, "endDate"); // dernier jour fermé (inclus) côté formulaire
  const units = optionalInt(str(fd, "units"), 1, 10_000);
  const reason = str(fd, "reason").slice(0, 300);

  if (!ISO_DATE.test(startDate) || !ISO_DATE.test(lastDate) || lastDate < startDate) {
    return { error: "Vérifiez les dates : le dernier jour doit être après ou égal au premier." };
  }
  if (Number.isNaN(units)) return { error: "Nombre d'unités invalide." };

  // Stockage en intervalle [début, fin) : le lendemain du dernier jour fermé.
  const end = new Date(`${lastDate}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 1);
  const endDate = end.toISOString().slice(0, 10);

  try {
    const offer = (await listCatalogOffers()).find((o) => o.slug === offerSlug);
    if (!offer) return { error: "Choisissez une offre." };
    const id = await insertBlock({ offerSlug, startDate, endDate, units, reason, createdBy: ctx.user.id });
    await logAudit(ctx, "availability.block.add", { type: "offer", id: offerSlug }, { blockId: id, startDate, lastDate, units, reason });
  } catch (error) {
    console.error("[admin] ajout de fermeture", error);
    return FAILED;
  }
  refresh(fd);
  return { ok: "Fermeture enregistrée." };
}

export async function deleteBlockAction(_prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const ctx = await authorize("reservations.manage");
  if (!ctx) return DENIED;
  const id = str(fd, "id");
  try {
    const removed = await deleteBlock(id);
    if (!removed) return { error: "Cette fermeture n'existe plus." };
    await logAudit(ctx, "availability.block.delete", { type: "offer", id: removed.offer_slug }, { blockId: id, ...removed });
  } catch (error) {
    console.error("[admin] suppression de fermeture", error);
    return FAILED;
  }
  refresh(fd);
  return { ok: "Fermeture supprimée." };
}
