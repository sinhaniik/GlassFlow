export type BoardView = 'kanban' | 'list' | 'calendar' | 'timeline'

export const BOARD_VIEWS: {
  id: BoardView
  label: string
  shortLabel: string
}[] = [
  { id: 'kanban', label: 'Kanban', shortLabel: 'Board' },
  { id: 'list', label: 'List', shortLabel: 'List' },
  { id: 'calendar', label: 'Calendar', shortLabel: 'Cal' },
  { id: 'timeline', label: 'Timeline', shortLabel: 'Time' },
]

const VIEW_STORAGE_KEY = 'glassflow-board-view'

export function loadBoardView(): BoardView {
  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY)
    if (stored && BOARD_VIEWS.some((view) => view.id === stored)) {
      return stored as BoardView
    }
  } catch {
    /* ignore */
  }
  return 'kanban'
}

export function saveBoardView(view: BoardView) {
  localStorage.setItem(VIEW_STORAGE_KEY, view)
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateKey(key: string): Date {
  return new Date(`${key}T00:00:00`)
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1)
}

export function getCalendarGrid(month: Date): (Date | null)[] {
  const first = startOfMonth(month)
  const startWeekday = first.getDay()
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate()

  const cells: (Date | null)[] = []

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day))
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function formatTimelineDate(key: string): string {
  const date = parseDateKey(key)
  const now = new Date()
  if (isSameDay(date, now)) return 'Today'

  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  if (isSameDay(date, tomorrow)) return 'Tomorrow'

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (isSameDay(date, yesterday)) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}