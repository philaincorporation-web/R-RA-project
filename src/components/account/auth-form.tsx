"use client";

import { useActionState, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Eye, EyeOff, Link2 } from "lucide-react";
import { signInAction, signUpAction } from "@/app/[locale]/account/actions";
import { PENDING_CLAIM_KEY, type PendingClaim } from "@/components/account/account-prompt";
import type { AppLocale } from "@/lib/i18n/config";

const inputClasses =
  "h-14 w-full rounded-xl border border-transparent bg-white px-5 text-base text-rera-navy-800 placeholder:text-rera-navy-300 focus:border-rera-gold-400 focus:outline-none focus:ring-4 focus:ring-rera-gold-400/30";
const labelClasses = "mb-2 block text-sm font-medium text-white";

const noopSubscribe = () => () => {};

/** Lit la réservation en attente de rattachement (sessionStorage) sans provoquer d'erreur d'hydratation. */
function usePendingClaim(): PendingClaim | null {
  const raw = useSyncExternalStore(
    noopSubscribe,
    () => {
      try {
        return sessionStorage.getItem(PENDING_CLAIM_KEY);
      } catch {
        return null;
      }
    },
    () => null
  );
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingClaim;
  } catch {
    return null;
  }
}

export function AuthForm({ mode, locale }: { mode: "sign-in" | "sign-up"; locale: AppLocale }) {
  const fr = locale === "fr";
  const signUp = mode === "sign-up";
  const [state, formAction, isPending] = useActionState(signUp ? signUpAction : signInAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const claim = usePendingClaim();

  return (
    <form
      // La clé force le remontage une fois la réservation en attente lue, pour pré-remplir les champs.
      key={claim?.reference ?? "empty"}
      action={formAction}
      className="space-y-5"
    >
      <input type="hidden" name="locale" value={locale} />
      {claim ? (
        <>
          <input type="hidden" name="claimReference" value={claim.reference} />
          <input type="hidden" name="claimToken" value={claim.token} />
          <p className="flex items-start gap-2 rounded-xl border border-rera-gold-400/30 bg-rera-gold-400/10 p-3 text-xs text-rera-gold-200">
            <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {fr
              ? `Votre demande ${claim.reference} sera automatiquement ajoutée à votre compte.`
              : `Your request ${claim.reference} will be added to your account automatically.`}
          </p>
        </>
      ) : null}

      {signUp ? (
        <div>
          <label htmlFor="auth-name" className={labelClasses}>{fr ? "Nom complet" : "Full name"}</label>
          <input id="auth-name" name="name" required autoComplete="name" defaultValue={claim?.name ?? ""} placeholder={fr ? "Prénom et nom" : "First and last name"} className={inputClasses} />
        </div>
      ) : null}

      <div>
        <label htmlFor="auth-email" className={labelClasses}>{fr ? "Adresse e-mail" : "Email address"}</label>
        <input id="auth-email" name="email" type="email" required autoComplete="email" defaultValue={claim?.email ?? ""} placeholder={fr ? "vous@exemple.com" : "you@example.com"} className={inputClasses} />
      </div>

      {signUp ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="auth-phone" className={labelClasses}>{fr ? "Téléphone" : "Phone"}</label>
            <input id="auth-phone" name="phone" type="tel" autoComplete="tel" defaultValue={claim?.phone ?? ""} className={inputClasses} />
          </div>
          <div>
            <label htmlFor="auth-country" className={labelClasses}>{fr ? "Pays de résidence" : "Country of residence"}</label>
            <input id="auth-country" name="country" autoComplete="country-name" defaultValue={claim?.country ?? ""} className={inputClasses} />
          </div>
        </div>
      ) : null}

      <div>
        <label htmlFor="auth-password" className={labelClasses}>{fr ? "Mot de passe" : "Password"}</label>
        <div className="relative">
          <input
            id="auth-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={signUp ? 8 : undefined}
            autoComplete={signUp ? "new-password" : "current-password"}
            placeholder={fr ? "Votre mot de passe" : "Your password"}
            className={`${inputClasses} pr-14`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? (fr ? "Masquer le mot de passe" : "Hide password") : fr ? "Afficher le mot de passe" : "Show password"}
            className="absolute inset-y-0 right-0 flex w-14 items-center justify-center text-rera-navy-500 hover:text-rera-navy-800"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {signUp ? (
          <p className="mt-2 text-xs text-white/60">
            {fr ? "8 caractères minimum." : "At least 8 characters."}
          </p>
        ) : null}
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="!mt-7 flex h-14 w-full items-center justify-center rounded-full bg-rera-gold-500 px-6 font-heading text-base font-bold text-rera-navy-900 shadow-glow-gold transition hover:bg-rera-gold-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-rera-gold-400/40 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending
          ? fr ? "Patientez…" : "Please wait…"
          : signUp
          ? fr ? "Créer mon compte" : "Create my account"
          : fr ? "Se connecter" : "Sign in"}
      </button>

      <p className="!mt-7 text-center text-sm text-white/90">
        {signUp ? (fr ? "Déjà un compte ?" : "Already have an account?") : fr ? "Nouveau sur RÈRA ?" : "New to RÈRA?"}{" "}
        <Link
          href={`/${locale}/account/${signUp ? "sign-in" : "sign-up"}`}
          className="font-semibold text-rera-gold-400 underline underline-offset-4 hover:text-rera-gold-300"
        >
          {signUp ? (fr ? "Se connecter" : "Sign in") : fr ? "Créer un compte" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
