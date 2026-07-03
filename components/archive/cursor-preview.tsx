"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

/**
 * Cursor-follow image preview — the signature fashion-archive move.
 *
 * Any element carrying data-preview="/path/to/image.jpg" gets a floating
 * preview image that lerps toward the pointer and fades in on hover.
 *
 * NOTE (Phase 2): nothing in the archive sets data-preview yet because
 * public/images/archive/ has no real photography. The component is wired and
 * dormant — add data-preview attributes once real images exist.
 *
 * Disabled on touch devices and under prefers-reduced-motion.
 */
export function CursorPreview() {
  const reducedMotion = useReducedMotion()
  const [enabled, setEnabled] = useState(false)

  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const posRef = useRef({ x: -9999, y: -9999 })
  const srcRef = useRef<string | null>(null)
  const rafRef = useRef<number>(0)

  // Match the eyeball trail feel (interactive-logo.tsx uses 0.08)
  const LERP = 0.1
  const OFFSET = { x: 24, y: 24 }

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    setEnabled(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const active = enabled && !reducedMotion

  useEffect(() => {
    if (!active) return

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-preview]") as HTMLElement | null
      const src = el?.getAttribute("data-preview") ?? null
      if (src !== srcRef.current) {
        srcRef.current = src
        if (imgRef.current && src) imgRef.current.src = src
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseover", handleOver)

    const animate = () => {
      const wrap = wrapRef.current
      if (wrap) {
        const target = {
          x: mouseRef.current.x + OFFSET.x,
          y: mouseRef.current.y + OFFSET.y,
        }
        posRef.current.x += (target.x - posRef.current.x) * LERP
        posRef.current.y += (target.y - posRef.current.y) * LERP
        wrap.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`
        wrap.style.opacity = srcRef.current ? "1" : "0"
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseover", handleOver)
      cancelAnimationFrame(rafRef.current)
    }
  }, [active])

  if (!active) return null

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[75] transition-opacity duration-200"
      style={{ willChange: "transform", opacity: 0 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        alt=""
        className="h-44 w-60 rounded-sm border-2 border-archive-border object-cover shadow-xl"
        draggable={false}
      />
    </div>
  )
}
