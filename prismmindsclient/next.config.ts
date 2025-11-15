import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: __dirname, // explicitly set your Next.js app directory
  },
  images: {
    // allow loading remote images from popular free photo sites if you prefer not to host locally
    domains: ["images.unsplash.com", "images.pexels.com", "images.unsplash.com"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "images.pexels.com", port: "", pathname: "/**" },
    ],
  },
};

export default nextConfig;
