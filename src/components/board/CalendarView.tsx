import { useMemo, useState } from 'react'
import type { Task } from '../../features/kanban/types'
import {
  addMonths,
  formatMonthYear,
  getCalendarGrid,
  isSameDay,
  toDateKey,
} from '../../features/kanban/views'
import { EmptyState } from '../ui/EmptyState'

interface CalendarViewProps {
  tasks: Task[]
  filtersActive: boolean
  onOpenTask: (taskId: string) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_TASKS_PER_DAY = 3

export function CalendarView({
  tasks,
  filtersActive,
  onOpenTask,
}: CalendarViewProps) {
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const today = useMemo(() => new Date(), [])

  const { datedTasks, undatedTasks } = useMemo(() => {
    const dated = new Map<string, Task[]>()
    const undated: Task[] = []

    for (const task of tasks) {
      if (!task.dueDate) {
        undated.push(task)
        continue
      }
      const key = task.dueDate.slice(0, 10)
      const bucket = dated.get(key) ?? []
      bucket.push(task)
      dated.set(key, bucket)
    }

    for (const bucket of dated.values()) {
      bucket.sort((a, b) => a.order - b.order)
    }

    return { datedTasks: dated, undatedTasks: undated }
  }, [tasks])

  const grid = useMemo(() => getCalendarGrid(month), [month])

  if (tasks.length === 0) {
    return (
      <div className="board-view-panel calendar-view">
        <EmptyState
          label={
            filtersActive
              ? 'No tasks match your filters'
              : 'No tasks to show on the calendar'
          }
        />
      </div>
    )
  }

  return (
    <div className="board-view-panel calendar-view">
      <div className="calendar-view__layout">
        <section className="calendar-view__main glass-card">
          <header className="calendar-view__nav">
            <button
              type="button"
              className="calendar-view__nav-btn"
              onClick={() => setMonth((current) => addMonths(current, -1))}
              aria-label="Previous month"
            >
              ‹
            </button>
            <h3 className="calendar-view__month">{formatMonthYear(month)}</h3>
            <button
              type="button"
              className="calendar-view__nav-btn"
              onClick={() => setMonth((current) => addMonths(current, 1))}
              aria-label="Next month"
            >
              ›
            </button>
          </header>

          <div className="calendar-view__weekdays">
            {WEEKDAYS.map((day) => (
              <span key={day} className="calendar-view__weekday">
                {day}
              </span>
            ))}
          </div>

          <div className="calendar-view__grid">
            {grid.map((date, index) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="calendar-view__cell calendar-view__cell--empty"
                  />
                )
              }

              const key = toDateKey(date)
              const dayTasks = datedTasks.get(key) ?? []
              const isToday = isSameDay(date, today)
              const hiddenCount = Math.max(0, dayTasks.length - MAX_TASKS_PER_DAY)

              return (
                <div
                  key={key}
                  className={[
                    'calendar-view__cell',
                    isToday && 'calendar-view__cell--today',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="calendar-view__day">{date.getDate()}</span>
                  <div className="calendar-view__tasks">
                    {dayTasks.slice(0, MAX_TASKS_PER_DAY).map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        className={[
                          'calendar-view__task',
                          `calendar-view__task--${task.accent}`,
                          `calendar-view__task--${task.columnId}`,
                        ].join(' ')}
                        onClick={() => onOpenTask(task.id)}
                        title={task.title}
                      >
                        {task.title}
                      </button>
                    ))}
                    {hiddenCount > 0 && (
                      <span className="calendar-view__more">+{hiddenCount}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {undatedTasks.length > 0 && (
          <aside className="calendar-view__sidebar glass-card">
            <header className="calendar-view__sidebar-header">
              <h3 className="calendar-view__sidebar-title">No due date</h3>
              <span className="calendar-view__sidebar-count">
                {undatedTasks.length}
              </span>
            </header>
            <div className="calendar-view__sidebar-list">
              {undatedTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  className={[
                    'calendar-view__sidebar-task',
                    `calendar-view__sidebar-task--${task.accent}`,
                  ].join(' ')}
                  onClick={() => onOpenTask(task.id)}
                >
                  <span className="calendar-view__sidebar-task-title">
                    {task.title}
                  </span>
                  <span className="calendar-view__sidebar-task-meta">
                    {task.columnId.replace('-', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}