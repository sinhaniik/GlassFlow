import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { deleteTask, updateTask } from '../../features/kanban/kanbanSlice'
import type {
  AccentColor,
  TaskAttachment,
  TaskComment,
  TaskPriority,
} from '../../features/kanban/types'
import { AccentPicker } from '../ui/AccentPicker'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { LabelPicker } from '../ui/LabelPicker'
import { PriorityPicker } from '../ui/PriorityPicker'
import { TaskAttachmentsField } from './TaskAttachmentsField'
import { TaskCommentsField } from './TaskCommentsField'

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
  const [dueDate, setDueDate] = useState('')
  const [assignee, setAssignee] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [attachments, setAttachments] = useState<TaskAttachment[]>([])
  const [comments, setComments] = useState<TaskComment[]>([])
  const [accent, setAccent] = useState<AccentColor>('pink')
  const [priority, setPriority] = useState<TaskPriority>('low')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setDescription(task.description ?? '')
    setDueDate(task.dueDate ?? '')
    setAssignee(task.assignee ?? '')
    setLabels(task.labels ?? [])
    setAttachments(task.attachments ?? [])
    setComments(task.comments ?? [])
    setAccent(task.accent)
    setPriority(task.priority ?? 'low')
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
        dueDate: dueDate || undefined,
        assignee: assignee.trim() || undefined,
        labels: labels.length > 0 ? labels : undefined,
        attachments,
        comments,
        accent,
        priority,
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
      <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4">
        <button
          type="button"
          aria-label="Close"
          className="modal-backdrop absolute inset-0"
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-labelledby="task-modal-title"
          className="glass-elevated modal-enter relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl p-4 sm:max-h-[90dvh] sm:rounded-2xl sm:p-6"
        >
          <h2
            id="task-modal-title"
            className="text-lg font-semibold text-text-primary"
          >
            Edit task
          </h2>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-text-primary">
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
                className="glass-input w-full rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none transition"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-text-primary">
                Description
                <span className="font-normal text-text-secondary"> (optional)</span>
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Add notes or details…"
                className="glass-input w-full resize-none rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none transition"
              />
            </label>

            <div>
              <span className="mb-2 block text-xs font-semibold text-text-primary">
                Priority
              </span>
              <PriorityPicker value={priority} onChange={setPriority} />
            </div>

            <div>
              <span className="mb-2 block text-xs font-semibold text-text-primary">
                Labels
                <span className="font-normal text-text-secondary"> (optional)</span>
              </span>
              <LabelPicker value={labels} onChange={setLabels} />
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-text-primary">
                Due date
                <span className="font-normal text-text-secondary"> (optional)</span>
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="glass-input flex-1 rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none transition"
                />
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="glass-subtle shrink-0 rounded-xl px-3 py-2.5 text-xs font-medium text-text-secondary transition hover:text-text-primary"
                  >
                    Clear
                  </button>
                )}
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-text-primary">
                Assignee
                <span className="font-normal text-text-secondary"> (optional)</span>
              </span>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Who owns this task?"
                className="glass-input w-full rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none transition"
              />
            </label>

            <div>
              <span className="mb-2 block text-xs font-semibold text-text-primary">
                Attachments
                <span className="font-normal text-text-secondary">
                  {' '}
                  (links to docs, blogs, etc.)
                </span>
              </span>
              <TaskAttachmentsField
                value={attachments}
                onChange={setAttachments}
              />
            </div>

            <div>
              <span className="mb-2 block text-xs font-semibold text-text-primary">
                Comments
                <span className="font-normal text-text-secondary">
                  {' '}
                  (status updates, bug notes)
                </span>
              </span>
              <TaskCommentsField value={comments} onChange={setComments} />
            </div>

            <div>
              <span className="mb-2 block text-xs font-semibold text-text-primary">
                Accent color
              </span>
              <AccentPicker value={accent} onChange={setAccent} />
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm font-medium text-text-secondary transition hover:text-text-primary"
            >
              Delete task
            </button>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
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