import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'educacao.arecreativa.com.br',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};
  /* config options here */

export default nextConfig;
