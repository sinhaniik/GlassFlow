import type {
  AccentColor,
  ArchivedTask,
  BackupData,
  ColumnId,
  Task,
} from './types'
import { ACCENT_COLORS } from './types'

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
  pink: 'border-l-accent-pink bg-accent-pink/8',
  orange: 'border-l-accent-orange bg-accent-orange/8',
  purple: 'border-l-accent-purple bg-accent-purple/8',
  mint: 'border-l-accent-mint bg-accent-mint/8',
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

export type DueDateStatus = 'overdue' | 'today' | 'soon' | 'later'

export function getDueDateInfo(dueDate: string): {
  label: string
  shortLabel: string
  status: DueDateStatus
} {
  const due = new Date(`${dueDate}T00:00:00`)
  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )
  const startOfDue = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate(),
  )
  const diffDays = Math.floor(
    (startOfDue.getTime() - startOfToday.getTime()) / 86_400_000,
  )

  if (diffDays < 0) {
    const days = Math.abs(diffDays)
    return {
      label: days === 1 ? 'Overdue yesterday' : `Overdue ${days} days`,
      shortLabel: 'late',
      status: 'overdue',
    }
  }
  if (diffDays === 0) {
    return { label: 'Due today', shortLabel: 'today', status: 'today' }
  }
  if (diffDays === 1) {
    return { label: 'Due tomorrow', shortLabel: 'tmrw', status: 'soon' }
  }
  if (diffDays <= 7) {
    const label = due.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    return { label, shortLabel: `${diffDays}d`, status: 'soon' }
  }

  const label = due.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year:
      due.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
  const shortLabel = due.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
  })
  return { label, shortLabel, status: 'later' }
}

function normalizeAccent(accent: unknown, fallback: AccentColor): AccentColor {
  return ACCENT_COLORS.includes(accent as AccentColor)
    ? (accent as AccentColor)
    : fallback
}

function normalizeColumnId(columnId: unknown): ColumnId | null {
  return isColumnId(columnId as string) ? (columnId as ColumnId) : null
}

export function normalizeTask(raw: Partial<Task>, index: number): Task | null {
  if (!raw.id || typeof raw.title !== 'string' || !raw.title.trim()) {
    return null
  }
  const columnId = normalizeColumnId(raw.columnId)
  if (!columnId) return null

  const now = new Date().toISOString()
  const createdAt =
    typeof raw.createdAt === 'string' ? raw.createdAt : now
  const updatedAt =
    typeof raw.updatedAt === 'string' ? raw.updatedAt : createdAt

  return {
    id: String(raw.id),
    title: raw.title.trim(),
    description:
      typeof raw.description === 'string' && raw.description.trim()
        ? raw.description.trim()
        : undefined,
    columnId,
    accent: normalizeAccent(raw.accent, 'pink'),
    order: typeof raw.order === 'number' ? raw.order : index,
    createdAt,
    updatedAt,
    dueDate:
      typeof raw.dueDate === 'string' && raw.dueDate
        ? raw.dueDate.slice(0, 10)
        : undefined,
  }
}

export function normalizeArchivedTask(
  raw: Partial<ArchivedTask>,
  index: number,
): ArchivedTask | null {
  const task = normalizeTask(raw, index)
  if (!task) return null
  const archivedAt =
    typeof raw.archivedAt === 'string' ? raw.archivedAt : task.updatedAt
  return { ...task, archivedAt }
}

export function buildBackupData(
  tasks: Task[],
  archive: ArchivedTask[],
): BackupData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
    archive,
  }
}

export function parseBackup(raw: unknown): BackupData | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Partial<BackupData>
  if (data.version !== 1) return null
  if (!Array.isArray(data.tasks) || !Array.isArray(data.archive)) return null

  const tasks = data.tasks
    .map((task, index) => normalizeTask(task as Partial<Task>, index))
    .filter((task): task is Task => task !== null)

  const archive = data.archive
    .map((task, index) =>
      normalizeArchivedTask(task as Partial<ArchivedTask>, index),
    )
    .filter((task): task is ArchivedTask => task !== null)

  return {
    version: 1,
    exportedAt:
      typeof data.exportedAt === 'string'
        ? data.exportedAt
        : new Date().toISOString(),
    tasks,
    archive,
  }
}