"use client"

import { useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

export function InteractiveLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number>(0)
  const pupilRef = useRef({ x: 0, y: 0 })
  const router = useRouter()

  const SIZE = 200
  const FONT_SIZE = 160

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      router.push("/archive")
    },
    [router]
  )

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

      ctx.font = `bold ${FONT_SIZE}px "Space Grotesk", system-ui, sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "hsl(190, 95%, 50%)"
      ctx.fillText("e", SIZE / 2 + offX, SIZE / 2 + 6 + offY)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationRef.current)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative cursor-pointer"
      aria-label="Ethan Tapia logo - click to open archive"
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        className="w-16 h-16 sm:w-20 sm:h-20"
        aria-hidden="true"
      />
    </div>
  )
}
