import type {
  AccentColor,
  ArchivedTask,
  BackupData,
  ColumnId,
  Task,
  TaskAttachment,
  TaskComment,
  TaskPriority,
} from './types'
import { ACCENT_COLORS, TASK_PRIORITIES } from './types'

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
    priority: 'low',
    labels: [],
    attachments: [],
    comments: [],
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
  monthLabel: string
  dayLabel: string
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
    return {
      label: 'Today',
      shortLabel: 'today',
      monthLabel: 'today',
      dayLabel: '',
      isToday: true,
    }
  }
  if (diffDays === 1) {
    return {
      label: 'Yesterday',
      shortLabel: 'yst',
      monthLabel: 'yst',
      dayLabel: '',
      isToday: false,
    }
  }

  const monthLabel = created.toLocaleDateString('en-US', { month: 'short' })
  const dayLabel = String(created.getDate())
  const shortLabel = created.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
  })

  if (created.getFullYear() === now.getFullYear()) {
    const label = created.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    return { label, shortLabel, monthLabel, dayLabel, isToday: false }
  }

  const label = created.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })
  const yearShortLabel = created.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
  })
  return {
    label,
    shortLabel: yearShortLabel,
    monthLabel,
    dayLabel,
    isToday: false,
  }
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export function getTaskPriority(task: Task): {
  label: string
  level: TaskPriority
} {
  const level = task.priority ?? 'low'
  return { label: PRIORITY_LABELS[level], level }
}

export function getAssigneeInitials(assignee: string): string {
  const parts = assignee.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
}

export function getLabelAccent(label: string): AccentColor {
  const hash = [...label.toLowerCase()].reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  )
  return ACCENT_COLORS[hash % ACCENT_COLORS.length]
}

export function getColumnProgress(columnId: ColumnId): number {
  switch (columnId) {
    case 'todo':
      return 0
    case 'in-progress':
      return 50
    case 'done':
      return 100
  }
}

function normalizePriority(priority: unknown): TaskPriority {
  return TASK_PRIORITIES.includes(priority as TaskPriority)
    ? (priority as TaskPriority)
    : 'low'
}

function normalizeLabels(labels: unknown): string[] | undefined {
  if (!Array.isArray(labels)) return undefined
  const normalized = labels
    .map((label) => (typeof label === 'string' ? label.trim().toLowerCase() : ''))
    .filter(Boolean)
  const unique = [...new Set(normalized)]
  return unique.length > 0 ? unique.slice(0, 8) : undefined
}

export function normalizeAttachmentUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  try {
    const parsed = new URL(withProtocol)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    return parsed.href
  } catch {
    return null
  }
}

export function getAttachmentDisplayLabel(attachment: TaskAttachment): string {
  if (attachment.label?.trim()) return attachment.label.trim()
  try {
    const host = new URL(attachment.url).hostname.replace(/^www\./, '')
    return host || attachment.url
  } catch {
    return attachment.url
  }
}

export function createAttachment(url: string, label?: string): TaskAttachment | null {
  const normalizedUrl = normalizeAttachmentUrl(url)
  if (!normalizedUrl) return null
  return {
    id: crypto.randomUUID(),
    url: normalizedUrl,
    label: label?.trim() || undefined,
  }
}

export function createComment(text: string): TaskComment | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  return {
    id: crypto.randomUUID(),
    text: trimmed,
    createdAt: new Date().toISOString(),
  }
}

function normalizeAttachments(attachments: unknown): TaskAttachment[] | undefined {
  if (!Array.isArray(attachments)) return undefined
  const normalized = attachments
    .map((raw) => {
      if (!raw || typeof raw !== 'object') return null
      const item = raw as Partial<TaskAttachment>
      const url =
        typeof item.url === 'string' ? normalizeAttachmentUrl(item.url) : null
      if (!url) return null
      const attachment: TaskAttachment = {
        id: typeof item.id === 'string' ? item.id : crypto.randomUUID(),
        url,
      }
      if (typeof item.label === 'string' && item.label.trim()) {
        attachment.label = item.label.trim()
      }
      return attachment
    })
    .filter((item): item is TaskAttachment => item !== null)
  return normalized.length > 0 ? normalized.slice(0, 10) : undefined
}

function normalizeComments(comments: unknown): TaskComment[] | undefined {
  if (!Array.isArray(comments)) return undefined
  const normalized = comments
    .map((raw) => {
      if (!raw || typeof raw !== 'object') return null
      const item = raw as Partial<TaskComment>
      if (typeof item.text !== 'string' || !item.text.trim()) return null
      return {
        id: typeof item.id === 'string' ? item.id : crypto.randomUUID(),
        text: item.text.trim(),
        createdAt:
          typeof item.createdAt === 'string'
            ? item.createdAt
            : new Date().toISOString(),
      } satisfies TaskComment
    })
    .filter((item): item is TaskComment => item !== null)
  return normalized.length > 0 ? normalized.slice(0, 20) : undefined
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
    priority: normalizePriority(raw.priority),
    labels: normalizeLabels(raw.labels),
    assignee:
      typeof raw.assignee === 'string' && raw.assignee.trim()
        ? raw.assignee.trim()
        : undefined,
    attachments: normalizeAttachments(raw.attachments),
    comments: normalizeComments(raw.comments),
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