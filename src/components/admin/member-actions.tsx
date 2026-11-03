"use client";

import { useActionState } from "react";
import { changeMemberRoleAction, removeMemberAction } from "@/app/[locale]/admin/actions";
import { FormMessage, SubmitButton } from "./form-bits";
import { adminInput } from "./styles";

/** Changement de rôle et retrait d'un membre (toutes les règles sont revérifiées côté serveur). */
export function MemberActions({
  locale,
  userId,
  email,
  currentRoleId,
  roles,
}: {
  locale: string;
  userId: string;
  email: string;
  currentRoleId: string;
  roles: { id: string; name: string }[];
}) {
  const [roleState, roleAction] = useActionState(changeMemberRoleAction, null);
  const [removeState, removeAction] = useActionState(removeMemberAction, null);
  const hasCurrent = roles.some((r) => r.id === currentRoleId);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <form action={roleAction} className="flex items-center gap-2">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="userId" value={userId} />
          <select
            name="roleId"
            defaultValue={hasCurrent ? currentRoleId : ""}
            aria-label={`Rôle de ${email}`}
            className={`${adminInput} h-10 w-52`}
          >
            {!hasCurrent ? (
              <option value="" disabled>
                Rôle actuel non attribuable
              </option>
            ) : null}
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <SubmitButton variant="secondary">Enregistrer</SubmitButton>
        </form>
        <form action={removeAction}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="userId" value={userId} />
          <SubmitButton variant="danger" confirm={`Retirer l'accès au back-office pour ${email} ?`}>
            Retirer
          </SubmitButton>
        </form>
      </div>
      <FormMessage state={removeState?.error || removeState?.ok ? removeState : roleState} />
    </div>
  );
}
