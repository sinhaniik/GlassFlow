export type ColumnId = 'todo' | 'in-progress' | 'done'

export type AccentColor = 'pink' | 'orange' | 'purple' | 'mint'

export type TaskPriority = 'low' | 'medium' | 'high'

export interface TaskAttachment {
  id: string
  url: string
  label?: string
}

export interface TaskComment {
  id: string
  text: string
  createdAt: string
}

export interface TaskSubtask {
  id: string
  title: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  description?: string
  columnId: ColumnId
  accent: AccentColor
  priority?: TaskPriority
  labels?: string[]
  assignee?: string
  attachments?: TaskAttachment[]
  comments?: TaskComment[]
  subtasks?: TaskSubtask[]
  order: number
  createdAt: string
  updatedAt: string
  dueDate?: string
}

export interface ArchivedTask extends Task {
  archivedAt: string
}

export interface BackupData {
  version: 1
  exportedAt: string
  tasks: Task[]
  archive: ArchivedTask[]
}

export interface Column {
  id: ColumnId
  title: string
  accent: AccentColor
}

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', accent: 'pink' },
  { id: 'in-progress', title: 'In Progress', accent: 'orange' },
  { id: 'done', title: 'Done', accent: 'mint' },
]

export const ACCENT_COLORS: AccentColor[] = [
  'pink',
  'orange',
  'purple',
  'mint',
]

export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']

export const TASK_LABEL_PRESETS = [
  'features',
  'bug',
  'design',
  'docs',
] as const