// Tiny event bus so the Show Control cue stack can trigger effects in
// sibling components (starfield, CRT flicker, ASCII logo) without prop
// drilling them all through the page.
export type ShowControlCue = "preheat" | "figure-to-show" | "burst"

const EVENT_NAME = "showcontrol:cue"

export function fireShowControlCue(cue: ShowControlCue) {
  window.dispatchEvent(new CustomEvent<ShowControlCue>(EVENT_NAME, { detail: cue }))
}

export function onShowControlCue(handler: (cue: ShowControlCue) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<ShowControlCue>).detail)
  window.addEventListener(EVENT_NAME, listener)
  return () => window.removeEventListener(EVENT_NAME, listener)
}
