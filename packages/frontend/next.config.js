// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { esmExternals: true, externalDir: true, swcFileReading: true },
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig;
