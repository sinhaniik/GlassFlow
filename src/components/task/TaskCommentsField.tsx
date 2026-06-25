import { useState } from 'react'
import type { TaskComment } from '../../features/kanban/types'
import { createComment } from '../../features/kanban/utils'

interface TaskCommentsFieldProps {
  value: TaskComment[]
  onChange: (comments: TaskComment[]) => void
}

export function TaskCommentsField({ value, onChange }: TaskCommentsFieldProps) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  function handleAdd() {
    const comment = createComment(draft)
    if (!comment) {
      setError('Write a comment before adding')
      return
    }
    if (value.length >= 20) {
      setError('Maximum 20 comments per task')
      return
    }
    onChange([...value, comment])
    setDraft('')
    setError('')
  }

  function handleRemove(id: string) {
    onChange(value.filter((item) => item.id !== id))
  }

  return (
    <div className="task-comments">
      {value.length > 0 && (
        <ul className="task-comments__list">
          {value.map((comment) => (
            <li key={comment.id} className="task-comments__item">
              <p className="task-comments__text">{comment.text}</p>
              <div className="task-comments__meta">
                <time dateTime={comment.createdAt}>
                  {new Date(comment.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </time>
                <button
                  type="button"
                  onClick={() => handleRemove(comment.id)}
                  className="task-comments__remove"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <textarea
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          setError('')
        }}
        rows={3}
        placeholder="Add a status update, bug note, or idea…"
        className="glass-input task-comments__input"
      />

      <button
        type="button"
        onClick={handleAdd}
        disabled={!draft.trim() || value.length >= 20}
        className="task-comments__add-btn"
      >
        Add comment
      </button>

      {error && <p className="task-field-error">{error}</p>}
    </div>
  )
}