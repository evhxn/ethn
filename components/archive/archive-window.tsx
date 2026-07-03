"use client"

import type React from "react"

export function ArchiveWindow({
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
