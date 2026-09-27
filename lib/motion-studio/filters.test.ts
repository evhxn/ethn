import { describe, expect, it } from "vitest"
import { MotionLimiter, OneEuroFilter, DEFAULT_ONE_EURO } from "./filters"

const limits = { min: -60, max: 60, vmax: 200, amax: 1200, jmax: 15000 }
const RATE = 200
const dt = 1 / RATE

function run(limiter: MotionLimiter, target: (t: number) => number, seconds: number) {
  const log: { p: number; v: number; a: number }[] = []
  for (let i = 0; i < seconds * RATE; i++) {
    limiter.step(target(i * dt), dt)
    log.push({ p: limiter.p, v: limiter.v, a: limiter.a })
  }
  return log
}

describe("MotionLimiter", () => {
  it("never exceeds velocity, acceleration, or jerk limits on a step input", () => {
    const log = run(new MotionLimiter(limits, 0), () => 50, 2)
    for (let i = 1; i < log.length; i++) {
      expect(Math.abs(log[i].v)).toBeLessThanOrEqual(limits.vmax + 1e-9)
      expect(Math.abs(log[i].a)).toBeLessThanOrEqual(limits.amax + 1e-9)
      expect(Math.abs(log[i].a - log[i - 1].a) / dt).toBeLessThanOrEqual(limits.jmax + 1e-6)
    }
  })

  it("settles on a reachable step target without overshooting much", () => {
    const log = run(new MotionLimiter(limits, 0), () => 40, 2)
    const peak = Math.max(...log.map((s) => s.p))
    expect(log.at(-1)!.p).toBeCloseTo(40, 3)
    expect(peak).toBeLessThan(40.4)
  })

  it("clamps targets outside the position limits", () => {
    const log = run(new MotionLimiter(limits, 0), () => 500, 2)
    for (const s of log) expect(s.p).toBeLessThanOrEqual(limits.max)
    expect(log.at(-1)!.p).toBeCloseTo(60, 3)
  })

  it("survives a noisy, discontinuous target without breaking limits", () => {
    let seed = 7
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1
    const log = run(new MotionLimiter(limits, 0), (t) => 40 * Math.sin(t * 9) + 30 * rand() + (t > 1 ? 80 : 0), 3)
    for (let i = 1; i < log.length; i++) {
      expect(log[i].p).toBeGreaterThanOrEqual(limits.min)
      expect(log[i].p).toBeLessThanOrEqual(limits.max)
      expect(Math.abs(log[i].v)).toBeLessThanOrEqual(limits.vmax + 1e-9)
      expect(Math.abs(log[i].a)).toBeLessThanOrEqual(limits.amax + 1e-9)
    }
  })

  it("tracks a slow sine closely", () => {
    const target = (t: number) => 30 * Math.sin(2 * Math.PI * 0.5 * t)
    const log = run(new MotionLimiter(limits, 0), target, 4)
    // Skip the first second of lock-on, then measure error.
    const errs = log.slice(RATE).map((s, i) => Math.abs(s.p - target((i + RATE + 1) * dt)))
    expect(Math.max(...errs)).toBeLessThan(3)
  })
})

describe("OneEuroFilter", () => {
  it("reduces jitter on a still signal", () => {
    const f = new OneEuroFilter(DEFAULT_ONE_EURO)
    let seed = 3
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1
    const out: number[] = []
    for (let i = 0; i < 300; i++) out.push(f.step(10 + rand() * 2, 1 / 30))
    const std = (xs: number[]) => {
      const m = xs.reduce((s, x) => s + x, 0) / xs.length
      return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length)
    }
    // Uniform ±2 noise has σ ≈ 1.15; smoothing should cut that by >2.5x.
    expect(std(out.slice(100))).toBeLessThan(1.15 / 2.5)
  })
})
