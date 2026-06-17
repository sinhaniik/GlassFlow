import type { AccentColor } from '../../features/kanban/types'
import { ACCENT_COLORS } from '../../features/kanban/types'
import { accentRing } from '../../features/kanban/utils'

interface AccentPickerProps {
  value: AccentColor
  onChange: (accent: AccentColor) => void
}

const accentBg: Record<AccentColor, string> = {
  pink: 'bg-accent-pink',
  orange: 'bg-accent-orange',
  purple: 'bg-accent-purple',
  mint: 'bg-accent-mint',
}

const accentLabels: Record<AccentColor, string> = {
  pink: 'Pink',
  orange: 'Orange',
  purple: 'Purple',
  mint: 'Mint',
}

export function AccentPicker({ value, onChange }: AccentPickerProps) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Accent color">
      {ACCENT_COLORS.map((accent) => (
        <button
          key={accent}
          type="button"
          role="radio"
          aria-checked={value === accent}
          aria-label={accentLabels[accent]}
          onClick={() => onChange(accent)}
          className={[
            'h-8 w-8 rounded-full transition duration-200',
            accentBg[accent],
            value === accent
              ? `ring-2 ring-offset-2 ring-offset-bg-main ${accentRing[accent]} scale-110`
              : 'opacity-70 hover:opacity-100 hover:scale-105',
          ].join(' ')}
        />
      ))}
    </div>
  )
}