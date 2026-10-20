import type { MetadataRoute } from "next";

// Nothing under these paths is useful in search: /api/ is the backend proxy
// and /auth/ holds OAuth callbacks. The dashboard, login and signup pages are
// kept out of the index with a noindex tag instead, so crawlers can still
// read that tag.
const DISALLOW = ["/api/", "/auth/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // A crawler follows only the most specific group that names it, so the
      // named search crawlers repeat the same rules.
      { userAgent: ["Googlebot", "Bingbot", "OAI-SearchBot"], allow: "/", disallow: DISALLOW },
      { userAgent: "*", allow: "/", disallow: DISALLOW },
    ],
    sitemap: "https://goport.uz/sitemap.xml",
    host: "https://goport.uz",
  };
}
