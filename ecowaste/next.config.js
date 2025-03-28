/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'], // Add Unsplash to allowed domains
  },
  webpack: (config) => {
    // Ignore mongodb driver dependency errors
    config.resolve.fallback = {
      ...config.resolve.fallback,
      child_process: false,
      fs: false,
      net: false,
      tls: false,
      dns: false,
    };
    return config;
  },
  // Enable HTTPS in development
  devServer: {
    https: true
  },
};

module.exports = nextConfig; 