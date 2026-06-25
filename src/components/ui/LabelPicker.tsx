import { useState, type KeyboardEvent } from 'react'
import { TASK_LABEL_PRESETS } from '../../features/kanban/types'

interface LabelPickerProps {
  value: string[]
  onChange: (labels: string[]) => void
}

export function LabelPicker({ value, onChange }: LabelPickerProps) {
  const [customLabel, setCustomLabel] = useState('')

  function toggleLabel(label: string) {
    const normalized = label.trim().toLowerCase()
    if (!normalized) return
    if (value.includes(normalized)) {
      onChange(value.filter((item) => item !== normalized))
      return
    }
    if (value.length >= 8) return
    onChange([...value, normalized])
  }

  function addCustomLabel() {
    toggleLabel(customLabel)
    setCustomLabel('')
  }

  function handleCustomKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomLabel()
    }
  }

  return (
    <div className="label-picker">
      <div className="label-picker__presets" role="group" aria-label="Labels">
        {TASK_LABEL_PRESETS.map((label) => (
          <button
            key={label}
            type="button"
            aria-pressed={value.includes(label)}
            onClick={() => toggleLabel(label)}
            className={[
              'label-picker__chip',
              value.includes(label) && 'label-picker__chip--active',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="label-picker__custom">
        <input
          type="text"
          value={customLabel}
          onChange={(e) => setCustomLabel(e.target.value)}
          onKeyDown={handleCustomKeyDown}
          placeholder="Add custom label…"
          className="glass-input label-picker__input"
        />
        <button
          type="button"
          onClick={addCustomLabel}
          disabled={!customLabel.trim() || value.length >= 8}
          className="label-picker__add-btn"
        >
          Add
        </button>
      </div>

      {value.length > 0 && (
        <div className="label-picker__selected">
          {value.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => toggleLabel(label)}
              className="label-picker__selected-chip"
              title="Remove label"
            >
              {label}
              <span aria-hidden>×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}