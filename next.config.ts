import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true,
  allowedDevOrigins: ["46.225.89.2"],
  devIndicators: {
    appIsrStatus: false,
  },
  // Allow external IP access for dev mode on the Ubuntu server
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  }
};

export default nextConfig;
