// @ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config({
  path: `../../.env`,
});

const env = {};

Object.keys(process.env).forEach(key => {
  if (key.startsWith("NEXT_PUBLIC_")) {
    env[key] = process.env[key];
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @ts-ignore
  env: env,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
