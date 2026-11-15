"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { addBlockAction, deleteBlockAction, saveInventoryAction } from "@/app/[locale]/admin/availability/actions";
import { INVENTORY_MODES, type InventoryMode, type OfferType } from "@/lib/availability/types";
import { FormMessage, SubmitButton } from "./form-bits";
import { adminInput, adminLabel } from "./styles";

/** Règles de stock d'une offre. */
export function InventoryForm({
  locale,
  offer,
  initial,
  canManage,
}: {
  locale: string;
  offer: { slug: string; type: OfferType; capacity?: number };
  initial: { mode: InventoryMode; unitsTotal: number | null; guestsPerUnit: number | null; minNights: number };
  canManage: boolean;
}) {
  const [state, action] = useActionState(saveInventoryAction, null);
  const [mode, setMode] = useState<InventoryMode>(initial.mode);
  const modes = INVENTORY_MODES.filter((m) => m.value !== "nightly" || offer.type === "accommodation");
  const id = (field: string) => `inv-${offer.slug}-${field}`;

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="offerSlug" value={offer.slug} />
      <fieldset disabled={!canManage} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor={id("mode")} className={adminLabel}>Gestion du stock</label>
          <select id={id("mode")} name="mode" value={mode} onChange={(e) => setMode(e.target.value as InventoryMode)} className={adminInput}>
            {modes.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-rera-navy-400">{INVENTORY_MODES.find((m) => m.value === mode)?.help}</p>
        </div>
        {mode !== "on_request" ? (
          <div>
            <label htmlFor={id("units")} className={adminLabel}>{mode === "nightly" ? "Nombre de logements" : "Places par jour"}</label>
            <input id={id("units")} name="unitsTotal" type="number" min={0} max={10000} required defaultValue={initial.unitsTotal ?? ""} className={adminInput} />
          </div>
        ) : null}
        {mode === "nightly" ? (
          <>
            <div>
              <label htmlFor={id("guests")} className={adminLabel}>Personnes par logement</label>
              <input
                id={id("guests")}
                name="guestsPerUnit"
                type="number"
                min={1}
                max={100}
                defaultValue={initial.guestsPerUnit ?? offer.capacity ?? ""}
                className={adminInput}
              />
            </div>
            <div>
              <label htmlFor={id("min")} className={adminLabel}>Nuits minimum</label>
              <input id={id("min")} name="minNights" type="number" min={1} max={60} defaultValue={initial.minNights} className={adminInput} />
            </div>
          </>
        ) : null}
      </fieldset>
      <FormMessage state={state} />
      {canManage ? <SubmitButton variant="secondary">Enregistrer</SubmitButton> : null}
    </form>
  );
}

/** Ajout d'une fermeture (totale ou partielle). */
export function BlockForm({ locale, offers, today }: { locale: string; offers: { slug: string; name: string; group: string }[]; today: string }) {
  const [state, action] = useActionState(addBlockAction, null);
  const groups = [...new Set(offers.map((o) => o.group))];
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="locale" value={locale} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="block-offer" className={adminLabel}>Offre</label>
          <select id="block-offer" name="offerSlug" required defaultValue="" className={adminInput}>
            <option value="" disabled>Choisir une offre…</option>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {offers.filter((o) => o.group === g).map((o) => (
                  <option key={o.slug} value={o.slug}>{o.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="block-start" className={adminLabel}>Premier jour fermé</label>
          <input id="block-start" name="startDate" type="date" min={today} required className={adminInput} />
        </div>
        <div>
          <label htmlFor="block-end" className={adminLabel}>Dernier jour fermé (inclus)</label>
          <input id="block-end" name="endDate" type="date" min={today} required className={adminInput} />
        </div>
        <div>
          <label htmlFor="block-units" className={adminLabel}>Unités bloquées</label>
          <input id="block-units" name="units" type="number" min={1} placeholder="Vide = tout fermer" className={adminInput} />
        </div>
        <div>
          <label htmlFor="block-reason" className={adminLabel}>Motif (interne)</label>
          <input id="block-reason" name="reason" maxLength={300} placeholder="Travaux, privatisation…" className={adminInput} />
        </div>
      </div>
      <FormMessage state={state} />
      <SubmitButton>Ajouter la fermeture</SubmitButton>
    </form>
  );
}

export function DeleteBlockButton({ locale, id }: { locale: string; id: string }) {
  const [state, action] = useActionState(deleteBlockAction, null);
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={id} />
      {state?.error ? <span className="text-xs text-red-600">{state.error}</span> : null}
      <SubmitButton variant="danger" className="h-8 px-2.5" confirm="Supprimer cette fermeture ?">
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Supprimer</span>
      </SubmitButton>
    </form>
  );
}
