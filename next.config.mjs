/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Permit the public development tunnel so phones can load Next.js client
  // resources (including hot reload) without cross-origin rejections.
  allowedDevOrigins: ["task.goport.uz"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
