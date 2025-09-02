/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@studysharper/ai', '@studysharper/core'],
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig