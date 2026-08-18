"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { RetroStarfield } from "@/components/retro-starfield"
import { PROJECT_FOLDERS, type FolderItem } from "@/components/archive/data"
import { FolderIcon, LinkedInFolderIcon, PhotoIcon, ComingSoonIcon } from "@/components/archive/icons"
import { RandomCRTFlicker } from "@/components/archive/random-crt-flicker"
import { RetroDropdown } from "@/components/archive/retro-dropdown"
import { ArchiveWindow } from "@/components/archive/archive-window"
import { HelperCharacter } from "@/components/archive/helper-character"
import { Special3DOverlay } from "@/components/archive/special-3d-overlay"
import { AboutWindow } from "@/components/archive/about-window"
import { CursorPreview } from "@/components/archive/cursor-preview"

export default function ArchivePage() {
  const router = useRouter()
  const [openFolder, setOpenFolder] = useState<FolderItem | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [showSpecial, setShowSpecial] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    )
  }, [])

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
      <RandomCRTFlicker />

      {/* Couture-motion layer: cursor-follow preview */}
      <CursorPreview />

      {/* Menu Bar */}
      <header className="relative z-40 flex items-center gap-0.5 px-3 py-1 bg-archive-menubar border-b-2 border-archive-border">
        <Image src="/images/e-logo.png" alt="Logo" width={18} height={18} className="mr-2 opacity-90" />

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
                <span className="text-xs font-mono text-archive-textMuted" suppressHydrationWarning>
                  {currentDate}
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
            <span className="text-xs font-mono text-archive-textMuted">{"Desktop > Archive"}</span>
          </div>

          {/* Folder Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {PROJECT_FOLDERS.map((item) => (
              <button
                key={item.name}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-sm transition-colors group ${
                  selectedItem === item.name ? "bg-archive-highlight" : "hover:bg-archive-highlight/30"
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
                {item.type === "folder" && <FolderIcon className="w-12 h-12 md:w-14 md:h-14 drop-shadow-sm" />}
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
            <span className="text-[10px] font-mono text-archive-textMuted">{PROJECT_FOLDERS.length} items</span>
            <span className="text-[10px] font-mono text-archive-textMuted">Double-click to open</span>
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
                  {"Archive > "}
                  {openFolder.name}
                </span>
                {openFolder.look && (
                  <span className="ml-auto text-xs font-mono text-archive-textMuted">
                    {openFolder.look}
                    {openFolder.collection ? ` \u00b7 ${openFolder.collection}` : ""}
                    {openFolder.season ? ` \u00b7 ${openFolder.season}` : ""}
                  </span>
                )}
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
                        data-preview={photo.src}
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
