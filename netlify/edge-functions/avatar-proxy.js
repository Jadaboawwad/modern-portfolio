/**
 * Netlify Edge — proxy /avatar-api/* -> ngrok origin -> gateway's
 * /avatar-api/ location (gateway.conf) -> assestant on the host (port 3000).
 * Same ngrok tunnel as api-proxy.js / chat-proxy.js use (free plan only
 * allows one), so the path is forwarded unchanged — the gateway does the
 * routing to assestant, not this function.
 *
 * Responses can be binary (lip-synced video, the idle reference image), so
 * the body is streamed through as-is rather than read as text.
 */
const NGROK_ORIGIN = "https://smartly-cryptic-smilingly.ngrok-free.dev";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  const url = new URL(request.url);
  const target = new URL(url.pathname, NGROK_ORIGIN);
  target.search = url.search;

  const headers = new Headers(request.headers);
  headers.set("Host", new URL(NGROK_ORIGIN).host);
  headers.set("ngrok-skip-browser-warning", "1");
  headers.delete("content-length");

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  // Avatar generation (TTS + lip-sync) can take tens of seconds.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  try {
    const upstream = await fetch(target.toString(), {
      method: request.method,
      headers,
      body,
      redirect: "follow",
      signal: controller.signal,
    });

    const responseHeaders = new Headers(upstream.headers);
    for (const [key, value] of Object.entries(CORS)) {
      responseHeaders.set(key, value);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } finally {
    clearTimeout(timeout);
  }
};
