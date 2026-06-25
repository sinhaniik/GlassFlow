interface EmptyStateProps {
  title: string
  hint?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title,
  hint,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        <svg width="56" height="56" viewBox="0 0 72 72" fill="none">
          <circle cx="36" cy="36" r="34" fill="var(--accent-purple)" opacity="0.25" />
          <circle cx="24" cy="28" r="10" fill="var(--accent-pink)" opacity="0.5" />
          <circle cx="48" cy="30" r="8" fill="var(--accent-orange)" opacity="0.5" />
          <circle cx="38" cy="48" r="9" fill="var(--accent-mint)" opacity="0.5" />
          <rect
            x="22"
            y="40"
            width="28"
            height="6"
            rx="3"
            fill="var(--text-secondary)"
            opacity="0.2"
          />
        </svg>
      </div>

      <p className="empty-state__title">{title}</p>

      {hint && <p className="empty-state__hint">{hint}</p>}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="empty-state__action pressable"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}