import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-ee342152cf1149298fc3cb54a286f268.r2.dev",
      },
    ],
  },
};

export default nextConfig;
