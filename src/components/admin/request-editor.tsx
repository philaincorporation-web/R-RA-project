"use client";

import { useActionState, useState } from "react";
import { updateRequestAction } from "@/app/[locale]/admin/request-actions";
import { FormMessage, SubmitButton } from "./form-bits";
import { adminInput, adminLabel } from "./styles";

/** Statut + notes internes. Champs contrôlés : la saisie est conservée si l'enregistrement échoue. */
export function RequestEditor({
  locale,
  target,
  reference,
  version,
  status,
  notes,
  statuses,
}: {
  locale: string;
  target: "reservation" | "message";
  reference: string;
  version: string;
  status: string;
  notes: string;
  statuses: readonly { value: string; label: string }[];
}) {
  const [state, action] = useActionState(updateRequestAction, null);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentNotes, setCurrentNotes] = useState(notes);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="target" value={target} />
      <input type="hidden" name="reference" value={reference} />
      <input type="hidden" name="version" value={version} />
      <div>
        <label htmlFor="request-status" className={adminLabel}>
          Statut
        </label>
        <select
          id="request-status"
          name="status"
          value={currentStatus}
          onChange={(e) => setCurrentStatus(e.target.value)}
          className={adminInput}
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="request-notes" className={adminLabel}>
          Notes internes
        </label>
        <textarea
          id="request-notes"
          name="notes"
          rows={6}
          maxLength={5000}
          value={currentNotes}
          onChange={(e) => setCurrentNotes(e.target.value)}
          placeholder="Visibles uniquement par l'équipe."
          className={`${adminInput} h-auto py-2.5`}
        />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="w-full">Enregistrer</SubmitButton>
    </form>
  );
}
