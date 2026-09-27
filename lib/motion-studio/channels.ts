// Channel map for the demo figure — a small animatronic bust with a 3-axis
// neck, jaw, eyelids, and two 2-DOF arms. Every channel is an angle in
// degrees; limits describe what the (hypothetical) servo + linkage can
// physically do, and the limiter in filters.ts never lets the output
// trajectory exceed them.

export type ChannelId =
  | "headYaw"
  | "headPitch"
  | "headRoll"
  | "jaw"
  | "lids"
  | "lShoulder"
  | "lElbow"
  | "rShoulder"
  | "rElbow"

export interface ChannelSpec {
  id: ChannelId
  label: string
  /** Short name used in exported code / CSV headers. */
  key: string
  /** Position limits, degrees. */
  min: number
  max: number
  /** Rest position the figure returns to when tracking is lost. */
  neutral: number
  /** Velocity limit, deg/s. */
  vmax: number
  /** Acceleration limit, deg/s². */
  amax: number
  /** Jerk limit, deg/s³. */
  jmax: number
  /** Servo pulse width at `min` and `max`, microseconds. */
  minUs: number
  maxUs: number
}

export const CHANNELS: ChannelSpec[] = [
  { id: "headYaw", label: "Head Yaw", key: "HEAD_YAW", min: -60, max: 60, neutral: 0, vmax: 220, amax: 1400, jmax: 16000, minUs: 900, maxUs: 2100 },
  { id: "headPitch", label: "Head Pitch", key: "HEAD_PITCH", min: -30, max: 30, neutral: 0, vmax: 160, amax: 1100, jmax: 14000, minUs: 1100, maxUs: 1900 },
  { id: "headRoll", label: "Head Roll", key: "HEAD_ROLL", min: -25, max: 25, neutral: 0, vmax: 140, amax: 900, jmax: 12000, minUs: 1150, maxUs: 1850 },
  { id: "jaw", label: "Jaw", key: "JAW", min: 0, max: 28, neutral: 0, vmax: 400, amax: 6000, jmax: 120000, minUs: 1000, maxUs: 1600 },
  { id: "lids", label: "Eyelids", key: "LIDS", min: 0, max: 80, neutral: 0, vmax: 900, amax: 20000, jmax: 600000, minUs: 1000, maxUs: 1800 },
  { id: "lShoulder", label: "L Shoulder", key: "L_SHOULDER", min: 0, max: 150, neutral: 10, vmax: 180, amax: 900, jmax: 9000, minUs: 600, maxUs: 2400 },
  { id: "lElbow", label: "L Elbow", key: "L_ELBOW", min: 0, max: 130, neutral: 10, vmax: 240, amax: 1400, jmax: 14000, minUs: 700, maxUs: 2300 },
  { id: "rShoulder", label: "R Shoulder", key: "R_SHOULDER", min: 0, max: 150, neutral: 10, vmax: 180, amax: 900, jmax: 9000, minUs: 600, maxUs: 2400 },
  { id: "rElbow", label: "R Elbow", key: "R_ELBOW", min: 0, max: 130, neutral: 10, vmax: 240, amax: 1400, jmax: 14000, minUs: 700, maxUs: 2300 },
]

export const CHANNEL_IDS = CHANNELS.map((c) => c.id)

export type ChannelFrame = Record<ChannelId, number>

export function neutralFrame(channels: ChannelSpec[] = CHANNELS): ChannelFrame {
  return Object.fromEntries(channels.map((c) => [c.id, c.neutral])) as ChannelFrame
}

export function angleToMicros(spec: ChannelSpec, deg: number): number {
  const t = (Math.min(Math.max(deg, spec.min), spec.max) - spec.min) / (spec.max - spec.min)
  return Math.round(spec.minUs + t * (spec.maxUs - spec.minUs))
}
