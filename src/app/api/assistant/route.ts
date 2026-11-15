import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { assistantConfig, isAssistantEnabled } from "@/lib/assistant/config";
import { assistantInstructions } from "@/lib/assistant/prompt";
import { buildAssistantTools } from "@/lib/assistant/tools";
import { countAssistantMessage, visitorHash } from "@/lib/assistant/usage";
import { TRACK_COOKIE } from "@/lib/tracking/server";

/**
 * POST /api/assistant — conversation avec l'assistant RÈRA (réponse en flux).
 * Aucune conversation n'est enregistrée côté serveur.
 */
export const maxDuration = 60;

const error = (code: string, status: number) => NextResponse.json({ ok: false, error: code }, { status });

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

const textOf = (m: UIMessage) =>
  m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

export async function POST(request: Request) {
  if (!isAssistantEnabled()) return error("disabled", 503);
  const config = assistantConfig();

  let body: { messages?: unknown; locale?: unknown };
  try {
    body = await request.json();
  } catch {
    return error("invalid_json", 400);
  }
  const locale = body.locale === "en" ? "en" : "fr";
  const messages = Array.isArray(body.messages) ? (body.messages as UIMessage[]) : null;
  if (!messages || messages.length === 0 || messages.length > 200) return error("invalid_messages", 400);

  const last = messages[messages.length - 1];
  if (last?.role !== "user" || !Array.isArray(last.parts)) return error("invalid_messages", 400);
  if (textOf(last).length > config.maxMessageChars) return error("message_too_long", 413);
  const turns = messages.filter((m) => m.role === "user").length;
  if (turns > config.maxTurns) return error("conversation_limit", 429);

  try {
    const usage = await countAssistantMessage(visitorHash(clientIp(request)), {
      perVisitor: config.maxMessagesPerDay,
      visitorsPerDay: config.maxVisitorsPerDay,
    });
    if (!usage.allowed) return error(usage.reason, 429);
  } catch (e) {
    console.error("[assistant] compteur d'usage", e);
    return error("server_error", 503);
  }

  // Seuls les échanges récents sont envoyés au modèle (maîtrise des coûts).
  const recent = messages.slice(-config.historyWindow).filter((m) => m.role === "user" || m.role === "assistant");
  const trackingCookie = (await cookies()).get(TRACK_COOKIE)?.value;
  const google = createGoogleGenerativeAI({ apiKey: config.apiKey });

  const result = streamText({
    model: google(config.model),
    instructions: assistantInstructions(locale),
    messages: await convertToModelMessages(recent),
    tools: buildAssistantTools({ locale, trackingCookie }),
    stopWhen: isStepCount(6),
    maxOutputTokens: 1200,
    temperature: 0.4,
    providerOptions: { google: { thinkingConfig: { thinkingLevel: "low" } } },
    abortSignal: AbortSignal.timeout(55_000),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: (e) => {
        console.error("[assistant] génération", e);
        return "assistant_unavailable";
      },
    }),
  });
}
