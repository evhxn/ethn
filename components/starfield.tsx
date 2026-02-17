"use client"

import { useRef, useEffect, useCallback } from "react"

interface Star {
  x: number
  y: number
  z: number
  size: number
  opacity: number
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animationRef = useRef<number>(0)
  const angleRef = useRef(0)

  const initStars = useCallback((width: number, height: number) => {
    const stars: Star[] = []
    const count = Math.min(600, Math.floor((width * height) / 3000))
    for (let i = 0; i < count; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * 1000,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
      })
    }
    starsRef.current = stars
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

      const cx = canvas.width / 2
      const cy = canvas.height / 2
      angleRef.current += 0.0001

      const cosA = Math.cos(angleRef.current)
      const sinA = Math.sin(angleRef.current)

      for (const star of starsRef.current) {
        // Slow rotation
        const rx = star.x * cosA - star.y * sinA
        const ry = star.x * sinA + star.y * cosA

        const perspective = 500 / (500 + star.z)
        const sx = cx + rx * perspective
        const sy = cy + ry * perspective

        // Twinkle effect
        const twinkle = 0.7 + 0.3 * Math.sin(Date.now() * 0.001 + star.z)
        const finalOpacity = star.opacity * twinkle * perspective

        const size = star.size * perspective

        ctx.beginPath()
        ctx.arc(sx, sy, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220, 220, 225, ${finalOpacity})`
        ctx.fill()

        // Subtle glow for brighter stars
        if (star.size > 1.2) {
          ctx.beginPath()
          ctx.arc(sx, sy, size * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(200, 200, 210, ${finalOpacity * 0.15})`
          ctx.fill()
        }

        // Slowly move stars forward
        star.z -= 0.05
        if (star.z < 1) {
          star.z = 1000
          star.x = (Math.random() - 0.5) * canvas.width * 2
          star.y = (Math.random() - 0.5) * canvas.height * 2
        }
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
