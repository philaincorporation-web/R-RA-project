"use client";

import Link from "next/link";
import { CircleUserRound, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils/cn";
import type { AppLocale } from "@/lib/i18n/config";

/** Accès à l'espace client : « Mon compte » si connecté, sinon « Connexion ». */
export function AccountLink({
  locale,
  dark,
  variant = "icon",
  onNavigate,
}: {
  locale: AppLocale;
  dark?: boolean;
  variant?: "icon" | "row";
  onNavigate?: () => void;
}) {
  const { data: session, isPending } = authClient.useSession();
  const fr = locale === "fr";
  const signedIn = Boolean(session?.user);
  const label = signedIn ? (fr ? "Mon compte" : "My account") : fr ? "Connexion" : "Sign in";
  const href = signedIn ? `/${locale}/account` : `/${locale}/account/sign-in`;
  const Icon = signedIn ? CircleUserRound : UserRound;

  if (variant === "row") {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-rera-navy-700 transition-colors hover:bg-rera-navy-100/60 dark:text-rera-mist dark:hover:bg-white/10"
      >
        <Icon className="h-5 w-5 text-rera-lagoon-500" />
        {isPending ? (fr ? "Mon compte" : "My account") : label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors",
        dark
          ? "text-white hover:bg-white/10"
          : "text-rera-navy-700 hover:bg-rera-navy-100/70 dark:text-rera-mist dark:hover:bg-white/10"
      )}
    >
      <Icon className="h-[19px] w-[19px]" />
      {signedIn ? (
        <span aria-hidden className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rera-emerald-400 ring-2 ring-white dark:ring-rera-navy-900" />
      ) : null}
    </Link>
  );
}
