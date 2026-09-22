// Where /api/* is proxied when the client uses same-origin requests. Server
// side only, so it is never compiled into the browser bundle.
const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? "http://localhost:8090";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  /*
   * Proxy the backend through this server rather than having the browser call
   * it directly. The hop to PocketBase happens server-side, where neither
   * mixed-content nor CORS applies, which means one build works from every
   * origin: localhost, a tunnel, or production.
   *
   * It also keeps API traffic inside the tunnel, so requests show up in the
   * local inspector instead of bypassing it.
   *
   * `afterFiles` runs after this app's own routes, so /api/early-access is
   * still handled here and only unmatched /api/* is forwarded.
   */
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [{ source: "/api/:path*", destination: `${API_PROXY_TARGET}/api/:path*` }],
      fallback: [],
    };
  },
  // Permit the public development tunnel so phones can load Next.js client
  // resources (including hot reload) without cross-origin rejections.
  allowedDevOrigins: ["task.goport.uz", "192.168.1.87", "*.goport.uz"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
