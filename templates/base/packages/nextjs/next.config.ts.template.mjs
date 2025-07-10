import { stringify, withDefaults, deepMerge } from '../../../utils.js'

const defaultConfig = {
  reactStrictMode: true,
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: '$$process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true"$$',
  },
  eslint: {
    ignoreDuringBuilds: '$$process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true"$$',
  },
  webpack: `$$config => { config.resolve.fallback = { fs: false, net: false, tls: false }; config.externals.push("pino-pretty", "lokijs", "encoding"); return config; }$$`,
}

const contents = ({ preContent, configOverrides, postConfigContent, finalNextConfigName }) => {
  // Merge the default config with any overrides
  const finalConfig = deepMerge(defaultConfig, configOverrides[0] || {});

  return `import type { NextConfig } from "next";
${preContent[0] || ''}

const nextConfig: NextConfig = ${stringify(finalConfig)};

const isIpfs = process.env.NEXT_PUBLIC_IPFS_BUILD === "true";

if (isIpfs) {
  nextConfig.output = "export";
  nextConfig.trailingSlash = true;
  nextConfig.images = {
    unoptimized: true,
  };
}

${postConfigContent[0] || ''}

module.exports = ${finalNextConfigName[0]};`
}

export default withDefaults(contents, {
  preContent: "",
  configOverrides: {},
  postConfigContent: "",
  finalNextConfigName: "nextConfig",
})
