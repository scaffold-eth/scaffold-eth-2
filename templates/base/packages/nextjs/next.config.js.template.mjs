import { stringify, withDefaults } from '../../../utils.js'

const contents = ({ ignoreTsAndLintBuildErrors, extraConfig }) =>
`// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  ${extraConfig[0] ? `...${stringify(extraConfig[0])},` : ''}
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: ${ignoreTsAndLintBuildErrors},
  },
  eslint: {
    ignoreDuringBuilds: ${ignoreTsAndLintBuildErrors},
  },
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

const isIpfs = process.env.NEXT_PUBLIC_IPFS_BUILD === "true";

if (isIpfs) {
  nextConfig.output = "export";
  nextConfig.trailingSlash = true;
  nextConfig.images = {
    unoptimized: true,
  };
}

module.exports = nextConfig;`

export default withDefaults(contents, {
  ignoreTsAndLintBuildErrors: 'process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true"',
  extraConfig: null
})
