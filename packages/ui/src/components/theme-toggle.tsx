import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'

type ThemeMode = 'light' | 'dark' | 'auto'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'auto'
  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored
  return 'auto'
}

function applyThemeMode(mode: ThemeMode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(resolved)
  if (mode === 'auto') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', mode)
  }
  document.documentElement.style.colorScheme = resolved
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('auto')

  useEffect(() => {
    const m = getInitialMode()
    setMode(m)
    applyThemeMode(m)
  }, [])

  useEffect(() => {
    if (mode !== 'auto') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyThemeMode('auto')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [mode])

  function toggle() {
    const next: ThemeMode =
      mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light'
    setMode(next)
    applyThemeMode(next)
    window.localStorage.setItem('theme', next)
  }

  const Icon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Monitor
  const label = mode === 'auto' ? 'Auto' : mode === 'dark' ? 'Oscuro' : 'Claro'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Tema: ${label}`}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition hover:bg-accent"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}
