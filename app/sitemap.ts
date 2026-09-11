import type { MetadataRoute } from "next";

// Bump this when page content meaningfully changes. A fixed date keeps the
// signal honest: using `new Date()` would claim every page changed on every
// build, which search engines learn to ignore.
const LAST_MODIFIED = new Date("2026-09-11T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://goport.uz";

  const routes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/product", changeFrequency: "monthly", priority: 0.9 },
    { path: "/use-cases", changeFrequency: "monthly", priority: 0.9 },
    { path: "/pricing", changeFrequency: "weekly", priority: 0.9 },
    { path: "/quickstart", changeFrequency: "monthly", priority: 0.8 },
    { path: "/docs", changeFrequency: "monthly", priority: 0.8 },
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: LAST_MODIFIED,
    changeFrequency,
    priority,
  }));
}
