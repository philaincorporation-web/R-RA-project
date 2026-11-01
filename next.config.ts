import type { NextConfig } from "next";
import { ALLOWED_IMAGE_HOSTS } from "./src/lib/images";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: ALLOWED_IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
  },
};

export default nextConfig;
