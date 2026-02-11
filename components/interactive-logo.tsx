"use client"

import { useRef, useEffect, useState, useCallback } from "react"

export function InteractiveLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const [isMatrix, setIsMatrix] = useState(false)
  const matrixTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number>(0)
  const dropsRef = useRef<number[]>([])
  const logoOffsetRef = useRef({ x: 0, y: 0 })

  const handleGlobalClick = useCallback(() => {
    setIsMatrix(true)
    if (matrixTimeoutRef.current) clearTimeout(matrixTimeoutRef.current)
    matrixTimeoutRef.current = setTimeout(() => setIsMatrix(false), 3000)
  }, [])

  useEffect(() => {
    window.addEventListener("click", handleGlobalClick)
    return () => window.removeEventListener("click", handleGlobalClick)
  }, [handleGlobalClick])

  // Track mouse for logo following
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Animate canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = 40
    canvas.width = size
    canvas.height = size

    const cols = Math.floor(size / 8)
    if (dropsRef.current.length === 0) {
      dropsRef.current = Array(cols).fill(0)
    }

    const animate = () => {
      if (!ctx || !canvas) return

      // Calculate logo offset based on mouse position
      const rect = container.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = mouseRef.current.x - cx
      const dy = mouseRef.current.y - cy
      const maxOffset = 4
      const dist = Math.sqrt(dx * dx + dy * dy) || 1

      const targetX = (dx / dist) * Math.min(maxOffset, dist * 0.01)
      const targetY = (dy / dist) * Math.min(maxOffset, dist * 0.01)
      logoOffsetRef.current.x += (targetX - logoOffsetRef.current.x) * 0.08
      logoOffsetRef.current.y += (targetY - logoOffsetRef.current.y) * 0.08

      container.style.transform = `translate(${logoOffsetRef.current.x}px, ${logoOffsetRef.current.y}px)`

      if (isMatrix) {
        // Matrix rain effect
        ctx.fillStyle = "rgba(10, 14, 20, 0.15)"
        ctx.fillRect(0, 0, size, size)
        ctx.fillStyle = "#0ee5d0"
        ctx.font = "7px monospace"

        for (let i = 0; i < dropsRef.current.length; i++) {
          const text = Math.random() > 0.5 ? "1" : "0"
          ctx.fillText(text, i * 8, dropsRef.current[i] * 8)
          if (dropsRef.current[i] * 8 > size && Math.random() > 0.95) {
            dropsRef.current[i] = 0
          }
          dropsRef.current[i]++
        }
      } else {
        // Draw the "e" logo
        ctx.clearRect(0, 0, size, size)
        ctx.font = "bold 30px var(--font-sans), sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "hsl(190, 95%, 50%)"
        ctx.fillText("e", size / 2, size / 2 + 1)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationRef.current)
  }, [isMatrix])

  return (
    <div ref={containerRef} className="relative cursor-pointer" aria-label="Ethan Tapia logo">
      <canvas
        ref={canvasRef}
        className="w-10 h-10 rounded-lg"
        aria-hidden="true"
      />
    </div>
  )
}
