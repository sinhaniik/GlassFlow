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

export function formatCreatedDate(createdAt: string): {
  label: string
  shortLabel: string
  isToday: boolean
} {
  const created = new Date(createdAt)
  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )
  const startOfCreated = new Date(
    created.getFullYear(),
    created.getMonth(),
    created.getDate(),
  )
  const diffDays = Math.floor(
    (startOfToday.getTime() - startOfCreated.getTime()) / 86_400_000,
  )

  if (diffDays === 0) {
    return { label: 'Today', shortLabel: 'today', isToday: true }
  }
  if (diffDays === 1) {
    return { label: 'Yesterday', shortLabel: 'yst', isToday: false }
  }
  if (created.getFullYear() === now.getFullYear()) {
    const label = created.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    const shortLabel = created.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
    })
    return { label, shortLabel, isToday: false }
  }
  const label = created.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })
  const shortLabel = created.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
  })
  return { label, shortLabel, isToday: false }
}