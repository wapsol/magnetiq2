import { useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { CalendarDaysIcon as CalendarDaysIconSolid } from '@heroicons/react/24/solid'
import { getCalendarIntegrations, trackCalendarIntegration, WebinarCalendarData } from '../../utils/calendar'

interface CalendarIntegrationProps {
  webinar: WebinarCalendarData
  registrationId?: string
  className?: string
  variant?: 'button' | 'dropdown' | 'list'
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
}

const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({
  webinar,
  registrationId,
  className = '',
  variant = 'dropdown',
  size = 'md',
  showLabels = true
}) => {
  const { language } = useLanguage()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [copiedToCalendar, setCopiedToCalendar] = useState<string | null>(null)

  const calendarIntegrations = getCalendarIntegrations(webinar, {
    includeLocation: true,
    includeDescription: true,
    includeReminders: true
  })

  const calendarOptions = [
    {
      id: 'google',
      name: 'Google Calendar',
      icon: '/icons/google-calendar.svg',
      action: () => window.open(calendarIntegrations.google, '_blank'),
      description: language === 'de' ? 'Zu Google Calendar hinzufügen' : 'Add to Google Calendar'
    },
    {
      id: 'outlook',
      name: 'Outlook',
      icon: '/icons/outlook.svg',
      action: () => window.open(calendarIntegrations.outlook, '_blank'),
      description: language === 'de' ? 'Zu Outlook hinzufügen' : 'Add to Outlook'
    },
    {
      id: 'office365',
      name: 'Office 365',
      icon: '/icons/office365.svg',
      action: () => window.open(calendarIntegrations.office365, '_blank'),
      description: language === 'de' ? 'Zu Office 365 hinzufügen' : 'Add to Office 365'
    },
    {
      id: 'yahoo',
      name: 'Yahoo Calendar',
      icon: '/icons/yahoo.svg',
      action: () => window.open(calendarIntegrations.yahoo, '_blank'),
      description: language === 'de' ? 'Zu Yahoo Calendar hinzufügen' : 'Add to Yahoo Calendar'
    },
    {
      id: 'ics',
      name: language === 'de' ? 'ICS-Datei' : 'ICS File',
      icon: null,
      action: calendarIntegrations.ics,
      description: language === 'de' ? 'Kalender-Datei herunterladen' : 'Download calendar file'
    }
  ]

  const handleCalendarClick = (option: typeof calendarOptions[0]) => {
    trackCalendarIntegration(webinar.id, option.id as any, registrationId)
    option.action()
    
    if (variant === 'dropdown') {
      setIsDropdownOpen(false)
    }
    
    // Show success feedback
    setCopiedToCalendar(option.id)
    setTimeout(() => setCopiedToCalendar(null), 3000)
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm'
      case 'lg':
        return 'px-8 py-4 text-lg'
      default:
        return 'px-6 py-3 text-base'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4'
      case 'lg':
        return 'h-6 w-6'
      default:
        return 'h-5 w-5'
    }
  }

  if (variant === 'button') {
    // Simple button that opens the most popular calendar (Google)
    return (
      <button
        onClick={() => handleCalendarClick(calendarOptions[0])}
        className={`inline-flex items-center border border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors ${getSizeClasses()} ${className}`}
      >
        <CalendarDaysIconSolid className={`${getIconSize()} mr-2`} />
        {showLabels && (language === 'de' ? 'Zum Kalender hinzufügen' : 'Add to Calendar')}
        {copiedToCalendar === 'google' && (
          <CheckCircleIcon className={`${getIconSize()} ml-2 text-green-600`} />
        )}
      </button>
    )
  }

  if (variant === 'list') {
    // List of calendar options
    return (
      <div className={`space-y-3 ${className}`}>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {language === 'de' ? 'Zum Kalender hinzufügen:' : 'Add to Calendar:'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {calendarOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleCalendarClick(option)}
              className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              {option.icon ? (
                <img 
                  src={option.icon} 
                  alt={option.name}
                  className={`${getIconSize()} mr-3 group-hover:scale-110 transition-transform`}
                />
              ) : (
                <CalendarDaysIcon className={`${getIconSize()} mr-3 text-gray-600 dark:text-gray-400`} />
              )}
              <div className="text-left flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.name}
                </div>
                {showLabels && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {option.description}
                  </div>
                )}
              </div>
              {copiedToCalendar === option.id && (
                <CheckCircleIcon className="h-4 w-4 text-green-600 ml-2" />
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`inline-flex items-center border border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors ${getSizeClasses()}`}
      >
        <CalendarDaysIconSolid className={`${getIconSize()} mr-2`} />
        {showLabels && (language === 'de' ? 'Zum Kalender hinzufügen' : 'Add to Calendar')}
        <ChevronDownIcon className={`${getIconSize()} ml-2 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2 mb-1">
                {language === 'de' ? 'Kalender wählen:' : 'Choose Calendar:'}
              </div>
              
              {calendarOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleCalendarClick(option)}
                  className="w-full flex items-center px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                >
                  <div className="flex-shrink-0 mr-3">
                    {option.icon ? (
                      <img 
                        src={option.icon} 
                        alt={option.name}
                        className={`${getIconSize()} group-hover:scale-110 transition-transform`}
                      />
                    ) : (
                      <CalendarDaysIcon className={`${getIconSize()} text-gray-600 dark:text-gray-400`} />
                    )}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {option.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </div>
                  </div>

                  {copiedToCalendar === option.id && (
                    <div className="flex-shrink-0 ml-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Footer with helpful tip */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {language === 'de' 
                  ? 'Termine werden automatisch mit Erinnerungen hinzugefügt'
                  : 'Events are added automatically with reminders'
                }
              </p>
            </div>
          </div>
        </>
      )}

      {/* Success notification */}
      {copiedToCalendar && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-30">
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center">
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            {language === 'de' ? 'Zum Kalender hinzugefügt!' : 'Added to calendar!'}
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarIntegration