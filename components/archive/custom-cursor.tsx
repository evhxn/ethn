"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

/**
 * Custom archive cursor.
 *
 * - Default: small pixel-art arrow that tracks the pointer with a fast lerp.
 * - Near any element with data-cursor="view": morphs into a circular "VIEW"
 *   label that trails with the same 0.08 lerp/damping constant as the eyeball
 *   effect in components/interactive-logo.tsx, plus a magnetic pull toward the
 *   hovered element's center.
 * - Only mounts on fine-pointer hover devices (matchMedia "(hover: hover)").
 * - Fully disabled under prefers-reduced-motion (native cursor restored).
 */
export function CustomCursor() {
  const reducedMotion = useReducedMotion()
  const [enabled, setEnabled] = useState(false)

  const dotRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: -100, y: -100 })
  const dotPosRef = useRef({ x: -100, y: -100 })
  const labelPosRef = useRef({ x: -100, y: -100 })
  const viewTargetRef = useRef<HTMLElement | null>(null)
  const rafRef = useRef<number>(0)

  // Same constant family as interactive-logo.tsx (pupil lerp = 0.08)
  const LABEL_LERP = 0.08
  const DOT_LERP = 0.35
  const MAGNET_STRENGTH = 0.25 // pull of the VIEW label toward element center

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

    document.documentElement.classList.add("archive-cursor-active")

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.("[data-cursor='view']")
      viewTargetRef.current = (target as HTMLElement) ?? null
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseover", handleOver)

    const animate = () => {
      const dot = dotRef.current
      const label = labelRef.current
      if (!dot || !label) {
        rafRef.current = requestAnimationFrame(animate)
        return
      }

      const m = mouseRef.current
      const viewEl = viewTargetRef.current
      const inView = !!viewEl && document.contains(viewEl)

      // Dot: fast follow
      dotPosRef.current.x += (m.x - dotPosRef.current.x) * DOT_LERP
      dotPosRef.current.y += (m.y - dotPosRef.current.y) * DOT_LERP

      // Label: slow trail + magnetic pull toward hovered element center
      let tx = m.x
      let ty = m.y
      if (inView && viewEl) {
        const rect = viewEl.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        tx = m.x + (cx - m.x) * MAGNET_STRENGTH
        ty = m.y + (cy - m.y) * MAGNET_STRENGTH
      }
      labelPosRef.current.x += (tx - labelPosRef.current.x) * LABEL_LERP
      labelPosRef.current.y += (ty - labelPosRef.current.y) * LABEL_LERP

      dot.style.transform = `translate3d(${dotPosRef.current.x}px, ${dotPosRef.current.y}px, 0) translate(-2px, -2px)`
      dot.style.opacity = inView ? "0" : "1"

      label.style.transform = `translate3d(${labelPosRef.current.x}px, ${labelPosRef.current.y}px, 0) translate(-50%, -50%) scale(${
        inView ? 1 : 0.4
      })`
      label.style.opacity = inView ? "1" : "0"

      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      document.documentElement.classList.remove("archive-cursor-active")
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseover", handleOver)
      cancelAnimationFrame(rafRef.current)
    }
  }, [active])

  if (!active) return null

  return (
    <>
      {/* Pixel-art arrow cursor */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[80]"
        style={{ willChange: "transform", opacity: 0 }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" style={{ imageRendering: "pixelated" }}>
          {/* classic 1-bit arrow, drawn in 2px blocks */}
          <path
            d="M2 1 L2 13 L5 10 L7 15 L9 14 L7 9 L11 9 Z"
            fill="#f0f0f0"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            strokeLinejoin="miter"
          />
        </svg>
      </div>

      {/* Circular VIEW label */}
      <div
        ref={labelRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[80] flex h-16 w-16 items-center justify-center rounded-full border-2 border-archive-border bg-archive-bg/90"
        style={{ willChange: "transform", opacity: 0 }}
      >
        <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-archive-text">VIEW</span>
      </div>
    </>
  )
}
