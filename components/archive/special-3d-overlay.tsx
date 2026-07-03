"use client"

import { useEffect, useRef } from "react"
import { ArchiveWindow } from "./archive-window"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

export function Special3DOverlay({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotationRef = useRef({ x: 0, y: 0 })
  const draggingRef = useRef(false)
  const lastMouseRef = useRef({ x: 0, y: 0 })
  const velocityRef = useRef({ x: 0.01, y: 0.005 })
  const animRef = useRef<number>(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 500
    canvas.height = 500

    const draw = () => {
      ctx.clearRect(0, 0, 500, 500)

      const rx = rotationRef.current.x
      const ry = rotationRef.current.y

      // Pseudo-3D "e" using perspective transforms
      const scale = 0.8 + 0.2 * Math.cos(ry)
      const skewX = Math.sin(ry) * 15
      const skewY = Math.sin(rx) * 10

      ctx.save()
      ctx.translate(250, 250)
      ctx.transform(scale, Math.sin(rx) * 0.2, Math.sin(ry) * 0.2, scale, skewX, skewY)

      // Shadow
      ctx.save()
      ctx.translate(4, 4)
      ctx.font = "bold 220px 'Space Grotesk', sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "rgba(0,0,0,0.15)"
      ctx.fillText("e", 0, 10)
      ctx.restore()

      // Main "e" with gradient
      const depth = Math.cos(ry) * 0.5 + 0.5
      const r = Math.round(60 + depth * 60)
      const g = Math.round(120 + depth * 80)
      const b = Math.round(180 + depth * 60)
      ctx.font = "bold 220px 'Space Grotesk', sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
      ctx.fillText("e", 0, 10)

      // Highlight edge
      ctx.strokeStyle = `rgba(${r + 40}, ${g + 40}, ${b + 40}, 0.6)`
      ctx.lineWidth = 2
      ctx.strokeText("e", 0, 10)

      ctx.restore()
    }

    const handleMouseDown = (e: MouseEvent) => {
      draggingRef.current = true
      lastMouseRef.current = { x: e.clientX, y: e.clientY }
      velocityRef.current = { x: 0, y: 0 }
    }
    const handleMouseUp = () => {
      draggingRef.current = false
    }
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return
      const dx = e.clientX - lastMouseRef.current.x
      const dy = e.clientY - lastMouseRef.current.y
      rotationRef.current.y += dx * 0.01
      rotationRef.current.x += dy * 0.01
      velocityRef.current = { x: dy * 0.002, y: dx * 0.002 }
      lastMouseRef.current = { x: e.clientX, y: e.clientY }
      // Reduced motion: no RAF loop is running, so redraw directly on drag.
      if (reducedMotion) draw()
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("mousemove", handleMouseMove)

    if (reducedMotion) {
      // Single static frame; user can still drag to reposition, but the logo
      // never auto-spins and no continuous animation loop runs.
      draw()
    } else {
      const animate = () => {
        if (!draggingRef.current) {
          rotationRef.current.x += velocityRef.current.x
          rotationRef.current.y += velocityRef.current.y
          velocityRef.current.x *= 0.995
          velocityRef.current.y *= 0.995
          if (Math.abs(velocityRef.current.x) < 0.001) velocityRef.current.x = 0.005
          if (Math.abs(velocityRef.current.y) < 0.001) velocityRef.current.y = 0.008
        }
        draw()
        animRef.current = requestAnimationFrame(animate)
      }
      animate()
    }

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animRef.current)
    }
  }, [reducedMotion])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <ArchiveWindow title="Special - 3D Logo Viewer" onClose={onClose} className="relative z-50 w-full max-w-lg">
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs font-mono text-archive-textMuted text-center">Click and drag to spin the logo</p>
          <canvas
            ref={canvasRef}
            className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] cursor-grab active:cursor-grabbing"
            style={{ imageRendering: "auto" }}
          />
        </div>
      </ArchiveWindow>
    </div>
  )
}
