"use client";

import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type InferUITools, type UIDataTypes, type UIMessage } from "ai";
import { CheckCircle2, Loader2, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { AppLocale } from "@/lib/i18n/config";
import type { AssistantTools } from "@/lib/assistant/tools";

type AssistantMessage = UIMessage<unknown, UIDataTypes, InferUITools<AssistantTools>>;
type Draft = Extract<
  NonNullable<InferUITools<AssistantTools>["prepareReservationRequest"]["output"]>,
  { ok: true }
>["draft"];

const MAX_CHARS = 1000;
const ASSISTANT_NAME = "Aïna";

/**
 * Photo d'Aïna (public/images/aina-avatar.png : visage recadré depuis aina.png, fond transparent).
 */
function AinaAvatar({ size, className }: { size: number; className?: string }) {
  return (
    <span
      className={cn("relative block shrink-0 overflow-hidden rounded-full bg-gradient-to-b from-rera-lagoon-100 to-rera-navy-100", className)}
      style={{ width: size, height: size }}
    >
      <Image src="/images/aina-avatar.png" alt="" width={size} height={size} className="h-full w-full object-cover" />
    </span>
  );
}

/** Texte de l'assistant : retours à la ligne, **gras** et liens internes (/fr/…) cliquables. */
function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {line.split(/(\[[^\]]+\]\(\/(?:fr|en)\/[^)\s]*\)|\*\*[^*]+\*\*|\/(?:fr|en)\/[^\s)»"]*)/g).map((chunk, j) => {
            // Lien au format Markdown [texte](/fr/…) : seuls les liens internes au site sont rendus cliquables.
            const md = chunk.match(/^\[([^\]]+)\]\((\/(?:fr|en)\/[^)\s]*)\)$/);
            if (md) {
              return (
                <Link key={j} href={md[2]} className="font-medium text-rera-lagoon-700 underline underline-offset-2 dark:text-rera-lagoon-300">
                  {md[1]}
                </Link>
              );
            }
            if (/^\*\*[^*]+\*\*$/.test(chunk)) return <strong key={j}>{chunk.slice(2, -2)}</strong>;
            if (/^\/(fr|en)\//.test(chunk)) {
              const href = chunk.replace(/[.,;:!?]+$/, "");
              const rest = chunk.slice(href.length);
              return (
                <Fragment key={j}>
                  <Link href={href} className="font-medium text-rera-lagoon-700 underline underline-offset-2 dark:text-rera-lagoon-300">
                    {href}
                  </Link>
                  {rest}
                </Fragment>
              );
            }
            return <Fragment key={j}>{chunk.replace(/^\s*[*-]\s+/, "• ")}</Fragment>;
          })}
          {i < lines.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </>
  );
}

/** Carte récapitulative : c'est le visiteur, et lui seul, qui transmet la demande. */
function DraftCard({ draft, locale }: { draft: Draft; locale: AppLocale }) {
  const fr = locale === "fr";
  const [state, setState] = useState<{ step: "idle" | "sending" | "sent" | "unavailable" | "error"; reference?: string }>({ step: "idle" });
  const fmt = (iso: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
  const money = new Intl.NumberFormat(locale, { style: "currency", currency: draft.currency || "XAF", maximumFractionDigits: 0 });

  async function submit() {
    setState({ step: "sending" });
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, source: "assistant" }),
      });
      const json = await res.json();
      if (res.status === 409) return setState({ step: "unavailable" });
      if (!res.ok || !json.ok) return setState({ step: "error" });
      setState({ step: "sent", reference: json.reference });
    } catch {
      setState({ step: "error" });
    }
  }

  const rows: [string, string][] = [
    [fr ? "Offre" : "Offer", draft.offerName],
    [fr ? "Dates" : "Dates", draft.endDate ? `${fmt(draft.startDate)} → ${fmt(draft.endDate)}` : fmt(draft.startDate)],
    [fr ? "Voyageurs" : "Travellers", `${draft.adults} ${fr ? "adulte(s)" : "adult(s)"}${draft.children ? `, ${draft.children} ${fr ? "enfant(s)" : "child(ren)"}` : ""}`],
    [fr ? "Nom" : "Name", draft.fullName],
    ["E-mail", draft.email],
    [fr ? "Téléphone" : "Phone", draft.phone],
    [fr ? "Estimation" : "Estimate", money.format(draft.totalEstimate)],
  ];

  return (
    <div className="mt-2 rounded-xl border border-rera-gold-400/50 bg-white p-3 text-sm shadow-sm dark:bg-rera-navy-800">
      <p className="mb-2 font-semibold text-rera-navy-800 dark:text-white">{fr ? "Récapitulatif de votre demande" : "Your request summary"}</p>
      <dl className="space-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[88px_1fr] gap-2">
            <dt className="text-rera-navy-400 dark:text-rera-mist/60">{k}</dt>
            <dd className="break-words font-medium text-rera-navy-800 dark:text-white">{v}</dd>
          </div>
        ))}
      </dl>
      {draft.notes ? <p className="mt-2 text-xs text-rera-navy-500 dark:text-rera-mist/70">{draft.notes}</p> : null}

      {state.step === "sent" ? (
        <div className="mt-3 rounded-lg bg-rera-emerald-50 p-2.5 text-rera-emerald-800 dark:bg-rera-emerald-400/10 dark:text-rera-emerald-200">
          <p className="flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="h-4 w-4" /> {fr ? "Demande transmise" : "Request sent"}
          </p>
          <p className="mt-1 text-xs">
            {fr
              ? `Référence ${state.reference}. Un e-mail de confirmation de réception vous a été envoyé. Notre équipe valide votre demande et revient vers vous rapidement.`
              : `Reference ${state.reference}. A confirmation of receipt has been emailed to you. Our team will validate your request and get back to you shortly.`}
          </p>
          <Link href={`/${locale}/track?ref=${encodeURIComponent(state.reference ?? "")}`} className="mt-1 inline-block text-xs font-semibold underline">
            {fr ? "Suivre ma demande" : "Track my request"}
          </Link>
        </div>
      ) : (
        <>
          {state.step === "unavailable" ? (
            <p className="mt-3 text-xs text-red-600 dark:text-red-400">
              {fr ? "Désolé, ces dates viennent d'être prises. Demandez d'autres dates à l'assistant." : "Sorry, these dates have just been taken. Ask the assistant for other dates."}
            </p>
          ) : null}
          {state.step === "error" ? (
            <p className="mt-3 text-xs text-red-600 dark:text-red-400">
              {fr ? "L'envoi a échoué. Réessayez, ou utilisez le formulaire de réservation." : "Sending failed. Try again, or use the booking form."}
            </p>
          ) : null}
          <button
            type="button"
            onClick={submit}
            disabled={state.step === "sending" || state.step === "unavailable"}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rera-gold-gradient px-4 py-2 text-sm font-semibold text-rera-navy-900 disabled:opacity-50"
          >
            {state.step === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {fr ? "Transmettre ma demande" : "Send my request"}
          </button>
          <p className="mt-1.5 text-center text-[11px] text-rera-navy-400 dark:text-rera-mist/50">
            {fr ? "Demande sans engagement, validée ensuite par notre équipe." : "No commitment: our team validates it afterwards."}
          </p>
        </>
      )}
    </div>
  );
}

const TOOL_LABELS: Record<string, { fr: string; en: string }> = {
  "tool-searchOffers": { fr: "Je consulte nos offres…", en: "Looking at our offers…" },
  "tool-getOfferDetails": { fr: "Je consulte les détails…", en: "Checking the details…" },
  "tool-checkAvailability": { fr: "Je vérifie les disponibilités…", en: "Checking availability…" },
  "tool-prepareReservationRequest": { fr: "Je prépare le récapitulatif…", en: "Preparing your summary…" },
  "tool-getReservationStatus": { fr: "Je consulte votre demande…", en: "Looking up your request…" },
};

export function AssistantWidget({ locale, contact }: { locale: AppLocale; contact: { phone: string; whatsapp: string; email: string } }) {
  const fr = locale === "fr";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [transport] = useState(() => new DefaultChatTransport<AssistantMessage>({ api: "/api/assistant", body: { locale } }));
  const { messages, sendMessage, status, error, regenerate, clearError, setMessages } = useChat<AssistantMessage>({ transport });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status, error]);

  function send(text: string) {
    const value = text.trim().slice(0, MAX_CHARS);
    if (!value || busy) return;
    clearError();
    sendMessage({ text: value });
    setInput("");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  const errorText = (() => {
    if (!error) return null;
    const msg = error.message ?? "";
    if (/visitor_limit|conversation_limit/.test(msg))
      return fr
        ? "Vous avez atteint la limite de messages pour aujourd'hui. Notre équipe reste joignable directement :"
        : "You have reached today's message limit. Our team is available directly:";
    if (/global_limit/.test(msg))
      return fr ? "L'assistant est très sollicité aujourd'hui. Contactez-nous directement :" : "The assistant is very busy today. Contact us directly:";
    if (/message_too_long/.test(msg)) return fr ? "Votre message est trop long (1 000 caractères maximum)." : "Your message is too long (1,000 characters max).";
    return fr
      ? "L'assistant est momentanément indisponible. Vous pouvez réessayer, ou réserver et nous contacter directement :"
      : "The assistant is temporarily unavailable. You can retry, or book and contact us directly:";
  })();

  const suggestions = fr
    ? ["Un week-end à deux en décembre ?", "Quelles activités nautiques proposez-vous ?", "Où en est ma réservation ?"]
    : ["A weekend for two in December?", "Which water activities do you offer?", "What is the status of my booking?"];

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group fixed bottom-5 right-5 z-[60] flex items-center gap-3 print:hidden"
          aria-label={fr ? `Discuter avec ${ASSISTANT_NAME}, l'assistante RÈRA` : `Chat with ${ASSISTANT_NAME}, the RÈRA assistant`}
        >
          <span className="hidden animate-aina-bubble rounded-2xl rounded-br-sm bg-white px-4 py-2.5 text-left text-sm shadow-premium dark:bg-rera-navy-800 sm:block">
            <span className="block font-semibold text-rera-navy-800 dark:text-white">
              {fr ? `Bonjour, je suis ${ASSISTANT_NAME} !` : `Hi, I'm ${ASSISTANT_NAME}!`}
            </span>
            <span className="block text-xs text-rera-navy-500 dark:text-rera-mist/70">{fr ? "Une question sur votre séjour ?" : "Any question about your stay?"}</span>
          </span>
          <span className="relative animate-aina-float">
            {/* Halos dorés qui s'élargissent : invitation discrète à cliquer */}
            <span className="pointer-events-none absolute inset-0 animate-aina-halo rounded-full bg-rera-gold-400/50" aria-hidden />
            <span className="pointer-events-none absolute inset-0 animate-aina-halo-delayed rounded-full bg-rera-gold-400/40" aria-hidden />
            <AinaAvatar
              size={64}
              className="shadow-premium ring-[3px] ring-rera-gold-400 transition-transform duration-300 group-hover:scale-110 group-hover:ring-rera-gold-300"
            />
            <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rera-emerald-400 opacity-60" />
              <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-rera-emerald-500 dark:border-rera-navy-900" />
            </span>
          </span>
        </button>
      ) : null}

      {open ? (
        <section
          role="dialog"
          aria-label={fr ? "Assistant RÈRA" : "RÈRA assistant"}
          className="fixed inset-0 z-[60] flex flex-col bg-white shadow-2xl dark:bg-rera-navy-900 sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[600px] sm:max-h-[calc(100svh-2.5rem)] sm:w-[400px] sm:rounded-2xl sm:border sm:border-rera-navy-100 dark:sm:border-white/10 print:hidden"
        >
          <header className="flex items-center gap-3 bg-rera-navy-800 px-4 py-3 text-white sm:rounded-t-2xl">
            <span className="relative">
              <AinaAvatar size={42} className="ring-2 ring-rera-gold-400" />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-rera-navy-800 bg-rera-emerald-500" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight">{ASSISTANT_NAME}</p>
              <p className="text-xs text-white/60">{fr ? "Assistante virtuelle RÈRA · en ligne" : "RÈRA virtual assistant · online"}</p>
            </div>
            {messages.length > 0 ? (
              <button type="button" onClick={() => { setMessages([]); clearError(); }} className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white" aria-label={fr ? "Nouvelle conversation" : "New conversation"}>
                <RotateCcw className="h-4 w-4" />
              </button>
            ) : null}
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white" aria-label={fr ? "Fermer" : "Close"}>
              <X className="h-5 w-5" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            <div className="flex items-start gap-2">
              <AinaAvatar size={30} />
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-rera-mist px-3.5 py-2.5 text-sm text-rera-navy-800 dark:bg-white/5 dark:text-rera-mist">
                {fr
                  ? `Bonjour et bienvenue chez RÈRA ! Je suis ${ASSISTANT_NAME}, votre assistante virtuelle. Je peux vous présenter nos séjours, activités et hébergements à Pointe Denis, vérifier les disponibilités et préparer votre demande de réservation. Que souhaitez-vous organiser ?`
                  : `Hello and welcome to RÈRA! I'm ${ASSISTANT_NAME}, your virtual assistant. I can present our stays, activities and accommodation in Pointe Denis, check availability and prepare your booking request. What would you like to plan?`}
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)} className="inline-flex items-center gap-1 rounded-full border border-rera-lagoon-200 px-3 py-1.5 text-xs font-medium text-rera-lagoon-700 hover:bg-rera-lagoon-50 dark:border-white/15 dark:text-rera-lagoon-200 dark:hover:bg-white/5">
                    <Sparkles className="h-3 w-3" /> {s}
                  </button>
                ))}
              </div>
            ) : null}

            {messages.map((m) => {
              if (m.role === "user") {
                return (
                  <div key={m.id} className="ml-auto max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-rera-navy-700 px-3.5 py-2.5 text-sm text-white">
                    {m.parts.map((p) => (p.type === "text" ? p.text : "")).join("")}
                  </div>
                );
              }
              const nodes: ReactNode[] = [];
              m.parts.forEach((p, i) => {
                if (p.type === "text" && p.text.trim()) {
                  nodes.push(
                    <div key={i} className="max-w-[92%] break-words rounded-2xl rounded-tl-sm bg-rera-mist px-3.5 py-2.5 text-sm leading-relaxed text-rera-navy-800 dark:bg-white/5 dark:text-rera-mist">
                      <RichText text={p.text} />
                    </div>
                  );
                } else if (p.type === "tool-prepareReservationRequest" && p.state === "output-available" && p.output.ok) {
                  nodes.push(<DraftCard key={i} draft={p.output.draft} locale={locale} />);
                } else if (p.type.startsWith("tool-") && "state" in p && (p.state === "input-streaming" || p.state === "input-available")) {
                  const label = TOOL_LABELS[p.type];
                  if (label) {
                    nodes.push(
                      <p key={i} className="flex items-center gap-1.5 text-xs text-rera-navy-400 dark:text-rera-mist/60">
                        <Loader2 className="h-3 w-3 animate-spin" /> {fr ? label.fr : label.en}
                      </p>
                    );
                  }
                }
              });
              if (nodes.length === 0) return null;
              return (
                <div key={m.id} className="flex items-start gap-2">
                  <AinaAvatar size={30} />
                  <div className="min-w-0 flex-1 space-y-2">{nodes}</div>
                </div>
              );
            })}

            {(() => {
              // Réponse terminée sans texte ni récapitulatif (cas rare côté modèle) : proposer de réessayer.
              const last = messages[messages.length - 1];
              const empty =
                status === "ready" &&
                !error &&
                last?.role === "assistant" &&
                !last.parts.some(
                  (p) => (p.type === "text" && p.text.trim()) || (p.type === "tool-prepareReservationRequest" && p.state === "output-available")
                );
              return empty ? (
                <div className="text-xs text-rera-navy-500 dark:text-rera-mist/70">
                  {fr ? "Je n'ai pas pu terminer ma réponse. " : "I couldn't finish my answer. "}
                  <button type="button" onClick={() => regenerate()} className="font-semibold text-rera-lagoon-700 underline dark:text-rera-lagoon-300">
                    {fr ? "Réessayer" : "Retry"}
                  </button>
                </div>
              ) : null;
            })()}

            {status === "submitted" ? (
              <div className="flex items-center gap-2" role="status">
                <AinaAvatar size={30} />
                <span className="inline-flex items-center gap-1 rounded-2xl rounded-tl-sm bg-rera-mist px-3.5 py-3 dark:bg-white/5">
                  <span className="sr-only">{fr ? `${ASSISTANT_NAME} écrit…` : `${ASSISTANT_NAME} is typing…`}</span>
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-rera-navy-400 dark:bg-rera-mist/60"
                      style={{ animationDelay: `${delay}ms` }}
                      aria-hidden
                    />
                  ))}
                </span>
              </div>
            ) : null}

            {errorText ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
                <p>{errorText}</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>
                    <Link href={`/${locale}/booking`} className="font-semibold underline">{fr ? "Formulaire de réservation" : "Booking form"}</Link>
                  </li>
                  <li>
                    <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="font-semibold underline">WhatsApp {contact.whatsapp}</a>
                  </li>
                  <li>
                    <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="font-semibold underline">{contact.phone}</a> · <a href={`mailto:${contact.email}`} className="underline">{contact.email}</a>
                  </li>
                </ul>
                {!/limit|too_long/.test(error?.message ?? "") ? (
                  <button type="button" onClick={() => { clearError(); regenerate(); }} className="mt-2 text-xs font-semibold underline">
                    {fr ? "Réessayer" : "Retry"}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="border-t border-rera-navy-100 p-3 dark:border-white/10">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                maxLength={MAX_CHARS}
                placeholder={fr ? "Écrivez votre message…" : "Type your message…"}
                aria-label={fr ? "Votre message" : "Your message"}
                className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-rera-navy-200 bg-white px-3 py-2.5 text-sm text-rera-navy-800 placeholder:text-rera-navy-300 focus:border-rera-lagoon-500 focus:outline-none focus:ring-2 focus:ring-rera-lagoon-200 dark:border-white/15 dark:bg-rera-navy-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rera-navy-700 text-white hover:bg-rera-navy-600 disabled:opacity-40"
                aria-label={fr ? "Envoyer" : "Send"}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-rera-navy-400 dark:text-rera-mist/50">
              {fr
                ? "Assistant IA : ses réponses peuvent comporter des erreurs. Les disponibilités et prix viennent de notre système, et chaque demande est validée par notre équipe. "
                : "AI assistant: answers may contain mistakes. Availability and prices come from our system, and every request is validated by our team. "}
              <Link href={`/${locale}/privacy`} className="underline">{fr ? "Confidentialité" : "Privacy"}</Link>
            </p>
          </form>
        </section>
      ) : null}
    </>
  );
}
