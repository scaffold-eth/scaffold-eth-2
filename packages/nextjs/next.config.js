// @ts-check

const ignoreBuildErrors = false;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: ignoreBuildErrors,
  },
  eslint: {
    ignoreDuringBuilds: ignoreBuildErrors,
  },
};

module.exports = nextConfig;
