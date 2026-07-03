"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

/**
 * Continuous warm-tint flicker layered over the archive desktop.
 * Runs a RAF loop only when the user has not requested reduced motion.
 */
export function RandomCRTFlicker() {
  const flickerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const el = flickerRef.current
    if (!el || reducedMotion) return

    let animationId: number

    const flicker = () => {
      const intensity = 0.005 + Math.random() * 0.025
      const r = 255
      const g = 245 + Math.floor(Math.random() * 10)
      const b = 215 + Math.floor(Math.random() * 30)
      el.style.background = `rgba(${r}, ${g}, ${b}, ${intensity})`
      animationId = requestAnimationFrame(flicker)
    }

    animationId = requestAnimationFrame(flicker)
    return () => cancelAnimationFrame(animationId)
  }, [reducedMotion])

  // Reduced motion: keep a faint static warm tint so the scene doesn't go cold,
  // but never animate it.
  return (
    <div
      ref={flickerRef}
      className="crt-flicker pointer-events-none fixed inset-0 z-[60]"
      style={reducedMotion ? { background: "rgba(255, 248, 225, 0.015)" } : undefined}
    />
  )
}
