import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly set workspace root to suppress multi-lockfile warning
  turbopack: {
    root: __dirname,
  },
  // Proxy /api/* requests to the Python FastAPI backend during development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/:path*",
      },
    ];
  },
};

export default nextConfig;
