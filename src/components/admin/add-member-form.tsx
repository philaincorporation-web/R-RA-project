"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { addMemberAction } from "@/app/[locale]/admin/actions";
import { FormMessage, SubmitButton } from "./form-bits";
import { adminInput, adminLabel } from "./styles";

export function AddMemberForm({ locale, roles }: { locale: string; roles: { id: string; name: string }[] }) {
  const [state, action] = useActionState(addMemberAction, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_14rem_auto] sm:items-end">
        <div>
          <label htmlFor="member-email" className={adminLabel}>
            E-mail du compte RÈRA
          </label>
          <input id="member-email" name="email" type="email" required placeholder="prenom@exemple.com" className={adminInput} />
        </div>
        <div>
          <label htmlFor="member-role" className={adminLabel}>
            Rôle
          </label>
          <select id="member-role" name="roleId" required defaultValue="" className={adminInput}>
            <option value="" disabled>
              Choisir…
            </option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <SubmitButton className="h-11">
          <UserPlus className="h-4 w-4" />
          Ajouter
        </SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
