import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: __dirname, // explicitly set your Next.js app directory
  },
};

export default nextConfig;
