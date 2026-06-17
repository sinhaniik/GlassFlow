import type { Task } from '../../features/kanban/types'
import { getColumnTasks } from '../../features/kanban/utils'

interface DaySummaryProps {
  tasks: Task[]
}

export function DaySummary({ tasks }: DaySummaryProps) {
  const todo = getColumnTasks(tasks, 'todo').length
  const inProgress = getColumnTasks(tasks, 'in-progress').length
  const done = getColumnTasks(tasks, 'done').length
  const total = tasks.length
  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="summary-panel rounded-2xl px-4 py-3.5">
      <div className="flex items-center justify-between text-sm text-text-secondary">
        <span>{today}</span>
        <span>{percent}% complete</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <StatItem label="To do" count={todo} accent="pink" />
        <StatItem label="In progress" count={inProgress} accent="orange" />
        <StatItem label="Done" count={done} accent="mint" />
      </div>
    </div>
  )
}

function StatItem({
  label,
  count,
  accent,
}: {
  label: string
  count: number
  accent: 'pink' | 'orange' | 'mint'
}) {
  const dotClass = {
    pink: 'bg-accent-pink',
    orange: 'bg-accent-orange',
    mint: 'bg-accent-mint',
  }[accent]

  return (
    <span className="inline-flex items-center gap-2 text-sm text-text-secondary">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
      {label} {count}
    </span>
  )
}