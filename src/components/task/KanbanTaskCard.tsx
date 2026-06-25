import type { RefObject } from 'react'
import type { Task } from '../../features/kanban/types'
import {
  getAssigneeInitials,
  getAttachmentDisplayLabel,
  getDueDateInfo,
  getLabelAccent,
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

const MAX_VISIBLE_LINKS = 2

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
  const dueInfo = task.dueDate ? getDueDateInfo(task.dueDate) : null
  const labels = task.labels ?? []
  const attachments = task.attachments ?? []
  const comments = task.comments ?? []
  const latestComment =
    comments.length > 0 ? comments[comments.length - 1] : null
  const visibleLinks = attachments.slice(0, MAX_VISIBLE_LINKS)
  const hiddenLinkCount = attachments.length - visibleLinks.length
  const hasFooterMeta = Boolean(task.assignee)

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
          <div className="kanban-card__top">
            <span
              className={[
                'kanban-card-priority',
                `kanban-card-priority--${priorityLevel}`,
              ].join(' ')}
            >
              {priorityLabel}
            </span>
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
          </div>

          <h3 className="kanban-card-title">{task.title}</h3>

          {task.description && (
            <p className="kanban-card-description">{task.description}</p>
          )}

          {labels.length > 0 && (
            <div className="kanban-card-labels">
              {labels.map((label) => (
                <span
                  key={label}
                  className={[
                    'kanban-card-label',
                    `kanban-card-label--${getLabelAccent(label)}`,
                  ].join(' ')}
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {attachments.length > 0 && (
            <div className="kanban-card-links">
              {visibleLinks.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kanban-card-link"
                  title={attachment.url}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <LinkIcon />
                  <span>{getAttachmentDisplayLabel(attachment)}</span>
                </a>
              ))}
              {hiddenLinkCount > 0 && (
                <span className="kanban-card-link kanban-card-link--more">
                  +{hiddenLinkCount} more
                </span>
              )}
            </div>
          )}

          {latestComment && (
            <div className="kanban-card-comment-preview">
              <CommentIcon />
              <p title={latestComment.text}>{latestComment.text}</p>
              {comments.length > 1 && (
                <span className="kanban-card-comment-preview__count">
                  +{comments.length - 1}
                </span>
              )}
            </div>
          )}

          {hasFooterMeta && (
            <footer className="kanban-card-footer">
              <div className="kanban-card-assignee" title={task.assignee}>
                <span
                  className={[
                    'kanban-card-avatar',
                    `kanban-card-avatar--${task.accent}`,
                  ].join(' ')}
                  aria-hidden
                >
                  {getAssigneeInitials(task.assignee!)}
                </span>
                <span className="kanban-card-assignee__name">
                  {task.assignee}
                </span>
              </div>
            </footer>
          )}
        </>
      )}
    </article>
  )
}

function LinkIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}