import type { TaskPriority } from '../../features/kanban/types'
import { TASK_PRIORITIES } from '../../features/kanban/types'

interface PriorityPickerProps {
  value: TaskPriority
  onChange: (priority: TaskPriority) => void
}

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  return (
    <div className="priority-picker" role="radiogroup" aria-label="Task priority">
      {TASK_PRIORITIES.map((priority) => (
        <button
          key={priority}
          type="button"
          role="radio"
          aria-checked={value === priority}
          aria-label={priorityLabels[priority]}
          onClick={() => onChange(priority)}
          className={[
            'priority-picker-btn',
            `priority-picker-btn--${priority}`,
            value === priority && 'priority-picker-btn--active',
          ].join(' ')}
        >
          {priorityLabels[priority]}
        </button>
      ))}
    </div>
  )
}