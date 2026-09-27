// Canvas renderer for the demo figure: an animatronic bust on a test stand,
// drawn front-on in the archive's palette. Pure function of a channel frame
// so the same code renders live tracking, playback, and the raw "before" view.

import type { ChannelFrame } from "@/lib/motion-studio/channels"

const INK = "#1f1f1f"
const SHELL = "#d4c89a"
const SHELL_DARK = "#b8a862"
const METAL = "#8a8a88"
const METAL_DARK = "#5a5a58"
const EYE = "#f0ecd8"
const STAGE = "#1a1a1e"
const GRID = "rgba(212, 200, 154, 0.08)"

const RAD = Math.PI / 180

export interface DrawOptions {
  /** Faint outline of another pose (e.g. the raw target) behind the figure. */
  ghost?: ChannelFrame
  /** Draw as a jittery wireframe — used for the raw "before" view. */
  wire?: boolean
  label?: string
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function limb(ctx: CanvasRenderingContext2D, x0: number, y0: number, angle: number, length: number, width: number, side: 1 | -1) {
  const dx = side * Math.sin(angle * RAD)
  const dy = Math.cos(angle * RAD)
  const x1 = x0 + dx * length
  const y1 = y0 + dy * length
  ctx.save()
  ctx.translate(x0, y0)
  ctx.rotate(Math.atan2(dy, dx) - Math.PI / 2)
  roundRect(ctx, -width / 2, 0, width, length, width / 2)
  ctx.restore()
  return [x1, y1] as const
}

function drawArm(ctx: CanvasRenderingContext2D, sx: number, sy: number, shoulder: number, elbow: number, s: number, side: 1 | -1, wire: boolean) {
  const upper = 46 * s
  const fore = 42 * s
  const w = 13 * s
  const style = () => {
    if (wire) {
      ctx.stroke()
    } else {
      ctx.fillStyle = SHELL
      ctx.fill()
      ctx.stroke()
    }
  }
  ctx.lineWidth = 2
  ctx.strokeStyle = wire ? SHELL : INK

  const [ex, ey] = limb(ctx, sx, sy, shoulder, upper, w, side)
  style()
  const [hx, hy] = limb(ctx, ex, ey, shoulder + elbow, fore, w * 0.85, side)
  style()

  // Elbow servo + hand.
  ctx.beginPath()
  ctx.arc(ex, ey, 5.5 * s, 0, Math.PI * 2)
  if (!wire) {
    ctx.fillStyle = METAL
    ctx.fill()
  }
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(hx, hy, 7 * s, 0, Math.PI * 2)
  if (!wire) {
    ctx.fillStyle = SHELL_DARK
    ctx.fill()
  }
  ctx.stroke()

  // Shoulder servo horn.
  ctx.beginPath()
  ctx.arc(sx, sy, 9 * s, 0, Math.PI * 2)
  if (!wire) {
    ctx.fillStyle = METAL
    ctx.fill()
  }
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(sx, sy)
  ctx.lineTo(sx + side * Math.sin(shoulder * RAD) * 9 * s, sy + Math.cos(shoulder * RAD) * 9 * s)
  ctx.stroke()
}

function drawHead(ctx: CanvasRenderingContext2D, nx: number, ny: number, f: ChannelFrame, s: number, wire: boolean) {
  const W = 88 * s
  const H = 74 * s
  // Yaw foreshortens the shell a little and slides the face across it;
  // pitch slides the face vertically. Cheap, but reads clearly as 3D.
  const yawShift = Math.sin(f.headYaw * RAD) * W * 0.3
  const pitchShift = -Math.sin(f.headPitch * RAD) * H * 0.35
  const shellW = W * (0.86 + 0.14 * Math.cos(f.headYaw * RAD))

  ctx.save()
  ctx.translate(nx, ny)
  ctx.rotate(f.headRoll * RAD)
  ctx.lineWidth = 2
  ctx.strokeStyle = wire ? SHELL : INK

  // Jaw drops below the upper shell, hinged at the back.
  const jawDrop = Math.sin(f.jaw * RAD) * 30 * s
  roundRect(ctx, -shellW * 0.36 + yawShift * 0.5, -H * 0.2 + jawDrop + pitchShift * 0.3, shellW * 0.72, H * 0.28, 6 * s)
  if (!wire) {
    ctx.fillStyle = SHELL_DARK
    ctx.fill()
  }
  ctx.stroke()
  // Mouth cavity visible when open.
  if (jawDrop > 1 && !wire) {
    ctx.fillStyle = INK
    ctx.fillRect(-shellW * 0.3 + yawShift * 0.5, -H * 0.22 + pitchShift * 0.3, shellW * 0.6, jawDrop + 2)
  }

  // Upper shell.
  roundRect(ctx, -shellW / 2, -H, shellW, H * 0.82, 14 * s)
  if (!wire) {
    ctx.fillStyle = SHELL
    ctx.fill()
  }
  ctx.stroke()

  // Visor band.
  const fx = yawShift
  const fy = -H * 0.58 + pitchShift
  roundRect(ctx, fx - shellW * 0.4, fy - 14 * s, shellW * 0.8, 28 * s, 8 * s)
  if (!wire) {
    ctx.fillStyle = METAL_DARK
    ctx.fill()
  }
  ctx.stroke()

  // Eyes with lids: lids channel 0 = open, 80 = shut.
  const lid = Math.min(Math.max(f.lids / 80, 0), 1)
  for (const side of [-1, 1]) {
    const ex = fx + side * shellW * 0.2
    const r = 9 * s
    ctx.beginPath()
    ctx.arc(ex, fy, r, 0, Math.PI * 2)
    if (!wire) {
      ctx.fillStyle = EYE
      ctx.fill()
    }
    ctx.stroke()
    if (!wire) {
      ctx.beginPath()
      ctx.arc(ex + Math.sin(f.headYaw * RAD) * 3 * s, fy - Math.sin(f.headPitch * RAD) * 3 * s, r * 0.4, 0, Math.PI * 2)
      ctx.fillStyle = INK
      ctx.fill()
      if (lid > 0.02) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(ex, fy, r, 0, Math.PI * 2)
        ctx.clip()
        ctx.fillStyle = SHELL_DARK
        ctx.fillRect(ex - r, fy - r, r * 2, r * 2 * lid)
        ctx.restore()
        ctx.beginPath()
        ctx.arc(ex, fy, r, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
  }

  // Antenna — a little wobble indicator for roll.
  ctx.beginPath()
  ctx.moveTo(fx * 0.3, -H)
  ctx.lineTo(fx * 0.3, -H - 12 * s)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(fx * 0.3, -H - 15 * s, 3.5 * s, 0, Math.PI * 2)
  if (!wire) {
    ctx.fillStyle = "#c86a4a"
    ctx.fill()
  }
  ctx.stroke()

  ctx.restore()
}

function drawPose(ctx: CanvasRenderingContext2D, w: number, h: number, f: ChannelFrame, wire: boolean) {
  const s = Math.min(w / 320, h / 300)
  const cx = w / 2
  const torsoTop = h * 0.5
  const torsoW = 120 * s
  const torsoH = 96 * s

  ctx.lineJoin = "round"
  ctx.lineCap = "round"
  ctx.lineWidth = 2
  ctx.strokeStyle = wire ? SHELL : INK

  // Pedestal.
  if (!wire) {
    ctx.fillStyle = METAL_DARK
    ctx.fillRect(cx - 70 * s, torsoTop + torsoH - 4 * s, 140 * s, h - (torsoTop + torsoH) + 4 * s)
    ctx.strokeRect(cx - 70 * s, torsoTop + torsoH - 4 * s, 140 * s, h - (torsoTop + torsoH) + 4 * s)
  }

  // Arms go behind the torso's shoulder line.
  const shoulderY = torsoTop + 16 * s
  drawArm(ctx, cx - torsoW / 2 - 4 * s, shoulderY, f.rShoulder, f.rElbow, s, -1, wire)
  drawArm(ctx, cx + torsoW / 2 + 4 * s, shoulderY, f.lShoulder, f.lElbow, s, 1, wire)

  // Torso.
  roundRect(ctx, cx - torsoW / 2, torsoTop, torsoW, torsoH, 12 * s)
  if (!wire) {
    ctx.fillStyle = SHELL
    ctx.fill()
  }
  ctx.stroke()
  if (!wire) {
    // Chest panel with rivets.
    ctx.strokeRect(cx - 30 * s, torsoTop + 26 * s, 60 * s, 40 * s)
    ctx.fillStyle = INK
    for (const [rx, ry] of [[-24, 32], [24, 32], [-24, 60], [24, 60]]) {
      ctx.beginPath()
      ctx.arc(cx + rx * s, torsoTop + ry * s, 1.8 * s, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Neck.
  const neckTop = torsoTop - 10 * s
  if (!wire) {
    ctx.fillStyle = METAL
    ctx.fillRect(cx - 12 * s, neckTop, 24 * s, 14 * s)
  }
  ctx.strokeRect(cx - 12 * s, neckTop, 24 * s, 14 * s)

  drawHead(ctx, cx, neckTop, f, s, wire)
}

export function drawFigure(canvas: HTMLCanvasElement, frame: ChannelFrame, opts: DrawOptions = {}) {
  const dpr = window.devicePixelRatio || 1
  // Layout size, not getBoundingClientRect — the latter includes ancestor transforms (window drag, zoom).
  const w = Math.max(1, canvas.clientWidth)
  const h = Math.max(1, canvas.clientHeight)
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr
    canvas.height = h * dpr
  }
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  ctx.fillStyle = STAGE
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = GRID
  ctx.lineWidth = 1
  for (let x = 0.5; x < w; x += 16) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = 0.5; y < h; y += 16) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  if (opts.ghost) {
    ctx.save()
    ctx.globalAlpha = 0.35
    ctx.setLineDash([3, 3])
    drawPose(ctx, w, h, opts.ghost, true)
    ctx.restore()
  }
  drawPose(ctx, w, h, frame, !!opts.wire)

  if (opts.label) {
    ctx.font = "10px ui-monospace, monospace"
    ctx.fillStyle = "rgba(212, 200, 154, 0.8)"
    ctx.fillText(opts.label, 8, 14)
  }
}
