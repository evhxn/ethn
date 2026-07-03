"use client"

import { useEffect, useState } from "react"

/**
 * Reactive prefers-reduced-motion hook.
 * Returns true when the user has requested reduced motion.
 * Defaults to false on the server so SSR markup is stable;
 * effects that depend on it re-run once the client value resolves.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return reduced
}
