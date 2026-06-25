import type { TaskPriority } from '../../features/kanban/types'

interface PriorityPickerProps {
  value: TaskPriority
  onChange: (priority: TaskPriority) => void
}

const priorityOptions: {
  id: TaskPriority
  label: string
  description: string
  lines: number
}[] = [
  { id: 'low', label: 'Low', description: 'Can wait', lines: 1 },
  { id: 'medium', label: 'Medium', description: 'Normal pace', lines: 2 },
  { id: 'high', label: 'High', description: 'Urgent', lines: 3 },
]

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  return (
    <div className="priority-picker" role="radiogroup" aria-label="Task priority">
      {priorityOptions.map(({ id, label, description, lines }) => {
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${label} priority — ${description}`}
            onClick={() => onChange(id)}
            className={[
              'priority-picker-btn',
              `priority-picker-btn--${id}`,
              active && 'priority-picker-btn--active',
            ].join(' ')}
          >
            <span className="priority-picker__lines" aria-hidden>
              {Array.from({ length: lines }).map((_, index) => (
                <span
                  key={index}
                  className={[
                    'priority-picker__line',
                    `priority-picker__line--${index + 1}`,
                  ].join(' ')}
                />
              ))}
            </span>
            <span className="priority-picker__label">{label}</span>
            <span className="priority-picker__desc">{description}</span>
          </button>
        )
      })}
    </div>
  )
}