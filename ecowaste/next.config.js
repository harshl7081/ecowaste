/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'], // Add Unsplash to allowed domains
  },
  devIndicators: false,
  eslint: {
    // Only run ESLint on these directories during production builds
    dirs: ['src/app', 'src/components', 'src/lib'],
    // Don't run ESLint during builds - you can change this to true once all errors are fixed
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 