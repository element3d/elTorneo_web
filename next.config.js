// next.config.js

const { i18n } = require('./next-i18next.config');

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disableDevLogs: true,
});

const nextConfig = {
  i18n,
  reactStrictMode: false,
  experimental: {
    scrollRestoration: true,
  },
};

// Merge PWA with your config
module.exports = withPWA(nextConfig);
