import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { deleteTask, updateTask } from '../../features/kanban/kanbanSlice'
import type {
  AccentColor,
  TaskAttachment,
  TaskComment,
  TaskPriority,
  TaskSubtask,
} from '../../features/kanban/types'
import { AccentPicker } from '../ui/AccentPicker'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { LabelPicker } from '../ui/LabelPicker'
import { PriorityPicker } from '../ui/PriorityPicker'
import { TaskAttachmentsField } from './TaskAttachmentsField'
import { TaskCommentsField } from './TaskCommentsField'
import { TaskSubtasksField } from './TaskSubtasksField'

interface TaskModalProps {
  taskId: string | null
  onClose: () => void
  onRequestDelete?: () => void
}

export function TaskModal({ taskId, onClose, onRequestDelete }: TaskModalProps) {
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
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([])
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
    setSubtasks(task.subtasks ?? [])
    setAccent(task.accent)
    setPriority(task.priority ?? 'low')
    setShowDeleteConfirm(false)
    requestAnimationFrame(() => titleRef.current?.focus())
  }, [task])

  useEffect(() => {
    if (!taskId) return

    const previousOverflow = document.body.style.overflow
    document.body.classList.add('modal-open')
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.classList.remove('modal-open')
      document.body.style.overflow = previousOverflow
    }
  }, [taskId])

  useEffect(() => {
    if (!taskId) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !showDeleteConfirm) {
        onClose()
        return
      }
      if (e.key === 'Delete' && !showDeleteConfirm) {
        e.preventDefault()
        if (onRequestDelete) {
          onRequestDelete()
        } else {
          setShowDeleteConfirm(true)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [taskId, onClose, onRequestDelete, showDeleteConfirm])

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
        subtasks,
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
          className="modal-panel task-modal modal-enter relative flex w-full max-w-md flex-col rounded-t-2xl sm:max-h-[min(90dvh,44rem)] sm:rounded-2xl"
        >
          <header className="task-modal__header shrink-0 px-4 pb-3 pt-4 sm:px-6 sm:pt-6">
            <h2
              id="task-modal-title"
              className="text-lg font-semibold text-text-primary"
            >
              Edit task
            </h2>
          </header>

          <div className="task-modal__body min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-6">
            <label className="block">
              <span className="modal-field-label">
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
              <span className="modal-field-label">
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
              <span className="modal-field-label">
                Priority
              </span>
              <PriorityPicker value={priority} onChange={setPriority} />
            </div>

            <div>
              <span className="modal-field-label">
                Labels
                <span className="font-normal text-text-secondary"> (optional)</span>
              </span>
              <LabelPicker value={labels} onChange={setLabels} />
            </div>

            <label className="block">
              <span className="modal-field-label">
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
              <span className="modal-field-label">
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
              <span className="modal-field-label">
                Subtasks
                <span className="font-normal text-text-secondary">
                  {' '}
                  (break work into steps)
                </span>
              </span>
              <TaskSubtasksField value={subtasks} onChange={setSubtasks} />
            </div>

            <div>
              <span className="modal-field-label">
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
              <span className="modal-field-label">
                Comments
                <span className="font-normal text-text-secondary">
                  {' '}
                  (status updates, bug notes)
                </span>
              </span>
              <TaskCommentsField value={comments} onChange={setComments} />
            </div>

            <div>
              <span className="modal-field-label">
                Accent color
              </span>
              <AccentPicker value={accent} onChange={setAccent} />
            </div>
          </div>

          <footer className="task-modal__footer shrink-0 border-t border-[color-mix(in_srgb,var(--glass-border)_55%,transparent)] px-4 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          </footer>
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