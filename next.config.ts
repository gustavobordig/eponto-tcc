import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ["app", "components", "lib", "services", "types", "utils"],
  },
};

export default nextConfig;
