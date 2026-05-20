import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["@napi-rs/canvas"],
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "@napi-rs/canvas": "commonjs @napi-rs/canvas",
        "@napi-rs/canvas-win32-x64-msvc": "commonjs @napi-rs/canvas-win32-x64-msvc"
      });
    }
    return config;
  }
};

export default nextConfig;
