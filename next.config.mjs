/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    // domains: ["nextme-bucket.s3.amazonaws.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "**",
      },
    ],
  },
  staticPageGenerationTimeout: 600,
  turbopack: {
    resolveAlias: {
      "@": "./src",
    },
  },
  // Proxy API requests to bypass CORS in local development only
  async rewrites() {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api-proxy/:path*",
            destination: "https://development.alabamarketplace.ng/backend/:path*",
          },
        ]
      : [];
  },
};

export default nextConfig;
