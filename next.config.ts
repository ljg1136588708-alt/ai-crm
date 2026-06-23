import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zthvfbnxmnwtdcpdccfi.supabase.co",
        pathname: "/storage/v1/object/public/generations/**",
      },
    ],
  },
};

export default nextConfig;
