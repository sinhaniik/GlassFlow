export function UndoToast({ onUndo }: { onUndo: () => void }) {
  return (
    <div
      className="undo-toast"
      role="status"
      aria-live="polite"
    >
      <span>Task deleted</span>
      <button type="button" className="undo-button" onClick={onUndo}>
        Undo
      </button>
    </div>
  )
}
