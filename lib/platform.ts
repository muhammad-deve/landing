export const GITHUB_URL = "https://github.com/muhammad-deve/GoPort";

/** GitHub serves the newest release's asset at this stable prefix, so links never go stale. */
export const RELEASE_DOWNLOAD_URL = `${GITHUB_URL}/releases/latest/download`;

export type PlatformId = "macos" | "windows" | "linux";
export type MacArch = "arm64" | "amd64";

/**
 * Desktop OS from the user agent, or null on phones and tablets, where a CLI
 * binary is useless. Android reports "Linux" and iPadOS reports "Macintosh",
 * so both are ruled out before the desktop checks.
 */
export function detectPlatform(): PlatformId | null {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/android|iphone|ipad|ipod|mobile/.test(userAgent)) return null;
  if (userAgent.includes("macintosh") && navigator.maxTouchPoints > 1) return null;
  if (userAgent.includes("windows")) return "windows";
  if (userAgent.includes("macintosh") || userAgent.includes("mac os x")) return "macos";
  if (userAgent.includes("linux")) return "linux";
  return null;
}

interface HighEntropyNavigator extends Navigator {
  userAgentData?: { getHighEntropyValues(hints: string[]): Promise<{ architecture?: string }> };
}

/**
 * Every Mac browser claims "Intel Mac OS X" in its user agent, so the CPU has to
 * come from elsewhere. Chromium exposes it through client hints; Safari and
 * Firefox only leak it through the WebGL renderer name. When neither answers,
 * assume Apple Silicon, which is every Mac sold since 2023.
 */
export async function detectMacArch(): Promise<MacArch> {
  try {
    const hints = await (navigator as HighEntropyNavigator).userAgentData?.getHighEntropyValues(["architecture"]);
    if (hints?.architecture === "arm") return "arm64";
    if (hints?.architecture === "x86") return "amd64";
  } catch {
    // Client hints can be blocked by permissions policy; fall through.
  }

  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const info = gl?.getExtension("WEBGL_debug_renderer_info");
    const renderer = info && gl ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    if (/intel|amd|radeon/i.test(renderer)) return "amd64";
  } catch {
    // WebGL unavailable; keep the default.
  }

  return "arm64";
}
