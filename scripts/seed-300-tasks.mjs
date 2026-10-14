const columns = ['todo', 'in-progress', 'done']
const priorities = ['low', 'medium', 'high']
const order = Object.fromEntries(columns.map((column) => [column, 0]))
const now = new Date().toISOString()

function localDateOffset(offset) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

const tasks = Array.from({ length: 300 }, (_, index) => {
  const columnId = columns[index % columns.length]
  const task = {
    id: `performance-${String(index + 1).padStart(3, '0')}`,
    title: `Performance task ${String(index + 1).padStart(3, '0')}`,
    description: 'Generated for local rendering and drag profiling.',
    columnId,
    priority: priorities[index % priorities.length],
    dueDate: localDateOffset((index % 21) - 7),
    order: order[columnId]++,
    createdAt: now,
    updatedAt: now,
  }
  return task
})

const serialized = JSON.stringify(tasks)
if (process.argv.includes('--verify')) {
  console.log(`Generated ${tasks.length} tasks across ${columns.length} columns with priorities and date-only deadlines.`)
} else {
  console.log(`localStorage.setItem('glassflow-kanban', ${JSON.stringify(serialized)}); location.reload();`)
}
