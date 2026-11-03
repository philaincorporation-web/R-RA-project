"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { AdminFormState } from "@/app/[locale]/admin/actions";
import { adminButton, type AdminButtonVariant as Variant } from "./styles";

/** Bouton d'envoi désactivé pendant l'action. `confirm` demande une confirmation avant l'envoi. */
export function SubmitButton({
  children,
  variant = "primary",
  className,
  confirm,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  confirm?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className={adminButton(variant, className)}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function FormMessage({ state, className }: { state: AdminFormState; className?: string }) {
  if (!state?.error && !state?.ok) return null;
  const error = Boolean(state.error);
  return (
    <p
      role={error ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg px-3 py-2 text-sm",
        error ? "bg-red-50 text-red-700" : "bg-rera-emerald-50 text-rera-emerald-700",
        className
      )}
    >
      {error ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
      {state.error ?? state.ok}
    </p>
  );
}
