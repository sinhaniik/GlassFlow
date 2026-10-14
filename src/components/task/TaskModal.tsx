import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import type { ColumnId, Task, TaskPriority } from '../../features/kanban/types'
import { DEFAULT_COLUMNS } from '../../features/kanban/types'
import { isValidDateOnly } from '../../features/kanban/utils'

interface TaskModalProps {
  task: Task
  isNew: boolean
  onClose: () => void
  onSave: (task: Task) => void
  onMove: (columnId: ColumnId) => void
  onDelete: () => void
}

const statusLabels: Record<ColumnId, string> = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

const priorityOptions: { id: TaskPriority; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Med' },
  { id: 'high', label: 'High' },
]

export function TaskModal({ task, isNew, onClose, onSave, onMove, onDelete }: TaskModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [dueDate, setDueDate] = useState(task.dueDate ?? '')
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [error, setError] = useState('')
  const [errorField, setErrorField] = useState<'title' | 'deadline' | null>(null)
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const dirty = title !== task.title || description !== (task.description ?? '') ||
    dueDate !== (task.dueDate ?? '') || priority !== task.priority
  const canSave = Boolean(title.trim()) && isValidDateOnly(dueDate) && dirty

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.showModal()
    titleRef.current?.focus()
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => {
      cancelAnimationFrame(frame)
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
      dialog.close()
      requestAnimationFrame(() => {
        const original = returnFocusRef.current
        if (original?.isConnected) {
          original.focus()
          return
        }
        const taskCard = Array.from(document.querySelectorAll<HTMLElement>('[data-task-id] .task-open'))
          .find((element) => element.closest<HTMLElement>('[data-task-id]')?.dataset.taskId === task.id)
        ;(taskCard ?? document.querySelector<HTMLElement>('.new-task-button'))?.focus()
      })
    }
  }, [task.id])

  function closeAfterFade(callback: () => void) {
    if (closing) return
    setClosing(true)
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 120
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null
      callback()
    }, delay)
  }

  function requestClose() {
    if (closing) return
    if (dirty && !window.confirm('Discard unsaved changes?')) return
    closeAfterFade(onClose)
  }

  function changeStatus(columnId: ColumnId) {
    if (closing || columnId === task.columnId) return
    if (dirty && !window.confirm('Discard unsaved changes and move this task?')) return
    closeAfterFade(() => onMove(columnId))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (closing) return
    const cleanTitle = title.trim()
    if (!cleanTitle) {
      setError('Enter a task title.')
      setErrorField('title')
      titleRef.current?.focus()
      return
    }
    if (!isValidDateOnly(dueDate)) {
      setError(dueDate ? 'Enter a valid deadline.' : 'Choose a deadline before saving.')
      setErrorField('deadline')
      document.getElementById('task-deadline')?.focus()
      return
    }
    closeAfterFade(() => onSave({
      ...task,
      title: cleanTitle,
      description: description.trim(),
      dueDate,
      priority,
      updatedAt: new Date().toISOString(),
    }))
  }

  function handleShortcut(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== 'Enter' || (!event.metaKey && !event.ctrlKey)) return
    event.preventDefault()
    event.currentTarget.requestSubmit()
  }

  return (
    <dialog
      ref={dialogRef}
      className={`task-dialog task-editor-dialog${visible ? ' is-visible' : ''}${closing ? ' is-closing' : ''}`}
      aria-labelledby="task-dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) requestClose()
      }}
    >
      <form onSubmit={handleSubmit} onKeyDown={handleShortcut} noValidate>
        <header className="dialog-header">
          <div>
            <p className="eyebrow">Task details</p>
            <h2 id="task-dialog-title">{isNew ? 'New task' : 'Edit task'}</h2>
          </div>
          <button type="button" className="icon-button dialog-close" aria-label="Close editor" onClick={requestClose}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg>
          </button>
        </header>

        <div className="dialog-fields">
          <label className="field-group" htmlFor="task-title">
            <span className="field-heading">Title <span className="field-requirement">Required</span></span>
            <input
              ref={titleRef}
              id="task-title"
              className="text-input"
              value={title}
              maxLength={160}
              required
              aria-describedby={errorField === 'title' ? 'task-title-error' : undefined}
              aria-invalid={errorField === 'title'}
              onChange={(event) => { setTitle(event.target.value); setError(''); setErrorField(null) }}
              placeholder="What needs to get done?"
            />
            {errorField === 'title' && <span id="task-title-error" className="field-error">{error}</span>}
          </label>

          <label className="field-group" htmlFor="task-description">
            <span className="field-heading">Notes <span className="field-requirement">Optional</span></span>
            <textarea
              id="task-description"
              className="text-input text-area"
              value={description}
              maxLength={2000}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a little context"
              rows={3}
            />
          </label>

          <div className="field-row">
            <fieldset className="field-group fieldset-reset">
              <legend className="field-heading">Priority</legend>
              <div className="segmented-control priority-segments" role="radiogroup" aria-label="Priority">
                {priorityOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={priority === option.id}
                    className={`segment priority-segment${priority === option.id ? ' is-selected' : ''}`}
                    onClick={() => setPriority(option.id)}
                  >
                    <span className={`priority-dot priority-dot-${option.id}`} aria-hidden="true" />
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="field-group" htmlFor="task-deadline">
              <span className="field-heading">Deadline <span className="field-requirement">Required</span></span>
              <input
                id="task-deadline"
                className="text-input date-input"
                type="date"
                value={dueDate}
                required
                aria-describedby={errorField === 'deadline' ? 'task-deadline-error' : undefined}
                aria-invalid={errorField === 'deadline'}
                onChange={(event) => { setDueDate(event.target.value); setError(''); setErrorField(null) }}
              />
              {errorField === 'deadline' && <span id="task-deadline-error" className="field-error">{error}</span>}
            </label>
          </div>

          {!isNew && (
            <fieldset className="field-group fieldset-reset">
              <legend className="field-heading">Status</legend>
              <div className="segmented-control status-segments" role="group" aria-label="Change task status">
                {DEFAULT_COLUMNS.map((column) => (
                  <button
                    key={column.id}
                    type="button"
                    aria-pressed={task.columnId === column.id}
                    className={`segment status-segment${task.columnId === column.id ? ' is-selected' : ''}`}
                    onClick={() => changeStatus(column.id)}
                    disabled={task.columnId === column.id || closing}
                  >
                    {statusLabels[column.id]}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
        </div>

        <footer className="dialog-footer">
          {!isNew && <button type="button" className="text-button destructive" onClick={() => {
            if (window.confirm(`Delete “${task.title}”? You can undo this for 5 seconds.`)) closeAfterFade(onDelete)
          }} disabled={closing}>Delete task</button>}
          <div className="dialog-actions">
            <button type="button" className="text-button" onClick={requestClose} disabled={closing}>Cancel</button>
            <button type="submit" className="primary-button" disabled={!canSave || closing}>
              {isNew ? 'Create task' : 'Save changes'}
            </button>
          </div>
        </footer>
      </form>
    </dialog>
  )
}
