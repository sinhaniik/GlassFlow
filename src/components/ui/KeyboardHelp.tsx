import { useEffect, useRef } from 'react'

const shortcuts = [
  ['N', 'Create a task'],
  ['/', 'Search tasks'],
  ['↑ ↓ ← →', 'Move focus between tasks'],
  ['Space', 'Pick up or place a card from its move control'],
  ['?', 'Show these shortcuts'],
  ['Esc', 'Close the current sheet'],
]

export function KeyboardHelp({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    return () => dialog.close()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="task-dialog shortcuts-dialog"
      aria-labelledby="shortcuts-title"
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === dialogRef.current) onClose() }}
    >
      <header className="dialog-header">
        <div><p className="eyebrow">Keyboard</p><h2 id="shortcuts-title">Shortcuts</h2></div>
        <button type="button" className="icon-button" aria-label="Close shortcuts" onClick={onClose}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg>
        </button>
      </header>
      <dl className="shortcut-list">
        {shortcuts.map(([key, label]) => (
          <div key={key} className="shortcut-row"><dt><kbd>{key}</kbd></dt><dd>{label}</dd></div>
        ))}
      </dl>
    </dialog>
  )
}
