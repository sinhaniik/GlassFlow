import { useState } from 'react'
import type { TaskAttachment } from '../../features/kanban/types'
import { createAttachment } from '../../features/kanban/utils'

interface TaskAttachmentsFieldProps {
  value: TaskAttachment[]
  onChange: (attachments: TaskAttachment[]) => void
}

export function TaskAttachmentsField({
  value,
  onChange,
}: TaskAttachmentsFieldProps) {
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [error, setError] = useState('')

  function handleAdd() {
    const attachment = createAttachment(url, label)
    if (!attachment) {
      setError('Enter a valid link (e.g. https://example.com/blog)')
      return
    }
    if (value.length >= 10) {
      setError('Maximum 10 links per task')
      return
    }
    onChange([...value, attachment])
    setUrl('')
    setLabel('')
    setError('')
  }

  function handleRemove(id: string) {
    onChange(value.filter((item) => item.id !== id))
  }

  return (
    <div className="task-attachments">
      {value.length > 0 && (
        <ul className="task-attachments__list">
          {value.map((attachment) => (
            <li key={attachment.id} className="task-attachments__item">
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="task-attachments__link"
              >
                {attachment.label || attachment.url}
              </a>
              <button
                type="button"
                onClick={() => handleRemove(attachment.id)}
                className="task-attachments__remove"
                aria-label="Remove link"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="task-attachments__form">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setError('')
          }}
          placeholder="https://blog.example.com/article"
          className="glass-input task-attachments__input"
        />
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (optional)"
          className="glass-input task-attachments__input"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!url.trim() || value.length >= 10}
          className="task-attachments__add-btn"
        >
          Add link
        </button>
      </div>

      {error && <p className="task-field-error">{error}</p>}
    </div>
  )
}