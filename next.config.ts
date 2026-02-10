import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, 
  },
  basePath: "/ux_glosary",
  assetPrefix: "/ux_glosary/",
};
export default nextConfig;
