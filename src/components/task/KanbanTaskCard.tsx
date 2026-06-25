import type { RefObject } from 'react'
import type { Task } from '../../features/kanban/types'
import {
  formatCreatedDate,
  getColumnProgress,
  getDueDateInfo,
  getTaskPriority,
} from '../../features/kanban/utils'

interface KanbanTaskCardProps {
  task: Task
  isInlineEditing: boolean
  editTitle: string
  inputRef: RefObject<HTMLInputElement | null>
  onEditTitleChange: (value: string) => void
  onSaveInlineEdit: () => void
  onCancelInlineEdit: () => void
}

export function KanbanTaskCard({
  task,
  isInlineEditing,
  editTitle,
  inputRef,
  onEditTitleChange,
  onSaveInlineEdit,
  onCancelInlineEdit,
}: KanbanTaskCardProps) {
  const { label: priorityLabel, level: priorityLevel } = getTaskPriority(task)
  const { label: createdLabel } = formatCreatedDate(task.createdAt)
  const dueInfo = task.dueDate ? getDueDateInfo(task.dueDate) : null
  const progress = getColumnProgress(task.columnId)

  return (
    <article className="kanban-card">
      {isInlineEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => onEditTitleChange(e.target.value)}
          onBlur={onSaveInlineEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveInlineEdit()
            if (e.key === 'Escape') onCancelInlineEdit()
            e.stopPropagation()
          }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="kanban-card-input w-full bg-transparent outline-none"
        />
      ) : (
        <>
          <span
            className={[
              'kanban-card-priority',
              `kanban-card-priority--${priorityLevel}`,
            ].join(' ')}
          >
            {priorityLabel}
          </span>

          <h3 className="kanban-card-title">{task.title}</h3>

          {task.description && (
            <p className="kanban-card-note">
              <span className="kanban-card-note__label">Note:</span>{' '}
              <span className="kanban-card-note__text">{task.description}</span>
            </p>
          )}

          <div className="kanban-card-progress">
            <div className="kanban-card-progress__header">
              <span className="kanban-card-progress__label">Progress</span>
              <span className="kanban-card-progress__value">{progress}%</span>
            </div>
            <div className="kanban-card-progress__track">
              <div
                className="kanban-card-progress__fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <footer className="kanban-card-footer">
            <div className="kanban-card-footer__left">
              <span
                className={[
                  'kanban-card-avatar',
                  `kanban-card-avatar--${task.accent}`,
                ].join(' ')}
                aria-hidden
              >
                {task.title.charAt(0).toUpperCase()}
              </span>
              <span className="kanban-card-meta">
                <span className="kanban-card-meta__label">Added</span>{' '}
                <span className="kanban-card-meta__value">{createdLabel}</span>
              </span>
            </div>
            {dueInfo && (
              <span
                className={[
                  'kanban-card-due',
                  `kanban-card-due--${dueInfo.status}`,
                ].join(' ')}
                title={dueInfo.label}
              >
                {dueInfo.shortLabel}
              </span>
            )}
          </footer>
        </>
      )}
    </article>
  )
}