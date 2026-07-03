"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { ReactLenis, type LenisRef } from "lenis/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Site-wide inertia smooth scroll.
 *
 * Lenis is driven by GSAP's ticker (not its own RAF loop) so ScrollTrigger
 * and Lenis share one clock — the pattern Lenis' docs recommend:
 *   gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0)
 *
 * If the user prefers reduced motion, Lenis is skipped entirely and native
 * scrolling is used.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000)
    }

    // Keep ScrollTrigger in sync with Lenis' virtual scroll position
    const lenis = lenisRef.current?.lenis
    lenis?.on("scroll", ScrollTrigger.update)

    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
      lenis?.off("scroll", ScrollTrigger.update)
    }
  }, [reducedMotion])

  if (reducedMotion) {
    return <>{children}</>
  }

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      {children}
    </ReactLenis>
  )
}
