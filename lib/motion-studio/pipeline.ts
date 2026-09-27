// Take processing: irregular camera samples -> fixed-rate servo frames.
//
//   capture samples (≈ webcam fps, jittery timing, gaps when tracking drops)
//     -> resample to a fixed tick (linear interp, hold across gaps)
//     -> One Euro smoothing
//     -> jerk-limited MotionLimiter
//     -> frames ready for playback / export

import { CHANNELS, type ChannelId, type ChannelSpec } from "./channels"
import { DEFAULT_ONE_EURO, MotionLimiter, OneEuroFilter, type OneEuroParams } from "./filters"

/** One capture sample. A channel is missing (undefined/NaN) when it wasn't tracked that frame. */
export interface CaptureSample {
  t: number
  values: Partial<Record<ChannelId, number>>
}

export interface Take {
  name: string
  /** Seconds. */
  duration: number
  samples: CaptureSample[]
}

export interface ChannelTrack {
  raw: Float32Array
  smoothed: Float32Array
  output: Float32Array
  /** Ticks where the raw signal alone would have broken a position/velocity limit. */
  rawViolations: number
  /** Ticks where the limiter had to hold the output back from the smoothed target by > 1°. */
  limitedTicks: number
  /** RMS of (output - smoothed), degrees — the cost of staying within limits. */
  trackingRms: number
  peakVelocity: number
}

export interface ProcessedTake {
  rate: number
  frameCount: number
  duration: number
  tracks: Record<ChannelId, ChannelTrack>
}

export interface ProcessOptions {
  rate: number
  oneEuro: OneEuroParams
  channels: ChannelSpec[]
}

/** Limiter ticks per output frame — 4 × 50 Hz = a 200 Hz servo loop. */
const LIMITER_SUBSTEPS = 4

export const DEFAULT_PROCESS_OPTIONS: ProcessOptions = {
  rate: 50,
  oneEuro: DEFAULT_ONE_EURO,
  channels: CHANNELS,
}

/**
 * Linear resample of one channel onto a fixed tick grid. Gaps (missing
 * samples) hold the last good value; before the first good value we hold
 * the first good value, and a channel that was never tracked sits at neutral.
 */
export function resampleChannel(samples: CaptureSample[], id: ChannelId, rate: number, frameCount: number, neutral: number) {
  const pts: { t: number; v: number }[] = []
  for (const s of samples) {
    const v = s.values[id]
    if (v !== undefined && Number.isFinite(v)) pts.push({ t: s.t, v })
  }
  const out = new Float32Array(frameCount)
  if (pts.length === 0) {
    out.fill(neutral)
    return out
  }
  let j = 0
  for (let i = 0; i < frameCount; i++) {
    const t = i / rate
    while (j < pts.length - 1 && pts[j + 1].t <= t) j++
    const a = pts[j]
    const b = pts[j + 1]
    if (t <= a.t || !b) {
      out[i] = a.v
    } else {
      // Don't interpolate across a long dropout — hold, then resume.
      const gap = b.t - a.t
      out[i] = gap > 0.25 ? a.v : a.v + ((b.v - a.v) * (t - a.t)) / gap
    }
  }
  return out
}

export function processTake(take: Take, opts: ProcessOptions = DEFAULT_PROCESS_OPTIONS): ProcessedTake {
  const { rate } = opts
  const dt = 1 / rate
  const frameCount = Math.max(1, Math.ceil(take.duration * rate))
  const tracks = {} as Record<ChannelId, ChannelTrack>

  for (const spec of opts.channels) {
    const raw = resampleChannel(take.samples, spec.id, rate, frameCount, spec.neutral)
    const smoothed = new Float32Array(frameCount)
    const output = new Float32Array(frameCount)

    const euro = new OneEuroFilter(opts.oneEuro)
    const limiter = new MotionLimiter(spec, raw[0])

    let rawViolations = 0
    let limitedTicks = 0
    let errSq = 0
    let peakVelocity = 0

    for (let i = 0; i < frameCount; i++) {
      smoothed[i] = euro.step(raw[i], dt)
      // Servo loop runs faster than the export rate; see LIMITER_SUBSTEPS.
      for (let k = 0; k < LIMITER_SUBSTEPS; k++) limiter.step(smoothed[i], dt / LIMITER_SUBSTEPS)
      output[i] = limiter.p

      if (i > 0) {
        // Accel is left out on purpose: landmark jitter differentiated twice
        // breaks the accel limit nearly every frame, which says nothing useful.
        const rawV = (raw[i] - raw[i - 1]) / dt
        const outOfRange = raw[i] < spec.min || raw[i] > spec.max
        if (outOfRange || Math.abs(rawV) > spec.vmax) rawViolations++
        peakVelocity = Math.max(peakVelocity, Math.abs((output[i] - output[i - 1]) / dt))
      }
      const err = output[i] - smoothed[i]
      if (Math.abs(err) > 1) limitedTicks++
      errSq += err * err
    }

    tracks[spec.id] = {
      raw,
      smoothed,
      output,
      rawViolations,
      limitedTicks,
      trackingRms: Math.sqrt(errSq / frameCount),
      peakVelocity,
    }
  }

  return { rate, frameCount, duration: frameCount / rate, tracks }
}

/** Streaming version of the same pipeline, for driving the figure live while recording. */
export class LivePipeline {
  private euro: Map<ChannelId, OneEuroFilter>
  private limiters: Map<ChannelId, MotionLimiter>
  private last: Partial<Record<ChannelId, number>> = {}
  private lastT: number | null = null

  constructor(private opts: ProcessOptions = DEFAULT_PROCESS_OPTIONS) {
    this.euro = new Map(opts.channels.map((c) => [c.id, new OneEuroFilter(opts.oneEuro)]))
    this.limiters = new Map(opts.channels.map((c) => [c.id, new MotionLimiter(c, c.neutral)]))
  }

  /** Feed a sample at time t (seconds); returns the limited output for every channel. */
  step(sample: CaptureSample): Record<ChannelId, number> {
    const dt = this.lastT === null ? 1 / 30 : Math.min(Math.max(sample.t - this.lastT, 1e-3), 0.1)
    this.lastT = sample.t
    const out = {} as Record<ChannelId, number>
    for (const spec of this.opts.channels) {
      const v = sample.values[spec.id]
      const target = v !== undefined && Number.isFinite(v) ? v : (this.last[spec.id] ?? spec.neutral)
      this.last[spec.id] = target
      const smoothed = this.euro.get(spec.id)!.step(target, dt)
      // Camera frames arrive at ~30 Hz; run the limiter at ≥200 Hz between them
      // so its jerk/accel integration matches a real servo loop.
      const limiter = this.limiters.get(spec.id)!
      const substeps = Math.ceil(dt / 0.005)
      for (let k = 0; k < substeps; k++) limiter.step(smoothed, dt / substeps)
      out[spec.id] = limiter.p
    }
    return out
  }
}
