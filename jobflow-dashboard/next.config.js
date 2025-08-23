/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // Allow Python backend API calls
  async rewrites() {
    return [
      {
        source: '/py-api/:path*',
        destination: 'http://localhost:8000/:path*', // Python FastAPI backend
      },
    ];
  },
}

module.exports = nextConfig