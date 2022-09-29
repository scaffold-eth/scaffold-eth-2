// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { esmExternals: true, externalDir: true, swcFileReading: true },
  productionBrowserSourceMaps: true,
  swcMinify: true,
  webpack: (config, { dev, isServer }) => {
    config.config.resolve.alias = {
      ...config.resolve.alias,
      // -------------------------------------------
      // your aliases
      // -------------------------------------------
    };
    return config;
  },
};

module.exports = nextConfig;
