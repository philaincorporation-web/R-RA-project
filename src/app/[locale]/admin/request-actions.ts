"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { isValidLocale } from "@/lib/i18n/config";
import { can, getAdminContext, logAudit } from "@/lib/admin/server";
import {
  getBookingForStatus,
  getReservationKind,
  updateMessageRow,
  updateReservationRow,
} from "@/lib/admin/requests";
import { updateStatusWithCapacity } from "@/lib/db/reservations";
import { getInventory, isManaged, periodFor } from "@/lib/availability/engine";
import { FIRM_STATUSES } from "@/lib/availability/types";
import { sendStatusEmail, statusEmailFor } from "@/lib/notifications/status";
import { isValidStatus, normalizeStatus, type RequestKind } from "@/lib/requests/status";
import type { AdminFormState } from "./actions";

const DENIED = { error: "Vous n'avez pas les droits nécessaires pour cette action." };
const FAILED = { error: "Une erreur est survenue. Réessayez dans un instant." };
const CONFLICT = {
  error: "Cette fiche vient d'être modifiée par quelqu'un d'autre. Copiez vos notes si besoin, puis rechargez la page.",
};
const FULL = {
  error:
    "Impossible de confirmer : il ne reste plus assez de place sur ces dates (réservations confirmées ou fermeture). Consultez la page Disponibilités.",
};
const FIRM = new Set<string>(FIRM_STATUSES);
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

    let previous: { previousStatus: string; previousNotes: string } | null;
    const booking = kind === "booking" ? await getBookingForStatus(reference) : null;

    if (booking && FIRM.has(status) && !FIRM.has(booking.status) && booking.offer_slug && booking.start_date) {
      // Confirmation : on revérifie le stock sous verrou, dans la même transaction que la mise à jour.
      const inventory = await getInventory(booking.offer_slug);
      if (isManaged(inventory)) {
        const period = periodFor(inventory.mode, booking.start_date, booking.end_date);
        const result = await updateStatusWithCapacity({
          reference,
          version,
          status,
          notes,
          offerSlug: booking.offer_slug,
          capacity: { ...period, unitsTotal: inventory.unitsTotal },
        });
        if (result === "conflict") return CONFLICT;
        if (result === "full") return FULL;
        previous = result;
      } else {
        previous = await updateReservationRow(reference, version, status, notes);
      }
    } else {
      previous =
        kind === "message"
          ? await updateMessageRow(reference, version, status, notes)
          : await updateReservationRow(reference, version, status, notes);
    }
    if (!previous) return CONFLICT;

    const from = normalizeStatus(kind, previous.previousStatus);
    const emailKind = booking && fd.get("notifyClient") === "on" ? statusEmailFor(from, status) : null;
    if (booking && emailKind) {
      const lines: [string, string][] = [
        ["Offre", booking.title],
        ["Arrivée", booking.start_date ?? "—"],
        ...(booking.end_date ? ([["Départ", booking.end_date]] as [string, string][]) : []),
      ];
      after(() => sendStatusEmail({ kind: emailKind, to: booking.email, name: booking.full_name, reference, lines }));
    }

    const action = kind === "booking" ? "reservation.update" : kind === "business" ? "business.update" : "message.update";
    await logAudit(ctx, action, { type: kind, id: reference }, {
      ...(from !== status ? { from, to: status } : {}),
      notesChanged: previous.previousNotes !== notes,
      ...(emailKind ? { clientEmail: emailKind } : {}),
    });
  } catch (error) {
    console.error("[admin] mise à jour demande", error);
    return FAILED;
  }

  revalidatePath(`/${locale}/admin`, "layout");
  return { ok: "Modifications enregistrées." };
}
