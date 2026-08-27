import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pictures.dealer.com" },
      { protocol: "https", hostname: "images.dealer.com" },
      { protocol: "https", hostname: "www.premierfordinc.com" },
      { protocol: "https", hostname: "www.premierlincolnbrooklyn.com" },
      { protocol: "https", hostname: "rdzmpabrvkslfvkdbivj.supabase.co" },
      { protocol: "https", hostname: "ddc1.s3.us-east-1.amazonaws.com" },
      { protocol: "https", hostname: "lifestyle-cars.s3.amazonaws.com" },
      { protocol: "https", hostname: "lp-auto-assets.s3.amazonaws.com" },
    ],
  },
};

export default nextConfig;
