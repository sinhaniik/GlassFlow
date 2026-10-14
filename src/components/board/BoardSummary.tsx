import { useAppSelector } from '../../app/hooks'
import { selectTaskCounts } from '../../features/kanban/selectors'

export function BoardSummary() {
  const counts = useAppSelector(selectTaskCounts)

  return (
    <section
      className="board-summary"
      aria-label={`${counts.total} Total, ${counts.todo} To Do, ${counts['in-progress']} In Progress, ${counts.done} Done`}
      aria-live="polite"
    >
      <span className="summary-total">{counts.total} Total</span>
      <span className="summary-item"><i className="summary-dot status-todo" aria-hidden="true" />{counts.todo} To Do</span>
      <span className="summary-item"><i className="summary-dot status-in-progress" aria-hidden="true" />{counts['in-progress']} In Progress</span>
      <span className="summary-item"><i className="summary-dot status-done" aria-hidden="true" />{counts.done} Done</span>
    </section>
  )
}
