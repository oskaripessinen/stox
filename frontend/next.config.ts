import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static2.finnhub.io',
        port: '',
        pathname: '/file/publicdatany/finnhubimage/**',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
