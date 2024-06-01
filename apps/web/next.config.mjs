const expressPort = process.env.EXPRESS_PORT || 4000;

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
      beforeFiles: [
        {
          source: "/api/docs",
          destination: `http://localhost:${expressPort}/docs/`,
        },
        {
          source: `/api/:path(.+\\.css$)`,
          destination: `http://localhost:${expressPort}/docs/:path`,
        },
        {
          source: `/api/:path(.+\\.js$)`,
          destination: `http://localhost:${expressPort}/docs/:path`,
        },
        {
          source: `/api/:path(.+\\.png$)`,
          destination: `http://localhost:${expressPort}/docs/:path`,
        },
      ],
      fallback: [
        {
          source: "/api/:path*",
          destination: `http://localhost:${expressPort}/:path*`,
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
