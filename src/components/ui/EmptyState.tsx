interface EmptyStateProps {
  label: string
}

export function EmptyState({ label }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-2 py-6 text-center sm:gap-3 sm:py-10">
      <svg
        width="56"
        height="56"
        className="opacity-70 sm:h-[4.5rem] sm:w-[4.5rem]"
        viewBox="0 0 72 72"
        fill="none"
        aria-hidden="true"
      >
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
      <p className="max-w-[14rem] text-xs leading-relaxed text-text-secondary sm:max-w-none sm:text-sm">
        {label}
      </p>
    </div>
  )
}