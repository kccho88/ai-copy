import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // @ts-ignore - Turbopack root directory configuration
    turbopack: {
      root: "./",
    },
  },
};

export default nextConfig;
