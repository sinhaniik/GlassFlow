export function KeyboardHints() {
  return (
    <footer className="mx-auto max-w-[min(96vw,1400px)] px-3 pb-4">
      <div className="glass-subtle flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-xl px-4 py-2.5 text-xs text-text-secondary">
        <Hint keys="N" label="New task" />
        <span className="hidden sm:inline text-text-secondary/40">·</span>
        <Hint keys="Esc" label="Close" />
        <span className="hidden sm:inline text-text-secondary/40">·</span>
        <span className="hidden sm:inline">Double-click to rename</span>
      </div>
    </footer>
  )
}

function Hint({ keys, label }: { keys: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <kbd className="glass rounded px-1.5 py-0.5 font-mono text-[10px] text-text-primary">
        {keys}
      </kbd>
      {label}
    </span>
  )
}