"use server";

import { revalidatePath } from "next/cache";
import { isValidLocale } from "@/lib/i18n/config";
import { can, getAdminContext, logAudit } from "@/lib/admin/server";
import { getReservationKind, updateMessageRow, updateReservationRow } from "@/lib/admin/requests";
import { isValidStatus, normalizeStatus, type RequestKind } from "@/lib/requests/status";
import type { AdminFormState } from "./actions";

const DENIED = { error: "Vous n'avez pas les droits nécessaires pour cette action." };
const FAILED = { error: "Une erreur est survenue. Réessayez dans un instant." };
const CONFLICT = {
  error: "Cette fiche vient d'être modifiée par quelqu'un d'autre. Copiez vos notes si besoin, puis rechargez la page.",
};
const MAX_NOTES = 5000;

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");

/** Enregistre le statut et les notes internes d'une réservation, d'une demande Business ou d'un message. */
export async function updateRequestAction(_prev: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const ctx = await getAdminContext();
  if (!ctx) return DENIED;

  const target = str(fd, "target");
  const reference = str(fd, "reference").trim();
  const version = str(fd, "version");
  const status = str(fd, "status");
  const notes = str(fd, "notes").trim();
  const locale = isValidLocale(str(fd, "locale")) ? str(fd, "locale") : "fr";

  if (!reference || (target !== "reservation" && target !== "message")) return { error: "Requête invalide." };
  if (notes.length > MAX_NOTES) return { error: `Les notes ne doivent pas dépasser ${MAX_NOTES} caractères.` };

  try {
    let kind: RequestKind;
    if (target === "message") {
      kind = "message";
      if (!can(ctx, "messages.manage")) return DENIED;
    } else {
      const found = await getReservationKind(reference);
      if (!found) return { error: "Cette demande n'existe plus." };
      kind = found;
      if (!can(ctx, kind === "booking" ? "reservations.manage" : "business.manage")) return DENIED;
    }
    if (!isValidStatus(kind, status)) return { error: "Statut invalide." };

    const previous =
      kind === "message"
        ? await updateMessageRow(reference, version, status, notes)
        : await updateReservationRow(reference, version, status, notes);
    if (!previous) return CONFLICT;

    const from = normalizeStatus(kind, previous.previousStatus);
    const action = kind === "booking" ? "reservation.update" : kind === "business" ? "business.update" : "message.update";
    await logAudit(ctx, action, { type: kind, id: reference }, {
      ...(from !== status ? { from, to: status } : {}),
      notesChanged: previous.previousNotes !== notes,
    });
  } catch (error) {
    console.error("[admin] mise à jour demande", error);
    return FAILED;
  }

  revalidatePath(`/${locale}/admin`, "layout");
  return { ok: "Modifications enregistrées." };
}
