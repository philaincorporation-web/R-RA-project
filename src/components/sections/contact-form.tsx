"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const inputClasses =
  "w-full rounded-lg border border-rera-navy-200 bg-white px-4 py-3 text-sm text-rera-navy-800 placeholder:text-rera-navy-300 focus:border-rera-lagoon-500 focus:outline-none focus:ring-2 focus:ring-rera-lagoon-200 dark:border-white/15 dark:bg-rera-navy-800 dark:text-white dark:placeholder:text-white/30";

export function ContactForm({ locale, dict }: { locale: AppLocale; dict: Dictionary }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const payload = {
      fullName: String(form.get("fullName") ?? ""),
      email: String(form.get("email") ?? ""),
      subject: String(form.get("subject") ?? ""),
      message: String(form.get("message") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
    } catch {
      setStatus("error");
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
          {locale === "fr" ? "Message envoyé !" : "Message sent!"}
        </h3>
        <p className="max-w-md text-sm text-rera-navy-500 dark:text-rera-mist/70">
          {locale === "fr"
            ? "Merci de nous avoir écrit. Notre équipe vous répondra très prochainement."
            : "Thank you for reaching out. Our team will get back to you shortly."}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface space-y-5 rounded-xl2 p-6 shadow-premium sm:p-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
            {dict.booking.labels.fullName}
          </label>
          <input name="fullName" required className={inputClasses} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
            {dict.booking.labels.email}
          </label>
          <input type="email" name="email" required className={inputClasses} />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
          {locale === "fr" ? "Sujet" : "Subject"}
        </label>
        <input name="subject" required className={inputClasses} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
          {locale === "fr" ? "Message" : "Message"}
        </label>
        <textarea name="message" required rows={5} className={inputClasses} />
      </div>
      {status === "error" ? <p className="text-sm text-red-500">{dict.common.error}</p> : null}
      <Button type="submit" disabled={status === "loading"} className="w-full sm:w-auto">
        {status === "loading" ? dict.booking.labels.submitting : dict.common.send}
      </Button>
    </form>
  );
}
