/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/product",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: "/api/trpc/:path*",
          destination: `http://localhost:${process.env.EXPRESS_PORT || 4000}/trpc/:path*`,
        },
      ],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  transpilePackages: ["@repo/ui"],
};

export default nextConfig;
