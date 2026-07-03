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
