"use client"

import { useEffect, useRef } from "react"

export interface RetroMenuItem {
  label: string
  shortcut?: string
  disabled?: boolean
  divider?: boolean
  onClick?: () => void
}

export function RetroDropdown({
  label,
  items,
  isOpen,
  onToggle,
  onClose,
}: {
  label: string
  items: RetroMenuItem[]
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
                {item.shortcut && <span className="ml-6 text-archive-textMuted">{item.shortcut}</span>}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
