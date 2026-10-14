import { useEffect } from 'react'

export function useKeyboardShortcuts({
  onNewTask,
  onSearch,
  onShowHelp,
}: {
  onNewTask: () => void
  onSearch: () => void
  onShowHelp: () => void
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target
      if (!(target instanceof HTMLElement) || target.isContentEditable) return
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === '/') {
        event.preventDefault()
        onSearch()
      } else if (event.key === '?') {
        event.preventDefault()
        onShowHelp()
      } else if (event.key.toLowerCase() === 'n') {
        event.preventDefault()
        onNewTask()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onNewTask, onSearch, onShowHelp])
}
