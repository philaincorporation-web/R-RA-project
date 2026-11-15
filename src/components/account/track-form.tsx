"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n/config";

const inputClasses =
  "w-full rounded-lg border border-rera-navy-200 bg-white px-4 py-3 text-sm text-rera-navy-800 placeholder:text-rera-navy-300 focus:border-rera-lagoon-500 focus:outline-none focus:ring-2 focus:ring-rera-lagoon-200 dark:border-white/15 dark:bg-rera-navy-800 dark:text-white dark:placeholder:text-white/30";
const labelClasses = "mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist";

/** Suivi d'une demande sans compte : référence + e-mail, puis code reçu par e-mail. */
export function TrackForm({ locale, initialReference }: { locale: AppLocale; initialReference?: string }) {
  const fr = locale === "fr";
  const router = useRouter();
  const [step, setStep] = useState<"identify" | "code">("identify");
  const [reference, setReference] = useState(initialReference ?? "");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messages: Record<string, string> = fr
    ? {
        rate_limited: "Trop de demandes de code. Réessayez dans une heure, ou contactez-nous.",
        invalid: "Code incorrect. Vérifiez les 6 chiffres reçus par e-mail.",
        expired: "Ce code a expiré ou a déjà été utilisé. Demandez-en un nouveau.",
        too_many: "Trop d'essais avec ce code. Demandez-en un nouveau.",
        generic: "Une erreur est survenue. Réessayez dans un instant.",
      }
    : {
        rate_limited: "Too many code requests. Try again in an hour, or contact us.",
        invalid: "Incorrect code. Check the 6 digits we emailed you.",
        expired: "This code has expired or was already used. Request a new one.",
        too_many: "Too many attempts with this code. Request a new one.",
        generic: "Something went wrong. Please try again.",
      };

  async function post(url: string, body: unknown) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return (await res.json().catch(() => ({ ok: false, error: "generic" }))) as { ok: boolean; error?: string; reference?: string };
  }

  async function requestCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const json = await post("/api/track/request", { reference: reference.trim(), email: email.trim(), locale });
    setLoading(false);
    if (!json.ok) return setError(messages[json.error ?? ""] ?? messages.generic);
    setStep("code");
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const json = await post("/api/track/verify", { reference: reference.trim(), code: code.trim() });
    if (!json.ok) {
      setLoading(false);
      return setError(messages[json.error ?? ""] ?? messages.generic);
    }
    router.push(`/${locale}/track/${encodeURIComponent(json.reference ?? reference.trim())}`);
  }

  return (
    <div className="card-surface mx-auto max-w-md rounded-xl2 p-6 shadow-premium sm:p-8">
      {step === "identify" ? (
        <form onSubmit={requestCode} className="space-y-4">
          <p className="text-sm text-rera-navy-500 dark:text-rera-mist/70">
            {fr
              ? "Indiquez la référence de votre demande (ex. RERA-BK-…) et l'adresse e-mail utilisée. Nous vous enverrons un code de vérification."
              : "Enter your request reference (e.g. RERA-BK-…) and the email address you used. We will send you a verification code."}
          </p>
          <div>
            <label htmlFor="track-ref" className={labelClasses}>{fr ? "Référence" : "Reference"}</label>
            <input
              id="track-ref"
              required
              minLength={6}
              maxLength={64}
              autoComplete="off"
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              placeholder="RERA-BK-…"
              className={`${inputClasses} font-mono`}
            />
          </div>
          <div>
            <label htmlFor="track-email" className={labelClasses}>E-mail</label>
            <input id="track-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
          </div>
          {error ? <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {fr ? "Recevoir mon code" : "Send me a code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-4">
          <p className="text-sm text-rera-navy-500 dark:text-rera-mist/70">
            {fr
              ? "Si la référence et l'e-mail correspondent à une demande, un code à 6 chiffres vient de vous être envoyé (valable 10 minutes). Pensez à vérifier vos spams."
              : "If the reference and email match a request, a 6-digit code has just been sent to you (valid for 10 minutes). Check your spam folder."}
          </p>
          <div>
            <label htmlFor="track-code" className={labelClasses}>{fr ? "Code reçu par e-mail" : "Code from the email"}</label>
            <input
              id="track-code"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]{6,7}"
              maxLength={7}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`${inputClasses} text-center font-mono text-2xl tracking-[0.5em]`}
            />
          </div>
          {error ? <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {fr ? "Voir ma demande" : "View my request"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("identify");
              setCode("");
              setError(null);
            }}
            className="w-full text-center text-sm text-rera-lagoon-700 hover:underline dark:text-rera-lagoon-300"
          >
            {fr ? "Modifier la référence ou demander un nouveau code" : "Change the reference or request a new code"}
          </button>
        </form>
      )}
    </div>
  );
}
