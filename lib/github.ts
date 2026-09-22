const GITHUB_REPO_API = "https://api.github.com/repos/muhammad-deve/GoPort";

/**
 * Live star count for the public repo, revalidated hourly.
 *
 * Unauthenticated GitHub API calls are rate limited per build IP, and the
 * network is not guaranteed at build time, so every failure path returns null
 * and the caller simply omits the badge. Social proof is never worth a 500.
 */
export async function getGitHubStars(): Promise<number | null> {
  try {
    const response = await fetch(GITHUB_REPO_API, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const data: unknown = await response.json();
    const stars = (data as { stargazers_count?: unknown })?.stargazers_count;

    return typeof stars === "number" && Number.isFinite(stars) ? stars : null;
  } catch {
    return null;
  }
}
