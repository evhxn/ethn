"use client"

import type React from "react"
import { useRef, useState } from "react"

const MIN_VISIBLE = 60

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
  const windowRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0, baseLeft: 0, baseTop: 0, width: 0, height: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!windowRef.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = windowRef.current.getBoundingClientRect()
    draggingRef.current = true
    setDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
      baseLeft: rect.left - offset.x,
      baseTop: rect.top - offset.y,
      width: rect.width,
      height: rect.height,
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    const start = dragStartRef.current
    const newLeft = start.baseLeft + (start.offsetX + (e.clientX - start.x))
    const newTop = start.baseTop + (start.offsetY + (e.clientY - start.y))

    const clampedLeft = Math.min(Math.max(newLeft, MIN_VISIBLE - start.width), window.innerWidth - MIN_VISIBLE)
    const clampedTop = Math.min(Math.max(newTop, 0), window.innerHeight - MIN_VISIBLE)

    setOffset({ x: clampedLeft - start.baseLeft, y: clampedTop - start.baseTop })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    draggingRef.current = false
    setDragging(false)
  }

  return (
    <div
      ref={windowRef}
      className={`crt-window border-2 border-archive-border rounded-sm shadow-xl overflow-hidden ${className ?? ""}`}
      style={offset.x || offset.y ? { transform: `translate(${offset.x}px, ${offset.y}px)` } : undefined}
    >
      <div
        className={`flex items-center gap-2 px-3 py-1.5 bg-archive-titlebar border-b-2 border-archive-border select-none touch-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <button
          onClick={onClose}
          onPointerDown={(e) => e.stopPropagation()}
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
