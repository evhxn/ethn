// A synthetic "performance" so the studio works without a webcam.
//
// It's deliberately recorded badly, the way a real capture is: ~30 fps with
// frame-timing jitter, landmark noise, a tracking dropout, a one-frame
// glitch, and a move faster than the servos can follow. The point of the
// demo is watching the pipeline clean all of that up.

import type { ChannelId } from "./channels"
import type { CaptureSample, Take } from "./pipeline"

const DURATION = 14

function smoothstep(t: number) {
  return t * t * (3 - 2 * t)
}

/** Piecewise curve through [time, value] keys with eased segments. */
function keys(points: [number, number][]) {
  return (t: number) => {
    if (t <= points[0][0]) return points[0][1]
    for (let i = 0; i < points.length - 1; i++) {
      const [t0, v0] = points[i]
      const [t1, v1] = points[i + 1]
      if (t <= t1) return v0 + (v1 - v0) * smoothstep((t - t0) / (t1 - t0))
    }
    return points[points.length - 1][1]
  }
}

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

const window_ = (t: number, a: number, b: number) => (t >= a && t <= b ? 1 : 0)

export function makeDemoTake(): Take {
  const rand = seeded(1234)
  const gauss = () => (rand() + rand() + rand() - 1.5) * 1.15

  const yaw = keys([[0, 0], [3.8, 0], [4.6, 38], [5.6, 38], [6.4, -35], [7.2, -35], [7.8, 0], [10.5, 0], [11.2, 12], [12.4, -6], [13.2, 0]])
  const pitch = keys([[0, 0], [1.4, 4], [3.8, 4], [4.6, -6], [6.4, 8], [7.8, 0], [8.2, 14], [9.4, 14], [10.2, 0]])
  const roll = keys([[0, 0], [1.6, 0], [2.2, 12], [3.8, 12], [4.4, 0], [7.8, 0], [8.2, -8], [9.4, -8], [10, 0]])

  // Right arm waves hello, both arms snap up for a "ta-da", then relax.
  const rShoulderBase = keys([[0, 12], [1.4, 12], [2.0, 128], [3.8, 128], [4.4, 14], [7.9, 14], [8.05, 145], [9.4, 140], [10.2, 20], [14, 12]])
  const lShoulder = keys([[0, 12], [7.9, 12], [8.05, 145], [9.4, 140], [10.2, 18], [14, 12]])
  const lElbow = keys([[0, 12], [7.9, 12], [8.05, 20], [9.4, 20], [10.2, 25], [14, 12]])
  const rElbowRest = lElbow

  const nodPulse = (t: number) => (t > 12.6 && t < 13.4 ? Math.sin(((t - 12.6) / 0.8) * Math.PI * 2) * 9 : 0)

  // Speech: syllables as a gated sine with random amplitude per syllable.
  const syllables: { t: number; amp: number; len: number }[] = []
  for (const [start, end] of [[1.8, 3.4], [10.6, 12.3]]) {
    let t = start
    while (t < end) {
      const len = 0.12 + rand() * 0.14
      syllables.push({ t, amp: 0.4 + rand() * 0.6, len })
      t += len + 0.03 + rand() * 0.08
    }
  }
  const jaw = (t: number) => {
    for (const s of syllables) {
      if (t >= s.t && t <= s.t + s.len) return Math.sin(((t - s.t) / s.len) * Math.PI) * s.amp * 26
    }
    return 0
  }

  const blinks = [0.9, 4.1, 6.9, 9.7, 12.0, 13.6]
  const lids = (t: number) => {
    for (const b of blinks) {
      const d = t - b
      if (d >= 0 && d < 0.16) return Math.sin((d / 0.16) * Math.PI) * 80
    }
    return 0
  }

  const samples: CaptureSample[] = []
  let t = 0
  while (t < DURATION) {
    const arms = window_(t, 9.6, 10.1) === 0 // tracking dropout on the arms
    const wave = window_(t, 2.0, 3.8) * Math.sin((t - 2.0) * Math.PI * 2 * 2.2)
    const values: Partial<Record<ChannelId, number>> = {
      headYaw: yaw(t) + gauss() * 1.6,
      headPitch: pitch(t) + nodPulse(t) + gauss() * 1.4,
      headRoll: roll(t) + gauss() * 1.0,
      jaw: Math.max(0, jaw(t) + gauss() * 0.8),
      lids: Math.max(0, lids(t) + gauss() * 1.5),
    }
    if (arms) {
      values.rShoulder = rShoulderBase(t) + gauss() * 3
      values.rElbow = (window_(t, 1.8, 4.0) ? 55 + wave * 38 : rElbowRest(t)) + gauss() * 4
      values.lShoulder = lShoulder(t) + gauss() * 3
      values.lElbow = lElbow(t) + gauss() * 4
    }
    // Single-frame tracker glitch: the face solver flips for one frame.
    if (t > 5.9 && t < 5.94) values.headYaw = -85

    samples.push({ t, values })
    t += 1 / 30 + (rand() - 0.5) * 0.012
  }

  return { name: "demo_take_01", duration: DURATION, samples }
}
