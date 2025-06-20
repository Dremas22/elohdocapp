/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [new URL("https://lh3.googleusercontent.com/**")],
  },
};

export default nextConfig;
