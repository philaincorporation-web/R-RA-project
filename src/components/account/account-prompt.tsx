"use client";

import { useEffect } from "react";
import { History, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n/config";

export const PENDING_CLAIM_KEY = "rera:pending-claim";

export interface PendingClaim {
  reference: string;
  token: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
}

/**
 * Affiché après l'envoi d'une réservation / demande.
 * - Connecté : la réservation est déjà dans l'espace client.
 * - Non connecté : invite à créer un compte (ou se connecter). Les informations saisies
 *   et le jeton de rattachement sont gardés dans sessionStorage (onglet courant uniquement)
 *   pour pré-remplir l'inscription et rattacher automatiquement la réservation.
 */
export function AccountPrompt({
  locale,
  signedIn,
  claim,
}: {
  locale: AppLocale;
  signedIn: boolean;
  claim: PendingClaim | null;
}) {
  const fr = locale === "fr";

  useEffect(() => {
    if (!signedIn && claim) {
      try {
        sessionStorage.setItem(PENDING_CLAIM_KEY, JSON.stringify(claim));
      } catch {
        // stockage indisponible (navigation privée stricte) : l'inscription restera possible, sans pré-remplissage
      }
    }
  }, [signedIn, claim]);

  if (signedIn) {
    return (
      <div className="w-full rounded-xl2 border border-rera-emerald-400/40 bg-rera-emerald-50 p-4 text-sm text-rera-navy-700 dark:bg-white/5 dark:text-rera-mist">
        <p className="flex items-center justify-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4 text-rera-emerald-500" />
          {fr ? "Cette demande est enregistrée dans votre espace client." : "This request is saved in your account."}
        </p>
        <Button href={`/${locale}/account`} variant="secondary" size="sm" className="mt-3">
          {fr ? "Voir mon compte" : "View my account"}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl2 border border-rera-gold-400/50 bg-rera-gold-50/70 p-5 text-left dark:border-rera-gold-400/30 dark:bg-white/5">
      <p className="flex items-center gap-2 font-heading text-base font-semibold text-rera-navy-800 dark:text-white">
        <UserPlus className="h-5 w-5 text-rera-gold-600 dark:text-rera-gold-400" />
        {fr ? "Suivez votre demande en créant votre compte" : "Track your request with an account"}
      </p>
      <ul className="mt-3 space-y-1.5 text-sm text-rera-navy-600 dark:text-rera-mist/80">
        <li className="flex items-start gap-2">
          <History className="mt-0.5 h-4 w-4 shrink-0 text-rera-lagoon-500" />
          {fr ? "Historique de toutes vos réservations et demandes" : "History of all your bookings and requests"}
        </li>
        <li className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-rera-lagoon-500" />
          {fr
            ? "Récapitulatif détaillé de chaque offre, utile en cas de réclamation"
            : "Detailed summary of each offer, useful for any claim"}
        </li>
      </ul>
      <p className="mt-3 text-xs text-rera-navy-500 dark:text-rera-mist/60">
        {fr
          ? "Vos coordonnées sont déjà remplies : il ne vous reste qu'à choisir un mot de passe."
          : "Your details are pre-filled: just choose a password."}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button href={`/${locale}/account/sign-up`} size="sm" className="flex-1">
          {fr ? "Créer mon compte" : "Create my account"}
        </Button>
        <Button href={`/${locale}/account/sign-in`} variant="ghost" size="sm" className="flex-1">
          {fr ? "J'ai déjà un compte" : "I already have an account"}
        </Button>
      </div>
    </div>
  );
}
