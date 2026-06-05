const NGROK_ORIGIN = "https://curable-steerable-obnoxious.ngrok-free.dev";
const NGROK_WS_ORIGIN = NGROK_ORIGIN.replace(/^https/, "wss");

const STREAMLIT_MODULE_RE =
  /<script\s+type="module"\s+crossorigin\s+src="(\.\/static\/js\/[^"]+\.js)"><\/script>/;

const INLINE_WS_PATCH = `
const __portfolioNgrokWs = "${NGROK_WS_ORIGIN}";
const __portfolioNativeWs = globalThis.WebSocket;
globalThis.WebSocket = function (url, protocols) {
  let next = url;
  if (typeof next === "string" && next.includes("_stcore")) {
    next = next.replace(/^wss?:\\/\\/[^/]+/, "");
    next = next.replace(/^\\/chat(?=\\/)/, "");
    next = __portfolioNgrokWs + next;
  }
  return new __portfolioNativeWs(next, protocols);
};
globalThis.WebSocket.prototype = __portfolioNativeWs.prototype;
globalThis.WebSocket.CONNECTING = __portfolioNativeWs.CONNECTING;
globalThis.WebSocket.OPEN = __portfolioNativeWs.OPEN;
globalThis.WebSocket.CLOSING = __portfolioNativeWs.CLOSING;
globalThis.WebSocket.CLOSED = __portfolioNativeWs.CLOSED;
`;

function upstreamPath(pathname) {
  let path = pathname;
  if (path.startsWith("/chat")) {
    path = path.replace(/^\/chat/, "") || "/";
  }
  return path;
}

function buildUpstreamUrl(url) {
  const target = new URL(upstreamPath(url.pathname), NGROK_ORIGIN);
  target.search = url.search;
  return target;
}

function buildUpstreamHeaders(request, url) {
  const headers = new Headers(request.headers);
  headers.set("Host", new URL(NGROK_ORIGIN).host);
  headers.set("ngrok-skip-browser-warning", "1");
  headers.set("User-Agent", "PortfolioChat/1.0");
  headers.set("X-Forwarded-Host", url.host);
  headers.set("X-Forwarded-Proto", url.protocol.replace(":", ""));
  return headers;
}

function patchStreamlitHtml(html) {
  if (!STREAMLIT_MODULE_RE.test(html)) {
    return html;
  }

  return html.replace(
    STREAMLIT_MODULE_RE,
    (_, src) =>
      `<script type="module">${INLINE_WS_PATCH}await import("${src}");</script>`
  );
}

async function injectWebSocketPatch(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  const patched = patchStreamlitHtml(await response.text());
  const headers = new Headers(response.headers);
  headers.delete("content-length");

  return new Response(patched, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default async (request) => {
  const url = new URL(request.url);
  const target = buildUpstreamUrl(url);
  const headers = buildUpstreamHeaders(request, url);

  const response = await fetch(target.toString(), {
    method: request.method,
    headers,
    body: request.body,
    redirect: "follow",
  });

  return injectWebSocketPatch(response);
};
