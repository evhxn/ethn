"use client"

import { useRef, useEffect, useCallback } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

interface SymbolStar {
  x: number
  y: number
  char: string
  opacity: number
  phase: number
  speed: number
  size: number
  hue: number // 0 = cool blue-white, 1 = warm amber
  hero: boolean
}

interface ShootingStar {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
}

const SYMBOLS = ["+", "-", "*", "%", "#", "&", "^", "~", ".", ":", "|", "/", "\\", "=", "<", ">", "0", "1", "'", "`", "°"]

const COOL = { r: 200, g: 215, b: 255 }
const WARM = { r: 255, g: 205, b: 150 }

function mixColor(hue: number) {
  return {
    r: Math.round(COOL.r + (WARM.r - COOL.r) * hue),
    g: Math.round(COOL.g + (WARM.g - COOL.g) * hue),
    b: Math.round(COOL.b + (WARM.b - COOL.b) * hue),
  }
}

export function RetroStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<SymbolStar[]>([])
  const shootingStarsRef = useRef<ShootingStar[]>([])
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: -1, y: -1 })
  const reducedMotion = useReducedMotion()

  const initStars = useCallback((width: number, height: number) => {
    const stars: SymbolStar[] = []
    const count = Math.min(200, Math.floor((width * height) / 6000))
    for (let i = 0; i < count; i++) {
      const hero = Math.random() < 0.04
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        char: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        opacity: hero ? Math.random() * 0.2 + 0.5 : Math.random() * 0.3 + 0.08,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.8 + 0.3,
        size: hero ? Math.random() * 4 + 14 : Math.random() * 6 + 8,
        hue: Math.random() < 0.82 ? Math.random() * 0.25 : 0.6 + Math.random() * 0.4,
        hero,
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

    const maybeSpawnShootingStar = (width: number, height: number) => {
      if (shootingStarsRef.current.length >= 2) return
      if (Math.random() > 0.0025) return
      const vx = 4 + Math.random() * 3
      const vy = 1.5 + Math.random() * 2
      shootingStarsRef.current.push({
        x: Math.random() * width * 0.5,
        y: Math.random() * height * 0.35,
        vx,
        vy,
        life: 0,
        maxLife: 50 + Math.random() * 30,
      })
    }

    const drawShootingStars = () => {
      shootingStarsRef.current = shootingStarsRef.current.filter((s) => s.life < s.maxLife)
      for (const s of shootingStarsRef.current) {
        const fadeIn = Math.min(1, s.life / 8)
        const fadeOut = s.life > s.maxLife - 20 ? (s.maxLife - s.life) / 20 : 1
        const alpha = fadeIn * fadeOut

        ctx.save()
        ctx.strokeStyle = `rgba(255, 250, 235, ${alpha * 0.7})`
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(s.x - s.vx * 7, s.y - s.vy * 7)
        ctx.lineTo(s.x, s.y)
        ctx.stroke()

        ctx.font = "10px monospace"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = `rgba(255, 255, 245, ${alpha})`
        ctx.fillText("*", s.x, s.y)
        ctx.restore()

        s.x += s.vx
        s.y += s.vy
        s.life += 1
      }
    }

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
            finalOpacity = Math.min(0.95, finalOpacity + boost * 0.55)
          }
        }

        const { r, g, b } = mixColor(star.hue)

        if (star.hero) {
          ctx.save()
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.9)`
          ctx.shadowBlur = 6
          ctx.font = `${star.size}px "Courier New", monospace`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity})`
          ctx.fillText(star.char, star.x, star.y)
          ctx.restore()
        } else {
          ctx.font = `${star.size}px "Courier New", monospace`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity})`
          ctx.fillText(star.char, star.x, star.y)
        }
      }

      if (!reducedMotion) {
        maybeSpawnShootingStar(canvas.width, canvas.height)
        drawShootingStars()
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    // Reduced motion: render one static frame (no twinkle, no cursor tracking, no shooting stars)
    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [initStars, reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
