/**
 * Netlify Edge — proxy /rag-api/* → ngrok gateway /api/*
 * Chat uses SSE streaming so Netlify keeps the connection open (>40s processing).
 */
const NGROK_ORIGIN = "https://curable-steerable-obnoxious.ngrok-free.dev";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

/** Best-effort visit/message logging — must never break the proxy. */
function logRequest(kind, request, context, extra = {}) {
  try {
    const geo = context.geo || {};
    console.log(
      JSON.stringify({
        kind,
        time: new Date().toISOString(),
        ip: context.ip,
        country: geo.country?.name,
        countryCode: geo.country?.code,
        region: geo.subdivision?.name,
        city: geo.city,
        timezone: geo.timezone,
        userAgent: request.headers.get("user-agent") || "",
        referrer: request.headers.get("referer") || "",
        ...extra,
      })
    );
  } catch {
    // ignore — logging must never break the actual request
  }
}

export default async (request, context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/rag-api/, "/api") || "/api";
  const target = new URL(path, NGROK_ORIGIN);
  target.search = url.search;

  const headers = new Headers(request.headers);
  headers.set("Host", new URL(NGROK_ORIGIN).host);
  headers.set("ngrok-skip-browser-warning", "1");
  headers.set("User-Agent", "PortfolioChat/1.0");
  headers.delete("content-length");

  const isChatPost =
    request.method === "POST" && path.replace(/\/$/, "") === "/api/chat";

  let body;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const raw = await request.text();
    if (isChatPost && raw) {
      try {
        const payload = JSON.parse(raw);
        payload.stream = true;
        body = JSON.stringify(payload);
        logRequest("chat_message", request, context, {
          question:
            typeof payload.question === "string"
              ? payload.question.slice(0, 500)
              : undefined,
          language: payload.language,
        });
      } catch {
        body = raw;
      }
    } else {
      body = raw;
    }
  }

  if (isChatPost) {
    headers.set("Accept", "text/event-stream");
  } else if (path.replace(/\/$/, "") === "/api/health") {
    logRequest("chat_widget_open", request, context);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 300_000);

  try {
    const upstream = await fetch(target.toString(), {
      method: request.method,
      headers,
      body,
      redirect: "follow",
      signal: controller.signal,
    });

    if (isChatPost && upstream.ok) {
      return new Response(upstream.body, {
        status: 200,
        headers: {
          ...CORS,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    return upstream;
  } finally {
    clearTimeout(timeout);
  }
};
