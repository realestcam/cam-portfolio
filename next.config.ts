import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/work/ebay-drop-fire", destination: "/work/all-for-kicks", permanent: true },
      { source: "/work/acura-metaverse", destination: "/work/acura-decentraland", permanent: true },
      { source: "/work/gatorade-it-never-changed", destination: "/work/gatorade-it-hasnt-changed", permanent: true },
      { source: "/work/gatorade-we-made-the-w", destination: "/work/gatorade-let-her-cook", permanent: true },
      { source: "/work/about-cam", destination: "/work/about-me", permanent: true },
    ];
  },
};

export default nextConfig;
