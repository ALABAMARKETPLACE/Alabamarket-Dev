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
  async rewrites() {
    return [
      {
        source: "/api-proxy/paystack-subaccounts/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_PAYSTACK_SUBACCOUNTS_API ||
          "https://apis.alabamarketplace.ng"
        }/paystack-subaccounts/:path*`,
      },
    ];
  },
};

export default nextConfig;
