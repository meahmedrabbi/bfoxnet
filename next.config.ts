import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Remove 'standalone' output for Vercel deployment
  // Vercel handles optimization automatically
};

export default nextConfig;
