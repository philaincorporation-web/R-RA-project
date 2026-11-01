"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, CheckCircle2, ChevronLeft, ChevronRight, Lock, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatPrice, pick } from "@/lib/utils/format";
import { estimateTotal } from "@/lib/pricing";
import { additionalOptions, paymentMethods } from "@/data/booking-options";
import { AccountPrompt } from "@/components/account/account-prompt";
import type { AppLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Accommodation, Activity, Package } from "@/types";

type OfferType = "package" | "activity" | "accommodation";

interface UnifiedOffer {
  slug: string;
  type: OfferType;
  name: string;
  price: number;
  currency: string;
  image: string;
  capacity?: number;
}

const MAX_TRAVELERS = 30;

/** Date du jour au format AAAA-MM-JJ (fuseau local), pour bloquer les dates passées. */
function todayIso() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function nightsBetween(start: string, end: string) {
  if (!start || !end) return 0;
  const diff = new Date(`${end}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
}

const inputClasses =
  "w-full rounded-lg border border-rera-navy-200 bg-white px-4 py-3 text-sm text-rera-navy-800 placeholder:text-rera-navy-300 focus:border-rera-lagoon-500 focus:outline-none focus:ring-2 focus:ring-rera-lagoon-200 dark:border-white/15 dark:bg-rera-navy-800 dark:text-white dark:placeholder:text-white/30";


export function BookingStepper({
  locale,
  dict,
  packages,
  activities,
  accommodations,
  initialSlug,
  initialType,
}: {
  locale: AppLocale;
  dict: Dictionary;
  packages: Package[];
  activities: Activity[];
  accommodations: Accommodation[];
  initialSlug?: string;
  initialType?: string;
}) {
  const offers: UnifiedOffer[] = useMemo(() => {
    return [
      ...packages.map((p) => ({
        slug: p.slug,
        type: "package" as const,
        name: pick(p.name, locale),
        price: p.price,
        currency: p.currency,
        image: p.image,
      })),
      ...activities.map((a) => ({
        slug: a.slug,
        type: "activity" as const,
        name: pick(a.name, locale),
        price: a.price,
        currency: a.currency,
        image: a.image,
      })),
      ...accommodations.map((h) => ({
        slug: h.slug,
        type: "accommodation" as const,
        name: pick(h.name, locale),
        price: h.price,
        currency: h.currency,
        image: h.image,
        capacity: h.capacity,
      })),
    ];
  }, [packages, activities, accommodations, locale]);

  const preselectedOffer = initialSlug
    ? offers.find((o) => o.slug === initialSlug && (!initialType || o.type === initialType))
    : undefined;

  // Si le visiteur arrive depuis une offre précise, on passe directement au choix de la date.
  const [step, setStep] = useState(preselectedOffer ? 1 : 0);
  const [selectedOffer, setSelectedOffer] = useState<UnifiedOffer | undefined>(preselectedOffer ?? offers[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [notes, setNotes] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [reference, setReference] = useState<string | null>(null);
  const [account, setAccount] = useState<{ signedIn: boolean; claimToken: string | null }>({ signedIn: false, claimToken: null });

  const optionsTotal = selectedOptions.reduce((sum, id) => {
    const opt = additionalOptions.find((o) => o.id === id);
    return sum + (opt?.price ?? 0);
  }, 0);

  const isAccommodation = selectedOffer?.type === "accommodation";
  const nights = isAccommodation ? nightsBetween(startDate, endDate) : 0;
  const travelers = adults + children;
  const overCapacity = Boolean(isAccommodation && selectedOffer?.capacity && travelers > selectedOffer.capacity);

  // Hébergement : prix par nuit (et non par personne). Packages/activités : prix par personne.
  const total = !selectedOffer
    ? 0
    : isAccommodation
    ? Math.round(selectedOffer.price * nights + optionsTotal)
    : estimateTotal({ basePrice: selectedOffer.price, adults, children, optionsPrice: optionsTotal });

  const fr = locale === "fr";
  const selectedOptionLabels = additionalOptions
    .filter((o) => selectedOptions.includes(o.id))
    .map((o) => (fr ? o.fr : o.en))
    .join(", ");
  const dateLabel = startDate
    ? isAccommodation && endDate
      ? `${formatDate(startDate, locale)} → ${formatDate(endDate, locale)} (${nights} ${fr ? (nights > 1 ? "nuits" : "nuit") : nights > 1 ? "nights" : "night"})`
      : formatDate(startDate, locale)
    : "—";
  const isMobileMoney = paymentMethod === "airtel-money" || paymentMethod === "moov-money";

  const steps = [
    dict.booking.steps.offer,
    dict.booking.steps.date,
    dict.booking.steps.travelers,
    dict.booking.steps.options,
    dict.booking.steps.summary,
    dict.booking.steps.contact,
    dict.booking.steps.payment,
  ];

  function toggleOption(id: string) {
    setSelectedOptions((prev) => (prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]));
  }

  function canProceed() {
    if (step === 0) return Boolean(selectedOffer);
    if (step === 1) return Boolean(startDate) && startDate >= todayIso() && (!isAccommodation || nights > 0);
    if (step === 5)
      return (
        fullName.trim().length > 1 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
        phone.replace(/\D/g, "").length >= 6 &&
        country.trim().length > 1
      );
    return true;
  }

  function goTo(next: number) {
    setStep(next);
    // Ramène le haut du formulaire à l'écran (utile sur mobile où les étapes sont longues).
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedOffer || !paymentMethod) return;
    setStatus("loading");

    const method = paymentMethods.find((m) => m.id === paymentMethod);
    const paymentNote = `[${fr ? "Paiement" : "Payment"} : ${method ? method.fr : paymentMethod}${
      isMobileMoney && mobileMoneyNumber ? ` — ${mobileMoneyNumber}` : ""
    }]`;

    const payload = {
      offerType: selectedOffer.type,
      offerSlug: selectedOffer.slug,
      offerName: selectedOffer.name,
      startDate,
      endDate: isAccommodation ? endDate : undefined,
      adults,
      children,
      options: selectedOptions,
      fullName,
      email,
      phone,
      country,
      notes: [paymentNote, notes.trim()].filter(Boolean).join(" "),
      paymentMethod,
      totalEstimate: total,
      currency: selectedOffer.currency,
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error("failed");
      setReference(json.reference ?? null);
      setAccount({ signedIn: Boolean(json.signedIn), claimToken: json.claimToken ?? null });
      setStatus("success");
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <motion.div
        ref={topRef}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface mx-auto flex max-w-lg flex-col items-center gap-4 rounded-xl2 p-10 text-center shadow-premium"
      >
        <CheckCircle2 className="h-12 w-12 text-rera-emerald-500" />
        <h3 className="text-xl font-semibold text-rera-navy-800 dark:text-white">
          {dict.booking.labels.successTitle}
        </h3>
        <p className="text-sm text-rera-navy-500 dark:text-rera-mist/70">{dict.booking.labels.successText}</p>
        {reference ? (
          <p className="rounded-full bg-rera-lagoon-50 px-4 py-1.5 text-xs font-semibold text-rera-lagoon-700 dark:bg-white/10 dark:text-rera-lagoon-200">
            {reference}
          </p>
        ) : null}
        <AccountPrompt
          locale={locale}
          signedIn={account.signedIn}
          claim={
            reference && account.claimToken
              ? { reference, token: account.claimToken, name: fullName, email, phone, country }
              : null
          }
        />
        <Button
          variant="ghost"
          onClick={() => {
            setStep(0);
            setStatus("idle");
            setReference(null);
            setPaymentMethod("");
          }}
        >
          {dict.booking.labels.newBooking}
        </Button>
      </motion.div>
    );
  }

  return (
    <div ref={topRef} className="scroll-mt-28">
      {/* Indicateur de progression mobile (le stepper complet ne tient pas sur petit écran) */}
      <div className="mb-8 sm:hidden">
        <div className="flex items-center justify-between text-xs font-medium text-rera-navy-500 dark:text-rera-mist/60">
          <span>
            {fr ? "Étape" : "Step"} {step + 1}/{steps.length}
          </span>
          <span className="font-semibold text-rera-navy-800 dark:text-white">{steps[step]}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rera-navy-100 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-rera-lagoon-500 transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Stepper indicator */}
      <div className="mb-10 hidden items-center justify-between sm:flex">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  i < step
                    ? "border-rera-emerald-500 bg-rera-emerald-500 text-white"
                    : i === step
                    ? "border-rera-lagoon-500 bg-rera-lagoon-500 text-white"
                    : "border-rera-navy-200 text-rera-navy-400 dark:border-white/15 dark:text-rera-mist/40"
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="whitespace-nowrap text-[11px] text-rera-navy-500 dark:text-rera-mist/60">{label}</span>
            </div>
            {i < steps.length - 1 ? (
              <div
                className={cn(
                  "mx-2 h-px flex-1",
                  i < step ? "bg-rera-emerald-500" : "bg-rera-navy-200 dark:bg-white/15"
                )}
              />
            ) : null}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          // Empêche la touche Entrée de soumettre prématurément le formulaire
          // à une étape intermédiaire (ex: en tapant l'email ou le téléphone).
          // Entrée reste normale dans les <textarea> (retour à la ligne), et
          // la soumission réelle n'est possible qu'à l'étape 6 (paiement).
          if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
            if (step < 6) {
              e.preventDefault();
            }
          }
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 ? (
              <div>
                <h3 className="mb-5 text-lg font-semibold text-rera-navy-800 dark:text-white">
                  {dict.booking.labels.chooseOffer}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {offers.map((offer) => (
                    <button
                      type="button"
                      key={`${offer.type}-${offer.slug}`}
                      onClick={() => setSelectedOffer(offer)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl2 border p-3 text-left transition-all",
                        selectedOffer?.slug === offer.slug && selectedOffer?.type === offer.type
                          ? "border-rera-lagoon-500 bg-rera-lagoon-50 dark:bg-white/10"
                          : "border-rera-navy-100 hover:border-rera-lagoon-300 dark:border-white/10"
                      )}
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                        <Image src={offer.image} alt={offer.name} fill sizes="56px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-rera-navy-800 dark:text-white">
                          {offer.name}
                        </p>
                        <p className="text-xs text-rera-navy-500 dark:text-rera-mist/60">
                          {formatPrice(offer.price, offer.currency, locale)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="max-w-lg">
                <h3 className="mb-5 text-lg font-semibold text-rera-navy-800 dark:text-white">
                  {dict.booking.labels.chooseDate}
                </h3>
                <div className={cn("grid gap-4", isAccommodation && "sm:grid-cols-2")}>
                  <div>
                    <label htmlFor="booking-start" className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
                      {isAccommodation ? (fr ? "Arrivée" : "Check-in") : fr ? "Date" : "Date"}
                    </label>
                    <input
                      id="booking-start"
                      type="date"
                      required
                      min={todayIso()}
                      value={startDate}
                      onChange={(e) => {
                        const value = e.target.value;
                        setStartDate(value);
                        if (endDate && value && endDate <= value) setEndDate(addDays(value, 1));
                      }}
                      className={inputClasses}
                    />
                  </div>
                  {isAccommodation ? (
                    <div>
                      <label htmlFor="booking-end" className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
                        {fr ? "Départ" : "Check-out"}
                      </label>
                      <input
                        id="booking-end"
                        type="date"
                        required
                        min={startDate ? addDays(startDate, 1) : addDays(todayIso(), 1)}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={inputClasses}
                      />
                    </div>
                  ) : null}
                </div>
                {isAccommodation && nights > 0 ? (
                  <p className="mt-3 text-sm text-rera-navy-500 dark:text-rera-mist/70">
                    {nights} {fr ? (nights > 1 ? "nuits" : "nuit") : nights > 1 ? "nights" : "night"}
                  </p>
                ) : null}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="max-w-sm space-y-6">
                <h3 className="text-lg font-semibold text-rera-navy-800 dark:text-white">
                  {dict.booking.steps.travelers}
                </h3>
                <Counter
                  label={dict.booking.labels.adults}
                  value={adults}
                  min={1}
                  max={MAX_TRAVELERS - children}
                  onChange={setAdults}
                />
                <Counter
                  label={dict.booking.labels.children}
                  value={children}
                  min={0}
                  max={MAX_TRAVELERS - adults}
                  onChange={setChildren}
                />
                {overCapacity ? (
                  <p className="flex items-start gap-2 rounded-xl2 bg-rera-gold-50 p-3 text-xs text-rera-navy-700 dark:bg-white/5 dark:text-rera-mist/80">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rera-gold-600" />
                    {fr
                      ? `Cet hébergement accueille ${selectedOffer?.capacity} personnes maximum. Notre équipe vous proposera une solution adaptée (unités supplémentaires).`
                      : `This accommodation sleeps up to ${selectedOffer?.capacity} guests. Our team will suggest a suitable option (extra units).`}
                  </p>
                ) : null}
                {travelers >= MAX_TRAVELERS ? (
                  <p className="text-xs text-rera-navy-500 dark:text-rera-mist/60">
                    {fr
                      ? `Au-delà de ${MAX_TRAVELERS} voyageurs, contactez RÈRA Business pour un devis de groupe.`
                      : `For more than ${MAX_TRAVELERS} travelers, contact RÈRA Business for a group quote.`}
                  </p>
                ) : null}
              </div>
            ) : null}

            {step === 3 ? (
              <div>
                <h3 className="mb-5 text-lg font-semibold text-rera-navy-800 dark:text-white">
                  {dict.booking.labels.additionalOptions}
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {additionalOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => toggleOption(opt.id)}
                      className={cn(
                        "rounded-xl2 border p-4 text-left transition-all",
                        selectedOptions.includes(opt.id)
                          ? "border-rera-lagoon-500 bg-rera-lagoon-50 dark:bg-white/10"
                          : "border-rera-navy-100 hover:border-rera-lagoon-300 dark:border-white/10"
                      )}
                    >
                      <p className="text-sm font-semibold text-rera-navy-800 dark:text-white">
                        {locale === "fr" ? opt.fr : opt.en}
                      </p>
                      <p className="mt-1 text-xs text-rera-navy-500 dark:text-rera-mist/60">
                        {formatPrice(opt.price, selectedOffer?.currency ?? "XAF", locale)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="max-w-md space-y-4">
                <h3 className="text-lg font-semibold text-rera-navy-800 dark:text-white">
                  {dict.booking.steps.summary}
                </h3>
                <dl className="card-surface space-y-3 rounded-xl2 p-5 text-sm">
                  <SummaryRow label={dict.booking.labels.chooseOffer} value={selectedOffer?.name ?? "—"} />
                  <SummaryRow label={dict.booking.labels.chooseDate} value={dateLabel} />
                  <SummaryRow label={dict.booking.labels.adults} value={String(adults)} />
                  <SummaryRow label={dict.booking.labels.children} value={String(children)} />
                  <SummaryRow
                    label={dict.booking.labels.additionalOptions}
                    value={selectedOptionLabels || "—"}
                  />
                  <div className="border-t border-rera-navy-100 pt-3 dark:border-white/10">
                    <SummaryRow
                      label={dict.booking.labels.totalEstimate}
                      value={formatPrice(total, selectedOffer?.currency ?? "XAF", locale)}
                      emphasize
                    />
                  </div>
                </dl>
              </div>
            ) : null}

            {step === 5 ? (
              <div className="max-w-lg space-y-5">
                <h3 className="text-lg font-semibold text-rera-navy-800 dark:text-white">
                  {dict.booking.steps.contact}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
                      {dict.booking.labels.fullName}
                    </label>
                    <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClasses} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
                      {dict.booking.labels.email}
                    </label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
                      {dict.booking.labels.phone}
                    </label>
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
                      {dict.booking.labels.country}
                    </label>
                    <input required value={country} onChange={(e) => setCountry(e.target.value)} className={inputClasses} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
                    {dict.booking.labels.notes}
                  </label>
                  <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClasses} />
                </div>
              </div>
            ) : null}

            {step === 6 ? (
              <div>
                <h3 className="mb-5 text-lg font-semibold text-rera-navy-800 dark:text-white">
                  {dict.booking.steps.payment}
                </h3>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                  {/* Colonne gauche : récapitulatif de commande */}
                  <div className="lg:col-span-2">
                    <div className="card-surface rounded-xl2 p-5 shadow-premium">
                      <p className="text-xs font-semibold uppercase tracking-wider text-rera-navy-400 dark:text-rera-mist/50">
                        {locale === "fr" ? "Votre commande" : "Your order"}
                      </p>

                      {selectedOffer ? (
                        <div className="mt-4 flex items-center gap-3 border-b border-rera-navy-100/60 pb-4 dark:border-white/10">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={selectedOffer.image}
                              alt={selectedOffer.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-rera-navy-800 dark:text-white">
                              {selectedOffer.name}
                            </p>
                            <p className="text-xs text-rera-navy-500 dark:text-rera-mist/60">
                              {formatPrice(selectedOffer.price, selectedOffer.currency, locale)}
                            </p>
                          </div>
                        </div>
                      ) : null}

                      <dl className="mt-4 space-y-2.5 text-sm">
                        <SummaryRow label={dict.booking.labels.chooseDate} value={dateLabel} />
                        <SummaryRow label={dict.booking.labels.adults} value={String(adults)} />
                        <SummaryRow label={dict.booking.labels.children} value={String(children)} />
                        {selectedOptions.length > 0 ? (
                          <SummaryRow
                            label={dict.booking.labels.additionalOptions}
                            value={selectedOptionLabels}
                          />
                        ) : null}
                      </dl>

                      <div className="mt-4 border-t border-rera-navy-100/60 pt-4 dark:border-white/10">
                        <SummaryRow
                          label={dict.booking.labels.totalEstimate}
                          value={formatPrice(total, selectedOffer?.currency ?? "XAF", locale)}
                          emphasize
                        />
                      </div>
                    </div>
                  </div>

                  {/* Colonne droite : choix + formulaire de paiement */}
                  <div className="lg:col-span-3">
                    <div className="card-surface rounded-xl2 p-5 shadow-premium sm:p-6">
                      <div className="mb-5 flex items-center gap-2">
                        <Image
                          src="/images/logo.png"
                          alt="RÈRA"
                          width={28}
                          height={28}
                          className="rounded-md"
                        />
                        <p className="text-sm font-semibold text-rera-navy-800 dark:text-white">
                          {locale === "fr" ? "Paiement sécurisé" : "Secure checkout"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {paymentMethods.map((method) => {
                          const isActive = paymentMethod === method.id;
                          return (
                            <button
                              type="button"
                              key={method.id}
                              aria-pressed={isActive}
                              onClick={() => setPaymentMethod(method.id)}
                              className={cn(
                                "flex flex-col items-center gap-2 rounded-xl2 border p-3 text-center transition-all",
                                isActive
                                  ? "border-rera-lagoon-500 bg-rera-lagoon-50 dark:bg-white/10"
                                  : "border-rera-navy-100 hover:border-rera-lagoon-300 dark:border-white/10"
                              )}
                            >
                              {method.logo ? (
                                <div className="relative h-8 w-full">
                                  <Image src={method.logo} alt="" fill sizes="120px" className="object-contain" />
                                </div>
                              ) : null}
                              <span className="text-[11px] font-medium leading-tight text-rera-navy-700 dark:text-rera-mist">
                                {locale === "fr" ? method.fr : method.en}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {isMobileMoney ? (
                        <div className="mt-6">
                          <label htmlFor="mobile-money" className="mb-1.5 block text-sm font-medium text-rera-navy-700 dark:text-rera-mist">
                            {fr ? "Numéro Mobile Money (facultatif)" : "Mobile Money number (optional)"}
                          </label>
                          <input
                            id="mobile-money"
                            type="tel"
                            value={mobileMoneyNumber}
                            onChange={(e) => setMobileMoneyNumber(e.target.value)}
                            placeholder="074 00 00 00"
                            inputMode="tel"
                            autoComplete="tel"
                            className={inputClasses}
                          />
                        </div>
                      ) : null}

                      {paymentMethod === "card" ? (
                        <p className="mt-6 text-sm text-rera-navy-600 dark:text-rera-mist/80">
                          {fr
                            ? "Vous recevrez un lien de paiement sécurisé par email après validation de votre demande. Ne communiquez jamais vos données de carte par formulaire ou par téléphone."
                            : "You will receive a secure payment link by email once your request is confirmed. Never share your card details through a form or over the phone."}
                        </p>
                      ) : null}

                      {!paymentMethod ? (
                        <p className="mt-4 text-xs text-rera-navy-500 dark:text-rera-mist/60">
                          {fr ? "Sélectionnez un moyen de paiement pour confirmer." : "Select a payment method to confirm."}
                        </p>
                      ) : null}

                      <div className="mt-6 flex items-start gap-2 rounded-xl2 bg-rera-gold-50 p-4 text-xs text-rera-navy-600 dark:bg-white/5 dark:text-rera-mist/70">
                        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <p>
                          {locale === "fr"
                            ? "Aucun paiement n'est prélevé maintenant. Notre équipe RÈRA vous contactera pour finaliser le règlement en toute sécurité."
                            : "No payment is taken now. Our RÈRA team will contact you to securely finalize the payment."}
                        </p>
                      </div>

                      {status === "error" ? (
                        <p className="mt-4 text-sm text-red-500">{dict.common.error}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between border-t border-rera-navy-100/60 pt-6 dark:border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={() => goTo(Math.max(0, step - 1))}
            className={cn(step === 0 && "invisible")}
          >
            <ChevronLeft className="h-4 w-4" />
            {dict.booking.labels.back}
          </Button>

          {step < 6 ? (
            <Button type="button" disabled={!canProceed()} onClick={() => goTo(Math.min(6, step + 1))}>
              {dict.booking.labels.next}
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={status === "loading" || !paymentMethod}>
              {status === "loading" ? dict.booking.labels.submitting : dict.booking.labels.confirm}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function Counter({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const btn =
    "flex h-8 w-8 items-center justify-center rounded-full border border-rera-navy-200 text-rera-navy-600 transition-colors hover:bg-rera-navy-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:text-rera-mist dark:hover:bg-white/10";
  return (
    <div className="flex items-center justify-between rounded-xl2 border border-rera-navy-100 p-4 dark:border-white/10">
      <span className="text-sm font-medium text-rera-navy-700 dark:text-rera-mist">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`${label} −1`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className={btn}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-semibold text-rera-navy-800 dark:text-white" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          aria-label={`${label} +1`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className={btn}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-rera-navy-500 dark:text-rera-mist/60">{label}</dt>
      <dd
        className={cn(
          "text-right font-medium text-rera-navy-800 dark:text-white",
          emphasize && "text-lg font-bold"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
