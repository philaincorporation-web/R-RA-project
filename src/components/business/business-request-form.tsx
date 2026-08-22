"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const inputClasses =
  "w-full rounded-lg border border-rera-navy-200 bg-white px-4 py-3 text-sm text-rera-navy-800 placeholder:text-rera-navy-300 focus:border-rera-lagoon-500 focus:outline-none focus:ring-2 focus:ring-rera-lagoon-200 dark:border-white/15 dark:bg-rera-navy-800 dark:text-white dark:placeholder:text-white/30";

export function BusinessRequestForm({ locale, dict }: { locale: AppLocale; dict: Dictionary }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      companyName: String(form.get("companyName") ?? ""),
      contactName: String(form.get("contactName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      eventType: String(form.get("eventType") ?? ""),
      attendees: Number(form.get("attendees") ?? 1),
      preferredDate: String(form.get("preferredDate") ?? ""),
      budgetRange: String(form.get("budgetRange") ?? ""),
      message: String(form.get("message") ?? ""),
    };

    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("request_failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg(dict.common.error);
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface flex flex-col items-center gap-3 rounded-xl2 p-10 text-center shadow-premium"
      >
        <CheckCircle2 className="h-10 w-10 text-rera-emerald-500" />
        <h3 className="text-lg font-semibold text-rera-navy-800 dark:text-white">
          {dict.booking.labels.successTitle}
        </h3>
        <p className="max-w-md text-sm text-rera-navy-500 dark:text-rera-mist/70">
          {dict.booking.labels.successText}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface space-y-5 rounded-xl2 p-6 shadow-premium sm:p-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
            {locale === "fr" ? "Nom de l'entreprise" : "Company name"}
          </label>
          <input name="companyName" required className={inputClasses} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
            {locale === "fr" ? "Nom du contact" : "Contact name"}
          </label>
          <input name="contactName" required className={inputClasses} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
            {dict.booking.labels.email}
          </label>
          <input type="email" name="email" required className={inputClasses} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
            {dict.booking.labels.phone}
          </label>
          <input type="tel" name="phone" required className={inputClasses} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
            {locale === "fr" ? "Type d'événement" : "Event type"}
          </label>
          <input name="eventType" required placeholder="Séminaire, forum, team building..." className={inputClasses} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
            {locale === "fr" ? "Nombre de participants" : "Number of attendees"}
          </label>
          <input type="number" name="attendees" min={1} required className={inputClasses} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
            {locale === "fr" ? "Date souhaitée" : "Preferred date"}
          </label>
          <input type="date" name="preferredDate" className={inputClasses} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
            {locale === "fr" ? "Budget estimé" : "Estimated budget"}
          </label>
          <input name="budgetRange" placeholder={locale === "fr" ? "Optionnel" : "Optional"} className={inputClasses} />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
          {locale === "fr" ? "Votre message" : "Your message"}
        </label>
        <textarea name="message" required rows={5} className={inputClasses} />
      </div>

      {errorMsg ? <p className="text-sm text-red-500">{errorMsg}</p> : null}

      <Button type="submit" disabled={status === "loading"} className="w-full sm:w-auto">
        {status === "loading" ? dict.booking.labels.submitting : dict.common.send}
      </Button>
    </form>
  );
}
