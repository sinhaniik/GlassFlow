import type { AccentColor } from '../../features/kanban/types'
import { formatCreatedDate } from '../../features/kanban/utils'

interface TaskDateNotchProps {
  createdAt: string
  accent: AccentColor
}

export function TaskDateNotch({ createdAt, accent }: TaskDateNotchProps) {
  const { label, monthLabel, dayLabel, isToday } =
    formatCreatedDate(createdAt)
  const isRelative = !dayLabel

  return (
    <div
      className={[
        'task-date-tab',
        `task-date-tab--${accent}`,
        isToday ? 'task-date-tab--fresh' : 'task-date-tab--aged',
        isRelative && 'task-date-tab--relative',
      ].join(' ')}
      title={`Created ${new Date(createdAt).toLocaleString()} · ${label}`}
    >
      {isRelative ? (
        <span className="task-date-tab__relative">{monthLabel}</span>
      ) : (
        <>
          <span className="task-date-tab__month">{monthLabel}</span>
          <span className="task-date-tab__day">{dayLabel}</span>
        </>
      )}
    </div>
  )
}