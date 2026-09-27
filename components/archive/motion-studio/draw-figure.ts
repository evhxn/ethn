// Figure renderer: a wooden artist's mannequin drawn as 1-bit dithered pixel
// art, like a MacPaint plate — to sit alongside the archive's CRT/System-7
// look. The face is a ventriloquist-style hinged jaw with carved eyes so the
// jaw and lid channels still read at a glance.
//
// Rendering, per frame:
//   1. Draw the figure at low resolution (one "art pixel" = PIXEL css px) on
//      two offscreen layers: a grayscale *shading* layer (gradient fills) and
//      a *line* layer (outlines, eyes, seams; white fills for occlusion).
//   2. Combine: a pixel is ink if the line layer is dark, or if the shading
//      layer is darker than a 4×4 Bayer threshold (ordered dithering).
//   3. Blit to the visible canvas with nearest-neighbour scaling.
//
// "plate" mode is the finished figure on paper; "scope" mode is the same
// geometry as a phosphor wireframe on a dark CRT, used for the raw capture.

import type { ChannelFrame } from "@/lib/motion-studio/channels"

const PIXEL = 2
const PAPER: [number, number, number] = [232, 228, 220]
const INK: [number, number, number] = [36, 35, 32]
const SCOPE_BG: [number, number, number] = [26, 26, 30]
const PHOSPHOR: [number, number, number] = [212, 200, 154]
const PHOSPHOR_DIM: [number, number, number] = [150, 142, 110]

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16)

const RAD = Math.PI / 180
/** Key light from upper left, in canvas coords (y down). */
const LIGHT = { x: -0.55, y: -0.83 }

export interface DrawOptions {
  /** Faint dotted outline of another pose (e.g. the raw target) behind the figure. */
  ghost?: ChannelFrame
  mode?: "plate" | "scope"
  label?: string
}

interface Layers {
  shade: HTMLCanvasElement
  line: HTMLCanvasElement
}
const layerCache = new WeakMap<HTMLCanvasElement, Layers>()

function getLayers(canvas: HTMLCanvasElement, w: number, h: number): Layers {
  let l = layerCache.get(canvas)
  if (!l) {
    l = { shade: document.createElement("canvas"), line: document.createElement("canvas") }
    layerCache.set(canvas, l)
  }
  for (const c of [l.shade, l.line]) {
    if (c.width !== w || c.height !== h) {
      c.width = w
      c.height = h
    }
  }
  return l
}

const gray = (v: number) => {
  const c = Math.round(Math.min(Math.max(v, 0), 1) * 255)
  return `rgb(${c},${c},${c})`
}

// ---- Geometry ---------------------------------------------------------------

type Ctx = CanvasRenderingContext2D

type Fill = (c: Ctx) => string | CanvasGradient

/** Draws the figure's parts; each painter decides how they land on the layers. */
interface Painter {
  /** A solid part: shaded fill + outline. */
  shape(path: (c: Ctx) => void, fill: Fill): void
  /** Line-layer-only ink (eyes, seams, carve lines). */
  ink(draw: (c: Ctx) => void): void
  /** Fill the intersection of two clip paths: an ink "cavity", or a "solid" part outlined by clipB. */
  clipped(clipA: (c: Ctx) => void, clipB: (c: Ctx) => void, kind: "cavity" | "solid", fill?: Fill): void
}

function sphereFill(cx: number, cy: number, r: number, bias = 0) {
  return (c: Ctx) => {
    const g = c.createRadialGradient(cx + LIGHT.x * r * 0.45, cy + LIGHT.y * r * 0.45, r * 0.1, cx, cy, r * 1.25)
    g.addColorStop(0, gray(1))
    g.addColorStop(0.55, gray(0.92 + bias))
    g.addColorStop(1, gray(0.48 + bias))
    return g
  }
}

function limbFill(x0: number, y0: number, x1: number, y1: number, r: number) {
  return (c: Ctx) => {
    const a = Math.atan2(y1 - y0, x1 - x0)
    let nx = -Math.sin(a)
    let ny = Math.cos(a)
    if (nx * LIGHT.x + ny * LIGHT.y < 0) {
      nx = -nx
      ny = -ny
    }
    const mx = (x0 + x1) / 2
    const my = (y0 + y1) / 2
    const g = c.createLinearGradient(mx + nx * r, my + ny * r, mx - nx * r, my - ny * r)
    g.addColorStop(0, gray(1))
    g.addColorStop(0.5, gray(0.92))
    g.addColorStop(1, gray(0.5))
    return g
  }
}

/** Capsule that tapers from r0 at p0 to r1 at p1. */
function taper(x0: number, y0: number, x1: number, y1: number, r0: number, r1: number) {
  return (c: Ctx) => {
    const a = Math.atan2(y1 - y0, x1 - x0)
    c.beginPath()
    c.arc(x0, y0, r0, a + Math.PI / 2, a + (3 * Math.PI) / 2)
    c.arc(x1, y1, r1, a - Math.PI / 2, a + Math.PI / 2)
    c.closePath()
  }
}

const ellipse = (x: number, y: number, rx: number, ry: number, rot = 0) => (c: Ctx) => {
  c.beginPath()
  c.ellipse(x, y, Math.max(rx, 0.1), Math.max(ry, 0.1), rot, 0, Math.PI * 2)
}

function drawArm(p: Painter, sx: number, sy: number, shoulder: number, elbow: number, side: 1 | -1) {
  const dir = (deg: number) => ({ x: side * Math.sin(deg * RAD), y: Math.cos(deg * RAD) })
  const u = dir(shoulder)
  const ex = sx + u.x * 21
  const ey = sy + u.y * 21
  const f = dir(shoulder + elbow)
  const wx = ex + f.x * 18
  const wy = ey + f.y * 18
  const hx = wx + f.x * 5
  const hy = wy + f.y * 5

  p.shape(taper(sx, sy, ex, ey, 4.2, 3.2), limbFill(sx, sy, ex, ey, 4.2))
  p.shape(taper(ex, ey, wx, wy, 3.1, 2.3), limbFill(ex, ey, wx, wy, 3.1))
  // Mitten hand, angled along the forearm.
  p.shape(ellipse(hx, hy, 3.2, 4.6, Math.atan2(f.y, f.x) - Math.PI / 2), sphereFill(hx, hy, 4.6))
  p.shape(ellipse(wx, wy, 2.2, 2.2), sphereFill(wx, wy, 2.2, -0.05))
  p.shape(ellipse(ex, ey, 3.1, 3.1), sphereFill(ex, ey, 3.1, -0.05))
  p.shape(ellipse(sx, sy, 5, 5), sphereFill(sx, sy, 5))
}

function drawHead(p: Painter, f: ChannelFrame, nx: number, ny: number) {
  // Head group pivots at the neck ball (roll). Yaw and pitch slide the face
  // across the egg; the far eye foreshortens.
  const roll = f.headRoll * RAD
  const cos = Math.cos(roll)
  const sin = Math.sin(roll)
  const at = (lx: number, ly: number) => ({ x: nx + lx * cos - ly * sin, y: ny + lx * sin + ly * cos })

  const RX = 10.5
  const RY = 13.5
  const cy = -15 // head centre above the pivot
  const yawS = Math.sin(f.headYaw * RAD)
  const pitchS = Math.sin(f.headPitch * RAD)
  const faceX = yawS * RX * 0.58
  const faceY = -pitchS * RY * 0.42

  const c0 = at(0, cy)
  const egg = ellipse(c0.x, c0.y, RX, RY, roll)
  const headFill = (c: Ctx) => {
    // Highlight slides against the turn, so the head reads as a rotating solid.
    const hl = at(-RX * 0.35 - yawS * RX * 0.35, cy - RY * 0.4 + pitchS * RY * 0.25)
    const g = c.createRadialGradient(hl.x, hl.y, 1, c0.x, c0.y, RY * 1.25)
    g.addColorStop(0, gray(1))
    g.addColorStop(0.55, gray(0.93))
    g.addColorStop(1, gray(0.5))
    return g
  }

  // Jaw: a chin block below the mouth line, dropped by the jaw angle.
  const mouthY = cy + 5.5 + faceY * 0.5
  const chinHalfW = 5.2 * (1 - Math.abs(yawS) * 0.25)
  const chinX = faceX * 0.85
  const drop = Math.sin(f.jaw * RAD) * 11
  const chinRect = (dy: number) => (c: Ctx) => {
    const a = at(chinX - chinHalfW, mouthY + dy)
    c.save()
    c.translate(a.x, a.y)
    c.rotate(roll)
    c.beginPath()
    c.rect(0, 0, chinHalfW * 2, RY * 2)
    c.restore()
  }

  // Upper head (whole egg; the chin gets painted over it).
  p.shape(egg, headFill)

  // Mouth cavity, then the dropped chin on top of it.
  p.clipped(chinRect(0), egg, "cavity")
  const dropVec = { x: -sin * drop, y: cos * drop }
  const eggDropped = ellipse(c0.x + dropVec.x, c0.y + dropVec.y, RX, RY, roll)
  p.clipped(chinRect(drop), eggDropped, "solid", headFill)

  // Marionette seams down from the mouth corners.
  p.ink((c) => {
    c.lineWidth = 1
    c.strokeStyle = gray(0)
    for (const sx of [chinX - chinHalfW, chinX + chinHalfW]) {
      const a = at(sx, mouthY + drop)
      const b = at(sx, cy + RY * 0.92 + drop)
      c.beginPath()
      c.moveTo(a.x, a.y)
      c.lineTo(b.x, b.y)
      c.stroke()
    }
  })

  // Eyes: carved almonds; lids close them top-down.
  const lid = Math.min(Math.max(f.lids / 80, 0), 1)
  for (const s of [-1, 1] as const) {
    const near = s * yawS >= 0 ? 1 : 1 - Math.abs(yawS) * 0.55
    const e = at(faceX + s * 4.4 * (1 - Math.abs(yawS) * 0.2), cy - 2 + faceY)
    const rx = 1.9 * near
    const ry = 1.15 * (1 - lid)
    p.ink((c) => {
      c.fillStyle = gray(0)
      c.strokeStyle = gray(0)
      c.lineWidth = 1
      if (ry < 0.3) {
        const a = at(faceX + s * 4.4 - rx, cy - 2 + faceY)
        const b = at(faceX + s * 4.4 + rx, cy - 2 + faceY)
        c.beginPath()
        c.moveTo(a.x, a.y)
        c.lineTo(b.x, b.y)
        c.stroke()
      } else {
        c.beginPath()
        c.ellipse(e.x, e.y, rx, ry, roll, 0, Math.PI * 2)
        c.fill()
      }
    })
  }

  // Nose ridge: a short carved line that tracks yaw.
  p.ink((c) => {
    const a = at(faceX * 1.05, cy + 0.5 + faceY)
    const b = at(faceX * 1.1, cy + 3.2 + faceY)
    c.strokeStyle = gray(0)
    c.lineWidth = 1
    c.beginPath()
    c.moveTo(a.x, a.y)
    c.lineTo(b.x, b.y)
    c.stroke()
  })
}

function drawMannequin(p: Painter, f: ChannelFrame) {
  const cx = 80
  // Stand: base plate, rod, pelvis block.
  p.shape(ellipse(cx, 111, 24, 4.5), (c) => {
    const g = c.createLinearGradient(cx - 24, 107, cx + 24, 115)
    g.addColorStop(0, gray(0.85))
    g.addColorStop(1, gray(0.4))
    return g
  })
  p.shape(taper(cx, 92, cx, 110, 1.6, 1.6), limbFill(cx, 92, cx, 110, 1.6))
  p.shape(ellipse(cx, 86, 13, 7.5), sphereFill(cx, 86, 13))
  p.shape(ellipse(cx, 77, 4.5, 4.5), sphereFill(cx, 77, 4.5, -0.05))

  // Chest: an egg, wider at the shoulders.
  const chest = (c: Ctx) => {
    c.beginPath()
    c.moveTo(cx - 20, 52)
    c.bezierCurveTo(cx - 22, 46, cx + 22, 46, cx + 20, 52)
    c.bezierCurveTo(cx + 19, 64, cx + 10, 76, cx, 76)
    c.bezierCurveTo(cx - 10, 76, cx - 19, 64, cx - 20, 52)
    c.closePath()
  }
  p.shape(chest, sphereFill(cx, 58, 21))
  p.ink((c) => {
    // Pectoral carve line.
    c.strokeStyle = gray(0)
    c.lineWidth = 1
    c.beginPath()
    c.moveTo(cx - 11, 60)
    c.quadraticCurveTo(cx, 64, cx + 11, 60)
    c.stroke()
  })

  // Neck.
  p.shape(taper(cx, 50, cx, 42, 3.2, 2.8), limbFill(cx, 50, cx, 42, 3.2))
  p.shape(ellipse(cx, 42, 3.2, 3.2), sphereFill(cx, 42, 3.2, -0.05))
  drawHead(p, f, cx, 42)

  // Arms last: in front of the torso.
  drawArm(p, cx - 22, 51, f.rShoulder, f.rElbow, -1)
  drawArm(p, cx + 22, 51, f.lShoulder, f.lElbow, 1)
}

// ---- Painters ---------------------------------------------------------------

const FILL_ALL = (c: Ctx) => c.fillRect(-1e4, -1e4, 2e4, 2e4)

function platePainter(shade: Ctx, line: Ctx): Painter {
  return {
    shape(path, fill) {
      path(shade)
      shade.fillStyle = fill(shade)
      shade.fill()
      // White fill on the line layer occludes outlines of parts behind this one.
      path(line)
      line.fillStyle = gray(1)
      line.fill()
      line.strokeStyle = gray(0)
      line.lineWidth = 1
      line.stroke()
    },
    ink(draw) {
      line.save()
      draw(line)
      line.restore()
    },
    clipped(clipA, clipB, kind, fill) {
      for (const c of [shade, line]) {
        c.save()
        clipA(c)
        c.clip()
        clipB(c)
        c.clip()
        c.fillStyle = kind === "cavity" ? gray(0) : c === shade && fill ? fill(c) : gray(1)
        FILL_ALL(c)
        if (kind === "solid" && c === line) {
          clipB(c)
          c.strokeStyle = gray(0)
          c.lineWidth = 1.4
          c.stroke()
        }
        c.restore()
      }
    },
  }
}

/** Outlines only, no occlusion — an x-ray scope trace (dashed for the ghost). */
function outlinePainter(line: Ctx, dashed = false): Painter {
  const stroke = (width = 1) => {
    line.save()
    if (dashed) line.setLineDash([1, 2])
    line.strokeStyle = gray(0)
    line.lineWidth = width
    line.stroke()
    line.restore()
  }
  return {
    shape(path) {
      path(line)
      stroke()
    },
    ink(draw) {
      if (dashed) return
      line.save()
      draw(line)
      line.restore()
    },
    clipped(clipA, clipB, kind) {
      if (kind !== "solid") return
      line.save()
      clipA(line)
      line.clip()
      clipB(line)
      stroke(1.4)
      line.restore()
    },
  }
}

// ---- Entry point -------------------------------------------------------------

export function drawFigure(canvas: HTMLCanvasElement, frame: ChannelFrame, opts: DrawOptions = {}) {
  const mode = opts.mode ?? "plate"
  // Layout size, not getBoundingClientRect — the latter includes ancestor transforms.
  const cssW = Math.max(1, canvas.clientWidth)
  const cssH = Math.max(1, canvas.clientHeight)
  const lw = Math.max(1, Math.ceil(cssW / PIXEL))
  const lh = Math.max(1, Math.ceil(cssH / PIXEL))
  const { shade, line } = getLayers(canvas, lw, lh)
  const sctx = shade.getContext("2d", { willReadFrequently: true })!
  const lctx = line.getContext("2d", { willReadFrequently: true })!

  // Map the 160×120 design space into the low-res buffer, centred.
  const s = Math.min(lw / 160, lh / 120)
  const ox = (lw - 160 * s) / 2
  const oy = (lh - 120 * s) / 2

  for (const c of [sctx, lctx]) {
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.fillStyle = gray(1)
    c.fillRect(0, 0, lw, lh)
  }

  // Backdrop: dot grid + floor shadow (plate) / sparse graticule (scope).
  const step = Math.max(6, Math.round(10 * s))
  lctx.fillStyle = gray(0)
  for (let y = step / 2; y < lh; y += step) {
    for (let x = step / 2; x < lw; x += step) lctx.fillRect(Math.floor(x), Math.floor(y), 1, 1)
  }

  for (const c of [sctx, lctx]) c.setTransform(s, 0, 0, s, ox, oy)

  if (mode === "plate") {
    sctx.fillStyle = gray(0.62)
    sctx.beginPath()
    sctx.ellipse(84, 113, 30, 4.5, 0, 0, Math.PI * 2)
    sctx.fill()
    if (opts.ghost) drawMannequin(outlinePainter(lctx, true), opts.ghost)
    drawMannequin(platePainter(sctx, lctx), frame)
  } else {
    drawMannequin(outlinePainter(lctx), frame)
  }

  // Combine layers with ordered dithering.
  const sd = sctx.getImageData(0, 0, lw, lh).data
  const ld = lctx.getImageData(0, 0, lw, lh)
  const out = ld.data
  const [inkC, paperC] = mode === "plate" ? [INK, PAPER] : [PHOSPHOR, SCOPE_BG]
  for (let y = 0; y < lh; y++) {
    const scan = mode === "scope" && y % 2 === 1
    for (let x = 0; x < lw; x++) {
      const i = (y * lw + x) * 4
      const lineInk = out[i] < 140
      const shadeInk = mode === "plate" && sd[i] / 255 < BAYER4[(y & 3) * 4 + (x & 3)]
      const c = lineInk || shadeInk ? (scan ? PHOSPHOR_DIM : inkC) : paperC
      out[i] = c[0]
      out[i + 1] = c[1]
      out[i + 2] = c[2]
      out[i + 3] = 255
    }
  }
  lctx.setTransform(1, 0, 0, 1, 0, 0)
  lctx.putImageData(ld, 0, 0)

  // Blit, nearest-neighbour.
  const dpr = window.devicePixelRatio || 1
  if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)
  }
  const ctx = canvas.getContext("2d")!
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(line, 0, 0, lw * PIXEL * dpr, lh * PIXEL * dpr)

  if (opts.label) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace"
    const w = ctx.measureText(opts.label).width
    const [bg, fg] = mode === "plate" ? [PAPER, INK] : [SCOPE_BG, PHOSPHOR]
    ctx.fillStyle = `rgb(${bg.join(",")})`
    ctx.fillRect(6, 5, w + 8, 14)
    ctx.strokeStyle = `rgb(${fg.join(",")})`
    ctx.lineWidth = 1
    ctx.strokeRect(6.5, 5.5, w + 7, 13)
    ctx.fillStyle = `rgb(${fg.join(",")})`
    ctx.fillText(opts.label, 10, 15.5)
  }
}
