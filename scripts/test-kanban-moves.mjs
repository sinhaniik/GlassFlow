import assert from 'node:assert/strict'
import { getInsertIndex, getColumnTasks, moveTask } from '../src/features/kanban/utils.ts'

const base = (id, columnId, order) => ({
  id,
  title: id,
  description: `notes-${id}`,
  columnId,
  priority: 'high',
  dueDate: '2026-10-20',
  order,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
})

function board(todo, progress = [], done = []) {
  return [
    ...todo.map((id, order) => base(id, 'todo', order)),
    ...progress.map((id, order) => base(id, 'in-progress', order)),
    ...done.map((id, order) => base(id, 'done', order)),
  ]
}

function moveOrder(tasks, id, columnId, index) {
  return getColumnTasks(moveTask(tasks, id, columnId, index), columnId).map(({ id: taskId }) => taskId)
}

assert.deepEqual(moveOrder(board(['a', 'b', 'c', 'd']), 'a', 'todo', 1), ['b', 'a', 'c', 'd'], 'first to middle')
assert.deepEqual(moveOrder(board(['a', 'b', 'c']), 'b', 'todo', 0), ['b', 'a', 'c'], 'middle to first')
assert.deepEqual(moveOrder(board(['a', 'b', 'c', 'd']), 'b', 'todo', 2), ['a', 'c', 'b', 'd'], 'down within column')
assert.deepEqual(moveOrder(board(['a', 'b', 'c', 'd']), 'd', 'todo', 1), ['a', 'd', 'b', 'c'], 'up within column')
assert.deepEqual(moveOrder(board(['a'], ['x', 'y']), 'a', 'in-progress', 0), ['a', 'x', 'y'], 'cross-column top')
assert.deepEqual(moveOrder(board(['a'], ['x', 'y']), 'a', 'in-progress', 1), ['x', 'a', 'y'], 'cross-column middle')
assert.deepEqual(moveOrder(board(['a'], ['x', 'y']), 'a', 'in-progress', 2), ['x', 'y', 'a'], 'cross-column bottom')
assert.deepEqual(moveOrder(board(['a']), 'a', 'done', 0), ['a'], 'empty column')
assert.deepEqual(moveOrder(board(['a'], ['x']), 'a', 'in-progress', 1), ['x', 'a'], 'one-item destination')

const source = board(['a', 'b'], ['x'])
const moved = moveTask(source, 'a', 'in-progress', 1)
assert.deepEqual(getColumnTasks(moved, 'todo').map(({ id, order }) => [id, order]), [['b', 0]])
assert.deepEqual(getColumnTasks(moved, 'in-progress').map(({ id, order }) => [id, order]), [['x', 0], ['a', 1]])
assert.equal(moved.find(({ id }) => id === 'a')?.priority, 'high')
assert.equal(moved.find(({ id }) => id === 'a')?.dueDate, '2026-10-20')
assert.equal(moved.find(({ id }) => id === 'a')?.description, 'notes-a')
assert.equal(source.find(({ id }) => id === 'a')?.columnId, 'todo', 'input board remains unchanged')

assert.equal(getInsertIndex(10, [{ top: 10, bottom: 30 }, { top: 40, bottom: 60 }]), 0, 'before first midpoint')
assert.equal(getInsertIndex(20, [{ top: 10, bottom: 30 }, { top: 40, bottom: 60 }]), 1, 'midpoint goes after card')
assert.equal(getInsertIndex(50, [{ top: 10, bottom: 30 }, { top: 40, bottom: 60 }]), 2, 'after last midpoint')
assert.equal(getInsertIndex(10, []), 0, 'empty column')

console.log('PASS 9 task move cases: first/middle, same-column up/down, cross-column top/middle/bottom, empty and one-item destinations')
console.log('PASS reindex source and destination to 0..n-1; preserve task fields; do not mutate input')
console.log('PASS midpoint insertion: above, on boundary, below, and empty list')
