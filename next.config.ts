import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {protocol: 'https', hostname: 'cdn.shopify.com'},
      {protocol: 'https', hostname: '**.myshopify.com'},
      {protocol: 'https', hostname: '**.shopifycdn.com'},
      {protocol: 'https', hostname: 'store.folotoy.com'},
      {protocol: 'https', hostname: '**.folotoy.com'}
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {key: 'X-Content-Type-Options', value: 'nosniff'},
          {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
          {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()'},
          {key: 'X-Frame-Options', value: 'SAMEORIGIN'}
        ]
      }
    ];
  }
};

export default nextConfig;
