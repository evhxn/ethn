"use client"

export function RetroToggle({
  checked,
  onChange,
  label,
  ariaLabel,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className="group flex items-center gap-1.5"
    >
      {label && (
        <span className="text-[10px] font-mono text-archive-textMuted transition-colors group-hover:text-archive-text">
          {label}
        </span>
      )}
      <span
        className={`inline-flex h-3.5 w-7 shrink-0 items-center border border-archive-border px-0.5 transition-colors ${
          checked ? "bg-archive-highlight" : "bg-archive-card"
        }`}
      >
        <span
          className={`h-2 w-2.5 border border-archive-border bg-archive-bg transition-transform duration-150 ${
            checked ? "translate-x-[12px]" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  )
}
