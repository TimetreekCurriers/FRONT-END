import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // desactiva ESLint durante el build
  },
  images: {
    domains: ["i.postimg.cc", "i.pravatar.cc", "encrypted-tbn0.gstatic.com"],
  },
  env: {
    // Variables para el cliente
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_NEXTAUTH_URL:
      process.env.NEXT_AUTH_URL || "http://localhost:3000",
    NEXT_PUBLIC_X_API_KEY: process.env.NEXT_PUBLIC_X_API_KEY,

    // JWT secret de desarrollo (no se debe usar en producción)
    NEXT_JWT_SECRET:
      process.env.NEXT_JWT_SECRET || "dev-super-secret-jwt-1234567890",
    NEXT_EMAIL_TIMETREK: process.env.NEXT_EMAIL_TIMETREK,
  },
};

module.exports = nextConfig;
