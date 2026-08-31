import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "lastfm.freetls.fastly.net",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "videos.cortes.us",
          },
        ],
        destination: "https://www.youtube.com/channel/UClb_E9xtNgWHF2lcTqF2KAw",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
