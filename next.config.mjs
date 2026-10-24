// Where /api/* is proxied when the client uses same-origin requests. Server
// side only, so it is never compiled into the browser bundle.
const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? "http://localhost:8090";

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// No page of this site may be framed, so tunnel pages on *.goport.uz can't
// overlay the dashboard. /f/ serves users' files with its own headers, and
// /api/ is the dev proxy to the backend, which sets its own.
const FRAME_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      { source: "/:path((?!f/|f$|api/|api$).*)", headers: FRAME_HEADERS },
    ];
  },
  /*
   * Proxy the backend through this server rather than having the browser call
   * it directly. The hop to PocketBase happens server-side, where neither
   * mixed-content nor CORS applies, which means one build works from every
   * origin: localhost, a tunnel, or production.
   *
   * It also keeps API traffic inside the tunnel, so requests show up in the
   * local inspector instead of bypassing it.
   *
   * `afterFiles` runs after this app's own routes, so a route defined here
   * would still win; only unmatched /api/* is forwarded.
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
  images: {
    unoptimized: true,
  },
}

export default nextConfig
