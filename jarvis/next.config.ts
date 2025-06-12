import type { NextConfig } from "next";
import { allowedHosts } from "./config/image";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: allowedHosts,
  },
};

export default nextConfig;
