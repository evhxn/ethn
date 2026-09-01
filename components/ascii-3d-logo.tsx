"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

/**
 * A tiny homage to Andy Sloane's spinning ASCII donut, retargeted at the
 * site's "e" mark instead of a torus: the glyph is extruded into a thin
 * 3D block, sampled as a point cloud (front/back faces + exposed side
 * walls), rotated every frame, and rasterized into a character grid using
 * a z-buffer + Lambertian luminance ramp — the same pipeline as donut.c,
 * just aimed at a letterform. Click and drag to spin it yourself.
 */

// Alpha mask sampled from public/images/e-logo.png: a ring with a
// crossbar and an open aperture at bottom-right, not the letter "E".
const GLYPH = [
  "..............X.............",
  ".........XXX.....XXX........",
  ".......XX...........XX......",
  ".....XXX.............XXX....",
  "....XX.................X....",
  "....XX.................XX...",
  "...XX...................XX..",
  "..XXX...................XXX.",
  "..XXX...................XXX.",
  ".XXXX...................XXXX",
  ".XXXX...................XXXX",
  ".XXXX...................XXXX",
  ".XXXX...................XXXX",
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  ".XXXX.......................",
  ".XXXX.......................",
  ".XXXX.......................",
  ".XXXX.......................",
  "..XXX.......................",
  "..XXX.......................",
  "...XX.......................",
  "....XX.................XX...",
  "....XX................XX....",
  ".....XXX.............XX.....",
  ".......XX..........XXX......",
  ".........XXXX...XXXX........",
]

const RAMP = ".,-~:;=!*#$@"

const GRID_COLS = 32
const GRID_ROWS = 18
const CHAR_W = 7
const CHAR_H = 13

const FACE_SUB = 2
const EDGE_SUB = 3
const EDGE_Z_SUB = 1
const DEPTH = 0.5

const IDLE_YAW_SPEED = 0.0025
const DRAG_SENSITIVITY = 0.012
const YAW_DECAY = 0.96
const TILT_DECAY = 0.9

interface Point {
  x: number
  y: number
  z: number
  nx: number
  ny: number
  nz: number
}

function buildGeometry(): { points: Point[]; k1x: number; k1y: number; k2: number } {
  const rows = GLYPH.length
  const cols = GLYPH[0].length
  const cx = (cols - 1) / 2
  const cy = (rows - 1) / 2
  const halfDepth = DEPTH / 2

  const active = (r: number, c: number) => r >= 0 && r < rows && c >= 0 && c < cols && GLYPH[r][c] === "X"

  const points: Point[] = []

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!active(r, c)) continue

      const x0 = c - cx
      const x1 = x0 + 1
      const y1 = cy - r
      const y0 = y1 - 1

      // Front / back faces
      for (const [z, nz] of [
        [halfDepth, 1],
        [-halfDepth, -1],
      ] as const) {
        for (let i = 0; i <= FACE_SUB; i++) {
          for (let j = 0; j <= FACE_SUB; j++) {
            points.push({
              x: x0 + (x1 - x0) * (i / FACE_SUB),
              y: y0 + (y1 - y0) * (j / FACE_SUB),
              z,
              nx: 0,
              ny: 0,
              nz,
            })
          }
        }
      }

      // Exposed side walls (only where a neighboring cell is empty)
      const walls: Array<{ cond: boolean; fixed: "x" | "y"; value: number; nx: number; ny: number }> = [
        { cond: !active(r, c - 1), fixed: "x", value: x0, nx: -1, ny: 0 },
        { cond: !active(r, c + 1), fixed: "x", value: x1, nx: 1, ny: 0 },
        { cond: !active(r - 1, c), fixed: "y", value: y1, nx: 0, ny: 1 },
        { cond: !active(r + 1, c), fixed: "y", value: y0, nx: 0, ny: -1 },
      ]

      for (const wall of walls) {
        if (!wall.cond) continue
        for (let i = 0; i <= EDGE_SUB; i++) {
          const along = wall.fixed === "x" ? y0 + (y1 - y0) * (i / EDGE_SUB) : x0 + (x1 - x0) * (i / EDGE_SUB)
          for (let k = 0; k <= EDGE_Z_SUB; k++) {
            const z = -halfDepth + DEPTH * (k / EDGE_Z_SUB)
            points.push(
              wall.fixed === "x"
                ? { x: wall.value, y: along, z, nx: wall.nx, ny: wall.ny, nz: 0 }
                : { x: along, y: wall.value, z, nx: wall.nx, ny: wall.ny, nz: 0 },
            )
          }
        }
      }
    }
  }

  // Rotation preserves each point's distance from the origin, so the
  // largest such distance is a hard upper bound on |x|, |y|, and |z|
  // after ANY rotation. Sizing the camera distance (k2) off that bound
  // guarantees (k2 + z) never approaches zero — the perspective divide
  // stays stable at every angle, including edge-on, instead of just at
  // the resting pose.
  let maxRadius = 0
  for (const p of points) {
    const r = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z)
    if (r > maxRadius) maxRadius = r
  }

  const k2 = maxRadius * 1.7
  const k1x = (GRID_COLS / 2 - 3) * (k2 / maxRadius)
  const k1y = (GRID_ROWS / 2 - 2) * (k2 / maxRadius)

  return { points, k1x, k1y, k2 }
}

const LIGHT = (() => {
  const raw = { x: 0.35, y: 0.5, z: 0.9 }
  const len = Math.sqrt(raw.x ** 2 + raw.y ** 2 + raw.z ** 2)
  return { x: raw.x / len, y: raw.y / len, z: raw.z / len }
})()

export function Ascii3DLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const geometryRef = useRef<ReturnType<typeof buildGeometry> | null>(null)
  const animRef = useRef<number>(0)
  const yawRef = useRef(0.4)
  const tiltRef = useRef(0.12)
  const velocityRef = useRef({ yaw: IDLE_YAW_SPEED, tilt: 0 })
  const draggingRef = useRef(false)
  const lastPointerRef = useRef({ x: 0, y: 0 })
  const hoveredRef = useRef(false)
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    hoveredRef.current = hovered
  }, [hovered])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = GRID_COLS * CHAR_W
    canvas.height = GRID_ROWS * CHAR_H

    if (!geometryRef.current) geometryRef.current = buildGeometry()
    const { points, k1x, k1y, k2 } = geometryRef.current

    const charGrid = new Array<string>(GRID_COLS * GRID_ROWS)
    const litGrid = new Float32Array(GRID_COLS * GRID_ROWS)
    const zbuffer = new Float32Array(GRID_COLS * GRID_ROWS)

    const render = (yaw: number, tilt: number) => {
      charGrid.fill(" ")
      litGrid.fill(0)
      zbuffer.fill(0)

      const cosY = Math.cos(yaw)
      const sinY = Math.sin(yaw)
      const cosT = Math.cos(tilt)
      const sinT = Math.sin(tilt)

      for (const p of points) {
        // Yaw around Y, then tilt around X
        const x1 = p.x * cosY + p.z * sinY
        const z1 = -p.x * sinY + p.z * cosY
        const y1 = p.y

        const y2 = y1 * cosT - z1 * sinT
        const z2 = y1 * sinT + z1 * cosT
        const x2 = x1

        const nx1 = p.nx * cosY + p.nz * sinY
        const nz1 = -p.nx * sinY + p.nz * cosY
        const ny1 = p.ny

        const ny2 = ny1 * cosT - nz1 * sinT
        const nz2 = ny1 * sinT + nz1 * cosT
        const nx2 = nx1

        const ooz = 1 / (k2 + z2)
        const col = Math.round(GRID_COLS / 2 + k1x * ooz * x2)
        const row = Math.round(GRID_ROWS / 2 - k1y * ooz * y2)
        if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) continue

        const idx = row * GRID_COLS + col
        if (ooz <= zbuffer[idx]) continue
        zbuffer[idx] = ooz

        // Ambient floor: this is a thin extruded outline, not a closed solid,
        // so silhouette walls facing away from the light would otherwise drop
        // to pure black and hollow out the ring instead of just dimming.
        const dot = nx2 * LIGHT.x + ny2 * LIGHT.y + nz2 * LIGHT.z
        const luminance = 0.35 + Math.max(0, dot) * 0.65
        charGrid[idx] = RAMP[Math.min(RAMP.length - 1, Math.floor(luminance * RAMP.length))]
        litGrid[idx] = luminance
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${CHAR_H - 2}px "Courier New", monospace`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      if (hoveredRef.current) {
        ctx.shadowColor = "rgba(130, 210, 255, 0.8)"
        ctx.shadowBlur = 6
      } else {
        ctx.shadowBlur = 0
      }

      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const idx = row * GRID_COLS + col
          const ch = charGrid[idx]
          if (ch === " ") continue
          const baseAlpha = hoveredRef.current ? 0.4 : 0.22
          const alpha = baseAlpha + litGrid[idx] * 0.6
          ctx.fillStyle = `rgba(130, 210, 255, ${Math.min(0.95, alpha)})`
          ctx.fillText(ch, col * CHAR_W + CHAR_W / 2, row * CHAR_H + CHAR_H / 2)
        }
      }
    }

    if (reducedMotion) {
      render(yawRef.current, tiltRef.current)
      return
    }

    const animate = () => {
      if (!draggingRef.current) {
        yawRef.current += velocityRef.current.yaw
        tiltRef.current += velocityRef.current.tilt

        velocityRef.current.yaw *= YAW_DECAY
        if (Math.abs(velocityRef.current.yaw) < IDLE_YAW_SPEED) {
          velocityRef.current.yaw = velocityRef.current.yaw >= 0 ? IDLE_YAW_SPEED : -IDLE_YAW_SPEED
        }

        velocityRef.current.tilt *= TILT_DECAY
        if (Math.abs(velocityRef.current.tilt) < 0.0005) velocityRef.current.tilt = 0
      }
      render(yawRef.current, tiltRef.current)
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animRef.current)
  }, [reducedMotion])

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    draggingRef.current = true
    setDragging(true)
    lastPointerRef.current = { x: e.clientX, y: e.clientY }
    velocityRef.current = { yaw: 0, tilt: 0 }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return
    const dx = e.clientX - lastPointerRef.current.x
    const dy = e.clientY - lastPointerRef.current.y
    lastPointerRef.current = { x: e.clientX, y: e.clientY }

    // Negated so the shape follows the cursor (grab-and-spin), not the reverse.
    const dYaw = -dx * DRAG_SENSITIVITY
    const dTilt = -dy * DRAG_SENSITIVITY
    yawRef.current += dYaw
    tiltRef.current += dTilt
    velocityRef.current = { yaw: dYaw, tilt: dTilt }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    draggingRef.current = false
    setDragging(false)
  }

  return (
    <div
      className="fixed bottom-3 left-3 z-20 select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="click and drag to spin"
    >
      <canvas
        ref={canvasRef}
        className={dragging ? "cursor-grabbing touch-none" : "cursor-grab touch-none"}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        aria-hidden="true"
      />
    </div>
  )
}
