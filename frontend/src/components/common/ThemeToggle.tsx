import { useState } from 'react'
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon 
} from '@heroicons/react/24/outline'
import { useDarkMode, Theme } from '../../hooks/use_dark_mode'

const ThemeToggle = () => {
  const { theme, changeTheme, isDark } = useDarkMode()
  const [isOpen, setIsOpen] = useState(false)

  const themes: { value: Theme; label: string; icon: React.ComponentType<any> }[] = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'system', label: 'System', icon: ComputerDesktopIcon },
  ]

  const currentTheme = themes.find(t => t.value === theme)
  const CurrentIcon = currentTheme?.icon || SunIcon

  const handleThemeChange = (newTheme: Theme) => {
    changeTheme(newTheme)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center w-10 h-10 p-2 rounded-lg border border-gray-200 dark:border-violet-700 bg-white dark:bg-violet-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-violet-700 transition-colors duration-200"
          aria-label="Toggle theme"
        >
          <CurrentIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-xl bg-white dark:bg-violet-800 shadow-lg border border-gray-200 dark:border-violet-700 focus:outline-none">
          <div className="p-1">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon
              return (
                <button
                  key={themeOption.value}
                  onClick={() => handleThemeChange(themeOption.value)}
                  className={`${
                    theme === themeOption.value
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-violet-700 hover:text-gray-900 dark:hover:text-white'
                  } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150`}
                >
                  <Icon
                    className={`${
                      theme === themeOption.value
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                    } mr-3 h-4 w-4 transition-colors duration-150`}
                    aria-hidden="true"
                  />
                  {themeOption.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export default ThemeToggle