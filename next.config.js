/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const gateway = process.env.RAG_GATEWAY_URL || "http://localhost:9080";
    return [
      {
        source: "/rag-api/:path*",
        destination: `${gateway}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
