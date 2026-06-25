import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    confirmRef.current?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-3 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Cancel"
        className="modal-backdrop absolute inset-0"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="confirm-dialog modal-panel modal-enter relative w-full max-w-sm rounded-t-2xl p-4 sm:rounded-2xl sm:p-6"
      >
        <h3
          id="confirm-title"
          className="text-base font-bold tracking-tight text-text-primary"
        >
          {title}
        </h3>
        <p id="confirm-message" className="mt-2 text-sm text-text-secondary">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="pressable glass-subtle rounded-xl px-4 py-2 text-sm font-medium text-text-primary"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="pressable rounded-xl bg-accent-pink px-4 py-2 text-sm font-semibold text-text-primary shadow-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}