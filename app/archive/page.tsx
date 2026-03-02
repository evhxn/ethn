"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RetroStarfield } from "@/components/retro-starfield"

// --------------------------------------------------
// Data
// --------------------------------------------------

interface FolderItem {
  name: string
  type: "folder" | "photo" | "coming-soon" | "link"
  content?: string
  photos?: { name: string }[]
  href?: string
}

const PROJECT_FOLDERS: FolderItem[] = [
  {
    name: "Heritage Fest",
    type: "folder",
    content:
      "Led technical and creative design for large-scale projection-mapped shows.\nEmployed AutoCAD for projector placement and facility-scale design.\nIncreased attendee engagement by 75% through iterative testing and feedback.",
    photos: [
      { name: "projection_01.jpg" },
      { name: "stage_setup.jpg" },
    ],
  },
  {
    name: "F.I.S.H.Bot",
    type: "folder",
    content:
      "Developed an autonomous fish-inspired swimming hydro robot in C++.\nImplemented particle image velocimetry in Python for flow dynamics analysis.\nBacked by a $4,000 University research grant.",
    photos: [
      { name: "fishbot_v1.jpg" },
      { name: "piv_data.jpg" },
    ],
  },
  {
    name: "Corgicade",
    type: "folder",
    content:
      "Designed and built a modular arcade cabinet using AutoCAD.\nIntegrated dual monitors, custom lighting, and a PC-based emulator\nfor a retro gaming experience.",
    photos: [
      { name: "cabinet_render.jpg" },
    ],
  },
  {
    name: "Bent Into Shape",
    type: "folder",
    content:
      "Conducted tensile and bending tests on 3D-printed fish-scale-inspired braces.\nAchieved a 25% strength boost through pattern reformation.\nPython and R for statistical modeling.",
    photos: [
      { name: "instron_test.jpg" },
    ],
  },
  {
    name: "LinkedIn",
    type: "link",
    href: "https://www.linkedin.com/in/ethn/",
  },
  { name: "Photos", type: "coming-soon" },
  { name: "Assets", type: "coming-soon" },
  { name: "Schematics", type: "coming-soon" },
]

// --------------------------------------------------
// SVG Icons
// --------------------------------------------------

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="18" width="56" height="40" rx="2" fill="#d4c89a" stroke="#222" strokeWidth="2" />
      <path d="M4 18 L4 14 Q4 12 6 12 L24 12 L28 18 Z" fill="#c4b87a" stroke="#222" strokeWidth="2" />
      <rect x="4" y="18" width="56" height="2" fill="#b8a862" />
    </svg>
  )
}

function LinkedInFolderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="18" width="56" height="40" rx="2" fill="#5a8ab8" stroke="#222" strokeWidth="2" />
      <path d="M4 18 L4 14 Q4 12 6 12 L24 12 L28 18 Z" fill="#4a7aa8" stroke="#222" strokeWidth="2" />
      <rect x="4" y="18" width="56" height="2" fill="#3a6a98" />
      <text x="32" y="44" textAnchor="middle" fill="#fff" fontSize="14" fontFamily="monospace" fontWeight="bold">{"in"}</text>
    </svg>
  )
}

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="52" height="48" rx="2" fill="#e8e4d8" stroke="#222" strokeWidth="2" />
      <rect x="10" y="12" width="44" height="36" fill="#c8c4b8" stroke="#222" strokeWidth="1" />
      <polygon points="10,48 26,32 38,42 44,36 54,48" fill="#8ba87a" />
      <circle cx="20" cy="22" r="5" fill="#d4c470" />
    </svg>
  )
}

function ComingSoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="18" width="56" height="40" rx="2" fill="#aaa89e" stroke="#555" strokeWidth="2" strokeDasharray="4 2" />
      <path d="M4 18 L4 14 Q4 12 6 12 L24 12 L28 18 Z" fill="#9a988e" stroke="#555" strokeWidth="2" strokeDasharray="4 2" />
      <text x="32" y="44" textAnchor="middle" fill="#555" fontSize="8" fontFamily="monospace">{"???"}</text>
    </svg>
  )
}

// --------------------------------------------------
// Retro Dropdown Menu
// --------------------------------------------------

function RetroDropdown({
  label,
  items,
  isOpen,
  onToggle,
  onClose,
}: {
  label: string
  items: { label: string; shortcut?: string; disabled?: boolean; divider?: boolean; onClick?: () => void }[]
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  return (
    <div ref={ref} className="relative">
      <button
        className={`px-2.5 py-0.5 text-xs font-bold font-mono transition-colors ${
          isOpen
            ? "bg-archive-highlight text-archive-highlightText"
            : "text-archive-text hover:bg-archive-highlight hover:text-archive-highlightText"
        }`}
        onClick={onToggle}
      >
        {label}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-0 min-w-[180px] bg-archive-bg border-2 border-archive-border shadow-lg z-50">
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="border-t border-dashed border-archive-border my-0.5" />
            ) : (
              <button
                key={i}
                className={`w-full flex items-center justify-between px-4 py-1.5 text-xs font-mono text-left transition-colors ${
                  item.disabled
                    ? "text-archive-textMuted cursor-default"
                    : "text-archive-text hover:bg-archive-highlight hover:text-archive-highlightText"
                }`}
                onClick={() => {
                  if (!item.disabled && item.onClick) {
                    item.onClick()
                    onClose()
                  }
                }}
                disabled={item.disabled}
              >
                <span className={item.disabled ? "" : "font-bold"}>{item.label}</span>
                {item.shortcut && (
                  <span className="ml-6 text-archive-textMuted">{item.shortcut}</span>
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

// --------------------------------------------------
// Archive Window
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
      <div className="bg-archive-bg p-4">{children}</div>
    </div>
  )
}

// --------------------------------------------------
// Helper Character (Clippy-like paperclip buddy)
// --------------------------------------------------

function HelperCharacter() {
  const [isOpen, setIsOpen] = useState(true)
  const [message, setMessage] = useState("Hey! I'm Clip-E, Ethan's archive assistant. Click an option below!")

  const quickItems = [
    { label: "What does Ethan do?", response: "Ethan is a Systems & Software Engineer specializing in embedded systems, robotics, and entertainment technology. He builds at the intersection of hardware and software." },
    { label: "How can I reach Ethan?", response: "You can reach Ethan at etapia@chapman.edu or connect on LinkedIn at linkedin.com/in/ethn. He's based in Anaheim, CA." },
    { label: "What's this archive?", response: "This is Ethan's retro project archive -- a hidden Easter egg! Double-click any folder to explore project details and assets." },
    { label: "Where did Ethan study?", response: "Ethan studies Computer Science at Chapman University, with a minor in Entrepreneurship. Dean's List and Provost Scholarship recipient!" },
  ]

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 w-[72px] h-[72px] flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Open helper"
      >
        <Image
          src="/images/clippy.png"
          alt="Clip-E assistant"
          width={72}
          height={72}
          className="object-contain drop-shadow-lg"
        />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 max-w-xs">
      {/* Speech bubble */}
      <div className="bg-[#fffde8] border-2 border-archive-border rounded-sm p-3 shadow-lg relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-1 right-2 text-xs font-mono text-archive-textMuted hover:text-archive-text"
          aria-label="Close helper"
        >
          x
        </button>
        <p className="text-xs font-mono text-archive-text leading-relaxed pr-4 mb-3">
          {message}
        </p>
        <div className="flex flex-col gap-1">
          {quickItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setMessage(item.response)}
              className="text-left text-xs font-mono text-[#0000cc] hover:underline flex items-center gap-1.5"
            >
              <span className="text-archive-text">-</span>
              {item.label}
            </button>
          ))}
        </div>
        {/* Speech bubble arrow */}
        <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-archive-border" />
        <div className="absolute -bottom-1.5 right-[33px] w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-[#fffde8]" />
      </div>

      {/* Clippy character */}
      <div className="w-[88px] h-[88px] relative">
        <Image
          src="/images/clippy.png"
          alt="Clip-E assistant"
          width={96}
          height={96}
          className="object-contain drop-shadow-lg"
        />
      </div>
    </div>
  )
}

// --------------------------------------------------
// Special: 3D spinning "e" page (inline overlay)
// --------------------------------------------------

function Special3DOverlay({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotationRef = useRef({ x: 0, y: 0 })
  const draggingRef = useRef(false)
  const lastMouseRef = useRef({ x: 0, y: 0 })
  const velocityRef = useRef({ x: 0.01, y: 0.005 })
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 500
    canvas.height = 500

    const handleMouseDown = (e: MouseEvent) => {
      draggingRef.current = true
      lastMouseRef.current = { x: e.clientX, y: e.clientY }
      velocityRef.current = { x: 0, y: 0 }
    }
    const handleMouseUp = () => {
      draggingRef.current = false
    }
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return
      const dx = e.clientX - lastMouseRef.current.x
      const dy = e.clientY - lastMouseRef.current.y
      rotationRef.current.y += dx * 0.01
      rotationRef.current.x += dy * 0.01
      velocityRef.current = { x: dy * 0.002, y: dx * 0.002 }
      lastMouseRef.current = { x: e.clientX, y: e.clientY }
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("mousemove", handleMouseMove)

    const animate = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, 500, 500)

      if (!draggingRef.current) {
        rotationRef.current.x += velocityRef.current.x
        rotationRef.current.y += velocityRef.current.y
        velocityRef.current.x *= 0.995
        velocityRef.current.y *= 0.995
        if (Math.abs(velocityRef.current.x) < 0.001) velocityRef.current.x = 0.005
        if (Math.abs(velocityRef.current.y) < 0.001) velocityRef.current.y = 0.008
      }

      const rx = rotationRef.current.x
      const ry = rotationRef.current.y

      // Pseudo-3D "e" using perspective transforms
      const scale = 0.8 + 0.2 * Math.cos(ry)
      const skewX = Math.sin(ry) * 15
      const skewY = Math.sin(rx) * 10

      ctx.save()
      ctx.translate(250, 250)
      ctx.transform(scale, Math.sin(rx) * 0.2, Math.sin(ry) * 0.2, scale, skewX, skewY)

      // Shadow
      ctx.save()
      ctx.translate(4, 4)
      ctx.font = "bold 220px 'Space Grotesk', sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "rgba(0,0,0,0.15)"
      ctx.fillText("e", 0, 10)
      ctx.restore()

      // Main "e" with gradient
      const depth = Math.cos(ry) * 0.5 + 0.5
      const r = Math.round(60 + depth * 60)
      const g = Math.round(120 + depth * 80)
      const b = Math.round(180 + depth * 60)
      ctx.font = "bold 220px 'Space Grotesk', sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
      ctx.fillText("e", 0, 10)

      // Highlight edge
      ctx.strokeStyle = `rgba(${r + 40}, ${g + 40}, ${b + 40}, 0.6)`
      ctx.lineWidth = 2
      ctx.strokeText("e", 0, 10)

      ctx.restore()

      animRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <ArchiveWindow title="Special - 3D Logo Viewer" onClose={onClose} className="relative z-50 w-full max-w-lg">
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs font-mono text-archive-textMuted text-center">
            Click and drag to spin the logo
          </p>
          <canvas
            ref={canvasRef}
            className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] cursor-grab active:cursor-grabbing"
            style={{ imageRendering: "auto" }}
          />
        </div>
      </ArchiveWindow>
    </div>
  )
}

// --------------------------------------------------
// About Window (from View > About)
// --------------------------------------------------

function AboutWindow({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <ArchiveWindow title="About Ethan" onClose={onClose} className="relative z-50 w-full max-w-md">
        <div className="flex flex-col items-center gap-4 py-2">
          <Image
            src="/images/e-logo.png"
            alt="Logo"
            width={64}
            height={64}
            className="opacity-90"
          />
          <div className="text-center">
            <h2 className="text-sm font-mono font-bold text-archive-text mb-1">
              {"Ethan's Project Archive v1.0"}
            </h2>
            <p className="text-xs font-mono text-archive-textMuted leading-relaxed max-w-sm">
              Systems & Software Engineer specializing in embedded systems, robotics, and entertainment technology. Building at the intersection of hardware and software.
            </p>
          </div>
          <div className="w-full border-t border-archive-border pt-3">
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <span className="text-archive-textMuted">School:</span>
              <span className="text-archive-text">Chapman University</span>
              <span className="text-archive-textMuted">Major:</span>
              <span className="text-archive-text">Computer Science</span>
              <span className="text-archive-textMuted">Location:</span>
              <span className="text-archive-text">Anaheim, CA</span>
              <span className="text-archive-textMuted">Email:</span>
              <span className="text-archive-text">etapia@chapman.edu</span>
            </div>
          </div>
        </div>
      </ArchiveWindow>
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
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [showSpecial, setShowSpecial] = useState(false)
  const [showAbout, setShowAbout] = useState(false)

  const closeMenu = () => setOpenMenu(null)

  const fileItems = [
    { label: "New Folder", shortcut: "\u2318N", disabled: true },
    { label: "Open", shortcut: "\u2318O", disabled: true },
    { label: "Print", shortcut: "\u2318P", disabled: true },
    { divider: true, label: "" },
    { label: "Close Window", onClick: () => router.push("/") },
    { label: "Find...", shortcut: "\u2318F", disabled: true },
  ]

  const viewItems = [
    { label: "Icon View", disabled: true },
    { label: "List View", disabled: true },
    { divider: true, label: "" },
    { label: "About", onClick: () => setShowAbout(true) },
  ]

  const specialItems = [
    { label: "3D Logo Viewer", onClick: () => setShowSpecial(true) },
    { divider: true, label: "" },
    { label: "Restart", disabled: true },
    { label: "Shut Down", onClick: () => router.push("/") },
  ]

  const helpItems = [
    { label: "About This Archive", onClick: () => setShowAbout(true) },
    { divider: true, label: "" },
    { label: "Visit Portfolio", onClick: () => router.push("/") },
  ]

  return (
    <div className="archive-crt min-h-screen bg-archive-desktop relative overflow-hidden">
      {/* Retro symbol starfield */}
      <RetroStarfield />

      {/* CRT Overlays */}
      <div className="crt-static pointer-events-none fixed inset-0 z-[60]" />
      <div className="crt-flicker pointer-events-none fixed inset-0 z-[60]" />

      {/* Menu Bar */}
      <header className="relative z-40 flex items-center gap-0.5 px-3 py-1 bg-archive-menubar border-b-2 border-archive-border">
        <Image
          src="/images/e-logo.png"
          alt="Logo"
          width={18}
          height={18}
          className="mr-2 opacity-90"
        />

        <RetroDropdown
          label="File"
          items={fileItems}
          isOpen={openMenu === "file"}
          onToggle={() => setOpenMenu(openMenu === "file" ? null : "file")}
          onClose={closeMenu}
        />
        <RetroDropdown
          label="View"
          items={viewItems}
          isOpen={openMenu === "view"}
          onToggle={() => setOpenMenu(openMenu === "view" ? null : "view")}
          onClose={closeMenu}
        />
        <RetroDropdown
          label="Special"
          items={specialItems}
          isOpen={openMenu === "special"}
          onToggle={() => setOpenMenu(openMenu === "special" ? null : "special")}
          onClose={closeMenu}
        />
        <RetroDropdown
          label="Help"
          items={helpItems}
          isOpen={openMenu === "help"}
          onToggle={() => setOpenMenu(openMenu === "help" ? null : "help")}
          onClose={closeMenu}
        />

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

      {/* Main Desktop */}
      <main className="relative z-10 p-4 md:p-8 min-h-[calc(100vh-32px)]">
        <ArchiveWindow
          title={"Ethan's Project Archive"}
          onClose={() => router.push("/")}
          className="max-w-4xl mx-auto"
        >
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
                  if (item.type === "link" && item.href) {
                    window.open(item.href, "_blank", "noopener,noreferrer")
                  } else if (item.type === "folder") {
                    setOpenFolder(item)
                  }
                }}
              >
                {item.type === "folder" && (
                  <FolderIcon className="w-12 h-12 md:w-14 md:h-14 drop-shadow-sm" />
                )}
                {item.type === "link" && (
                  <LinkedInFolderIcon className="w-12 h-12 md:w-14 md:h-14 drop-shadow-sm" />
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
                  {item.type === "coming-soon" ? `${item.name} (Soon)` : item.name}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 pt-2 border-t border-archive-border">
            <span className="text-[10px] font-mono text-archive-textMuted">
              {PROJECT_FOLDERS.length} items
            </span>
            <span className="text-[10px] font-mono text-archive-textMuted">
              Double-click to open
            </span>
          </div>
        </ArchiveWindow>

        {/* Open Folder Overlay */}
        {openFolder && (
          <div className="fixed inset-0 z-30 flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/20" onClick={() => setOpenFolder(null)} />
            <ArchiveWindow
              title={openFolder.name}
              onClose={() => setOpenFolder(null)}
              className="relative z-40 w-full max-w-2xl max-h-[80vh] overflow-auto"
            >
              <div className="flex items-center gap-1 mb-4 pb-2 border-b border-archive-border">
                <span className="text-xs font-mono text-archive-textMuted">
                  {"Archive > "}{openFolder.name}
                </span>
              </div>
              {openFolder.content && (
                <div className="mb-6 p-3 border border-archive-border rounded-sm bg-archive-card">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-archive-text">README.txt</span>
                  </div>
                  <p className="text-xs font-mono text-archive-textMuted leading-relaxed whitespace-pre-wrap">
                    {openFolder.content}
                  </p>
                </div>
              )}
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
              <div className="flex items-center justify-between mt-4 pt-2 border-t border-archive-border">
                <span className="text-[10px] font-mono text-archive-textMuted">
                  {(openFolder.photos?.length ?? 0) + 1} items
                </span>
              </div>
            </ArchiveWindow>
          </div>
        )}
      </main>

      {/* Special 3D overlay */}
      {showSpecial && <Special3DOverlay onClose={() => setShowSpecial(false)} />}

      {/* About overlay */}
      {showAbout && <AboutWindow onClose={() => setShowAbout(false)} />}

      {/* Helper character */}
      <HelperCharacter />
    </div>
  )
}
