import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
const BACKEND_HOST = process.env.BACKEND_HOST || '127.0.0.1';
const BACKEND_PORT = process.env.BACKEND_PORT || '8000';
const PROD_DOMAIN = process.env.PROD_DOMAIN || '';

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: BACKEND_HOST, port: BACKEND_PORT },
      { protocol: 'http', hostname: 'localhost', port: BACKEND_PORT },
      ...(PROD_DOMAIN ? [{ protocol: 'https', hostname: PROD_DOMAIN } as const] : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${BACKEND_URL}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
