import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Server Actions are enabled by default in Next 15
  },
};

export default nextConfig;
