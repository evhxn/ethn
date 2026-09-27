"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { ArchiveWindow } from "../archive-window"
import { ChannelGraph } from "./channel-graph"
import { drawFigure } from "./draw-figure"
import { CHANNELS, type ChannelFrame, type ChannelId, type ChannelSpec } from "@/lib/motion-studio/channels"
import { DEFAULT_CHARACTER, type CharacterParams } from "@/lib/motion-studio/character"
import { DEFAULT_ONE_EURO, type OneEuroParams } from "@/lib/motion-studio/filters"
import { DEMO_TAKE_NAME, makeDemoTake } from "@/lib/motion-studio/demo-take"
import { downloadText, toArduinoSketch, toCsv, toShowJson } from "@/lib/motion-studio/export"
import { LivePipeline, processTake, type CaptureSample, type ProcessedTake, type Take } from "@/lib/motion-studio/pipeline"
import { DEFAULT_RETARGET, headAnglesFromMatrix, retarget } from "@/lib/motion-studio/retarget"
import type { Tracker, TrackerFrame } from "@/lib/motion-studio/tracker"

const RATE = 50
const MAX_TAKE_SECONDS = 30
const POSE_BONES: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24],
]

type CameraState = "off" | "loading" | "live" | "error"

function frameAt(p: ProcessedTake, i: number, kind: "raw" | "output"): ChannelFrame {
  const idx = Math.min(Math.max(Math.round(i), 0), p.frameCount - 1)
  return Object.fromEntries(CHANNELS.map((c) => [c.id, p.tracks[c.id][kind][idx]])) as ChannelFrame
}

function timecode(frame: number, rate: number) {
  const pad = (n: number) => n.toString().padStart(2, "0")
  const total = Math.floor(frame / rate)
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}:${pad(Math.floor(frame % rate))}`
}

function Btn({
  children,
  onClick,
  disabled,
  active,
  title,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  active?: boolean
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={active}
      className={`border-2 border-archive-border px-2.5 py-1 text-[11px] font-mono font-bold tracking-wide transition-all outline-none focus-visible:outline-dashed focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-archive-border disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-archive-highlight text-archive-highlightText" : "bg-archive-card text-archive-text hover:bg-archive-highlight/30"
      }`}
    >
      {children}
    </button>
  )
}

function Panel({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col border border-archive-border bg-archive-card ${className ?? ""}`}>
      <header className="border-b border-archive-border bg-archive-menubar px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest text-archive-text">
        {title}
      </header>
      {children}
    </section>
  )
}

function NumberField({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="flex items-center justify-between gap-2 text-[10px] font-mono text-archive-textMuted">
      {label}
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => {
          const v = Number(e.target.value)
          if (Number.isFinite(v)) onChange(v)
        }}
        className="w-20 border border-archive-border bg-archive-bg px-1 py-0.5 text-right text-[11px] text-archive-text"
      />
    </label>
  )
}

export function MotionStudioWindow({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"studio" | "readme">("studio")
  const [channels, setChannels] = useState<ChannelSpec[]>(CHANNELS)
  const [oneEuro, setOneEuro] = useState<OneEuroParams>(DEFAULT_ONE_EURO)
  const [character, setCharacter] = useState<CharacterParams>(DEFAULT_CHARACTER)
  const [take, setTake] = useState<Take>(() => makeDemoTake())
  const [playhead, setPlayhead] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [ghost, setGhost] = useState(true)
  const [selected, setSelected] = useState<ChannelId>("headYaw")
  const [mirror, setMirror] = useState(true)
  const [camera, setCamera] = useState<CameraState>("off")
  const [cameraError, setCameraError] = useState("")
  const [countdown, setCountdown] = useState<number | null>(null)
  const [recording, setRecording] = useState(false)
  const [recSeconds, setRecSeconds] = useState(0)
  const [liveValues, setLiveValues] = useState<Record<ChannelId, number> | null>(null)
  const [calibrated, setCalibrated] = useState(false)
  const takeCount = useRef(0)

  const figureRef = useRef<HTMLCanvasElement>(null)
  const rawRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const trackerRef = useRef<Tracker | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const liveRef = useRef<LivePipeline | null>(null)
  const recordingRef = useRef(false)
  const recStartRef = useRef(0)
  const recSamplesRef = useRef<CaptureSample[]>([])
  const lastMatrixRef = useRef<number[] | null>(null)
  const headZeroRef = useRef(DEFAULT_RETARGET.headZero)
  const mirrorRef = useRef(mirror)
  mirrorRef.current = mirror

  const processed = useMemo(() => processTake(take, { rate: RATE, oneEuro, character, channels }), [take, oneEuro, character, channels])
  const live = camera === "live" || camera === "loading"
  const selectedSpec = channels.find((c) => c.id === selected)!
  const source = live ? "camera" : take.name === DEMO_TAKE_NAME ? "demo" : "take"

  const totals = useMemo(() => {
    let rawViolations = 0
    let limited = 0
    for (const c of channels) {
      rawViolations += processed.tracks[c.id].rawViolations
      limited += processed.tracks[c.id].limitedTicks
    }
    return { rawViolations, limitedPct: (limited / (processed.frameCount * channels.length)) * 100 }
  }, [processed, channels])

  // ---- Playback clock -------------------------------------------------------
  useEffect(() => {
    if (!playing || live) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      // rAF timestamps are frame-start times and can precede `last` on the first tick.
      const dt = Math.max(0, now - last) / 1000
      last = now
      setPlayhead((f) => {
        const next = f + dt * RATE
        return next >= processed.frameCount - 1 ? 0 : next
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, live, processed.frameCount])

  // ---- Draw playback frames -------------------------------------------------
  useEffect(() => {
    if (live) return
    const out = frameAt(processed, playhead, "output")
    const raw = frameAt(processed, playhead, "raw")
    if (figureRef.current) drawFigure(figureRef.current, out, { ghost: ghost ? raw : undefined, label: "FIGURE · 50 Hz" })
    if (rawRef.current) drawFigure(rawRef.current, raw, { mode: "scope", label: `RAW · ${take.name}` })
  }, [processed, playhead, ghost, live, take.name])

  // Redraw on resize while paused.
  useEffect(() => {
    const onResize = () => setPlayhead((f) => f)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // ---- Camera ---------------------------------------------------------------
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    recordingRef.current = false
    setRecording(false)
    setCountdown(null)
    setLiveValues(null)
    setCamera("off")
  }, [])

  const startCamera = async () => {
    setCameraError("")
    setCamera("loading")
    setPlaying(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current!
      video.srcObject = stream
      await video.play()
      if (!trackerRef.current) {
        const { createTracker } = await import("@/lib/motion-studio/tracker")
        trackerRef.current = await createTracker()
      }
      liveRef.current = new LivePipeline({ rate: RATE, oneEuro, character, channels })
      setCamera("live")
    } catch (err) {
      stopCamera()
      const name = (err as { name?: string })?.name
      setCameraError(
        name === "NotAllowedError"
          ? "Camera permission was denied — the demo take still works."
          : name === "NotFoundError"
            ? "No camera found — the demo take still works."
            : "Couldn't start tracking (models load from a CDN; check your connection).",
      )
      setCamera("error")
    }
  }

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      trackerRef.current?.close()
    },
    [],
  )

  const finishRecording = useCallback(() => {
    if (!recordingRef.current) return
    recordingRef.current = false
    setRecording(false)
    const samples = recSamplesRef.current
    const duration = (performance.now() - recStartRef.current) / 1000
    stopCamera()
    if (samples.length < 15) {
      setCameraError("Take was too short — hold still in frame and try again.")
      return
    }
    takeCount.current += 1
    setTake({ name: `take_${String(takeCount.current).padStart(2, "0")}`, duration, samples })
    setPlayhead(0)
    setPlaying(true)
  }, [stopCamera])

  // Live tracking loop: detect -> retarget -> live pipeline -> draw (+ record).
  useEffect(() => {
    if (camera !== "live") return
    let raf = 0
    let lastVideoTime = -1
    let frames = 0
    const video = videoRef.current!
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const tracker = trackerRef.current
      if (!tracker || video.readyState < 2 || video.currentTime === lastVideoTime) return
      lastVideoTime = video.currentTime
      const now = performance.now()
      let result: TrackerFrame
      try {
        result = tracker.detect(video, now)
      } catch {
        return
      }
      if (result.face?.matrix) lastMatrixRef.current = result.face.matrix
      const values = retarget(result.face, result.pose, { mirror: mirrorRef.current, headZero: headZeroRef.current })
      const out = liveRef.current!.step({ t: now / 1000, values })

      if (figureRef.current) drawFigure(figureRef.current, out, { label: recordingRef.current ? "● REC · LIVE" : "LIVE" })
      drawOverlay(overlayRef.current, video, result)

      if (recordingRef.current) {
        const t = (now - recStartRef.current) / 1000
        recSamplesRef.current.push({ t, values })
        if (frames % 10 === 0) setRecSeconds(t)
        if (t >= MAX_TAKE_SECONDS) finishRecording()
      }
      if (frames++ % 6 === 0) setLiveValues(out)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [camera, finishRecording])

  const startRecording = () => {
    setCountdown(3)
    let n = 3
    const id = window.setInterval(() => {
      n -= 1
      if (n > 0) {
        setCountdown(n)
        return
      }
      window.clearInterval(id)
      setCountdown(null)
      if (!streamRef.current) return
      recSamplesRef.current = []
      recStartRef.current = performance.now()
      recordingRef.current = true
      setRecSeconds(0)
      setRecording(true)
    }, 1000)
  }

  const calibrate = () => {
    if (!lastMatrixRef.current) return
    headZeroRef.current = headAnglesFromMatrix(lastMatrixRef.current)
    setCalibrated(true)
  }

  const loadDemo = () => {
    if (live) stopCamera()
    setTake(makeDemoTake())
    setPlayhead(0)
    setPlaying(true)
  }

  const updateSelected = (patch: Partial<ChannelSpec>) =>
    setChannels((cs) => cs.map((c) => (c.id === selected ? { ...c, ...patch } : c)))

  // Space toggles playback (outside of form fields).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || live) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return
      e.preventDefault()
      setPlaying((p) => !p)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [live])

  const status = recording
    ? `● REC ${recSeconds.toFixed(1)}s / ${MAX_TAKE_SECONDS}s`
    : countdown !== null
      ? `REC IN ${countdown}…`
      : camera === "loading"
        ? "LOADING TRACKER…"
        : camera === "live"
          ? "LIVE — TRACKING"
          : playing
            ? "PLAYBACK"
            : "PAUSED"

  const currentValue = (id: ChannelId) =>
    liveValues && live ? liveValues[id] : processed.tracks[id].output[Math.min(Math.max(Math.round(playhead), 0), processed.frameCount - 1)]

  // z-[47]: above the desktop and helper, below the Show Control console so a cue can open it.
  return (
    <div className="fixed inset-0 z-[47] flex items-start justify-center p-2 pt-10 md:p-6 md:pt-12">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <ArchiveWindow title="Motion Studio — Animatronic Motion Authoring" onClose={onClose} className="relative z-50 w-full max-w-6xl">
        <div className="max-h-[calc(100vh-7.5rem)] overflow-y-auto overflow-x-hidden pr-1" data-lenis-prevent>
          {/* Tabs */}
          <div className="mb-3 flex items-center gap-1 border-b border-archive-border pb-2">
            <Btn active={tab === "studio"} onClick={() => setTab("studio")}>STUDIO</Btn>
            <Btn active={tab === "readme"} onClick={() => setTab("readme")}>README.txt</Btn>
            <span className="ml-auto text-[10px] font-mono text-archive-textMuted">{"Archive > Motion Studio"}</span>
          </div>

          {tab === "readme" ? (
            <Readme />
          ) : (
            <>
              {/* Toolbar */}
              <div className="mb-3 flex flex-wrap items-center gap-1.5">
                {/* Source selector: demo take (default) or live camera. A recorded take selects neither. */}
                <Btn
                  active={source === "demo"}
                  onClick={loadDemo}
                  disabled={recording || countdown !== null}
                  title="Play the bundled demo performance"
                >
                  {source === "demo" ? "◉" : "○"} DEMO TAKE
                </Btn>
                <Btn
                  active={source === "camera"}
                  onClick={live ? stopCamera : startCamera}
                  disabled={recording || countdown !== null}
                  title={live ? "Turn the camera off" : "Track yourself with the webcam — video never leaves your browser"}
                >
                  {source === "camera" ? "◉" : "○"} CAMERA
                </Btn>
                {recording ? (
                  <Btn active onClick={finishRecording}>■ STOP</Btn>
                ) : (
                  <Btn onClick={startRecording} disabled={camera !== "live" || countdown !== null}>● REC</Btn>
                )}
                <Btn onClick={calibrate} disabled={camera !== "live"} title="Look straight at the camera, then click to zero the head">
                  {calibrated ? "RE-CALIBRATE" : "CALIBRATE"}
                </Btn>
                <label className="ml-1 flex items-center gap-1 text-[11px] font-mono text-archive-text">
                  <input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} />
                  Mirror
                </label>
                <span className={`ml-auto text-[11px] font-mono font-bold ${recording ? "text-[#a04030]" : "text-archive-text"}`}>[{status}]</span>
              </div>
              {cameraError && (
                <p className="mb-3 border border-archive-border bg-[#fffde8] px-2 py-1 text-[11px] font-mono text-archive-text">{cameraError}</p>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Performer / raw */}
                <Panel title={live ? "PERFORMER — WEBCAM" : "BEFORE — RAW CAPTURE"}>
                  <div className="relative aspect-[4/3] bg-archive-desktop lg:aspect-[16/10]">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className={`absolute inset-0 h-full w-full object-cover ${live ? "" : "hidden"}`}
                      style={{ transform: mirror ? "scaleX(-1)" : undefined }}
                    />
                    <canvas
                      ref={overlayRef}
                      className={`absolute inset-0 h-full w-full ${live ? "" : "hidden"}`}
                      style={{ transform: mirror ? "scaleX(-1)" : undefined }}
                    />
                    <canvas ref={rawRef} className={`absolute inset-0 h-full w-full ${live ? "hidden" : ""}`} />
                    {camera === "loading" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-center text-[11px] font-mono text-[#d4c89a]">
                        Loading face + pose models (~12 MB)…
                        <br />
                        Video stays on this device.
                      </div>
                    )}
                    {countdown !== null && (
                      <div className="absolute inset-0 flex items-center justify-center text-6xl font-mono font-bold text-[#d4c89a] drop-shadow-lg">
                        {countdown}
                      </div>
                    )}
                  </div>
                </Panel>

                {/* Figure */}
                <Panel title={live ? "FIGURE — LIVE (FILTERED + LIMITED)" : "AFTER — FIGURE OUTPUT"}>
                  <div className="relative aspect-[4/3] bg-archive-desktop lg:aspect-[16/10]">
                    <canvas ref={figureRef} className="absolute inset-0 h-full w-full" />
                  </div>
                </Panel>

              </div>

              {/* Transport */}
              <div className="mt-3 flex items-center gap-2 border border-archive-border bg-archive-card px-2 py-1.5">
                <Btn onClick={() => setPlaying((p) => !p)} disabled={live}>
                  {playing ? "❚❚" : "▶"}
                </Btn>
                <span className="w-20 shrink-0 text-[11px] font-mono text-archive-text">{timecode(playhead, RATE)}</span>
                <input
                  type="range"
                  min={0}
                  max={processed.frameCount - 1}
                  step={1}
                  value={Math.round(playhead)}
                  disabled={live}
                  onChange={(e) => {
                    setPlaying(false)
                    setPlayhead(Number(e.target.value))
                  }}
                  className="min-w-0 flex-1 accent-[#5a5a58]"
                  aria-label="Scrub take"
                />
                <span className="hidden shrink-0 text-[11px] font-mono text-archive-textMuted sm:inline">{timecode(processed.frameCount - 1, RATE)}</span>
                <label className="flex shrink-0 items-center gap-1 text-[11px] font-mono text-archive-text">
                  <input type="checkbox" checked={ghost} onChange={(e) => setGhost(e.target.checked)} />
                  Ghost
                </label>
              </div>

              {/* Pipeline / export */}
              <div className="mt-3 grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Panel title="SMOOTHING — ONE EURO">
                  <div className="flex flex-col gap-2 p-2">
                    <label className="text-[10px] font-mono text-archive-textMuted">
                      Min cutoff {oneEuro.minCutoff.toFixed(2)} Hz
                      <input
                        type="range"
                        min={0.1}
                        max={5}
                        step={0.05}
                        value={oneEuro.minCutoff}
                        onChange={(e) => setOneEuro({ ...oneEuro, minCutoff: Number(e.target.value) })}
                        className="w-full accent-[#5a5a58]"
                      />
                    </label>
                    <label className="text-[10px] font-mono text-archive-textMuted">
                      Speed coefficient β {oneEuro.beta.toFixed(3)}
                      <input
                        type="range"
                        min={0}
                        max={0.2}
                        step={0.005}
                        value={oneEuro.beta}
                        onChange={(e) => setOneEuro({ ...oneEuro, beta: Number(e.target.value) })}
                        className="w-full accent-[#5a5a58]"
                      />
                    </label>
                  </div>
                </Panel>

                <Panel title="CHARACTER">
                  <div className="flex flex-col gap-2 p-2">
                    {(
                      [
                        ["life", "Life", "Breathing + idle drift"],
                        ["followThrough", "Follow-through", "Springy overshoot & settle"],
                        ["overlap", "Overlap", "Elbows & roll trail their drivers"],
                      ] as const
                    ).map(([key, label, hint]) => (
                      <label key={key} className="text-[10px] font-mono text-archive-textMuted" title={hint}>
                        {label} {Math.round(character[key] * 100)}%
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={character[key]}
                          onChange={(e) => setCharacter({ ...character, [key]: Number(e.target.value) })}
                          className="w-full accent-[#5a5a58]"
                        />
                      </label>
                    ))}
                    <label className="flex items-center gap-1 text-[10px] font-mono text-archive-text" title="Blink on fast head turns and at idle">
                      <input type="checkbox" checked={character.autoBlink} onChange={(e) => setCharacter({ ...character, autoBlink: e.target.checked })} />
                      Auto-blink
                    </label>
                  </div>
                </Panel>

                <Panel title={`LIMITS — ${selectedSpec.label.toUpperCase()}`}>
                  <div className="flex flex-col gap-1 p-2">
                    <NumberField label="Min (°)" value={selectedSpec.min} onChange={(v) => updateSelected({ min: Math.min(v, selectedSpec.max - 1) })} />
                    <NumberField label="Max (°)" value={selectedSpec.max} onChange={(v) => updateSelected({ max: Math.max(v, selectedSpec.min + 1) })} />
                    <NumberField label="Vel (°/s)" value={selectedSpec.vmax} step={10} onChange={(v) => updateSelected({ vmax: Math.max(v, 1) })} />
                    <NumberField label="Accel (°/s²)" value={selectedSpec.amax} step={100} onChange={(v) => updateSelected({ amax: Math.max(v, 10) })} />
                    <NumberField label="Jerk (°/s³)" value={selectedSpec.jmax} step={1000} onChange={(v) => updateSelected({ jmax: Math.max(v, 100) })} />
                    <button
                      type="button"
                      onClick={() => setChannels(CHANNELS)}
                      className="mt-1 self-end text-[10px] font-mono text-archive-textMuted underline underline-offset-2 hover:text-archive-text"
                    >
                      reset all limits
                    </button>
                  </div>
                </Panel>

                <Panel title="EXPORT">
                  <div className="flex flex-col gap-1.5 p-2">
                    <div className="grid grid-cols-2 gap-x-2 text-[10px] font-mono">
                      <span className="text-archive-textMuted">Frames</span>
                      <span className="text-right text-archive-text">
                        {processed.frameCount} @ {RATE} Hz
                      </span>
                      <span className="text-archive-textMuted">Raw limit breaks</span>
                      <span className="text-right text-archive-text">{totals.rawViolations}</span>
                      <span className="text-archive-textMuted">Limiter engaged</span>
                      <span className="text-right text-archive-text">{totals.limitedPct.toFixed(1)}%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <Btn onClick={() => downloadText(`${take.name}.ino`, toArduinoSketch(processed, channels, take.name))} disabled={live} title="Arduino/ESP32 sketch for a PCA9685 servo driver">
                        .INO
                      </Btn>
                      <Btn onClick={() => downloadText(`${take.name}.json`, toShowJson(processed, channels, take.name), "application/json")} disabled={live}>
                        .JSON
                      </Btn>
                      <Btn onClick={() => downloadText(`${take.name}.csv`, toCsv(processed, channels), "text/csv")} disabled={live}>
                        .CSV
                      </Btn>
                    </div>
                  </div>
                </Panel>
              </div>

              {/* Channels */}
              <Panel title="CHANNELS — RAW (GREY) vs FIGURE OUTPUT (BLACK) · CLICK TO EDIT LIMITS" className="mt-3">
                <div className="divide-y divide-archive-border">
                  {channels.map((c) => {
                    const t = processed.tracks[c.id]
                    const isSel = c.id === selected
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelected(c.id)}
                        aria-label={`${c.label} channel — edit limits`}
                        aria-pressed={isSel}
                        className={`grid w-full grid-cols-[76px_1fr_52px] items-center gap-2 px-2 py-1 text-left sm:grid-cols-[92px_1fr_56px_64px] ${
                          isSel ? "bg-archive-highlight/20" : "hover:bg-archive-highlight/10"
                        }`}
                      >
                        <span className={`text-[10px] font-mono ${isSel ? "font-bold text-archive-text" : "text-archive-text"}`}>
                          {isSel ? "▸ " : ""}
                          {c.label}
                        </span>
                        <span className="h-9">
                          <ChannelGraph spec={c} track={t} playhead={playhead} />
                        </span>
                        <span className="text-right text-[11px] font-mono tabular-nums text-archive-text">{currentValue(c.id).toFixed(1)}°</span>
                        <span
                          className={`hidden text-right text-[10px] font-mono sm:inline ${t.rawViolations > 0 ? "text-[#a04030]" : "text-archive-textMuted"}`}
                          title="Frames where the raw capture broke this channel's position or velocity limits"
                        >
                          {t.rawViolations > 0 ? `⚠ ${t.rawViolations}` : "ok"}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </Panel>
            </>
          )}
        </div>
      </ArchiveWindow>
    </div>
  )
}

function drawOverlay(canvas: HTMLCanvasElement | null, video: HTMLVideoElement, r: TrackerFrame) {
  if (!canvas) return
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.clearRect(0, 0, w, h)

  // Match the video's object-cover crop so landmarks line up with the image.
  const vw = video.videoWidth || 640
  const vh = video.videoHeight || 480
  const scale = Math.max(w / vw, h / vh)
  const ox = (w - vw * scale) / 2
  const oy = (h - vh * scale) / 2
  const px = (x: number) => ox + x * vw * scale
  const py = (y: number) => oy + y * vh * scale

  if (r.faceImage) {
    ctx.fillStyle = "rgba(212, 200, 154, 0.7)"
    for (let i = 0; i < r.faceImage.length; i += 9) {
      const p = r.faceImage[i]
      ctx.fillRect(px(p.x) - 1, py(p.y) - 1, 2, 2)
    }
  }
  if (r.poseImage) {
    ctx.strokeStyle = "#d4c89a"
    ctx.lineWidth = 3
    ctx.lineCap = "round"
    for (const [a, b] of POSE_BONES) {
      const pa = r.poseImage[a]
      const pb = r.poseImage[b]
      if (!pa || !pb || (pa.visibility ?? 1) < 0.5 || (pb.visibility ?? 1) < 0.5) continue
      ctx.beginPath()
      ctx.moveTo(px(pa.x), py(pa.y))
      ctx.lineTo(px(pb.x), py(pb.y))
      ctx.stroke()
    }
    ctx.fillStyle = "#c86a4a"
    for (const i of [11, 12, 13, 14, 15, 16]) {
      const p = r.poseImage[i]
      if (!p || (p.visibility ?? 1) < 0.5) continue
      ctx.beginPath()
      ctx.arc(px(p.x), py(p.y), 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function Readme() {
  return (
    <div className="space-y-4 text-xs font-mono leading-relaxed text-archive-text">
      <section className="border border-archive-border bg-archive-card p-3">
        <h3 className="mb-1 font-bold">MOTION STUDIO</h3>
        <p className="text-archive-textMuted">
          A browser-based motion authoring tool for animatronic figures. Perform in front of a webcam, and the studio turns your head, jaw, eyelids,
          and arms into servo trajectories a real figure can play back — then exports them as an Arduino/ESP32 sketch.
        </p>
      </section>

      <section className="border border-archive-border bg-archive-card p-3">
        <h3 className="mb-2 font-bold">PIPELINE</h3>
        <pre className="overflow-x-auto whitespace-pre text-[10px] leading-snug text-archive-textMuted">{`webcam ─▶ MediaPipe ─▶ retarget ─▶ resample ─▶ One Euro ─▶ character ─▶ jerk limiter ─▶ servo frames
 ~30fps    face+pose   joint       fixed      adaptive     overlap,      pos/vel/acc/    50 Hz µs
 jittery   landmarks   angles      50 Hz      low-pass     spring, life  jerk bounded    .ino/.json/.csv`}</pre>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-archive-textMuted">
          <li>
            <b className="text-archive-text">Tracking.</b> MediaPipe runs in WebAssembly/WebGL on your machine. The face model gives a head
            transform matrix plus blendshapes (jawOpen, eyeBlink); the pose model gives 3D shoulder/elbow/wrist positions.
          </li>
          <li>
            <b className="text-archive-text">Retargeting.</b> Head yaw/pitch/roll come from decomposing the rotation matrix in pan → tilt → roll
            order, the way a neck mechanism is stacked. Arm angles are vector angles between torso and limb segments in 3D.
          </li>
          <li>
            <b className="text-archive-text">Resampling.</b> Camera frames arrive with jittery timing and dropouts. Every channel is resampled
            onto a fixed 50 Hz grid; short gaps interpolate, long dropouts hold.
          </li>
          <li>
            <b className="text-archive-text">Smoothing.</b> A One Euro filter (Casiez et al. 2012) smooths heavily when you&apos;re still and
            lightly when you move fast, trading jitter for lag only where it&apos;s invisible.
          </li>
          <li>
            <b className="text-archive-text">Character.</b> Tracked motion sent straight to servos looks robotic: joints move
            independently, stop dead, and hold perfectly still. This stage applies animation principles as signal processing —
            overlapping action (elbows and head roll trail their drivers), follow-through (a slightly underdamped spring so moves
            settle instead of stopping), secondary motion (breathing and idle drift), and blinks on fast head turns.
          </li>
          <li>
            <b className="text-archive-text">Motion limiting.</b> Each channel has position, velocity, acceleration, and jerk limits. A
            cascaded tracking controller (braking curve → velocity loop → jerk-limited accel, run at 200 Hz) follows the smoothed target but
            can never exceed them. That&apos;s what stops a real figure from slamming into end stops, stripping gears, or visibly
            &quot;snapping&quot; — and why the one-frame tracking glitch in the demo take never reaches the figure.
          </li>
          <li>
            <b className="text-archive-text">Export.</b> Frames are mapped to servo pulse widths and written into a PROGMEM table in a
            self-contained sketch for a PCA9685 servo driver, with fixed-rate, drift-free playback.
          </li>
        </ol>
      </section>

      <section className="border border-archive-border bg-archive-card p-3">
        <h3 className="mb-1 font-bold">TRY IT</h3>
        <ul className="list-disc space-y-1 pl-5 text-archive-textMuted">
          <li>Watch the demo take: the left view is what the tracker saw, the right is what the servos get.</li>
          <li>Drag the One Euro sliders or tighten a channel&apos;s velocity limit and watch the black trace change.</li>
          <li>Turn on the camera, click CALIBRATE while looking straight ahead, then REC. Wave, nod, talk.</li>
          <li>Export the .ino and flash it to an Arduino/ESP32 + PCA9685 to play it on real servos.</li>
        </ul>
      </section>

      <section className="border border-archive-border bg-archive-card p-3">
        <h3 className="mb-1 font-bold">STACK</h3>
        <p className="text-archive-textMuted">
          TypeScript · React · Canvas 2D (1-bit ordered dithering) · MediaPipe Tasks Vision (WASM) · Vitest. The filter, limiter, and pipeline are unit-tested for limit
          compliance, settling, overshoot, and glitch rejection.
        </p>
      </section>
    </div>
  )
}
