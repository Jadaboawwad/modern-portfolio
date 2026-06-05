const NGROK_ORIGIN = "https://curable-steerable-obnoxious.ngrok-free.dev";
const NGROK_WS_ORIGIN = NGROK_ORIGIN.replace(/^https/, "wss");

const WS_PATCH = `<script id="portfolio-chat-ws-patch">(function(){var o="${NGROK_WS_ORIGIN}";var W=WebSocket;WebSocket=function(u,p){if(typeof u==="string"&&(u.indexOf("/_stcore/")!==-1||u.indexOf("/chat/_stcore/")!==-1)){u=u.replace(/^wss?:\\/\\/[^/]+/,"");u=u.replace(/^\\/chat/,"");u=o+u;}return new W(u,p);};WebSocket.prototype=W.prototype;WebSocket.CONNECTING=W.CONNECTING;WebSocket.OPEN=W.OPEN;WebSocket.CLOSING=W.CLOSING;WebSocket.CLOSED=W.CLOSED;})();</script>`;

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

async function injectWebSocketPatch(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  const html = await response.text();
  const patched = html.includes("</head>")
    ? html.replace("</head>", `${WS_PATCH}</head>`)
    : `${WS_PATCH}${html}`;

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
