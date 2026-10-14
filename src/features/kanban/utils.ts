import type { ColumnId, Task } from './types.ts'

export function isColumnId(value: unknown): value is ColumnId {
  return value === 'todo' || value === 'in-progress' || value === 'done'
}

export function getColumnTasks(tasks: Task[], columnId: ColumnId): Task[] {
  return tasks
    .filter((task) => task.columnId === columnId)
    .sort((a, b) => a.order - b.order)
}

export interface CardRect {
  top: number
  bottom: number
}

export function getInsertIndex(pointerY: number, cardRects: readonly CardRect[]): number {
  const index = cardRects.findIndex(({ top, bottom }) => pointerY < (top + bottom) / 2)
  return index < 0 ? cardRects.length : index
}

export function moveTask(
  tasks: readonly Task[],
  taskId: string,
  toColumnId: ColumnId,
  toIndex: number,
): Task[] {
  const moving = tasks.find(({ id }) => id === taskId)
  if (!moving || !Number.isFinite(toIndex)) return tasks as Task[]

  const sourceColumnId = moving.columnId
  const orderedSource = getColumnTasks([...tasks], sourceColumnId)
  const fromIndex = orderedSource.findIndex(({ id }) => id === taskId)
  const source = orderedSource.filter(({ id }) => id !== taskId)
  const destination = sourceColumnId === toColumnId
    ? source
    : getColumnTasks([...tasks], toColumnId).filter(({ id }) => id !== taskId)
  const index = Math.max(0, Math.min(Math.trunc(toIndex), destination.length))
  if (sourceColumnId === toColumnId && fromIndex === index &&
      orderedSource.every((task, order) => task.order === order)) return tasks as Task[]

  destination.splice(index, 0, { ...moving, columnId: toColumnId })
  const reordered = new Map<string, Task>()
  destination.forEach((task, order) => reordered.set(task.id, { ...task, order }))
  if (sourceColumnId !== toColumnId) {
    source.forEach((task, order) => reordered.set(task.id, { ...task, order }))
  }

  return tasks.map((task) => reordered.get(task.id) ?? task)
}

export function createTask(
  title: string,
  columnId: ColumnId,
  order: number,
): Task {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    description: '',
    columnId,
    priority: 'medium',
    order,
    createdAt: now,
    updatedAt: now,
  }
}

export function normalizeTask(raw: unknown, index: number): Task | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Partial<Task>
  if (
    typeof value.id !== 'string' ||
    !value.id.trim() ||
    typeof value.title !== 'string' ||
    !value.title.trim() ||
    !isColumnId(value.columnId)
  ) {
    return null
  }

  const createdAt = typeof value.createdAt === 'string'
    ? value.createdAt
    : new Date().toISOString()
  const dueDate = typeof value.dueDate === 'string' && isValidDateOnly(value.dueDate)
    ? value.dueDate
    : undefined
  return {
    ...value,
    id: value.id,
    title: value.title.trim(),
    description: typeof value.description === 'string' ? value.description : '',
    columnId: value.columnId,
    priority:
      value.priority === 'high' || value.priority === 'medium'
        ? value.priority
        : 'low',
    dueDate,
    order: typeof value.order === 'number' && Number.isFinite(value.order)
      ? value.order
      : index,
    createdAt,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : createdAt,
  }
}

export function isValidDateOnly(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const [, yearValue, monthValue, dayValue] = match
  const year = Number(yearValue)
  const month = Number(monthValue)
  const day = Number(dayValue)
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function getDueDateInfo(dueDate: string) {
  const [year, month, day] = dueDate.split('-').map(Number)
  const today = new Date()
  const dueDay = year * 10_000 + month * 100 + day
  const todayDay = today.getFullYear() * 10_000 + (today.getMonth() + 1) * 100 + today.getDate()
  const status = dueDay < todayDay ? 'overdue' : dueDay === todayDay ? 'today' : 'upcoming'
  const date = new Date(0)
  date.setFullYear(year, month - 1, day)
  date.setHours(12, 0, 0, 0)
  const shortDate = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
  return {
    label: status === 'today' ? 'Due today' : status === 'overdue' ? `Overdue · ${shortDate}` : shortDate,
    fullDate: date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
    status,
  }
}
