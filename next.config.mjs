/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // The @typescript-eslint plugin is not in devDeps; suppress during build
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const backend = process.env.INTERNAL_API_URL ?? 'http://localhost:5000/api';
    const backendOrigin = backend.replace(/\/api$/, '');
    return [
      { source: '/api/:path*', destination: `${backend}/:path*` },
      { source: '/uploads/:path*', destination: `${backendOrigin}/uploads/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
