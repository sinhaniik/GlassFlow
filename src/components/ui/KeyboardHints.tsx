export function KeyboardHints() {
  return (
    <footer className="keyboard-hints mx-auto w-full max-w-[87.5rem] px-3 pb-3 sm:pb-4 lg:px-6">
      <div className="keyboard-hints__bar glass-card flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 rounded-xl px-4 py-3 text-xs text-text-secondary">
        <Hint keys="⌘K" label="Search" />
        <span className="hidden sm:inline text-text-secondary/40">·</span>
        <Hint keys="N" label="New task" />
        <span className="hidden sm:inline text-text-secondary/40">·</span>
        <Hint keys="Del" label="Delete task" />
        <span className="hidden sm:inline text-text-secondary/40">·</span>
        <Hint keys="⌘Z" label="Undo" />
        <span className="hidden sm:inline text-text-secondary/40">·</span>
        <Hint keys="Esc" label="Close" />
        <span className="hidden sm:inline text-text-secondary/40">·</span>
        <span className="hidden sm:inline">Double-click to rename</span>
        <span className="sm:hidden text-text-secondary/40">·</span>
        <span className="sm:hidden">Hold to drag</span>
      </div>
    </footer>
  )
}

function Hint({ keys, label }: { keys: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <kbd className="glass-card rounded px-1.5 py-0.5 text-[10px] text-text-primary">
        {keys}
      </kbd>
      {label}
    </span>
  )
}