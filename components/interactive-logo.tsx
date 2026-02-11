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

  // Canvas internal resolution
  const SIZE = 200
  const FONT_SIZE = 160
  const CELL = 8
  const COLS = Math.floor(SIZE / CELL)
  const ROWS = Math.floor(SIZE / CELL)

  // Build the "e" shape mask once
  useEffect(() => {
    const offscreen = document.createElement("canvas")
    offscreen.width = SIZE
    offscreen.height = SIZE
    const octx = offscreen.getContext("2d")
    if (!octx) return
    octx.font = `bold ${FONT_SIZE}px "Space Grotesk", system-ui, sans-serif`
    octx.textAlign = "center"
    octx.textBaseline = "middle"
    octx.fillStyle = "#fff"
    octx.fillText("e", SIZE / 2, SIZE / 2 + 6)
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

    const drops: number[] = []
    for (let col = 0; col < COLS; col++) {
      drops.push(Math.floor(Math.random() * ROWS * -1))
    }
    dropsRef.current = drops
  }, [])

  const handleGlobalClick = useCallback(() => {
    setIsMatrix(true)
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

      // Calculate pupil offset -- the "e" looks toward the cursor like an eyeball
      const rect = container.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = mouseRef.current.x - cx
      const dy = mouseRef.current.y - cy
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const maxOffset = 10

      const targetX = (dx / dist) * Math.min(maxOffset, dist * 0.03)
      const targetY = (dy / dist) * Math.min(maxOffset, dist * 0.03)
      pupilRef.current.x += (targetX - pupilRef.current.x) * 0.1
      pupilRef.current.y += (targetY - pupilRef.current.y) * 0.1

      const offX = pupilRef.current.x
      const offY = pupilRef.current.y

      if (isMatrix && eMaskRef.current.length > 0) {
        // Binary rain within the "e" shape
        const drops = dropsRef.current
        const trail = 10

        for (let col = 0; col < COLS; col++) {
          for (let row = 0; row < ROWS; row++) {
            const maskIdx = row * COLS + col
            if (!eMaskRef.current[maskIdx]) continue

            const headRow = drops[col]
            const distFromHead = headRow - row

            if (distFromHead >= 0 && distFromHead < trail) {
              const brightness = 1 - distFromHead / trail
              if (distFromHead === 0) {
                ctx.fillStyle = `rgba(255, 255, 255, ${0.9 + brightness * 0.1})`
                ctx.font = `bold ${CELL}px monospace`
              } else {
                ctx.fillStyle = `rgba(14, 229, 208, ${brightness * 0.85})`
                ctx.font = `${CELL}px monospace`
              }
              ctx.textAlign = "center"
              ctx.textBaseline = "middle"
              const char = Math.random() > 0.5 ? "1" : "0"
              ctx.fillText(
                char,
                col * CELL + CELL / 2 + offX,
                row * CELL + CELL / 2 + offY
              )
            } else if (headRow > row) {
              // Already passed -- dim static character
              if (Math.random() > 0.6) {
                ctx.font = `${CELL}px monospace`
                ctx.textAlign = "center"
                ctx.textBaseline = "middle"
                ctx.fillStyle = "rgba(14, 229, 208, 0.15)"
                const char = Math.random() > 0.5 ? "1" : "0"
                ctx.fillText(
                  char,
                  col * CELL + CELL / 2 + offX,
                  row * CELL + CELL / 2 + offY
                )
              }
            }
          }

          drops[col] += 0.5 + Math.random() * 0.2
          if (drops[col] - trail > ROWS) {
            drops[col] = Math.floor(Math.random() * -6)
          }
        }
      } else {
        // Normal state: draw "e" shifted by pupil offset
        ctx.font = `bold ${FONT_SIZE}px "Space Grotesk", system-ui, sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "hsl(190, 95%, 50%)"
        ctx.fillText("e", SIZE / 2 + offX, SIZE / 2 + 6 + offY)
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
        className="w-16 h-16 sm:w-20 sm:h-20"
        aria-hidden="true"
      />
    </div>
  )
}
