const ARABIC_RE =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export const RAG_API_BASE =
  process.env.NEXT_PUBLIC_RAG_API_URL || "/rag-api";

const CHAT_TIMEOUT_MS = 300_000;
const HEALTH_TIMEOUT_MS = 8_000;

/** ngrok-skip-browser-warning only when calling ngrok directly (local/dev). */
function apiHeaders(extra = {}) {
  const headers = { ...extra };
  if (/^https?:\/\//.test(RAG_API_BASE) && RAG_API_BASE.includes("ngrok")) {
    headers["ngrok-skip-browser-warning"] = "1";
  }
  return headers;
}

export const UI = {
  ar: {
    welcome:
      "مرحباً! أنا مساعد ملف نماذج الاعمال لـجهاد أبو عواد. اسألني عن خبرتي، مهاراتي، شهاداتي، مشاريعي، أو أي معلومات عني.",
    placeholder: "اسأل عن خبرتي، مهاراتي، شهاداتي، أو مشاريعي...",
    searching: "جاري البحث والتوليد...",
    error: "تعذر الاتصال بالمساعد. حاول مرة أخرى.",
    offline:
      "المساعد غير متاح حالياً. يمكنك المحاولة مرة أخرى بعد قليل، أو التواصل معي عبر صفحة الاتصال.",
    retry: "إعادة المحاولة",
    timeout:
      "استغرق الرد وقتاً طويلاً. حاول سؤالاً أقصر أو أعد المحاولة بعد قليل.",
    langEn: "English",
    langAr: "العربية",
  },
  en: {
    welcome:
      "Hello! I'm Jehad Abu Awwad's portfolio assistant. Ask about my experience, skills, certifications, projects, or background.",
    placeholder: "Ask about experience, skills, certifications, projects...",
    searching: "Searching & generating...",
    error: "Could not reach the assistant. Please try again.",
    offline:
      "The assistant isn’t available right now. Please try again in a moment, or contact me through the contact page.",
    retry: "Try again",
    timeout:
      "The reply took too long. Try a shorter question or wait a moment and retry.",
    langEn: "English",
    langAr: "العربية",
  },
};

export function containsArabic(text) {
  return ARABIC_RE.test(text);
}

export function detectLanguage(text, fallback = "en") {
  return containsArabic(text) ? "ar" : fallback;
}

function parseSseEvents(buffer) {
  const events = [];
  const parts = buffer.split("\n\n");
  const rest = parts.pop() || "";
  for (const part of parts) {
    if (!part.trim()) continue;
    let event = "message";
    let data = "";
    for (const line of part.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      if (line.startsWith("data:")) data += line.slice(5).trim();
    }
    events.push({ event, data });
  }
  return { events, rest };
}

let warmupPromise = null;

async function pingRagApi() {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  try {
    const response = await fetch(`${RAG_API_BASE}/health`, {
      method: "GET",
      headers: apiHeaders(),
      signal: controller.signal,
    });
    if (!response.ok) return false;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return false;

    const data = await response.json();
    return typeof data.status === "string";
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function warmupRagApi() {
  if (!warmupPromise) {
    warmupPromise = pingRagApi();
  }
  return warmupPromise;
}

export function retryRagApiConnection() {
  warmupPromise = pingRagApi();
  return warmupPromise;
}

async function readChatStream(response, signal) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parsed = parseSseEvents(buffer);
    buffer = parsed.rest;

    for (const evt of parsed.events) {
      if (evt.event === "error") {
        const err = JSON.parse(evt.data);
        throw new Error(err.detail || "Chat failed");
      }
      if (evt.event === "result") {
        return JSON.parse(evt.data);
      }
    }
  }

  throw new Error("Chat ended without a result");
}

export async function sendPortfolioQuestion(question, language) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

  try {
    const response = await fetch(`${RAG_API_BASE}/chat`, {
      method: "POST",
      headers: apiHeaders({
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      }),
      body: JSON.stringify({
        question,
        language,
        portfolio_fast: true,
        stream: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Chat API ${response.status}`);
    }

    const data = await readChatStream(response, controller.signal);
    return data.answer || UI[language]?.error || UI.en.error;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(UI[language]?.timeout || UI.en.timeout);
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
