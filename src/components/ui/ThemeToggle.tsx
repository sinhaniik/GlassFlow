import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { toggleTheme } from '../../features/theme/themeSlice'

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill="#D8C9FA" fillOpacity="0.2" />
      <path
        d="M42 43.5C30.5 43.5 21 34 21 22.5C21 18.2 22.3 14.2 24.5 11C16.5 13.5 11 21 11 30C11 41.5 20.5 51 32 51C40.5 51 47.8 46 50.5 38.5C47.5 41.5 45 43.5 42 43.5Z"
        stroke="#1C1B1F"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill="#4A3319" />
      <circle cx="32" cy="32" r="11" stroke="#E6E1E5" strokeWidth="3" />
      <path
        d="M32 10V14M32 50V54M10 32H14M50 32H54M16.5 16.5L19.5 19.5M44.5 44.5L47.5 47.5M16.5 47.5L19.5 44.5M44.5 19.5L47.5 16.5"
        stroke="#E6E1E5"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ThemeToggle() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme.theme)
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      className="shrink-0 rounded-xl transition duration-200 hover:scale-105 active:scale-95"
    >
      {isLight ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}
