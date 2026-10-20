import type { MetadataRoute } from "next";

// Bump a page's date when its content meaningfully changes. Fixed dates keep
// the signal honest: using `new Date()` would claim every page changed on
// every build, which search engines learn to ignore.
const SITE_UPDATED = "2026-09-22";

// Only canonical public pages. Dashboard, login, signup, OAuth callbacks and
// /api/ are deliberately absent.
const ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  updated?: string;
}> = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/product", changeFrequency: "monthly", priority: 0.9 },
  { path: "/use-cases", changeFrequency: "monthly", priority: 0.9 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/ngrok-alternative", changeFrequency: "monthly", priority: 0.8, updated: "2026-10-20" },
  { path: "/quickstart", changeFrequency: "monthly", priority: 0.8 },
  { path: "/docs", changeFrequency: "monthly", priority: 0.8 },
  { path: "/self-hosting", changeFrequency: "monthly", priority: 0.8 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3, updated: "2026-10-20" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://goport.uz";

  return ROUTES.map(({ path, changeFrequency, priority, updated }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(`${updated ?? SITE_UPDATED}T00:00:00.000Z`),
    changeFrequency,
    priority,
  }));
}
