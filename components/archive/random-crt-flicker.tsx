"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { onShowControlCue } from "@/lib/show-control-events"

/**
 * Continuous warm-tint flicker layered over the archive desktop.
 * Runs a RAF loop only when the user has not requested reduced motion.
 */
export function RandomCRTFlicker() {
  const flickerRef = useRef<HTMLDivElement>(null)
  const boostUntilRef = useRef(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    return onShowControlCue((cue) => {
      if (cue === "preheat") boostUntilRef.current = performance.now() + 1500
    })
  }, [reducedMotion])

  useEffect(() => {
    const el = flickerRef.current
    if (!el || reducedMotion) return

    let animationId: number

    const flicker = () => {
      const boosted = performance.now() < boostUntilRef.current
      const intensity = boosted ? 0.02 + Math.random() * 0.09 : 0.005 + Math.random() * 0.025
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
