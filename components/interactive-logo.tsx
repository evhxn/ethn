"use client"

import { useRef, useEffect, useState, useCallback } from "react"

export function InteractiveLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const [isMatrix, setIsMatrix] = useState(false)
  const matrixTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number>(0)
  const logoOffsetRef = useRef({ x: 0, y: 0 })
  const eMaskRef = useRef<boolean[]>([])
  const dropsRef = useRef<{ y: number; speed: number; char: string }[]>([])

  const SIZE = 80
  const CELL = 8
  const COLS = Math.floor(SIZE / CELL)
  const ROWS = Math.floor(SIZE / CELL)

  // Build the "e" shape mask once on mount
  useEffect(() => {
    const offscreen = document.createElement("canvas")
    offscreen.width = SIZE
    offscreen.height = SIZE
    const octx = offscreen.getContext("2d")
    if (!octx) return
    octx.font = "bold 62px var(--font-sans), system-ui, sans-serif"
    octx.textAlign = "center"
    octx.textBaseline = "middle"
    octx.fillStyle = "#fff"
    octx.fillText("e", SIZE / 2, SIZE / 2 + 2)
    const imageData = octx.getImageData(0, 0, SIZE, SIZE)
    const mask: boolean[] = []
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const px = col * CELL + CELL / 2
        const py = row * CELL + CELL / 2
        const idx = (py * SIZE + px) * 4
        mask.push(imageData.data[idx + 3] > 80)
      }
    }
    eMaskRef.current = mask

    // Init drops for each column inside the mask
    const drops: { y: number; speed: number; char: string }[] = []
    for (let col = 0; col < COLS; col++) {
      drops.push({
        y: Math.random() * ROWS,
        speed: 0.3 + Math.random() * 0.5,
        char: Math.random() > 0.5 ? "1" : "0",
      })
    }
    dropsRef.current = drops
  }, [COLS, ROWS, SIZE])

  const handleGlobalClick = useCallback(() => {
    setIsMatrix(true)
    if (matrixTimeoutRef.current) clearTimeout(matrixTimeoutRef.current)
    matrixTimeoutRef.current = setTimeout(() => setIsMatrix(false), 3000)
  }, [])

  useEffect(() => {
    window.addEventListener("click", handleGlobalClick)
    return () => window.removeEventListener("click", handleGlobalClick)
  }, [handleGlobalClick])

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

      // Calculate "looking down" offset toward cursor
      const rect = container.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = mouseRef.current.x - cx
      const dy = mouseRef.current.y - cy
      const maxOffset = 6
      const dist = Math.sqrt(dx * dx + dy * dy) || 1

      const targetX = (dx / dist) * Math.min(maxOffset, dist * 0.015)
      const targetY = (dy / dist) * Math.min(maxOffset, dist * 0.015)
      logoOffsetRef.current.x += (targetX - logoOffsetRef.current.x) * 0.06
      logoOffsetRef.current.y += (targetY - logoOffsetRef.current.y) * 0.06

      container.style.transform = `translate(${logoOffsetRef.current.x}px, ${logoOffsetRef.current.y}px)`

      ctx.clearRect(0, 0, SIZE, SIZE)

      if (isMatrix && eMaskRef.current.length > 0) {
        // Binary rain constrained to the "e" shape
        const drops = dropsRef.current
        for (let col = 0; col < COLS; col++) {
          const drop = drops[col]
          drop.y += drop.speed
          if (drop.y >= ROWS) {
            drop.y = -1
            drop.speed = 0.3 + Math.random() * 0.5
          }

          for (let row = 0; row < ROWS; row++) {
            const maskIdx = row * COLS + col
            if (!eMaskRef.current[maskIdx]) continue

            const distFromHead = drop.y - row
            if (distFromHead < 0 || distFromHead > 6) {
              // Faded static characters in the e shape
              ctx.font = `${CELL - 1}px monospace`
              ctx.textAlign = "center"
              ctx.textBaseline = "middle"
              ctx.fillStyle = "rgba(14, 229, 208, 0.12)"
              ctx.fillText(
                Math.random() > 0.5 ? "1" : "0",
                col * CELL + CELL / 2,
                row * CELL + CELL / 2
              )
            } else {
              // Active rain trail
              const brightness = Math.max(0, 1 - distFromHead / 6)
              const alpha = brightness * 0.9 + 0.1
              if (distFromHead < 0.5) {
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
              } else {
                ctx.fillStyle = `rgba(14, 229, 208, ${alpha})`
              }
              ctx.font = `bold ${CELL - 1}px monospace`
              ctx.textAlign = "center"
              ctx.textBaseline = "middle"
              const char = Math.random() > 0.85 ? (Math.random() > 0.5 ? "1" : "0") : drop.char
              ctx.fillText(char, col * CELL + CELL / 2, row * CELL + CELL / 2)
            }
          }

          // Randomly change character
          if (Math.random() > 0.92) {
            drop.char = Math.random() > 0.5 ? "1" : "0"
          }
        }
      } else {
        // Draw static "e"
        ctx.font = "bold 62px var(--font-sans), system-ui, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "hsl(190, 95%, 50%)"
        ctx.fillText("e", SIZE / 2, SIZE / 2 + 2)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationRef.current)
  }, [isMatrix, COLS, ROWS, SIZE, CELL])

  return (
    <div ref={containerRef} className="relative cursor-pointer" aria-label="Ethan Tapia logo">
      <canvas
        ref={canvasRef}
        className="w-20 h-20 rounded-lg"
        aria-hidden="true"
      />
    </div>
  )
}
