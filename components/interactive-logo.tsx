"use client"

import { useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

interface InteractiveLogoProps {
  variant?: "white" | "black"
}

export function InteractiveLogo({ variant = "white" }: InteractiveLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number>(0)
  const pupilRef = useRef({ x: 0, y: 0 })
  const imgRef = useRef<HTMLImageElement | null>(null)
  const imgLoadedRef = useRef(false)
  const router = useRouter()
  const reducedMotion = useReducedMotion()

  const SIZE = 200

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      router.push("/archive")
    },
    [router]
  )

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = "/images/e-logo.png"
    img.onload = () => {
      imgRef.current = img
      imgLoadedRef.current = true
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = SIZE
    canvas.height = SIZE

    const animate = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, SIZE, SIZE)

      if (reducedMotion) {
        // Reduced motion: logo stays centered, no cursor tracking
        pupilRef.current.x = 0
        pupilRef.current.y = 0
      } else {
        // Calculate eyeball offset toward cursor
        const rect = container.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = mouseRef.current.x - cx
        const dy = mouseRef.current.y - cy
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const maxOffset = 8

        const targetX = (dx / dist) * Math.min(maxOffset, dist * 0.025)
        const targetY = (dy / dist) * Math.min(maxOffset, dist * 0.025)
        pupilRef.current.x += (targetX - pupilRef.current.x) * 0.08
        pupilRef.current.y += (targetY - pupilRef.current.y) * 0.08
      }

      const offX = pupilRef.current.x
      const offY = pupilRef.current.y

      if (imgLoadedRef.current && imgRef.current) {
        // Draw the PNG centered with eyeball offset
        const imgSize = SIZE * 0.85
        const x = (SIZE - imgSize) / 2 + offX
        const y = (SIZE - imgSize) / 2 + offY

        ctx.save()

        // For white variant, invert the black PNG to white
        if (variant === "white") {
          ctx.filter = "invert(1)"
        }

        ctx.drawImage(imgRef.current, x, y, imgSize, imgSize)
        ctx.restore()
      }

      // Reduced motion: stop looping once the static logo has been drawn
      if (reducedMotion && imgLoadedRef.current) return

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationRef.current)
  }, [variant, reducedMotion])

  return (
    <div
      ref={containerRef}
      className="relative cursor-pointer"
      aria-label="Ethan Tapia logo - click to open archive"
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        className="w-12 h-12 sm:w-14 sm:h-14"
        aria-hidden="true"
      />
    </div>
  )
}
