/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'], // Add Unsplash to allowed domains
  },
  devIndicators: false,
};

module.exports = nextConfig; 