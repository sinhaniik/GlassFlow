import { useMemo } from 'react'
import type { Task } from '../../features/kanban/types'
import { getSubtaskProgress } from '../../features/kanban/utils'
import {
  formatTimelineDate,
  parseDateKey,
  toDateKey,
} from '../../features/kanban/views'
import { EmptyState } from '../ui/EmptyState'

interface TimelineViewProps {
  tasks: Task[]
  filtersActive: boolean
  onOpenTask: (taskId: string) => void
  onCreateTask: () => void
}

interface TimelineGroup {
  key: string
  label: string
  tasks: Task[]
}

export function TimelineView({
  tasks,
  filtersActive,
  onOpenTask,
  onCreateTask,
}: TimelineViewProps) {
  const { groups, unscheduled } = useMemo(() => {
    const dated = new Map<string, Task[]>()
    const noDue: Task[] = []

    for (const task of tasks) {
      if (!task.dueDate) {
        noDue.push(task)
        continue
      }
      const key = task.dueDate.slice(0, 10)
      const bucket = dated.get(key) ?? []
      bucket.push(task)
      dated.set(key, bucket)
    }

    const sortedKeys = [...dated.keys()].sort(
      (a, b) => parseDateKey(a).getTime() - parseDateKey(b).getTime(),
    )

    const grouped: TimelineGroup[] = sortedKeys.map((key) => ({
      key,
      label: formatTimelineDate(key),
      tasks: (dated.get(key) ?? []).sort((a, b) => a.order - b.order),
    }))

    return { groups: grouped, unscheduled: noDue }
  }, [tasks])

  if (tasks.length === 0) {
    return (
      <div className="board-view-panel timeline-view">
        <EmptyState
          title={
            filtersActive
              ? 'No tasks match your filters'
              : 'Your timeline is empty'
          }
          hint={
            filtersActive
              ? 'Try clearing a filter or changing your search'
              : 'Create a task and add a due date to see it here'
          }
          actionLabel={filtersActive ? undefined : '+ Create your first task'}
          onAction={filtersActive ? undefined : onCreateTask}
        />
      </div>
    )
  }

  return (
    <div className="board-view-panel timeline-view">
      <div className="timeline-view__track">
        {groups.map((group) => (
          <section key={group.key} className="timeline-view__group">
            <div className="timeline-view__marker">
              <span className="timeline-view__dot" />
              <time
                className="timeline-view__date"
                dateTime={group.key}
              >
                {group.label}
              </time>
            </div>

            <div className="timeline-view__cards">
              {group.tasks.map((task) => (
                <TimelineCard
                  key={task.id}
                  task={task}
                  onOpen={() => onOpenTask(task.id)}
                />
              ))}
            </div>
          </section>
        ))}

        {unscheduled.length > 0 && (
          <section className="timeline-view__group timeline-view__group--unscheduled">
            <div className="timeline-view__marker">
              <span className="timeline-view__dot timeline-view__dot--muted" />
              <span className="timeline-view__date">Unscheduled</span>
            </div>

            <div className="timeline-view__cards">
              {unscheduled.map((task) => (
                <TimelineCard
                  key={task.id}
                  task={task}
                  onOpen={() => onOpenTask(task.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function TimelineCard({
  task,
  onOpen,
}: {
  task: Task
  onOpen: () => void
}) {
  const progress = getSubtaskProgress(task.subtasks)
  const startKey = toDateKey(new Date(task.createdAt))
  const endKey = task.dueDate?.slice(0, 10) ?? startKey
  const spanDays = Math.max(
    1,
    Math.round(
      (parseDateKey(endKey).getTime() - parseDateKey(startKey).getTime()) /
        86_400_000,
    ) + 1,
  )

  return (
    <button
      type="button"
      onClick={onOpen}
      className={[
        'timeline-card',
        `timeline-card--${task.accent}`,
        `timeline-card--${task.columnId}`,
      ].join(' ')}
    >
      <div className="timeline-card__header">
        <span className="timeline-card__title">{task.title}</span>
        <span className="timeline-card__status">
          {task.columnId.replace('-', ' ')}
        </span>
      </div>

      {task.description && (
        <p className="timeline-card__description">{task.description}</p>
      )}

      <div className="timeline-card__footer">
        <span className="timeline-card__span">
          {task.dueDate ? `${spanDays}d span` : 'No due date'}
        </span>
        {progress.total > 0 && (
          <span className="timeline-card__progress">
            {progress.completed}/{progress.total} done
          </span>
        )}
      </div>

      {task.dueDate && (
        <div className="timeline-card__bar">
          <div
            className="timeline-card__bar-fill"
            style={{
              width: `${Math.min(100, Math.max(12, spanDays * 8))}%`,
            }}
          />
        </div>
      )}
    </button>
  )
}