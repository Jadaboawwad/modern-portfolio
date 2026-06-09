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

let warmupPromise = null;

async function pingRagApi() {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  try {
    const response = await fetch(`${RAG_API_BASE}/api/health`, {
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

export async function sendPortfolioQuestion(question, language) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

  try {
    const response = await fetch(`${RAG_API_BASE}/api/chat`, {
      method: "POST",
      headers: apiHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        question,
        language,
        top_k: 5,
        use_hybrid: true,
        use_reranker: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Chat API ${response.status}`);
    }

    const data = await response.json();
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
