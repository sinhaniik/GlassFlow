import type { Task } from '../../features/kanban/types'
import { DEFAULT_COLUMNS } from '../../features/kanban/types'
import {
  getSubtaskProgress,
  getTaskPriority,
} from '../../features/kanban/utils'
import { DueDateBadge } from '../ui/DueDateBadge'

interface ViewTaskRowProps {
  task: Task
  onOpen: () => void
  showStatus?: boolean
  compact?: boolean
}

const columnTitle = Object.fromEntries(
  DEFAULT_COLUMNS.map((column) => [column.id, column.title]),
) as Record<Task['columnId'], string>

export function ViewTaskRow({
  task,
  onOpen,
  showStatus = true,
  compact = false,
}: ViewTaskRowProps) {
  const { label: priorityLabel, level: priorityLevel } = getTaskPriority(task)
  const subtaskProgress = getSubtaskProgress(task.subtasks)
  const hasSubtasks = subtaskProgress.total > 0

  return (
    <button
      type="button"
      onClick={onOpen}
      className={[
        'view-task-row',
        `view-task-row--${task.accent}`,
        compact && 'view-task-row--compact',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showStatus && (
        <span
          className={[
            'view-task-row__status',
            `view-task-row__status--${task.columnId}`,
          ].join(' ')}
          title={columnTitle[task.columnId]}
        />
      )}

      <span className="view-task-row__main">
        <span className="view-task-row__title">{task.title}</span>
        {!compact && task.description && (
          <span className="view-task-row__description">{task.description}</span>
        )}
      </span>

      <span className="view-task-row__meta">
        <span
          className={[
            'view-task-row__priority',
            `view-task-row__priority--${priorityLevel}`,
          ].join(' ')}
        >
          {priorityLabel}
        </span>

        {task.dueDate && <DueDateBadge dueDate={task.dueDate} />}

        {hasSubtasks && (
          <span className="view-task-row__progress">
            {subtaskProgress.completed}/{subtaskProgress.total}
          </span>
        )}

        {task.assignee && !compact && (
          <span className="view-task-row__assignee">{task.assignee}</span>
        )}
      </span>
    </button>
  )
}