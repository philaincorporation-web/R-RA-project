import type { NextConfig } from "next";
import { ALLOWED_IMAGE_HOSTS } from "./src/lib/images";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Nodemailer utilise des modules Node natifs (net, tls) : on le garde hors du bundle serveur.
  serverExternalPackages: ["nodemailer"],
  images: {
    remotePatterns: ALLOWED_IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
  },
};

export default nextConfig;
