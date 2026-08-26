import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pictures.dealer.com" },
      { protocol: "https", hostname: "images.dealer.com" },
      { protocol: "https", hostname: "www.premierfordinc.com" },
      { protocol: "https", hostname: "www.premierlincolnbrooklyn.com" },
      { protocol: "https", hostname: "rdzmpabrvkslfvkdbivj.supabase.co" },
    ],
  },
};

export default nextConfig;
