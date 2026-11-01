"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { claimReservation, upsertProfile } from "@/lib/db/reservations";
import { isValidLocale } from "@/lib/i18n/config";

export type AuthFormState = { error: string } | null;

const str = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

function localeOf(formData: FormData) {
  const l = str(formData, "locale");
  return isValidLocale(l) ? l : "fr";
}

/** Traduit les erreurs Better Auth en messages clairs pour le visiteur. */
function friendlyError(error: { code?: string; message?: string } | null | undefined, fr: boolean, fallback: string) {
  const code = `${error?.code ?? ""} ${error?.message ?? ""}`.toUpperCase();
  if (code.includes("ALREADY_EXISTS") || code.includes("ALREADY EXISTS"))
    return fr
      ? "Un compte existe déjà avec cet e-mail. Connectez-vous plutôt."
      : "An account already exists with this email. Please sign in instead.";
  if (code.includes("INVALID_EMAIL_OR_PASSWORD") || code.includes("INVALID EMAIL OR PASSWORD"))
    return fr ? "E-mail ou mot de passe incorrect." : "Incorrect email or password.";
  if (code.includes("PASSWORD_TOO_SHORT"))
    return fr ? "Le mot de passe doit contenir au moins 8 caractères." : "Password must be at least 8 characters.";
  if (code.includes("EMAIL_NOT_VERIFIED"))
    return fr ? "Veuillez d'abord confirmer votre adresse e-mail." : "Please verify your email address first.";
  return fallback;
}

/** Rattache la réservation faite juste avant (si un jeton valide est fourni). */
async function claimPending(formData: FormData, userId: string) {
  const reference = str(formData, "claimReference");
  const token = str(formData, "claimToken");
  if (!reference || !token) return false;
  try {
    return await claimReservation(reference, token, userId);
  } catch (error) {
    console.error("[account] rattachement impossible", error);
    return false;
  }
}

export async function signUpAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const locale = localeOf(formData);
  const fr = locale === "fr";
  const name = str(formData, "name");
  const email = str(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { error: fr ? "Indiquez votre nom complet." : "Please enter your full name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: fr ? "Adresse e-mail invalide." : "Invalid email address." };
  if (password.length < 8)
    return { error: fr ? "Le mot de passe doit contenir au moins 8 caractères." : "Password must be at least 8 characters." };

  const { data, error } = await auth.signUp.email({ name, email, password });
  if (error || !data?.user) {
    return { error: friendlyError(error, fr, fr ? "Impossible de créer le compte. Réessayez." : "Could not create the account. Please try again.") };
  }

  const userId = data.user.id;
  try {
    await upsertProfile(userId, str(formData, "phone"), str(formData, "country"));
  } catch (e) {
    console.error("[account] profil non enregistré", e);
  }
  const claimed = await claimPending(formData, userId);

  redirect(`/${locale}/account?welcome=1${claimed ? "&claimed=1" : ""}`);
}

export async function signInAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const locale = localeOf(formData);
  const fr = locale === "fr";
  const email = str(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: fr ? "Renseignez votre e-mail et votre mot de passe." : "Enter your email and password." };

  const { data, error } = await auth.signIn.email({ email, password });
  if (error || !data?.user) {
    return { error: friendlyError(error, fr, fr ? "Connexion impossible. Réessayez." : "Sign-in failed. Please try again.") };
  }

  const claimed = await claimPending(formData, data.user.id);
  redirect(`/${locale}/account${claimed ? "?claimed=1" : ""}`);
}

export async function signOutAction(formData: FormData) {
  const locale = localeOf(formData);
  await auth.signOut();
  redirect(`/${locale}`);
}
