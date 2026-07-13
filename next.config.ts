import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        // Album artwork for the footer's "now playing" widget.
        protocol: "https",
        hostname: "lastfm.freetls.fastly.net",
      },
    ],
  },
};

export default nextConfig;
