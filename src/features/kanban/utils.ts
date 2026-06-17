import type { AccentColor, ColumnId, Task } from './types'

export function isColumnId(id: string): id is ColumnId {
  return id === 'todo' || id === 'in-progress' || id === 'done'
}

export function getColumnTasks(tasks: Task[], columnId: ColumnId): Task[] {
  return tasks
    .filter((t) => t.columnId === columnId)
    .sort((a, b) => a.order - b.order)
}

export function createTask(
  title: string,
  columnId: ColumnId,
  accent: AccentColor,
  order: number,
): Task {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    columnId,
    accent,
    order,
    createdAt: now,
    updatedAt: now,
  }
}

export const accentClass: Record<AccentColor, string> = {
  pink: 'border-l-accent-pink bg-accent-pink/20',
  orange: 'border-l-accent-orange bg-accent-orange/20',
  purple: 'border-l-accent-purple bg-accent-purple/20',
  mint: 'border-l-accent-mint bg-accent-mint/20',
}

export const accentRing: Record<AccentColor, string> = {
  pink: 'ring-accent-pink',
  orange: 'ring-accent-orange',
  purple: 'ring-accent-purple',
  mint: 'ring-accent-mint',
}