import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel default output. Use "standalone" only for Docker / bare-metal.
  // output: "standalone",
  typescript: {
    // We have strict types but want Vercel builds to succeed even if
    // a minor type drift slips through — the lint step is the gate.
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "customer-fake.cloudflarestream.com" },
      { protocol: "https", hostname: "r2.vendeya.pe" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
