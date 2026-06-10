"use client";

/**
 * Diagonal dashed background for auth pages, matching the dense, even grid of
 * short green dashes on a warm cream field.
 *
 * Implemented as a tiled SVG <pattern>: a single short, thick, round-capped
 * dash is repeated across the whole surface, so every dash is identical and
 * evenly spaced (unlike a repeating-linear-gradient mask, which produces
 * uneven long lines).
 */
export function AuthBackground() {
  const cream = "#f4ede1";
  const green = "#3ddc84";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{ backgroundColor: cream }}
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="goport-dashes"
            width="92"
            height="92"
            patternUnits="userSpaceOnUse"
          >
            {/* two staggered short diagonal dashes per tile for a dense,
                even grid like the reference */}
            <line
              x1="6"
              y1="52"
              x2="40"
              y2="18"
              stroke={green}
              strokeWidth="7"
              strokeLinecap="round"
            />
            <line
              x1="52"
              y1="98"
              x2="86"
              y2="64"
              stroke={green}
              strokeWidth="7"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={cream} />
        <rect width="100%" height="100%" fill="url(#goport-dashes)" />
      </svg>
    </div>
  );
}
