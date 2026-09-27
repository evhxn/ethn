"use client"

import { useEffect, useRef } from "react"
import type { ChannelSpec } from "@/lib/motion-studio/channels"
import type { ChannelTrack } from "@/lib/motion-studio/pipeline"

/**
 * Raw capture (light, jittery) vs. limited servo output (dark) for one
 * channel, with the position limits drawn as dashed rails. The curves are
 * drawn once per take/settings change; the playhead is a positioned div so
 * scrubbing doesn't redraw the canvas.
 */
export function ChannelGraph({ spec, track, playhead }: { spec: ChannelSpec; track: ChannelTrack; playhead: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const w = Math.max(1, canvas.clientWidth)
      const h = Math.max(1, canvas.clientHeight)
      canvas.width = w * dpr
      canvas.height = h * dpr
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // Leave headroom so raw values past the limits are visible.
      const span = spec.max - spec.min
      const lo = spec.min - span * 0.2
      const hi = spec.max + span * 0.2
      const y = (v: number) => h - ((Math.min(Math.max(v, lo), hi) - lo) / (hi - lo)) * h
      const n = track.output.length
      const x = (i: number) => (i / Math.max(1, n - 1)) * w

      ctx.setLineDash([2, 3])
      ctx.strokeStyle = "rgba(160, 64, 48, 0.55)"
      ctx.lineWidth = 1
      for (const lim of [spec.min, spec.max]) {
        ctx.beginPath()
        ctx.moveTo(0, y(lim) + 0.5)
        ctx.lineTo(w, y(lim) + 0.5)
        ctx.stroke()
      }
      ctx.setLineDash([])

      const line = (data: Float32Array, color: string, width: number) => {
        ctx.strokeStyle = color
        ctx.lineWidth = width
        ctx.beginPath()
        // Decimate to about one point per pixel.
        const stride = Math.max(1, Math.floor(n / w))
        for (let i = 0; i < n; i += stride) {
          if (i === 0) ctx.moveTo(x(i), y(data[i]))
          else ctx.lineTo(x(i), y(data[i]))
        }
        ctx.stroke()
      }
      line(track.raw, "rgba(96, 96, 96, 0.45)", 1)
      line(track.output, "#1f1f1f", 1.5)
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [spec, track])

  const pct = (playhead / Math.max(1, track.output.length - 1)) * 100
  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div className="pointer-events-none absolute inset-y-0 w-px bg-[#a04030]" style={{ left: `${pct}%` }} />
    </div>
  )
}
