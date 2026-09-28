import { createContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

const STORAGE_KEY = 'devina-kit-theme'

export interface ThemeContextType {
  dark: boolean
  toggle: () => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
  }, [dark])

  const toggle = () => setDark((d) => !d)

  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>
}
