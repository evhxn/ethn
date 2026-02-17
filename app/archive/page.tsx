"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

// --------------------------------------------------
// Data
// --------------------------------------------------

interface FolderItem {
  name: string
  type: "folder" | "photo" | "coming-soon"
  content?: string
  photos?: { name: string; src: string }[]
}

const PROJECT_FOLDERS: FolderItem[] = [
  {
    name: "Heritage Fest",
    type: "folder",
    content:
      "Led technical and creative design for large-scale projection-mapped shows. Employed AutoCAD for projector placement and facility-scale design. Increased attendee engagement by 75% through iterative testing and feedback.",
    photos: [
      { name: "projection_01.jpg", src: "/images/archive/photo-icon.jpg" },
      { name: "stage_setup.jpg", src: "/images/archive/photo-icon.jpg" },
    ],
  },
  {
    name: "F.I.S.H.Bot",
    type: "folder",
    content:
      "Developed an autonomous fish-inspired swimming hydro robot in C++. Implemented particle image velocimetry in Python for flow dynamics analysis. Backed by a $4,000 University research grant.",
    photos: [
      { name: "fishbot_v1.jpg", src: "/images/archive/photo-icon.jpg" },
      { name: "piv_data.jpg", src: "/images/archive/photo-icon.jpg" },
    ],
  },
  {
    name: "Corgicade",
    type: "folder",
    content:
      "Designed and built a modular arcade cabinet using AutoCAD. Integrated dual monitors, custom lighting, and a PC-based emulator for a retro gaming experience.",
    photos: [
      { name: "cabinet_render.jpg", src: "/images/archive/photo-icon.jpg" },
    ],
  },
  {
    name: "Bent Into Shape",
    type: "folder",
    content:
      "Conducted tensile and bending tests on 3D-printed fish-scale-inspired braces. Achieved a 25% strength boost through pattern reformation. Python and R for statistical modeling.",
    photos: [
      { name: "instron_test.jpg", src: "/images/archive/photo-icon.jpg" },
    ],
  },
  { name: "Photos", type: "coming-soon" },
  { name: "Assets", type: "coming-soon" },
  { name: "Lab Notes", type: "coming-soon" },
  { name: "Schematics", type: "coming-soon" },
]

// --------------------------------------------------
// Pixel-art folder icon (SVG) for crisp retro look
// --------------------------------------------------

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="18" width="56" height="40" rx="2" fill="#d4c89a" stroke="#222" strokeWidth="2" />
      <path d="M4 18 L4 14 Q4 12 6 12 L24 12 L28 18 Z" fill="#c4b87a" stroke="#222" strokeWidth="2" />
      <rect x="4" y="18" width="56" height="2" fill="#b8a862" />
    </svg>
  )
}

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="6" y="8" width="52" height="48" rx="2" fill="#e8e4d8" stroke="#222" strokeWidth="2" />
      <rect x="10" y="12" width="44" height="36" fill="#c8c4b8" stroke="#222" strokeWidth="1" />
      <polygon points="10,48 26,32 38,42 44,36 54,48" fill="#8ba87a" />
      <circle cx="20" cy="22" r="5" fill="#d4c470" />
    </svg>
  )
}

function ComingSoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="18" width="56" height="40" rx="2" fill="#aaa89e" stroke="#555" strokeWidth="2" strokeDasharray="4 2" />
      <path d="M4 18 L4 14 Q4 12 6 12 L24 12 L28 18 Z" fill="#9a988e" stroke="#555" strokeWidth="2" strokeDasharray="4 2" />
      <text x="32" y="44" textAnchor="middle" fill="#555" fontSize="8" fontFamily="monospace">{"???"}</text>
    </svg>
  )
}

// --------------------------------------------------
// Archive Window Component
// --------------------------------------------------

function ArchiveWindow({
  title,
  onClose,
  children,
  className,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`crt-window border-2 border-archive-border rounded-sm shadow-xl overflow-hidden ${className ?? ""}`}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-archive-titlebar border-b-2 border-archive-border">
        <button
          onClick={onClose}
          className="w-3 h-3 rounded-sm border border-archive-border bg-archive-bg hover:bg-archive-highlight transition-colors"
          aria-label="Close window"
        />
        <span className="flex-1 text-center text-xs font-bold text-archive-text font-mono tracking-wide truncate">
          {title}
        </span>
        <div className="w-3 h-3" />
      </div>

      {/* Content */}
      <div className="bg-archive-bg p-4">{children}</div>
    </div>
  )
}

// --------------------------------------------------
// Main Archive Page
// --------------------------------------------------

export default function ArchivePage() {
  const router = useRouter()
  const [openFolder, setOpenFolder] = useState<FolderItem | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  return (
    <div className="archive-crt min-h-screen bg-archive-desktop relative overflow-hidden">
      {/* CRT Static Overlay */}
      <div className="crt-static pointer-events-none fixed inset-0 z-50" />
      <div className="crt-flicker pointer-events-none fixed inset-0 z-50" />

      {/* Menu Bar - Mac OS style */}
      <header className="relative z-40 flex items-center gap-1 px-3 py-1 bg-archive-menubar border-b-2 border-archive-border">
        <Image
          src="/images/e-logo.png"
          alt="Logo"
          width={20}
          height={20}
          className="mr-2 invert opacity-80"
        />
        <button
          className="px-2 py-0.5 text-xs font-bold text-archive-text font-mono hover:bg-archive-highlight hover:text-archive-highlightText rounded-sm transition-colors"
          onClick={() => router.push("/")}
        >
          File
        </button>
        <button className="px-2 py-0.5 text-xs font-bold text-archive-text font-mono hover:bg-archive-highlight hover:text-archive-highlightText rounded-sm transition-colors">
          View
        </button>
        <button className="px-2 py-0.5 text-xs font-bold text-archive-text font-mono hover:bg-archive-highlight hover:text-archive-highlightText rounded-sm transition-colors">
          Special
        </button>
        <button className="px-2 py-0.5 text-xs font-bold text-archive-text font-mono hover:bg-archive-highlight hover:text-archive-highlightText rounded-sm transition-colors">
          Help
        </button>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs font-mono text-archive-textMuted">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </header>

      {/* Main Desktop Area */}
      <main className="relative z-10 p-4 md:p-8 min-h-[calc(100vh-32px)]">
        {/* Main Finder Window */}
        <ArchiveWindow
          title="Ethan Tapia - Project Archive"
          onClose={() => router.push("/")}
          className="max-w-4xl mx-auto"
        >
          {/* Path breadcrumb */}
          <div className="flex items-center gap-1 mb-4 pb-2 border-b border-archive-border">
            <span className="text-xs font-mono text-archive-textMuted">
              {"Desktop > Archive"}
            </span>
          </div>

          {/* Folder Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {PROJECT_FOLDERS.map((item) => (
              <button
                key={item.name}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-sm transition-colors group ${
                  selectedItem === item.name
                    ? "bg-archive-highlight"
                    : "hover:bg-archive-highlight/30"
                }`}
                onClick={() => setSelectedItem(item.name)}
                onDoubleClick={() => {
                  if (item.type !== "coming-soon") {
                    setOpenFolder(item)
                  }
                }}
              >
                {item.type === "folder" && (
                  <FolderIcon className="w-12 h-12 md:w-14 md:h-14 drop-shadow-sm" />
                )}
                {item.type === "photo" && (
                  <PhotoIcon className="w-12 h-12 md:w-14 md:h-14 drop-shadow-sm" />
                )}
                {item.type === "coming-soon" && (
                  <ComingSoonIcon className="w-12 h-12 md:w-14 md:h-14 drop-shadow-sm opacity-50" />
                )}
                <span
                  className={`text-[10px] md:text-xs font-mono text-center leading-tight max-w-[80px] truncate ${
                    selectedItem === item.name
                      ? "text-archive-highlightText"
                      : item.type === "coming-soon"
                        ? "text-archive-textMuted"
                        : "text-archive-text"
                  }`}
                >
                  {item.type === "coming-soon"
                    ? `${item.name} (Soon)`
                    : item.name}
                </span>
              </button>
            ))}
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between mt-4 pt-2 border-t border-archive-border">
            <span className="text-[10px] font-mono text-archive-textMuted">
              {PROJECT_FOLDERS.length} items
            </span>
            <span className="text-[10px] font-mono text-archive-textMuted">
              Double-click to open
            </span>
          </div>
        </ArchiveWindow>

        {/* Open Folder Window (overlaid) */}
        {openFolder && (
          <div className="fixed inset-0 z-30 flex items-center justify-center p-4 md:p-8">
            <div
              className="absolute inset-0 bg-black/20"
              onClick={() => setOpenFolder(null)}
            />
            <ArchiveWindow
              title={openFolder.name}
              onClose={() => setOpenFolder(null)}
              className="relative z-40 w-full max-w-2xl max-h-[80vh] overflow-auto"
            >
              {/* Folder path */}
              <div className="flex items-center gap-1 mb-4 pb-2 border-b border-archive-border">
                <span className="text-xs font-mono text-archive-textMuted">
                  {"Archive > "}
                  {openFolder.name}
                </span>
              </div>

              {/* Folder readme */}
              {openFolder.content && (
                <div className="mb-6 p-3 border border-archive-border rounded-sm bg-archive-card">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-archive-text">
                      README.txt
                    </span>
                  </div>
                  <p className="text-xs font-mono text-archive-textMuted leading-relaxed whitespace-pre-wrap">
                    {openFolder.content}
                  </p>
                </div>
              )}

              {/* Photos grid */}
              {openFolder.photos && openFolder.photos.length > 0 && (
                <div>
                  <span className="text-xs font-mono font-bold text-archive-text mb-3 block">
                    Assets ({openFolder.photos.length} files)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {openFolder.photos.map((photo) => (
                      <div
                        key={photo.name}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-sm border border-archive-border bg-archive-card hover:bg-archive-highlight/30 transition-colors"
                      >
                        <PhotoIcon className="w-10 h-10" />
                        <span className="text-[10px] font-mono text-archive-textMuted text-center truncate w-full">
                          {photo.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status bar */}
              <div className="flex items-center justify-between mt-4 pt-2 border-t border-archive-border">
                <span className="text-[10px] font-mono text-archive-textMuted">
                  {(openFolder.photos?.length ?? 0) + 1} items
                </span>
              </div>
            </ArchiveWindow>
          </div>
        )}
      </main>
    </div>
  )
}
