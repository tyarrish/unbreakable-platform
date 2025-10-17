import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cohort.unbreakablegp.org',
      },
    ],
  },
  // Optimize for production
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;