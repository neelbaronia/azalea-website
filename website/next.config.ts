import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "publishing.azalea-labs.com",
            },
          ],
          destination: "/publishing",
        },
      ],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-ee342152cf1149298fc3cb54a286f268.r2.dev",
      },
      {
        protocol: "https",
        hostname: "eleven-public-cdn.elevenlabs.io",
      },
    ],
  },
};

export default nextConfig;
