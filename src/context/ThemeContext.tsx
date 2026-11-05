import { createContext, useContext, useEffect, useState } from 'react'
import { istTheme, nextIstSwitch } from '../lib/ist'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
})

// The theme follows the time in India. Using the toggle holds the other theme until the next
// sunrise or sunset there. The inline script in index.html repeats this for the first paint.
const OVERRIDE_KEY = 'theme-override'

function currentTheme(): Theme {
  const now = Date.now()
  try {
    const held = JSON.parse(localStorage.getItem(OVERRIDE_KEY) ?? 'null') as { theme: Theme; until: number } | null
    if (held && held.until > now) return held.theme
  } catch { /* storage blocked or unreadable */ }
  return istTheme(now)
}

function holdTheme(theme: Theme) {
  const now = Date.now()
  try {
    if (theme === istTheme(now)) localStorage.removeItem(OVERRIDE_KEY)
    else localStorage.setItem(OVERRIDE_KEY, JSON.stringify({ theme, until: nextIstSwitch(now) }))
  } catch { /* storage blocked: the choice lasts until the next check */ }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(currentTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Switch at sunrise and sunset; the regular check also catches a device waking from sleep
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const check = () => {
      setTheme(currentTheme())
      timer = setTimeout(check, Math.min(nextIstSwitch() - Date.now() + 50, 60_000))
    }
    const onVisible = () => { if (!document.hidden) setTheme(currentTheme()) }
    timer = setTimeout(check, Math.min(nextIstSwitch() - Date.now() + 50, 60_000))
    document.addEventListener('visibilitychange', onVisible)
    try { localStorage.removeItem('theme') } catch { /* the old saved choice no longer applies */ }
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', onVisible) }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    holdTheme(next)
    setTheme(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
