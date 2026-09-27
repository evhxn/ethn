// Signal conditioning for captured motion.
//
// Two stages, both stateful and step-driven so the exact same code runs
// sample-by-sample during live capture and over a whole take offline:
//
//   1. OneEuroFilter — adaptive low-pass (Casiez et al., CHI 2012). Heavy
//      smoothing when the signal is slow (kills landmark jitter), light
//      smoothing when it's fast (keeps latency low on big moves).
//   2. MotionLimiter — a jerk-limited tracking controller. Whatever the
//      filtered target does, the output never leaves [min, max] and never
//      exceeds the channel's velocity, acceleration, or jerk limits, which is
//      what keeps a real servo + linkage from slamming into its end stops.

import type { ChannelSpec } from "./channels"

export interface OneEuroParams {
  /** Cutoff at rest, Hz. Lower = smoother but laggier when still. */
  minCutoff: number
  /** How quickly the cutoff rises with speed. Higher = less lag on fast moves. */
  beta: number
  /** Cutoff for the derivative estimate, Hz. */
  dCutoff: number
}

export const DEFAULT_ONE_EURO: OneEuroParams = { minCutoff: 0.8, beta: 0.04, dCutoff: 1.0 }

function smoothingAlpha(cutoff: number, dt: number) {
  const tau = 1 / (2 * Math.PI * cutoff)
  return 1 / (1 + tau / dt)
}

export class OneEuroFilter {
  private x: number | null = null
  private dx = 0

  constructor(private params: OneEuroParams) {}

  reset() {
    this.x = null
    this.dx = 0
  }

  step(value: number, dt: number): number {
    if (this.x === null || !(dt > 0)) {
      this.x = value
      this.dx = 0
      return value
    }
    const rawDx = (value - this.x) / dt
    this.dx += smoothingAlpha(this.params.dCutoff, dt) * (rawDx - this.dx)
    const cutoff = this.params.minCutoff + this.params.beta * Math.abs(this.dx)
    this.x += smoothingAlpha(cutoff, dt) * (value - this.x)
    return this.x
  }
}

export interface LimiterState {
  p: number
  v: number
  a: number
}

type Limits = Pick<ChannelSpec, "min" | "max" | "vmax" | "amax" | "jmax">

const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi)

// Fraction of amax the braking curve plans with; the rest is headroom for
// the velocity loop to correct with. Tuned against filters.test.ts.
const BRAKE_DERATE = 0.8
// Velocity-loop gain, in units of the accel ramp bandwidth J/A.
const VELOCITY_GAIN = 2

export class MotionLimiter {
  p: number
  v = 0
  a = 0
  private prevGoal: number | null = null
  private goalVel = 0

  constructor(
    private limits: Limits,
    initial: number,
  ) {
    this.p = clamp(initial, limits.min, limits.max)
  }

  reset(position: number) {
    this.p = clamp(position, this.limits.min, this.limits.max)
    this.v = 0
    this.a = 0
    this.prevGoal = null
    this.goalVel = 0
  }

  /**
   * Advance one tick toward `target`.
   *
   * Cascaded controller:
   *   position error -> velocity command (jerk-aware braking curve + target
   *   velocity feedforward) -> acceleration command -> jerk-limited accel.
   * Every quantity is clamped to its limit before it's integrated, so the
   * limits hold no matter how wild the target is.
   */
  step(target: number, dt: number): number {
    const { min, max, vmax, amax, jmax } = this.limits
    if (!(dt > 0)) return this.p

    const goal = clamp(target, min, max)

    // Feedforward: how fast is the goal itself moving? Low-passed so noisy
    // targets don't turn into noisy velocity commands.
    const rawGoalVel = this.prevGoal === null ? 0 : (goal - this.prevGoal) / dt
    this.prevGoal = goal
    this.goalVel += Math.min(dt * 30, 1) * (clamp(rawGoalVel, -vmax, vmax) - this.goalVel)

    // Accel can't vanish instantly — look ahead to the state we'd reach after
    // unwinding the current accel at full jerk (tu = |a|/J). Steering on that
    // predicted state instead of the current one is what prevents
    // jerk-induced overshoot.
    const tu = Math.abs(this.a) / jmax
    const vPredicted = this.v + (this.a * tu) / 2
    const pPredicted = this.p + this.v * tu + (this.a * tu * tu) / 3

    // Largest speed (from zero accel) that can still stop within the error,
    // braking with accel ramped in at J: d = v²/2A + v·A/2J, solved for v.
    // Braking uses a derated accel so there's margin left for correction.
    const error = goal - pPredicted
    const aBrake = amax * BRAKE_DERATE
    const b = aBrake / (2 * jmax)
    const brakeSpeed = aBrake * (-b + Math.sqrt(b * b + (2 * Math.abs(error)) / aBrake))
    const vDes = clamp(this.goalVel + Math.sign(error) * brakeSpeed, -vmax, vmax)

    // Velocity loop, bandwidth matched to the accel ramp time (A/J).
    const aDes = clamp((vDes - vPredicted) * VELOCITY_GAIN * (jmax / amax), -amax, amax)

    // Jerk limit: accel may only move jmax*dt per tick.
    this.a = clamp(this.a + clamp(aDes - this.a, -jmax * dt, jmax * dt), -amax, amax)

    let nextV = clamp(this.v + this.a * dt, -vmax, vmax)
    let nextP = this.p + (this.v + nextV) * 0.5 * dt

    // Hard stops: never cross the position limits (a physical end stop would
    // kill the motion too, far less gently).
    if (nextP > max) {
      nextP = max
      nextV = Math.min(nextV, 0)
      this.a = Math.min(this.a, 0)
    } else if (nextP < min) {
      nextP = min
      nextV = Math.max(nextV, 0)
      this.a = Math.max(this.a, 0)
    }

    // Settle: close enough, slow enough, goal parked — land exactly on it.
    if (Math.abs(goal - nextP) < 0.02 && Math.abs(nextV) < 0.5 && Math.abs(this.goalVel) < 0.5) {
      nextP = goal
      nextV = 0
      this.a = 0
    }

    this.v = nextV
    this.p = nextP
    return this.p
  }
}
