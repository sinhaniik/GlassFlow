import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { archiveDoneTasks } from '../../features/kanban/kanbanSlice'
import type { Task } from '../../features/kanban/types'
import { getColumnTasks } from '../../features/kanban/utils'
import { ConfirmDialog } from './ConfirmDialog'

interface DaySummaryProps {
  tasks: Task[]
}

export function DaySummary({ tasks }: DaySummaryProps) {
  const dispatch = useAppDispatch()
  const archiveCount = useAppSelector((state) => state.kanban.archive.length)
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
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
    <>
      <div className="summary-panel rounded-2xl px-4 py-3.5">
        <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <span className="font-semibold text-text-primary">{today}</span>
          <span className="text-text-secondary">
            <span className="font-bold text-text-primary">{percent}%</span> complete
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5">
          <StatItem label="To do" count={todo} accent="pink" />
          <StatItem label="In progress" count={inProgress} accent="orange" />
          <StatItem label="Done" count={done} accent="mint" />
          {archiveCount > 0 && (
            <span className="text-sm text-text-secondary/70">
              · {archiveCount} archived
            </span>
          )}
        </div>

        {done > 0 && (
          <div className="mt-3 border-t border-[var(--glass-border)] pt-3">
            <button
              type="button"
              onClick={() => setShowArchiveConfirm(true)}
              className="glass-subtle w-full rounded-xl px-3 py-2 text-xs font-medium text-text-secondary transition hover:text-text-primary sm:w-auto sm:py-1.5"
            >
              End day — archive {done} done {done === 1 ? 'task' : 'tasks'}
            </button>
          </div>
        )}
      </div>

      {showArchiveConfirm && (
        <ConfirmDialog
          title="Archive done tasks?"
          message={`${done} completed ${done === 1 ? 'task' : 'tasks'} will move to your archive and leave the board. You can restore them later via import.`}
          confirmLabel="Archive"
          onConfirm={() => {
            dispatch(archiveDoneTasks())
            setShowArchiveConfirm(false)
          }}
          onCancel={() => setShowArchiveConfirm(false)}
        />
      )}
    </>
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
    <span className="inline-flex items-center gap-2 text-sm">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
      <span className="font-normal text-text-secondary">{label}</span>{' '}
      <span className="font-bold text-text-primary">{count}</span>
    </span>
  )
}