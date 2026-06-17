import { formatCreatedDate } from '../../features/kanban/utils'

interface TaskDateNotchProps {
  createdAt: string
}

export function TaskDateNotch({ createdAt }: TaskDateNotchProps) {
  const { label, shortLabel, isToday } = formatCreatedDate(createdAt)

  return (
    <div
      className={[
        'task-notch-card glass-card',
        isToday ? 'task-notch-card--today' : 'task-notch-card--stale',
      ].join(' ')}
      title={`Created ${new Date(createdAt).toLocaleString()} · ${label}`}
    >
      <span className="task-notch-card__text">{shortLabel}</span>
    </div>
  )
}