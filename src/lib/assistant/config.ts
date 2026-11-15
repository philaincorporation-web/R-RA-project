import "server-only";

/**
 * Réglages de l'assistant IA (variables d'environnement, toutes facultatives sauf la clé).
 *   ASSISTANT_ENABLED=true            interrupteur général (désactivé par défaut)
 *   GEMINI_API_KEY                    clé Google AI Studio
 *   GEMINI_MODEL                      modèle (défaut : gemini-3.5-flash)
 *   ASSISTANT_MAX_MESSAGES_PER_DAY    messages par visiteur et par jour (défaut 30)
 *   ASSISTANT_MAX_TURNS               échanges par conversation (défaut 20)
 *   ASSISTANT_MAX_VISITORS_PER_DAY    visiteurs distincts par jour, tous confondus (défaut 1000)
 */

function intEnv(name: string, fallback: number) {
  const n = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function isAssistantEnabled() {
  return process.env.ASSISTANT_ENABLED === "true" && Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function assistantConfig() {
  return {
    apiKey: process.env.GEMINI_API_KEY?.trim() ?? "",
    model: process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash",
    maxMessagesPerDay: intEnv("ASSISTANT_MAX_MESSAGES_PER_DAY", 30),
    maxTurns: intEnv("ASSISTANT_MAX_TURNS", 20),
    maxVisitorsPerDay: intEnv("ASSISTANT_MAX_VISITORS_PER_DAY", 1000),
    /** Longueur maximale d'un message du visiteur. */
    maxMessageChars: 1000,
    /** Messages d'historique envoyés au modèle (les plus récents). */
    historyWindow: 30,
  };
}
