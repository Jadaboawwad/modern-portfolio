const NGROK_ORIGIN = "https://curable-steerable-obnoxious.ngrok-free.dev";
const NGROK_WS_ORIGIN = NGROK_ORIGIN.replace(/^https/, "wss");
const PORTFOLIO_ORIGIN = "https://jehadabuawwad.com";

const STREAMLIT_MODULE_RE =
  /<script\s+type="module"\s+crossorigin\s+src="(\.\/static\/js\/[^"]+\.js)"><\/script>/;

const INLINE_WS_PATCH = `
function __portfolioRewriteWs(url) {
  if (typeof url !== "string" || !url.includes("_stcore")) return url;
  const path = url.replace(/^wss?:\\/\\/[^/]+/, "").replace(/^\\/chat(?=\\/)/, "");
  return "${NGROK_WS_ORIGIN}" + path;
}
const __portfolioNativeWs = globalThis.WebSocket;
globalThis.WebSocket = function (url, protocols) {
  return new __portfolioNativeWs(__portfolioRewriteWs(url), protocols);
};
globalThis.WebSocket.prototype = __portfolioNativeWs.prototype;
globalThis.WebSocket.CONNECTING = __portfolioNativeWs.CONNECTING;
globalThis.WebSocket.OPEN = __portfolioNativeWs.OPEN;
globalThis.WebSocket.CLOSING = __portfolioNativeWs.CLOSING;
globalThis.WebSocket.CLOSED = __portfolioNativeWs.CLOSED;
`;

const STREAMLIT_BUNDLE_WS_RE = /this\.websocket=new WebSocket\(nt,/g;
const STREAMLIT_BUNDLE_HELPER = `function __portfolioRewriteWs(g){if(typeof g!=="string"||!g.includes("_stcore"))return g;const h=g.replace(/^wss?:\\/\\/[^/]+/,"").replace(/^\\/chat(?=\\/)/,"");return"${NGROK_WS_ORIGIN}"+h;}`;

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

function patchStreamlitBundle(js) {
  if (!js.includes("connectToWebSocket") || js.includes("__portfolioRewriteWs")) {
    return js;
  }

  if (STREAMLIT_BUNDLE_WS_RE.test(js)) {
    return (
      STREAMLIT_BUNDLE_HELPER +
      js.replace(
        STREAMLIT_BUNDLE_WS_RE,
        "this.websocket=new WebSocket(__portfolioRewriteWs(nt),"
      )
    );
  }

  return js;
}

async function patchHostConfig(response) {
  try {
    const config = await response.json();
    const origins = new Set(config.allowedOrigins || []);
    origins.add(PORTFOLIO_ORIGIN);
    origins.add("https://www.jehadabuawwad.com");
    config.allowedOrigins = [...origins];
    const headers = new Headers(response.headers);
    headers.set("content-type", "application/json");
    headers.delete("content-length");
    return new Response(JSON.stringify(config), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch {
    return response;
  }
}

async function transformResponse(response, requestUrl) {
  const contentType = response.headers.get("content-type") || "";
  const path = upstreamPath(requestUrl.pathname);

  if (path.endsWith("/host-config")) {
    return patchHostConfig(response);
  }

  if (
    path.includes("/static/js/") &&
    path.endsWith(".js") &&
    (contentType.includes("javascript") || contentType.includes("ecmascript"))
  ) {
    const patched = patchStreamlitBundle(await response.text());
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    return new Response(patched, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  if (contentType.includes("text/html")) {
    const patched = patchStreamlitHtml(await response.text());
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    return new Response(patched, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
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

  return transformResponse(response, url);
};
