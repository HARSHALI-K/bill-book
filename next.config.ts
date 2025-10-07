/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "github.com" },
    ],
  },
  typescript: {
    // Ignore TypeScript errors during `next build`
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint errors during `next build`
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  experimental: {
    turbopack: {
      // Set the workspace root explicitly to avoid lockfile warnings
      root: __dirname,
    },
  },
};

export default nextConfig;
