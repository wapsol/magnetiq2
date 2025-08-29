import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ThemeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Helper function to determine if it's night time (6 PM to 6 AM)
  const isNightTime = () => {
    const hour = new Date().getHours()
    return hour >= 18 || hour < 6
  }

  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) {
      return JSON.parse(stored)
    }
    
    // Check if user has manually set a preference before
    const hasManualPreference = localStorage.getItem('hasManualThemePreference')
    if (!hasManualPreference) {
      // First time visitor - use time-based detection
      return isNightTime()
    }
    
    // Fallback to system preference for users who had manual preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // Mark that user has manually set a preference
    localStorage.setItem('hasManualThemePreference', 'true')
  }

  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
    
    // Apply dark class to html element
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    // Check if user has manual preference - if not, update theme based on time
    const hasManualPreference = localStorage.getItem('hasManualThemePreference')
    if (!hasManualPreference) {
      // Update theme every hour for users without manual preference
      const interval = setInterval(() => {
        const shouldBeDark = isNightTime()
        if (shouldBeDark !== isDarkMode) {
          setIsDarkMode(shouldBeDark)
        }
      }, 60 * 60 * 1000) // Check every hour

      // Also check when the component mounts
      const shouldBeDark = isNightTime()
      if (shouldBeDark !== isDarkMode) {
        setIsDarkMode(shouldBeDark)
      }

      return () => clearInterval(interval)
    }
  }, [isDarkMode])

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}