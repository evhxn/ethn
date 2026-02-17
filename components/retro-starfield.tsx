"use client"

import { useRef, useEffect, useCallback } from "react"

interface SymbolStar {
  x: number
  y: number
  char: string
  opacity: number
  phase: number
  speed: number
  size: number
}

const SYMBOLS = ["+", "-", "*", "%", "#", "&", "^", "~", ".", ":", "|", "/", "\\", "=", "<", ">", "0", "1"]

export function RetroStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<SymbolStar[]>([])
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: -1, y: -1 })

  const initStars = useCallback((width: number, height: number) => {
    const stars: SymbolStar[] = []
    const count = Math.min(200, Math.floor((width * height) / 6000))
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        char: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        opacity: Math.random() * 0.3 + 0.05,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.8 + 0.3,
        size: Math.random() * 6 + 8,
      })
    }
    starsRef.current = stars
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
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      if (starsRef.current.length === 0) {
        initStars(canvas.width, canvas.height)
      }
    }

    resize()
    window.addEventListener("resize", resize)

    const animate = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const now = Date.now() * 0.001
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (const star of starsRef.current) {
        // Twinkle: oscillate opacity
        const twinkle = 0.5 + 0.5 * Math.sin(now * star.speed + star.phase)
        let finalOpacity = star.opacity * twinkle

        // Interactive: brighten stars near cursor
        if (mx >= 0 && my >= 0) {
          const dx = star.x - mx
          const dy = star.y - my
          const dist = Math.sqrt(dx * dx + dy * dy)
          const radius = 180
          if (dist < radius) {
            const boost = 1 - dist / radius
            finalOpacity = Math.min(0.8, finalOpacity + boost * 0.55)
          }
        }

        ctx.font = `${star.size}px "Courier New", monospace`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = `rgba(180, 180, 190, ${finalOpacity})`
        ctx.fillText(star.char, star.x, star.y)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [initStars])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
