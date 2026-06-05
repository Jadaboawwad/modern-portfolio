const NGROK_ORIGIN = "https://curable-steerable-obnoxious.ngrok-free.dev";

export default async (request, context) => {
  const url = new URL(request.url);
  let path = url.pathname;
  if (path.startsWith("/chat")) {
    path = path.replace(/^\/chat/, "") || "/";
  }
  const target = new URL(path, NGROK_ORIGIN);
  target.search = url.search;

  const headers = new Headers(request.headers);
  headers.set("Host", new URL(NGROK_ORIGIN).host);
  headers.set("ngrok-skip-browser-warning", "1");
  headers.set("User-Agent", "PortfolioChat/1.0");
  headers.set("X-Forwarded-Host", url.host);
  headers.set("X-Forwarded-Proto", url.protocol.replace(":", ""));

  return fetch(target.toString(), {
    method: request.method,
    headers,
    body: request.body,
    redirect: "follow",
  });
};
