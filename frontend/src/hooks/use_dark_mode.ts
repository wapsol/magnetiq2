import { useState, useEffect } from 'react'

export type Theme = 'light' | 'dark' | 'system'

export const useDarkMode = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      return savedTheme
    }
    
    // Default to system preference
    return 'system'
  })

  const [isDark, setIsDark] = useState(false)

  // Function to get system preference
  const getSystemTheme = (): boolean => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // Function to apply theme to document
  const applyTheme = (isDarkMode: boolean) => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    setIsDark(isDarkMode)
  }

  // Function to set theme
  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    let shouldBeDark = false
    
    if (newTheme === 'dark') {
      shouldBeDark = true
    } else if (newTheme === 'light') {
      shouldBeDark = false
    } else {
      shouldBeDark = getSystemTheme()
    }
    
    applyTheme(shouldBeDark)
  }

  // Initialize theme on mount
  useEffect(() => {
    let shouldBeDark = false
    
    if (theme === 'dark') {
      shouldBeDark = true
    } else if (theme === 'light') {
      shouldBeDark = false
    } else {
      shouldBeDark = getSystemTheme()
    }
    
    applyTheme(shouldBeDark)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches)
      }
      
      mediaQuery.addEventListener('change', handleChange)
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
  }, [theme])

  return {
    theme,
    isDark,
    changeTheme,
    toggleTheme: () => changeTheme(isDark ? 'light' : 'dark')
  }
}

export default useDarkMode