/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // IMPORTANT: do NOT statically export auth apps
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
