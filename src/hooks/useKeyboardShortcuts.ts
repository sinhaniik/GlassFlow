import { useEffect } from 'react'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

interface KeyboardShortcutOptions {
  onNewTask: () => void
  onEscape: () => void
  onDelete?: () => void
  onUndo?: () => void
  canUndo?: boolean
  disabled?: boolean
}

export function useKeyboardShortcuts({
  onNewTask,
  onEscape,
  onDelete,
  onUndo,
  canUndo = false,
  disabled = false,
}: KeyboardShortcutOptions) {
  useEffect(() => {
    if (disabled) return

    function handleKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        onNewTask()
        return
      }

      if (e.key === 'Escape') {
        onEscape()
        return
      }

      if (e.key === 'Delete' && onDelete) {
        e.preventDefault()
        onDelete()
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && onUndo) {
        if (!canUndo) return
        e.preventDefault()
        onUndo()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onNewTask, onEscape, onDelete, onUndo, canUndo, disabled])
}