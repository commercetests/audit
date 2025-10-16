/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images-na.ssl-images-amazon.com',
      'images-eu.ssl-images-amazon.com',
      'images-fe.ssl-images-amazon.com',
      'm.media-amazon.com',
      'ecx.images-amazon.com',
      'images-cn.ssl-images-amazon.com',
      'images-sa.ssl-images-amazon.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazon.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazon.co.uk',
      },
      {
        protocol: 'https',
        hostname: '**.amazon.ca',
      },
      {
        protocol: 'https',
        hostname: '**.amazon.de',
      },
      {
        protocol: 'https',
        hostname: '**.amazon.fr',
      },
      {
        protocol: 'https',
        hostname: '**.amazon.es',
      },
      {
        protocol: 'https',
        hostname: '**.amazon.it',
      },
      {
        protocol: 'https',
        hostname: '**.amazon.co.jp',
      },
      {
        protocol: 'https',
        hostname: '**.amazon.com.au',
      },
      {
        protocol: 'https',
        hostname: '**.amazon.com.br',
      },
      {
        protocol: 'https',
        hostname: '**.amazon.nl',
      },
      {
        protocol: 'https',
        hostname: '**.amazon.in',
      },
      {
        protocol: 'https',
        hostname: '**.amazon.com.mx',
      },
      {
        protocol: 'https',
        hostname: '**.amazon.cn',
      },
      {
        protocol: 'https',
        hostname: '**.amazon.sg',
      },
    ],
  },
};

module.exports = nextConfig;
