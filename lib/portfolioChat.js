const ARABIC_RE =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export const RAG_API_BASE =
  process.env.NEXT_PUBLIC_RAG_API_URL || "/rag-api";

export const UI = {
  ar: {
    welcome:
      "مرحباً! أنا مساعد ملف نماذج الاعمال لـجهاد أبو عواد. اسألني عن خبرتي، مهاراتي، شهاداتي، مشاريعي، أو أي معلومات عني.",
    placeholder: "اسأل عن خبرتي، مهاراتي، شهاداتي، أو مشاريعي...",
    searching: "جاري البحث والتوليد...",
    error: "تعذر الاتصال بالمساعد. حاول مرة أخرى.",
    langEn: "English",
    langAr: "العربية",
  },
  en: {
    welcome:
      "Hello! I'm Jehad Abu Awwad's portfolio assistant. Ask about my experience, skills, certifications, projects, or background.",
    placeholder: "Ask about experience, skills, certifications, projects...",
    searching: "Searching & generating...",
    error: "Could not reach the assistant. Please try again.",
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
  const timeout = window.setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${RAG_API_BASE}/api/health`, {
      method: "GET",
      signal: controller.signal,
    });
    return response.ok;
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

export async function sendPortfolioQuestion(question, language) {
  const response = await fetch(`${RAG_API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      language,
      top_k: 5,
      use_hybrid: true,
      use_reranker: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat API ${response.status}`);
  }

  const data = await response.json();
  return data.answer || UI[language]?.error || UI.en.error;
}
