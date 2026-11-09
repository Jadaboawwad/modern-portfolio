/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const gateway = process.env.RAG_GATEWAY_URL || "http://localhost:9080";
    // Dev-only rewrite (same-machine assestant). In prod, Netlify's
    // avatar-proxy edge function forwards /avatar-api/* through the same
    // ngrok tunnel to gateway.conf's /avatar-api/ location instead.
    const avatarService =
      process.env.AVATAR_SERVICE_URL || "http://localhost:3001";
    return [
      {
        // Local dev parity with netlify/edge-functions/api-proxy.js, which
        // rewrites /rag-api/* -> /api/* against the ngrok origin in prod —
        // the gateway (gateway.conf) only exposes the backend under /api/*.
        source: "/rag-api/:path*",
        destination: `${gateway}/api/:path*`,
      },
      {
        source: "/avatar-api/:path*",
        destination: `${avatarService}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
