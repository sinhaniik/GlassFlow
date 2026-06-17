import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { deleteTask, updateTask } from '../../features/kanban/kanbanSlice'
import type { AccentColor } from '../../features/kanban/types'
import { AccentPicker } from '../ui/AccentPicker'
import { ConfirmDialog } from '../ui/ConfirmDialog'

interface TaskModalProps {
  taskId: string | null
  onClose: () => void
}

export function TaskModal({ taskId, onClose }: TaskModalProps) {
  const dispatch = useAppDispatch()
  const task = useAppSelector((state) =>
    state.kanban.tasks.find((t) => t.id === taskId),
  )

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [accent, setAccent] = useState<AccentColor>('pink')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setDescription(task.description ?? '')
    setAccent(task.accent)
    setShowDeleteConfirm(false)
    requestAnimationFrame(() => titleRef.current?.focus())
  }, [task])

  useEffect(() => {
    if (!taskId) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !showDeleteConfirm) onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [taskId, onClose, showDeleteConfirm])

  if (!taskId || !task) return null

  function handleSave() {
    if (!task) return
    const trimmed = title.trim()
    if (!trimmed) return
    dispatch(
      updateTask({
        id: task.id,
        title: trimmed,
        description: description.trim() || undefined,
        accent,
      }),
    )
    onClose()
  }

  function handleDelete() {
    if (!task) return
    dispatch(deleteTask(task.id))
    setShowDeleteConfirm(false)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Close"
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-labelledby="task-modal-title"
          className="glass modal-enter relative w-full max-w-md rounded-2xl p-6"
        >
          <h2
            id="task-modal-title"
            className="text-lg font-semibold text-text-primary"
          >
            Edit task
          </h2>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-text-secondary">
                Title
              </span>
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave()
                }}
                className="glass-subtle w-full rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none transition focus:ring-2 focus:ring-accent-purple/40"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-text-secondary">
                Description
                <span className="font-normal"> (optional)</span>
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Add notes or details…"
                className="glass-subtle w-full resize-none rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none transition focus:ring-2 focus:ring-accent-purple/40"
              />
            </label>

            <div>
              <span className="mb-2 block text-xs font-medium text-text-secondary">
                Accent color
              </span>
              <AccentPicker value={accent} onChange={setAccent} />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm font-medium text-text-secondary transition hover:text-text-primary"
            >
              Delete task
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="glass-subtle rounded-xl px-4 py-2 text-sm font-medium text-text-primary transition hover:opacity-80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!title.trim()}
                className="rounded-xl bg-accent-purple px-4 py-2 text-sm font-medium text-text-primary transition hover:opacity-90 disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete task?"
          message={`"${task.title}" will be permanently removed.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  )
}