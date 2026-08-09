import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // https://github.com/payloadcms/payload/issues/12550#issuecomment-2939070941
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
  experimental: {
    optimizePackageImports: ["@heroui/react"],
    prefetchInlining: true,
  },
  // Prevent webpack from bundling these packages so their binary paths are preserved
  serverExternalPackages: ["puppeteer", "puppeteer-core", "@sparticuz/chromium-min"],
};

export default nextConfig;
