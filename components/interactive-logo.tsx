"use client"

import { useRef, useEffect, useState, useCallback } from "react"

export function InteractiveLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const [isMatrix, setIsMatrix] = useState(false)
  const matrixTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number>(0)
  const eMaskRef = useRef<boolean[]>([])
  const dropsRef = useRef<number[]>([])
  const pupilRef = useRef({ x: 0, y: 0 })

  const SIZE = 160
  const FONT_SIZE = 120
  const CELL = 10
  const COLS = Math.floor(SIZE / CELL)
  const ROWS = Math.floor(SIZE / CELL)

  // Build the "e" shape mask once
  useEffect(() => {
    const offscreen = document.createElement("canvas")
    offscreen.width = SIZE
    offscreen.height = SIZE
    const octx = offscreen.getContext("2d")
    if (!octx) return
    octx.font = `bold ${FONT_SIZE}px var(--font-sans), system-ui, sans-serif`
    octx.textAlign = "center"
    octx.textBaseline = "middle"
    octx.fillStyle = "#fff"
    octx.fillText("e", SIZE / 2, SIZE / 2 + 4)
    const imageData = octx.getImageData(0, 0, SIZE, SIZE)
    const mask: boolean[] = []
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const px = Math.floor(col * CELL + CELL / 2)
        const py = Math.floor(row * CELL + CELL / 2)
        const idx = (py * SIZE + px) * 4
        mask.push(imageData.data[idx + 3] > 80)
      }
    }
    eMaskRef.current = mask

    // Init drops for each column (row position of the leading drop)
    const drops: number[] = []
    for (let col = 0; col < COLS; col++) {
      drops.push(Math.floor(Math.random() * ROWS * -1))
    }
    dropsRef.current = drops
  }, [])

  const handleGlobalClick = useCallback(() => {
    setIsMatrix(true)
    // Reset drops for fresh animation
    const drops: number[] = []
    for (let col = 0; col < COLS; col++) {
      drops.push(Math.floor(Math.random() * ROWS * -1))
    }
    dropsRef.current = drops
    if (matrixTimeoutRef.current) clearTimeout(matrixTimeoutRef.current)
    matrixTimeoutRef.current = setTimeout(() => setIsMatrix(false), 3000)
  }, [COLS, ROWS])

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
      ctx.clearRect(0, 0, SIZE, SIZE)

      // Calculate pupil offset -- the "e" looks toward the cursor
      const rect = container.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = mouseRef.current.x - cx
      const dy = mouseRef.current.y - cy
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const maxOffset = 8

      const targetX = (dx / dist) * Math.min(maxOffset, dist * 0.02)
      const targetY = (dy / dist) * Math.min(maxOffset, dist * 0.02)
      pupilRef.current.x += (targetX - pupilRef.current.x) * 0.08
      pupilRef.current.y += (targetY - pupilRef.current.y) * 0.08

      if (isMatrix && eMaskRef.current.length > 0) {
        // Binary rain within the "e" shape
        const drops = dropsRef.current
        const trail = 8

        for (let col = 0; col < COLS; col++) {
          for (let row = 0; row < ROWS; row++) {
            const maskIdx = row * COLS + col
            if (!eMaskRef.current[maskIdx]) continue

            const headRow = drops[col]
            const distFromHead = headRow - row

            if (distFromHead >= 0 && distFromHead < trail) {
              // Active trail
              const brightness = 1 - distFromHead / trail
              if (distFromHead === 0) {
                // Leading character -- bright white
                ctx.fillStyle = `rgba(255, 255, 255, ${0.9 + brightness * 0.1})`
                ctx.font = `bold ${CELL}px monospace`
              } else {
                // Trail -- cyan fading
                ctx.fillStyle = `rgba(14, 229, 208, ${brightness * 0.85})`
                ctx.font = `${CELL}px monospace`
              }
              ctx.textAlign = "center"
              ctx.textBaseline = "middle"
              const char = Math.random() > 0.5 ? "1" : "0"
              ctx.fillText(
                char,
                col * CELL + CELL / 2 + pupilRef.current.x,
                row * CELL + CELL / 2 + pupilRef.current.y
              )
            } else {
              // Background static characters inside e shape
              ctx.font = `${CELL}px monospace`
              ctx.textAlign = "center"
              ctx.textBaseline = "middle"
              ctx.fillStyle = "rgba(14, 229, 208, 0.08)"
              const char = Math.random() > 0.97 ? (Math.random() > 0.5 ? "1" : "0") : " "
              if (char !== " ") {
                ctx.fillText(
                  char,
                  col * CELL + CELL / 2 + pupilRef.current.x,
                  row * CELL + CELL / 2 + pupilRef.current.y
                )
              }
            }
          }

          // Advance drop
          drops[col] += 0.4 + Math.random() * 0.15
          if (drops[col] - trail > ROWS) {
            drops[col] = Math.floor(Math.random() * -6)
          }
        }
      } else {
        // Draw the "e" with pupil offset (eyeball effect)
        ctx.font = `bold ${FONT_SIZE}px var(--font-sans), system-ui, sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "hsl(190, 95%, 50%)"
        ctx.fillText(
          "e",
          SIZE / 2 + pupilRef.current.x,
          SIZE / 2 + 4 + pupilRef.current.y
        )
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationRef.current)
  }, [isMatrix, COLS, ROWS])

  return (
    <div
      ref={containerRef}
      className="relative cursor-pointer"
      aria-label="Ethan Tapia logo"
    >
      <canvas
        ref={canvasRef}
        className="w-[120px] h-[120px] rounded-xl"
        aria-hidden="true"
      />
    </div>
  )
}
