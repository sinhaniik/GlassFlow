import { getDueDateInfo } from '../../features/kanban/utils'

interface DueDateBadgeProps {
  dueDate: string
}

export function DueDateBadge({ dueDate }: DueDateBadgeProps) {
  const { label, shortLabel, status } = getDueDateInfo(dueDate)

  return (
    <span
      className={[
        'due-date-badge',
        `due-date-badge--${status}`,
      ].join(' ')}
      title={label}
    >
      {shortLabel}
    </span>
  )
}