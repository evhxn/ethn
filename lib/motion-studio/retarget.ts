// Retargeting: MediaPipe face + pose results -> figure joint angles.
//
// Kept free of MediaPipe imports (structural types only) so it's testable and
// doesn't drag the wasm bundle into anything that just needs the math.

import type { ChannelId } from "./channels"

export interface Vec3 {
  x: number
  y: number
  z: number
  visibility?: number
}

export interface FaceInput {
  /** 4×4 facial transformation matrix, column-major (MediaPipe `Matrix.data`). */
  matrix?: number[]
  /** Blendshape scores by name (jawOpen, eyeBlinkLeft, …). */
  blendshapes?: Record<string, number>
}

export interface PoseInput {
  /** 33 world landmarks (metres, hip-centred, y down). */
  world?: Vec3[]
}

export interface RetargetOptions {
  /** Mirror the performer, like a mirror: their left arm drives the figure's right. */
  mirror: boolean
  /** Neutral head pose captured by "Calibrate", subtracted from the raw angles. */
  headZero: { yaw: number; pitch: number; roll: number }
}

export const DEFAULT_RETARGET: RetargetOptions = { mirror: true, headZero: { yaw: 0, pitch: 0, roll: 0 } }

const DEG = 180 / Math.PI

// MediaPipe pose landmark indices.
const L_SHOULDER = 11
const R_SHOULDER = 12
const L_ELBOW = 13
const R_ELBOW = 14
const L_WRIST = 15
const R_WRIST = 16
const L_HIP = 23
const R_HIP = 24

const MIN_VISIBILITY = 0.5

const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z })
const len = (a: Vec3) => Math.hypot(a.x, a.y, a.z)

/** Unsigned angle between two vectors, degrees. */
export function angleBetween(a: Vec3, b: Vec3): number {
  const d = len(a) * len(b)
  if (d === 0) return 0
  const cos = (a.x * b.x + a.y * b.y + a.z * b.z) / d
  return Math.acos(Math.min(1, Math.max(-1, cos))) * DEG
}

/**
 * Yaw/pitch/roll from a column-major rotation matrix, decomposed as
 * R = Ry(yaw)·Rx(pitch)·Rz(roll) — the order a pan/tilt/roll neck is built in.
 */
export function headAnglesFromMatrix(m: number[]) {
  const r02 = m[8]
  const r12 = m[9]
  const r22 = m[10]
  const r10 = m[1]
  const r11 = m[5]
  return {
    yaw: Math.atan2(r02, r22) * DEG,
    pitch: Math.asin(Math.min(1, Math.max(-1, -r12))) * DEG,
    roll: Math.atan2(r10, r11) * DEG,
  }
}

function visible(...pts: (Vec3 | undefined)[]) {
  return pts.every((p) => p && (p.visibility ?? 1) >= MIN_VISIBILITY)
}

/** Shoulder raise (0 = arm hanging, 90 = horizontal, 180 = overhead) and elbow flex (0 = straight). */
function armAngles(world: Vec3[], shoulder: number, elbow: number, wrist: number, hip: number) {
  const s = world[shoulder]
  const e = world[elbow]
  const w = world[wrist]
  const h = world[hip]
  const out: { shoulder?: number; elbow?: number } = {}
  if (!visible(s, e)) return out
  // Hips are often out of frame at a desk; fall back to camera-down.
  const down = visible(h) ? sub(h, s) : { x: 0, y: 1, z: 0 }
  out.shoulder = angleBetween(down, sub(e, s))
  if (visible(w)) out.elbow = 180 - angleBetween(sub(s, e), sub(w, e))
  return out
}

export function retarget(face: FaceInput | null, pose: PoseInput | null, opts: RetargetOptions = DEFAULT_RETARGET) {
  const values: Partial<Record<ChannelId, number>> = {}

  if (face?.matrix && face.matrix.length >= 16) {
    // MediaPipe camera space is x right, y up, z toward the camera, so +pitch
    // is chin-down and +roll is counter-clockwise in the image. The figure
    // uses +pitch = look up and +roll = clockwise on screen, hence the flips.
    // Mirroring flips the horizontal sense of yaw and roll, not pitch.
    const h = headAnglesFromMatrix(face.matrix)
    const z = opts.headZero
    const sign = opts.mirror ? -1 : 1
    values.headYaw = sign * (h.yaw - z.yaw)
    values.headPitch = -(h.pitch - z.pitch)
    values.headRoll = -sign * (h.roll - z.roll)
  }
  if (face?.blendshapes) {
    const b = face.blendshapes
    // Small dead zones: a resting face reads as jawOpen ≈ 0.02, blink ≈ 0.1.
    const ramp = (x: number, lo: number, hi: number) => Math.min(1, Math.max(0, (x - lo) / (hi - lo)))
    if (b.jawOpen !== undefined) values.jaw = ramp(b.jawOpen, 0.05, 0.65) * 28
    if (b.eyeBlinkLeft !== undefined && b.eyeBlinkRight !== undefined) {
      values.lids = ramp((b.eyeBlinkLeft + b.eyeBlinkRight) / 2, 0.2, 0.8) * 80
    }
  }

  if (pose?.world && pose.world.length >= 25) {
    const perfLeft = armAngles(pose.world, L_SHOULDER, L_ELBOW, L_WRIST, L_HIP)
    const perfRight = armAngles(pose.world, R_SHOULDER, R_ELBOW, R_WRIST, R_HIP)
    // Mirror: performer's left arm drives the figure's right arm.
    const figLeft = opts.mirror ? perfRight : perfLeft
    const figRight = opts.mirror ? perfLeft : perfRight
    if (figLeft.shoulder !== undefined) values.lShoulder = figLeft.shoulder
    if (figLeft.elbow !== undefined) values.lElbow = figLeft.elbow
    if (figRight.shoulder !== undefined) values.rShoulder = figRight.shoulder
    if (figRight.elbow !== undefined) values.rElbow = figRight.elbow
  }

  return values
}
