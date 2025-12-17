/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // DO NOT use static export for authenticated apps
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
