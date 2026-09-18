"use client"

import { useEffect, useRef, useState } from "react"
import { ArchiveWindow } from "./archive-window"
import { fireShowControlCue, type ShowControlCue } from "@/lib/show-control-events"

interface CueStep {
  id: string
  tag: "STANDBY" | "GO"
  label: string
  cue?: ShowControlCue
  houseLights?: "down" | "up"
  openFolder?: string
  closeFolder?: boolean
}

// A guided tour through real projects — the effects (preheat, figure pose,
// starfield burst) are transitions between scenes, not the point of the cue.
const CUES: CueStep[] = [
  { id: "Q1", tag: "STANDBY", label: "HOUSE LIGHTS DOWN", houseLights: "down" },
  { id: "Q2", tag: "GO", label: "PRESET — HERITAGE FEST", cue: "preheat", openFolder: "Heritage Fest" },
  { id: "Q3", tag: "GO", label: "PRESET — R2D2", cue: "figure-to-show", openFolder: "R2D2" },
  { id: "Q4", tag: "GO", label: "PRESET — CORGICADE", openFolder: "Corgicade" },
  { id: "Q5", tag: "GO", label: "MAIN EFFECT — F.I.S.H.BOT", cue: "burst", openFolder: "F.I.S.H.Bot" },
  { id: "Q6", tag: "GO", label: "STRIKE — RESTORE HOUSE", houseLights: "up", closeFolder: true },
]

// A short synthesized relay/contactor click (no audio file) — real show-control
// racks make this exact sound when a cue fires. Lazily created so it only
// touches the AudioContext after a genuine user gesture (the GO press).
let audioCtx: AudioContext | null = null
function playRelayClick() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    if (!audioCtx) audioCtx = new Ctx()
    if (audioCtx.state === "suspended") audioCtx.resume()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = "square"
    osc.frequency.value = 180
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.05)
  } catch {
    // Web Audio unavailable — the show goes on silently.
  }
}

function formatTimecode(ms: number) {
  const pad = (n: number) => n.toString().padStart(2, "0")
  const totalSeconds = Math.floor(ms / 1000)
  const frames = Math.floor((ms % 1000) / 1000 * 30)
  const seconds = totalSeconds % 60
  const minutes = Math.floor(totalSeconds / 60) % 60
  const hours = Math.floor(totalSeconds / 3600)
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`
}

export function ShowControlWindow({
  onClose,
  onOpenFolder,
  onCloseFolder,
}: {
  onClose: () => void
  onOpenFolder: (name: string) => void
  onCloseFolder: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [running, setRunning] = useState(false)
  const [houseLightsDown, setHouseLightsDown] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const startRef = useRef(performance.now())

  useEffect(() => {
    const id = window.setInterval(() => setElapsedMs(performance.now() - startRef.current), 33)
    return () => window.clearInterval(id)
  }, [])

  const complete = currentIndex >= CUES.length

  const handleGo = () => {
    if (running) return

    if (complete) {
      setCurrentIndex(0)
      setHouseLightsDown(false)
      onCloseFolder()
      playRelayClick()
      return
    }

    const step = CUES[currentIndex]
    playRelayClick()
    setRunning(true)
    if (step.houseLights) setHouseLightsDown(step.houseLights === "down")
    if (step.openFolder) onOpenFolder(step.openFolder)
    if (step.closeFolder) onCloseFolder()
    if (step.cue) fireShowControlCue(step.cue)

    window.setTimeout(() => {
      setCurrentIndex((i) => i + 1)
      setRunning(false)
    }, 400)
  }

  const status = complete ? "COMPLETE" : running ? "EXECUTING" : currentIndex === 0 ? "READY" : "ARMED"

  return (
    <>
      {/* House lights: dims the desktop while the console itself stays lit */}
      <div
        className="pointer-events-none fixed inset-0 z-[45] bg-black transition-opacity duration-700"
        style={{ opacity: houseLightsDown ? 0.6 : 0 }}
        aria-hidden="true"
      />

      {/* A floating console, not a full-screen modal — the project it opens
          behind it is the point, so it stays out of the way in a corner. */}
      <div className="fixed top-14 right-3 md:right-6 z-50 w-[calc(100vw-1.5rem)] max-w-sm">
        <ArchiveWindow title="Show Control — Cue Stack" onClose={onClose}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-archive-border text-xs font-mono">
            <span className="text-archive-textMuted" suppressHydrationWarning>
              TC {formatTimecode(elapsedMs)}
            </span>
            <span className={running ? "text-archive-text font-bold" : "text-archive-textMuted"}>[{status}]</span>
          </div>

          <div className="border border-archive-border divide-y divide-archive-border mb-4">
            {CUES.map((step, i) => {
              const fired = i < currentIndex
              const isNext = i === currentIndex && !complete
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 px-2 py-1.5 text-xs font-mono ${
                    isNext ? "bg-archive-highlight text-archive-highlightText" : fired ? "text-archive-textMuted" : "text-archive-text"
                  }`}
                >
                  <span className="w-6 shrink-0">{fired ? "✓" : step.id}</span>
                  <span className="w-16 shrink-0 opacity-80">{step.tag}</span>
                  <span className="flex-1 truncate">{step.label}</span>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            onClick={handleGo}
            disabled={running}
            className="w-full border-2 border-archive-border bg-archive-highlight text-archive-highlightText font-mono font-bold text-sm py-2 tracking-widest hover:brightness-110 active:brightness-90 disabled:opacity-60 transition-all"
          >
            {complete ? "RESET" : "GO ▶"}
          </button>
        </ArchiveWindow>
      </div>
    </>
  )
}
