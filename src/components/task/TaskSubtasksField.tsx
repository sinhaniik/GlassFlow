import { useState } from 'react'
import type { TaskSubtask } from '../../features/kanban/types'
import { createSubtask, getSubtaskProgress } from '../../features/kanban/utils'

interface TaskSubtasksFieldProps {
  value: TaskSubtask[]
  onChange: (subtasks: TaskSubtask[]) => void
}

export function TaskSubtasksField({ value, onChange }: TaskSubtasksFieldProps) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const progress = getSubtaskProgress(value)

  function handleAdd() {
    const subtask = createSubtask(draft)
    if (!subtask) {
      setError('Enter a subtask title before adding')
      return
    }
    if (value.length >= 15) {
      setError('Maximum 15 subtasks per task')
      return
    }
    onChange([...value, subtask])
    setDraft('')
    setError('')
  }

  function handleToggle(id: string) {
    onChange(
      value.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    )
  }

  function handleTitleChange(id: string, title: string) {
    onChange(
      value.map((item) => (item.id === id ? { ...item, title } : item)),
    )
  }

  function handleRemove(id: string) {
    onChange(value.filter((item) => item.id !== id))
  }

  return (
    <div className="task-subtasks">
      {value.length > 0 && (
        <>
          <div className="task-subtasks__progress-header">
            <span className="task-subtasks__progress-label">Progress</span>
            <span className="task-subtasks__progress-value">
              {progress.completed}/{progress.total}
            </span>
          </div>
          <div className="task-subtasks__progress-track">
            <div
              className="task-subtasks__progress-fill"
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          <ul className="task-subtasks__list">
            {value.map((subtask) => (
              <li key={subtask.id} className="task-subtasks__item">
                <label className="task-subtasks__row">
                  <input
                    type="checkbox"
                    checked={subtask.done}
                    onChange={() => handleToggle(subtask.id)}
                    className="task-subtasks__checkbox"
                  />
                  <input
                    type="text"
                    value={subtask.title}
                    onChange={(e) =>
                      handleTitleChange(subtask.id, e.target.value)
                    }
                    className={[
                      'task-subtasks__title-input',
                      subtask.done && 'task-subtasks__title-input--done',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleRemove(subtask.id)}
                  className="task-subtasks__remove"
                  aria-label="Remove subtask"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="task-subtasks__form">
        <input
          type="text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            setError('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAdd()
            }
          }}
          placeholder="e.g. Design UI, Build API…"
          className="glass-input task-subtasks__input"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!draft.trim() || value.length >= 15}
          className="task-subtasks__add-btn"
        >
          Add subtask
        </button>
      </div>

      {error && <p className="task-field-error">{error}</p>}
    </div>
  )
}