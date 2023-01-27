/** @type {import('next').NextConfig} */
const withTM = require("next-transpile-modules")(["@se-2/graph-client"]);

const nextConfig = withTM({ reactStrictMode: true, swcMinify: true });

module.exports = nextConfig;
