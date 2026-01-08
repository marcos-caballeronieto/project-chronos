import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org", // La mayoría de fotos de Wikipedia
      },
      // Añade aquí otros dominios confiables si los necesitas en el futuro
      // Ejemplo: "pbs.twimg.com" (Twitter) o "i.ytimg.com" (YouTube)
    ],
  },
};

export default nextConfig;
