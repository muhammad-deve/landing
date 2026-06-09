interface GoPortLogoProps {
  className?: string;
}

/**
 * Full GoPort wordmark logo. Inherits color from the surrounding text
 * via `currentColor` for the letters, with the accent (primary) used for
 * the port "rings" and the arrow.
 */
export function GoPortLogo({ className = "" }: GoPortLogoProps) {
  return (
    <svg
      viewBox="30 84 600 146"
      role="img"
      aria-label="GoPort"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>GoPort</title>

      {/* G */}
      <path
        d="M108 92C78 82 42 98 36 130C28 168 50 210 88 220C118 228 148 212 155 185L155 158L108 158L108 175L138 175C132 196 114 207 94 203C68 198 55 174 60 150C65 122 88 108 112 112C124 114 134 120 140 128L155 115C145 100 128 92 108 92Z"
        fill="currentColor"
      />

      {/* o */}
      <circle cx="212" cy="160" r="44" fill="currentColor" />
      <circle cx="212" cy="160" r="26" fill="var(--background)" />
      <circle
        cx="212"
        cy="160"
        r="18"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.5"
        opacity="0.8"
      />
      <circle cx="212" cy="160" r="4" fill="var(--primary)" />

      {/* P */}
      <path
        d="M272 96L272 224L291 224L291 178L315 178C341 178 362 162 362 137C362 112 341 96 315 96ZM291 112L315 112C330 112 342 122 342 137C342 152 330 162 315 162L291 162Z"
        fill="currentColor"
      />

      {/* o */}
      <circle cx="420" cy="160" r="44" fill="currentColor" />
      <circle cx="420" cy="160" r="26" fill="var(--background)" />
      <ellipse
        cx="420"
        cy="160"
        rx="14"
        ry="18"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.5"
        opacity="0.8"
      />
      <ellipse cx="420" cy="160" rx="5" ry="7" fill="var(--primary)" opacity="0.95" />

      {/* r */}
      <path
        d="M484 130L484 224L502 224L502 170C502 152 514 144 528 144L540 144L540 128L526 128C514 128 504 134 500 142L500 130Z"
        fill="currentColor"
      />

      {/* t */}
      <rect x="572" y="96" width="18" height="128" rx="3" fill="currentColor" />
      <rect x="546" y="126" width="70" height="16" rx="3" fill="currentColor" />
      <path
        d="M611 122L622 134L611 146"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface GoPortMarkProps {
  className?: string;
}

/** Compact "port" mark (the ringed circle) for tight spaces. */
export function GoPortMark({ className = "" }: GoPortMarkProps) {
  return (
    <svg
      viewBox="90 150 380 248"
      role="img"
      aria-label="GoPort"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>GoPort</title>
      <circle cx="280" cy="274" r="100" fill="currentColor" />
      <circle cx="280" cy="274" r="62" fill="var(--background)" />
      <circle
        cx="280"
        cy="274"
        r="46"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.5"
        opacity="0.8"
      />
      <circle
        cx="280"
        cy="274"
        r="28"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.5"
        opacity="0.55"
      />
      <circle cx="280" cy="274" r="9" fill="var(--primary)" />
    </svg>
  );
}
