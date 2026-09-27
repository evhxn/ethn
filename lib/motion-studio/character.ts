// Character stage: classic animation principles applied as signal processing.
//
// Tracked motion that goes straight to servos reads as robotic — every joint
// moves on its own, stops dead, and holds perfectly still. Animatronic
// programmers fix that by hand; this stage does a first pass automatically:
//
//   overlap        — secondary joints (elbows, head roll) trail their drivers
//   follow-through — a slightly underdamped spring, so moves overshoot a hair
//                    and settle instead of stopping dead
//   life           — breathing and low-frequency idle drift, so a still
//                    figure never looks switched off
//   auto-blink     — blink on fast head turns (as people do) and at idle
//
// It sits between smoothing and the MotionLimiter, so everything it adds is
// still bounded by the channel limits. Deterministic for a given take, so
// reprocessing after a slider change gives the same result.

import type { ChannelId, ChannelSpec } from "./channels"

export interface CharacterParams {
  /** 0–1: breathing + idle drift amplitude. */
  life: number
  /** 0–1: 0 = critically damped, 1 = visibly springy settle. */
  followThrough: number
  /** 0–1: how far secondary joints lag their drivers. */
  overlap: number
  autoBlink: boolean
}

export const DEFAULT_CHARACTER: CharacterParams = { life: 0.6, followThrough: 0.5, overlap: 0.5, autoBlink: true }
export const NO_CHARACTER: CharacterParams = { life: 0, followThrough: 0, overlap: 0, autoBlink: false }

/** Natural frequency (Hz) of each channel's follow-through spring; absent = no spring (jaw/lids must stay snappy for lip sync and blinks). */
const SPRING_HZ: Partial<Record<ChannelId, number>> = {
  headYaw: 2.6,
  headPitch: 2.8,
  headRoll: 2.2,
  lShoulder: 2.0,
  rShoulder: 2.0,
  lElbow: 2.4,
  rElbow: 2.4,
}

/** Lag (s) at overlap = 1. */
const OVERLAP_LAG: Partial<Record<ChannelId, number>> = {
  headRoll: 0.09,
  lElbow: 0.12,
  rElbow: 0.12,
}

const BLINK_DEG = 80
const BLINK_S = 0.16

class Spring {
  x: number | null = null
  v = 0
  step(target: number, dt: number, hz: number, zeta: number) {
    if (this.x === null) {
      this.x = target
      return target
    }
    const w = 2 * Math.PI * hz
    const n = Math.max(1, Math.ceil(dt / 0.004))
    const h = dt / n
    for (let i = 0; i < n; i++) {
      // Semi-implicit Euler: stable for w*h well under 1.
      this.v += (w * w * (target - this.x) - 2 * zeta * w * this.v) * h
      this.x += this.v * h
    }
    return this.x
  }
}

/** Time-indexed delay line with linear interpolation. */
class Delay {
  private buf: { t: number; v: number }[] = []
  step(t: number, v: number, lag: number) {
    this.buf.push({ t, v })
    const want = t - lag
    while (this.buf.length > 2 && this.buf[1].t <= want) this.buf.shift()
    const [a, b] = this.buf
    if (!b || want <= a.t) return a.v
    return a.v + ((b.v - a.v) * (want - a.t)) / (b.t - a.t)
  }
}

/** Smooth pseudo-noise in [-1, 1]: incommensurate sines, cheap and deterministic. */
function drift(t: number, seed: number) {
  return (Math.sin(t * 0.37 + seed) * 0.5 + Math.sin(t * 0.91 + seed * 2.1) * 0.3 + Math.sin(t * 1.73 + seed * 3.7) * 0.2)
}

export class CharacterStage {
  private springs = new Map<ChannelId, Spring>()
  private delays = new Map<ChannelId, Delay>()
  private prevYaw: number | null = null
  private yawVel = 0
  private blinkStart = -Infinity
  private nextIdleBlink: number
  private rngState = 97

  constructor(
    private params: CharacterParams,
    private channels: ChannelSpec[],
  ) {
    this.nextIdleBlink = 1.5 + this.rand() * 2
  }

  private rand() {
    this.rngState = (this.rngState * 16807) % 2147483647
    return this.rngState / 2147483647
  }

  step(input: Record<ChannelId, number>, t: number, dt: number): Record<ChannelId, number> {
    const { life, followThrough, overlap, autoBlink } = this.params
    const out = { ...input }

    for (const c of this.channels) {
      let v = input[c.id]

      const lag = (OVERLAP_LAG[c.id] ?? 0) * overlap
      if (lag > 0) {
        if (!this.delays.has(c.id)) this.delays.set(c.id, new Delay())
        v = this.delays.get(c.id)!.step(t, v, lag)
      }

      const hz = SPRING_HZ[c.id]
      if (hz && followThrough > 0) {
        if (!this.springs.has(c.id)) this.springs.set(c.id, new Spring())
        // ζ 1 → 0.55: from a soft, weighted lag to a visible overshoot-and-settle.
        const sprung = this.springs.get(c.id)!.step(v, dt, hz, 1 - 0.45 * followThrough)
        v += (sprung - v) * Math.min(1, followThrough * 3)
      }
      out[c.id] = v
    }

    if (life > 0) {
      const breath = Math.sin((2 * Math.PI * t) / 4.2)
      out.headYaw += life * 2.2 * drift(t, 1.3)
      out.headPitch += life * (1.4 * drift(t, 4.1) + 0.8 * breath)
      out.headRoll += life * 1.2 * drift(t, 7.9)
      out.lShoulder += life * 2.0 * (breath + 0.4 * drift(t, 2.2))
      out.rShoulder += life * 2.0 * (breath + 0.4 * drift(t, 5.6))
      out.lElbow += life * 1.5 * drift(t, 3.3)
      out.rElbow += life * 1.5 * drift(t, 6.4)
    }

    if (autoBlink) {
      // Head-turn blinks key off how fast the performer's yaw is changing.
      if (this.prevYaw !== null && dt > 0) {
        const raw = (input.headYaw - this.prevYaw) / dt
        this.yawVel += Math.min(1, dt * 20) * (raw - this.yawVel)
      }
      this.prevYaw = input.headYaw
      const sinceBlink = t - this.blinkStart
      const turnBlink = Math.abs(this.yawVel) > 110 && sinceBlink > 0.8
      const idleBlink = life > 0 && t >= this.nextIdleBlink
      if ((turnBlink || idleBlink) && sinceBlink > BLINK_S) {
        this.blinkStart = t
        this.nextIdleBlink = t + 2.4 + this.rand() * 3.6
      }
      const p = (t - this.blinkStart) / BLINK_S
      if (p >= 0 && p <= 1) out.lids = Math.max(out.lids, Math.sin(p * Math.PI) * BLINK_DEG)
    }

    return out
  }
}
