import type { NextConfig } from "next";

const isProd = process.env.TYPE === "production";

const nextConfig: NextConfig = {
  basePath: isProd ? "/hackathon" : "",
  assetPrefix: isProd ? "/hackathon/" : "",

  allowedDevOrigins: [
    "46.225.89.2:3000",
    "46.225.89.2:3001",
    "localhost:3000",
    "localhost:3001"
  ],

  devIndicators: {
    appIsrStatus: false,
  },

  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  images: {
    qualities: [75, 100],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;