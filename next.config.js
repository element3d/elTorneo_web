// next.config.js

const { i18n } = require('./next-i18next.config')
 
const nextConfig = {
  i18n,
  reactStrictMode: false,
  experimental: {
    scrollRestoration: true,
  },

}

module.exports = nextConfig