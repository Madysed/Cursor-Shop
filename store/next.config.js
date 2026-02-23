/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  },
  output: 'standalone',
  // Disable static optimization for checkout page
  staticPageGenerationTimeout: 0,
  // Configure dynamic routes
  async rewrites() {
    return [
      {
        source: '/checkout',
        destination: '/checkout',
      },
    ]
  },
}

module.exports = nextConfig
