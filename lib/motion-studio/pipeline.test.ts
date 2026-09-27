import { describe, expect, it } from "vitest"
import { CHANNELS, angleToMicros } from "./channels"
import { CharacterStage, NO_CHARACTER } from "./character"
import { makeDemoTake } from "./demo-take"
import { toArduinoSketch, toCsv } from "./export"
import { processTake, resampleChannel, DEFAULT_PROCESS_OPTIONS } from "./pipeline"
import { angleBetween, headAnglesFromMatrix, retarget } from "./retarget"

describe("resampleChannel", () => {
  it("interpolates, holds across long gaps, and fills untracked channels with neutral", () => {
    const samples = [
      { t: 0, values: { jaw: 0 } },
      { t: 0.1, values: { jaw: 10 } },
      { t: 1.0, values: { jaw: 20 } },
    ]
    const out = resampleChannel(samples, "jaw", 20, 21, 0)
    expect(out[1]).toBeCloseTo(5) // t=0.05, halfway between 0 and 10
    expect(out[10]).toBeCloseTo(10) // t=0.5, inside a 0.9 s dropout: hold
    expect(out[20]).toBeCloseTo(20)
    expect(resampleChannel(samples, "lids", 20, 5, 7).every((v) => v === 7)).toBe(true)
  })
})

describe("processTake on the demo performance", () => {
  const take = makeDemoTake()
  const processed = processTake(take)
  const { rate } = processed

  it("keeps every channel within its position and velocity limits", () => {
    for (const spec of CHANNELS) {
      const out = processed.tracks[spec.id].output
      for (let i = 0; i < out.length; i++) {
        expect(out[i]).toBeGreaterThanOrEqual(spec.min - 1e-6)
        expect(out[i]).toBeLessThanOrEqual(spec.max + 1e-6)
        if (i > 0) expect(Math.abs(out[i] - out[i - 1]) * rate).toBeLessThanOrEqual(spec.vmax + 1e-3)
      }
    }
  })

  it("flags the raw capture's limit violations (the reason the limiter exists)", () => {
    const totalRaw = CHANNELS.reduce((s, c) => s + processed.tracks[c.id].rawViolations, 0)
    expect(totalRaw).toBeGreaterThan(10)
  })

  it("rejects the one-frame head glitch", () => {
    const yaw = processed.tracks.headYaw.output
    const i = Math.round(5.92 * rate)
    expect(Math.min(...yaw.slice(i - 3, i + 6))).toBeGreaterThan(0)
  })

  it("exports a CSV row per frame and a sketch with the full frame table", () => {
    expect(toCsv(processed, CHANNELS).split("\n")).toHaveLength(processed.frameCount + 1)
    const sketch = toArduinoSketch(processed, CHANNELS, "demo")
    expect(sketch.match(/^ {2}\{[\d, ]+\},$/gm)).toHaveLength(processed.frameCount)
    expect(sketch).toContain(`const uint16_t FRAMES = ${processed.frameCount};`)
  })

  it("uses the default 50 Hz export rate", () => {
    expect(rate).toBe(DEFAULT_PROCESS_OPTIONS.rate)
  })
})

describe("CharacterStage", () => {
  it("passes the signal through untouched when every effect is off", () => {
    const stage = new CharacterStage(NO_CHARACTER, CHANNELS)
    for (let i = 0; i < 50; i++) {
      const frame = Object.fromEntries(CHANNELS.map((c, k) => [c.id, Math.sin(i * 0.1 + k) * 10])) as Record<(typeof CHANNELS)[number]["id"], number>
      expect(stage.step(frame, i / 50, 1 / 50)).toEqual(frame)
    }
  })

  it("adds idle life to a perfectly still input", () => {
    const processed = processTake({ name: "still", duration: 4, samples: [{ t: 0, values: { headYaw: 0 } }] })
    const yaw = processed.tracks.headYaw.output
    expect(Math.max(...yaw) - Math.min(...yaw)).toBeGreaterThan(0.5)
  })
})

describe("retarget math", () => {
  it("maps angles to servo pulses and clamps out-of-range angles", () => {
    const yaw = CHANNELS[0]
    expect(angleToMicros(yaw, yaw.min)).toBe(yaw.minUs)
    expect(angleToMicros(yaw, yaw.max + 50)).toBe(yaw.maxUs)
    expect(angleToMicros(yaw, 0)).toBe((yaw.minUs + yaw.maxUs) / 2)
  })

  it("recovers yaw from a pure Y rotation matrix", () => {
    const a = (30 * Math.PI) / 180
    // Column-major Ry(30°).
    const m = [Math.cos(a), 0, -Math.sin(a), 0, 0, 1, 0, 0, Math.sin(a), 0, Math.cos(a), 0, 0, 0, 0, 1]
    const h = headAnglesFromMatrix(m)
    expect(h.yaw).toBeCloseTo(30)
    expect(h.pitch).toBeCloseTo(0)
    expect(h.roll).toBeCloseTo(0)
  })

  it("maps head rotation to figure conventions, flipping yaw/roll when mirrored", () => {
    // Column-major Rx(+10°): chin down in MediaPipe camera space.
    const a = (10 * Math.PI) / 180
    const chinDown = [1, 0, 0, 0, 0, Math.cos(a), Math.sin(a), 0, 0, -Math.sin(a), Math.cos(a), 0, 0, 0, 0, 1]
    const zero = { yaw: 0, pitch: 0, roll: 0 }
    expect(retarget({ matrix: chinDown }, null, { mirror: false, headZero: zero }).headPitch).toBeCloseTo(-10)
    // Column-major Rz(+10°): counter-clockwise in the camera image.
    const ccw = [Math.cos(a), Math.sin(a), 0, 0, -Math.sin(a), Math.cos(a), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    expect(retarget({ matrix: ccw }, null, { mirror: false, headZero: zero }).headRoll).toBeCloseTo(-10)
    expect(retarget({ matrix: ccw }, null, { mirror: true, headZero: zero }).headRoll).toBeCloseTo(10)
  })

  it("measures joint angles", () => {
    expect(angleBetween({ x: 0, y: 1, z: 0 }, { x: 1, y: 0, z: 0 })).toBeCloseTo(90)
  })
})
