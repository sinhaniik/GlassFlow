import { useEffect } from 'react'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

interface KeyboardShortcutOptions {
  onNewTask: () => void
  onEscape: () => void
  disabled?: boolean
}

export function useKeyboardShortcuts({
  onNewTask,
  onEscape,
  disabled = false,
}: KeyboardShortcutOptions) {
  useEffect(() => {
    if (disabled) return

    function handleKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        onNewTask()
      }

      if (e.key === 'Escape') {
        onEscape()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onNewTask, onEscape, disabled])
}