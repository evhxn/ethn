export function FolderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="18" width="56" height="40" rx="2" fill="#d4c89a" stroke="#222" strokeWidth="2" />
      <path d="M4 18 L4 14 Q4 12 6 12 L24 12 L28 18 Z" fill="#c4b87a" stroke="#222" strokeWidth="2" />
      <rect x="4" y="18" width="56" height="2" fill="#b8a862" />
    </svg>
  )
}

export function LinkedInFolderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="18" width="56" height="40" rx="2" fill="#5a8ab8" stroke="#222" strokeWidth="2" />
      <path d="M4 18 L4 14 Q4 12 6 12 L24 12 L28 18 Z" fill="#4a7aa8" stroke="#222" strokeWidth="2" />
      <rect x="4" y="18" width="56" height="2" fill="#3a6a98" />
      <text x="32" y="44" textAnchor="middle" fill="#fff" fontSize="14" fontFamily="monospace" fontWeight="bold">
        {"in"}
      </text>
    </svg>
  )
}

export function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="52" height="48" rx="2" fill="#e8e4d8" stroke="#222" strokeWidth="2" />
      <rect x="10" y="12" width="44" height="36" fill="#c8c4b8" stroke="#222" strokeWidth="1" />
      <polygon points="10,48 26,32 38,42 44,36 54,48" fill="#8ba87a" />
      <circle cx="20" cy="22" r="5" fill="#d4c470" />
    </svg>
  )
}

export function ComingSoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="18" width="56" height="40" rx="2" fill="#aaa89e" stroke="#555" strokeWidth="2" strokeDasharray="4 2" />
      <path d="M4 18 L4 14 Q4 12 6 12 L24 12 L28 18 Z" fill="#9a988e" stroke="#555" strokeWidth="2" strokeDasharray="4 2" />
      <text x="32" y="44" textAnchor="middle" fill="#555" fontSize="8" fontFamily="monospace">
        {"???"}
      </text>
    </svg>
  )
}

export function MotionStudioIcon({ className }: { className?: string }) {
  // Split face: the left half is the blueprint (the plan), the right half is
  // the finished dithered figure — the same before/after story the app tells.
  const head = "M32 21 C 39 21 41.5 27 41.5 32 C 41.5 38.5 37.5 43.5 32 43.5 C 26.5 43.5 22.5 38.5 22.5 32 C 22.5 27 25 21 32 21 Z"
  const ink = "#24231f"
  const line = "#e6eef8"
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="ms-icon-left">
          <rect x="4" y="16" width="28" height="40" />
        </clipPath>
        <clipPath id="ms-icon-right">
          <rect x="32" y="16" width="28" height="40" />
        </clipPath>
        <clipPath id="ms-icon-shade">
          <path d="M35.5 21 C 40 25 40.5 33 38.5 38 C 37 41.5 34.5 43.5 32 43.5 L 44 43.5 L 44 21 Z" />
        </clipPath>
        <pattern id="ms-icon-grid" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M4 0 H0 V4" stroke="#7fa3cf" strokeWidth="0.35" />
        </pattern>
        <pattern id="ms-icon-dither" width="1.5" height="1.5" patternUnits="userSpaceOnUse">
          <rect width="0.75" height="0.75" fill={ink} />
          <rect x="0.75" y="0.75" width="0.75" height="0.75" fill={ink} />
        </pattern>
      </defs>

      {/* Program window */}
      <rect x="4" y="8" width="56" height="48" rx="2" fill="#e8e4dc" stroke="#222" strokeWidth="2" />

      {/* Left: blueprint */}
      <g clipPath="url(#ms-icon-left)">
        <rect x="4" y="16" width="28" height="40" fill="#2b4f7e" />
        <rect x="4" y="16" width="28" height="40" fill="url(#ms-icon-grid)" />
        <path d="M30 44 V56" stroke={line} strokeWidth="1" />
        <path d={head} stroke={line} strokeWidth="1" />
        <path d="M29.5 31 h-3.6" stroke={line} strokeWidth="0.9" />
        <path d="M28 36.5 h4 M28 36.5 v6" stroke={line} strokeWidth="0.7" strokeDasharray="1 0.8" />
        {/* Dimension callouts */}
        <path d="M20 21 v22.5 M18.8 21 h2.4 M18.8 43.5 h2.4" stroke="#b9d0ec" strokeWidth="0.5" />
        <path d="M23.5 44 A 8 8 0 0 0 27.5 47.5" stroke="#b9d0ec" strokeWidth="0.5" strokeDasharray="0.8 0.8" />
        <circle cx="9.5" cy="21.5" r="1.8" stroke="#b9d0ec" strokeWidth="0.5" />
        <path d="M7 21.5 h5 M9.5 19 v5" stroke="#b9d0ec" strokeWidth="0.4" />
      </g>

      {/* Right: finished figure */}
      <g clipPath="url(#ms-icon-right)">
        <rect x="32" y="16" width="28" height="40" fill="#e8e4dc" />
        <rect x="29" y="43" width="5" height="14" fill="#f4f1ea" stroke={ink} strokeWidth="1" />
        <path d={head} fill="#f4f1ea" />
        <g clipPath="url(#ms-icon-shade)">
          <path d={head} fill="url(#ms-icon-dither)" />
        </g>
        <path d={head} stroke={ink} strokeWidth="1.2" />
        <ellipse cx="35.8" cy="31" rx="1.7" ry="1.1" fill={ink} />
        <path d="M32 36.5 h4 M36 36.5 v6" stroke={ink} strokeWidth="0.9" />
      </g>

      {/* Seam between the halves, then the titlebar on top */}
      <path d="M32 16 V56" stroke="#222" strokeWidth="0.8" />
      <rect x="4" y="8" width="56" height="8" fill="#8a8a88" stroke="#222" strokeWidth="2" />
    </svg>
  )
}
