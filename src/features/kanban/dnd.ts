import type { ColumnId } from './types'
import { DEFAULT_COLUMNS } from './types'
import { isColumnId } from './utils'

export function findColumnFromElement(
  element: Element | null,
): ColumnId | null {
  if (!element) return null
  const column = element.closest('[data-column-id]')
  const id = column?.getAttribute('data-column-id')
  return id && isColumnId(id) ? id : null
}

export function findColumnAtPoint(x: number, y: number): ColumnId | null {
  const elements = document.elementsFromPoint(x, y)
  for (const element of elements) {
    const fromElement = findColumnFromElement(element)
    if (fromElement) return fromElement
  }

  let nearest: { id: ColumnId; distance: number } | null = null
  for (const column of DEFAULT_COLUMNS) {
    const el = document.querySelector<HTMLElement>(
      `[data-column-id="${column.id}"]`,
    )
    if (!el) continue
    const rect = el.getBoundingClientRect()
    const insideX = x >= rect.left && x <= rect.right
    const insideY = y >= rect.top && y <= rect.bottom
    if (insideX && insideY) return column.id

    const dx =
      x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0
    const dy =
      y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0
    const distance = Math.hypot(dx, dy)
    if (!nearest || distance < nearest.distance) {
      nearest = { id: column.id, distance }
    }
  }

  return nearest && nearest.distance < 180 ? nearest.id : null
}

export function findTaskAtPoint(
  columnEl: HTMLElement,
  pointerY: number,
  excludeTaskId: string | null,
): string | null {
  const cards = columnEl.querySelectorAll<HTMLElement>('[data-task-id]')
  for (const card of cards) {
    const taskId = card.dataset.taskId
    if (!taskId || taskId === excludeTaskId) continue
    const rect = card.getBoundingClientRect()
    if (pointerY >= rect.top && pointerY <= rect.bottom) {
      return taskId
    }
  }
  return null
}

export function resolveInsertIndex(
  columnEl: HTMLElement,
  pointerY: number,
  excludeTaskId: string,
): number {
  const cards = columnEl.querySelectorAll<HTMLElement>('[data-task-id]')
  let index = 0

  for (const card of cards) {
    const taskId = card.dataset.taskId
    if (!taskId || taskId === excludeTaskId) continue
    const rect = card.getBoundingClientRect()
    if (pointerY < rect.top + rect.height / 2) return index
    index += 1
  }

  return index
}

export function getColumnElement(columnId: ColumnId): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-column-id="${columnId}"]`)
}