import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cohort.unbreakablegp.org',
      },
      {
        protocol: 'https',
        hostname: 'jtwmuugzyzauoyjvpymh.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images.amazon.com',
      },
    ],
  },
  // Optimize for production
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;