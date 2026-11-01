"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { businessServices, type BusinessField, type BusinessService } from "@/data/business-services";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const inputClasses =
  "w-full rounded-lg border border-rera-navy-200 bg-white px-4 py-3 text-sm text-rera-navy-800 placeholder:text-rera-navy-300 focus:border-rera-lagoon-500 focus:outline-none focus:ring-2 focus:ring-rera-lagoon-200 dark:border-white/15 dark:bg-rera-navy-800 dark:text-white dark:placeholder:text-white/30";
const labelClasses = "mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist";

type Answers = Record<string, string | string[]>;

function todayIso() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function BusinessRequestForm({
  locale,
  dict,
  serviceId,
  onServiceChange,
}: {
  locale: AppLocale;
  dict: Dictionary;
  serviceId: BusinessService["id"] | "";
  onServiceChange: (id: BusinessService["id"]) => void;
}) {
  const fr = locale === "fr";
  const t = (l: { fr: string; en: string }) => (fr ? l.fr : l.en);

  const [step, setStep] = useState<0 | 1>(0);
  const [contactName, setContactName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [reference, setReference] = useState<string | null>(null);

  const service = businessServices.find((s) => s.id === serviceId);

  const step1Valid =
    Boolean(service) &&
    contactName.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    phone.replace(/\D/g, "").length >= 6;

  const step2Valid =
    !!service &&
    service.fields
      .filter((f) => f.required)
      .every((f) => {
        const v = answers[f.id];
        if (f.id === "departure") return typeof v === "string" && v > preferredDate;
        return Array.isArray(v) ? v.length > 0 : Boolean(v && String(v).trim());
      });

  function setAnswer(id: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function toggleMulti(id: string, option: string) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      return { ...prev, [id]: current.includes(option) ? current.filter((o) => o !== option) : [...current, option] };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!service || !step1Valid || !step2Valid) return;
    setStatus("loading");

    // Les réponses sont envoyées avec des libellés en français pour l'équipe RÈRA,
    // quelle que soit la langue du visiteur.
    const details = service.fields
      .filter((f) => f.id !== "attendees" && f.id !== "budget")
      .map((f) => {
        const raw = answers[f.id];
        const values = (Array.isArray(raw) ? raw : raw ? [raw] : []).map((v) => {
          const opt = f.options?.find((o) => o.fr === v || o.en === v);
          return opt ? opt.fr : v;
        });
        return { label: f.label.fr, value: values.join(", ") };
      })
      .filter((d) => d.value);

    const attendees = Number(answers.attendees);

    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: service.id,
          contactName,
          organization: organization || undefined,
          email,
          phone,
          preferredDate: preferredDate || undefined,
          attendees: Number.isFinite(attendees) && attendees > 0 ? attendees : undefined,
          budget: typeof answers.budget === "string" && answers.budget ? answers.budget : undefined,
          details,
          message: message || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error("request_failed");
      setReference(json.reference ?? null);
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
          {fr ? "Demande envoyée !" : "Request sent!"}
        </h3>
        <p className="max-w-md text-sm text-rera-navy-500 dark:text-rera-mist/70">
          {fr
            ? "Merci ! L'équipe RÈRA Business étudie votre demande et vous recontacte sous 48 h avec une proposition adaptée."
            : "Thank you! The RÈRA Business team is reviewing your request and will get back to you within 48 hours with a tailored proposal."}
        </p>
        {reference ? (
          <p className="rounded-full bg-rera-lagoon-50 px-4 py-1.5 text-xs font-semibold text-rera-lagoon-700 dark:bg-white/10 dark:text-rera-lagoon-200">
            {reference}
          </p>
        ) : null}
        <Button
          variant="secondary"
          className="mt-2"
          onClick={() => {
            setStatus("idle");
            setStep(0);
            setAnswers({});
            setMessage("");
            setReference(null);
          }}
        >
          {fr ? "Faire une autre demande" : "Send another request"}
        </Button>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA" && step === 0) e.preventDefault();
      }}
      className="card-surface rounded-xl2 p-6 shadow-premium sm:p-8"
    >
      {/* Progression */}
      <div className="mb-8 flex items-center gap-3 text-xs font-medium">
        {[fr ? "Vos informations" : "Your details", service ? t(service.title) : fr ? "Votre projet" : "Your project"].map(
          (label, i) => (
            <div key={i} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  i < step
                    ? "border-rera-emerald-500 bg-rera-emerald-500 text-white"
                    : i === step
                    ? "border-rera-lagoon-500 bg-rera-lagoon-500 text-white"
                    : "border-rera-navy-200 text-rera-navy-400 dark:border-white/15 dark:text-rera-mist/40"
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={cn("truncate", i === step ? "text-rera-navy-800 dark:text-white" : "text-rera-navy-400 dark:text-rera-mist/50")}>
                {label}
              </span>
              {i === 0 ? <span className="mx-1 h-px flex-1 bg-rera-navy-200 dark:bg-white/15" /> : null}
            </div>
          )
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
        >
          {step === 0 ? (
            <div className="space-y-5">
              <fieldset>
                <legend className={labelClasses}>{fr ? "Rubrique concernée" : "Service"} *</legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {businessServices.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      aria-pressed={serviceId === s.id}
                      onClick={() => onServiceChange(s.id)}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                        serviceId === s.id
                          ? "border-rera-lagoon-500 bg-rera-lagoon-50 text-rera-navy-900 dark:bg-white/10 dark:text-white"
                          : "border-rera-navy-200 text-rera-navy-600 hover:border-rera-lagoon-300 dark:border-white/15 dark:text-rera-mist/80"
                      )}
                    >
                      {t(s.title)}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="biz-name" className={labelClasses}>{fr ? "Nom et prénom" : "Full name"} *</label>
                  <input id="biz-name" autoComplete="name" value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="biz-org" className={labelClasses}>{fr ? "Entreprise ou organisation" : "Company or organisation"}</label>
                  <input id="biz-org" autoComplete="organization" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder={fr ? "Si applicable" : "If applicable"} className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="biz-email" className={labelClasses}>{dict.booking.labels.email} *</label>
                  <input id="biz-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="biz-phone" className={labelClasses}>{dict.booking.labels.phone} *</label>
                  <input id="biz-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="biz-date" className={labelClasses}>
                    {service ? t(service.dateLabel) : fr ? "Date ou période souhaitée" : "Preferred date"}
                  </label>
                  <input id="biz-date" type="date" min={todayIso()} value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} className={inputClasses} />
                </div>
              </div>
            </div>
          ) : service ? (
            <div className="space-y-5">
              <p className="text-sm text-rera-navy-500 dark:text-rera-mist/70">
                {fr
                  ? "Quelques précisions pour préparer une proposition adaptée. Seuls les champs marqués * sont obligatoires."
                  : "A few details so we can prepare a tailored proposal. Only fields marked * are required."}
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {service.fields.map((field) => (
                  <Field
                    key={`${service.id}-${field.id}`}
                    field={field}
                    fr={fr}
                    value={answers[field.id]}
                    minDate={field.id === "departure" ? preferredDate || todayIso() : todayIso()}
                    onChange={(v) => setAnswer(field.id, v)}
                    onToggle={(opt) => toggleMulti(field.id, opt)}
                  />
                ))}
              </div>
              <div>
                <label htmlFor="biz-message" className={labelClasses}>{fr ? "Précisions complémentaires" : "Additional details"}</label>
                <textarea
                  id="biz-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={fr ? "Décrivez toute demande particulière…" : "Describe any special request…"}
                  className={inputClasses}
                />
              </div>
              {status === "error" ? <p className="text-sm text-red-500">{dict.common.error}</p> : null}
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between border-t border-rera-navy-100/60 pt-6 dark:border-white/10">
        <Button type="button" variant="ghost" onClick={() => setStep(0)} className={cn(step === 0 && "invisible")}>
          <ChevronLeft className="h-4 w-4" />
          {dict.booking.labels.back}
        </Button>
        {step === 0 ? (
          <Button type="button" disabled={!step1Valid} onClick={() => setStep(1)}>
            {dict.booking.labels.next}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={status === "loading" || !step2Valid}>
            {status === "loading" ? dict.booking.labels.submitting : fr ? "Envoyer ma demande" : "Send my request"}
          </Button>
        )}
      </div>
    </form>
  );
}

function Field({
  field,
  fr,
  value,
  minDate,
  onChange,
  onToggle,
}: {
  field: BusinessField;
  fr: boolean;
  value: string | string[] | undefined;
  minDate: string;
  onChange: (v: string) => void;
  onToggle: (option: string) => void;
}) {
  const label = `${fr ? field.label.fr : field.label.en}${field.required ? " *" : ""}`;
  const id = `biz-${field.id}`;
  const str = typeof value === "string" ? value : "";

  if (field.type === "multi") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <fieldset className="sm:col-span-2">
        <legend className={labelClasses}>{label}</legend>
        <div className="flex flex-wrap gap-2">
          {field.options?.map((opt) => {
            const v = fr ? opt.fr : opt.en;
            const active = selected.includes(v);
            return (
              <button
                type="button"
                key={opt.fr}
                aria-pressed={active}
                onClick={() => onToggle(v)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-rera-lagoon-500 bg-rera-lagoon-500 text-white"
                    : "border-rera-navy-200 text-rera-navy-600 hover:border-rera-lagoon-300 dark:border-white/15 dark:text-rera-mist/80"
                )}
              >
                {active ? <Check className="-ml-0.5 mr-1 inline h-3 w-3" /> : null}
                {v}
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  }

  return (
    <div className={cn(field.wide && "sm:col-span-2")}>
      <label htmlFor={id} className={labelClasses}>{label}</label>
      {field.type === "select" ? (
        <select id={id} value={str} onChange={(e) => onChange(e.target.value)} className={inputClasses}>
          <option value="">{fr ? "Choisir…" : "Select…"}</option>
          {field.options?.map((opt) => (
            <option key={opt.fr} value={fr ? opt.fr : opt.en}>
              {fr ? opt.fr : opt.en}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={field.type}
          min={field.type === "number" ? 1 : field.type === "date" ? minDate : undefined}
          inputMode={field.type === "number" ? "numeric" : undefined}
          value={str}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ? (fr ? field.placeholder.fr : field.placeholder.en) : undefined}
          className={inputClasses}
        />
      )}
    </div>
  );
}
