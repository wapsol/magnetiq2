import { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { getCalendarIntegrations, WebinarCalendarData, downloadICSFile } from '../../utils/calendar'
import { getAllSharingOptions, WebinarSharingData } from '../../utils/socialSharing'

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  webinar: {
    id: string
    title: string
    description: string
    presenter: string
    date: Date
    duration: string
    meetingUrl?: string
  }
  onRegistrationSuccess: (registrationId: string) => void
}

interface RegistrationFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  jobTitle: string
  website: string
  industryVertical: string
  currentChallenges: string[]
  expertiseInterest: string[]
  specificQuestions: string
  followUpPreferences: string[]
  interestedServices: {
    oneOnOneConsultation: boolean
    workshopSeries: boolean
    whitepaperDownloads: boolean
    ongoingMentorship: boolean
  }
  specialRequirements: string
  termsAccepted: boolean
  marketingConsent: boolean
  privacyConsent: boolean
  consultantFollowUpConsent: boolean
}

interface ValidationErrors {
  [key: string]: string
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  webinar,
  onRegistrationSuccess
}) => {
  const { language, t } = useLanguage()
  const [currentStep, setCurrentStep] = useState<'personal' | 'professional' | 'preferences' | 'confirmation'>('personal')
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    website: '',
    industryVertical: '',
    currentChallenges: [],
    expertiseInterest: [],
    specificQuestions: '',
    followUpPreferences: [],
    interestedServices: {
      oneOnOneConsultation: false,
      workshopSeries: false,
      whitepaperDownloads: false,
      ongoingMentorship: false
    },
    specialRequirements: '',
    termsAccepted: false,
    marketingConsent: false,
    privacyConsent: false,
    consultantFollowUpConsent: false
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [registrationId, setRegistrationId] = useState<string | null>(null)

  const industries = [
    { value: 'technology', label: language === 'de' ? 'Technologie' : 'Technology' },
    { value: 'finance', label: language === 'de' ? 'Finanzen' : 'Finance' },
    { value: 'healthcare', label: language === 'de' ? 'Gesundheitswesen' : 'Healthcare' },
    { value: 'manufacturing', label: language === 'de' ? 'Fertigung' : 'Manufacturing' },
    { value: 'retail', label: language === 'de' ? 'Einzelhandel' : 'Retail' },
    { value: 'education', label: language === 'de' ? 'Bildung' : 'Education' },
    { value: 'consulting', label: language === 'de' ? 'Beratung' : 'Consulting' },
    { value: 'other', label: language === 'de' ? 'Andere' : 'Other' }
  ]

  const challenges = [
    { value: 'data-quality', label: language === 'de' ? 'Datenqualität' : 'Data Quality' },
    { value: 'infrastructure', label: language === 'de' ? 'Infrastruktur' : 'Infrastructure' },
    { value: 'skills-gap', label: language === 'de' ? 'Kompetenzlücke' : 'Skills Gap' },
    { value: 'budget-constraints', label: language === 'de' ? 'Budget-Beschränkungen' : 'Budget Constraints' },
    { value: 'regulatory-compliance', label: language === 'de' ? 'Regulatorische Compliance' : 'Regulatory Compliance' },
    { value: 'change-management', label: language === 'de' ? 'Change Management' : 'Change Management' }
  ]

  const followUpOptions = [
    { value: 'email', label: language === 'de' ? 'E-Mail-Updates' : 'Email Updates' },
    { value: 'consultation', label: language === 'de' ? '1:1 Beratung' : '1:1 Consultation' },
    { value: 'resources', label: language === 'de' ? 'Zusätzliche Ressourcen' : 'Additional Resources' },
    { value: 'newsletter', label: language === 'de' ? 'Newsletter' : 'Newsletter' }
  ]

  const steps = [
    { id: 'personal', name: language === 'de' ? 'Persönliche Daten' : 'Personal Info' },
    { id: 'professional', name: language === 'de' ? 'Berufliche Daten' : 'Professional Info' },
    { id: 'preferences', name: language === 'de' ? 'Präferenzen' : 'Preferences' },
    { id: 'confirmation', name: language === 'de' ? 'Bestätigung' : 'Confirmation' }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setCurrentStep('personal')
      setValidationErrors({})
      setRegistrationComplete(false)
      setRegistrationId(null)
    }
  }, [isOpen])

  const validateStep = (step: string): boolean => {
    const errors: ValidationErrors = {}

    if (step === 'personal') {
      if (!formData.firstName.trim()) {
        errors.firstName = language === 'de' ? 'Vorname ist erforderlich' : 'First name is required'
      }
      if (!formData.lastName.trim()) {
        errors.lastName = language === 'de' ? 'Nachname ist erforderlich' : 'Last name is required'
      }
      if (!formData.email.trim()) {
        errors.email = language === 'de' ? 'E-Mail ist erforderlich' : 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = language === 'de' ? 'Ungültige E-Mail-Adresse' : 'Invalid email address'
      }
    }

    if (step === 'professional') {
      if (!formData.company.trim()) {
        errors.company = language === 'de' ? 'Unternehmen ist erforderlich' : 'Company is required'
      }
    }

    if (step === 'preferences') {
      if (!formData.privacyConsent) {
        errors.privacyConsent = language === 'de' ? 'Datenschutzerklärung muss akzeptiert werden' : 'Privacy policy must be accepted'
      }
      if (!formData.termsAccepted) {
        errors.termsAccepted = language === 'de' ? 'Nutzungsbedingungen müssen akzeptiert werden' : 'Terms of service must be accepted'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const currentIndex = steps.findIndex(step => step.id === currentStep)
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1].id as any)
      }
    }
  }

  const handlePrev = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as any)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep('preferences')) {
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/v1/business/webinars/${webinar.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        setRegistrationId(result.registrationId || `reg-${Date.now()}`)
        setRegistrationComplete(true)
        setCurrentStep('confirmation')
        
        // Store registration locally
        localStorage.setItem(`webinar-${webinar.id}-registration`, result.registrationId)
        
        onRegistrationSuccess(result.registrationId)
      } else {
        const errorData = await response.json()
        setValidationErrors({ submit: errorData.message || 'Registration failed' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setValidationErrors({ submit: language === 'de' ? 'Registrierung fehlgeschlagen' : 'Registration failed' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof RegistrationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleArrayInputChange = (field: keyof RegistrationFormData, value: string, checked: boolean) => {
    const currentArray = formData[field] as string[]
    if (checked) {
      handleInputChange(field, [...currentArray, value])
    } else {
      handleInputChange(field, currentArray.filter(item => item !== value))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {registrationComplete 
                  ? (language === 'de' ? 'Registrierung bestätigt!' : 'Registration Confirmed!')
                  : (language === 'de' ? 'Webinar-Registrierung' : 'Webinar Registration')
                }
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {webinar.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Progress Bar */}
          {!registrationComplete && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= currentStepIndex 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-1 mx-2 ${
                        index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                {steps.map(step => (
                  <span key={step.id} className="truncate">{step.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'de' ? 'Vorname' : 'First Name'} *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        validationErrors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder={language === 'de' ? 'Max' : 'John'}
                    />
                  </div>
                  {validationErrors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'de' ? 'Nachname' : 'Last Name'} *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        validationErrors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder={language === 'de' ? 'Mustermann' : 'Doe'}
                    />
                  </div>
                  {validationErrors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'de' ? 'E-Mail-Adresse' : 'Email Address'} *
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      validationErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder={language === 'de' ? 'max@example.com' : 'john@example.com'}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'de' ? 'Telefonnummer' : 'Phone Number'}
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={language === 'de' ? '+49 123 456 789' : '+1 (555) 123-4567'}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 'professional' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'de' ? 'Unternehmen' : 'Company'} *
                </label>
                <div className="relative">
                  <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      validationErrors.company ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder={language === 'de' ? 'Ihr Unternehmen' : 'Your Company'}
                  />
                </div>
                {validationErrors.company && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.company}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'de' ? 'Position' : 'Job Title'}
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={language === 'de' ? 'CTO, Manager, etc.' : 'CTO, Manager, etc.'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'de' ? 'Branche' : 'Industry'}
                  </label>
                  <select
                    value={formData.industryVertical}
                    onChange={(e) => handleInputChange('industryVertical', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{language === 'de' ? 'Branche wählen' : 'Select Industry'}</option>
                    {industries.map(industry => (
                      <option key={industry.value} value={industry.value}>
                        {industry.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'de' ? 'Website' : 'Website'}
                </label>
                <div className="relative">
                  <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {language === 'de' ? 'Aktuelle Herausforderungen' : 'Current Challenges'} ({language === 'de' ? 'Mehrfachauswahl möglich' : 'Select all that apply'})
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {challenges.map(challenge => (
                    <label key={challenge.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.currentChallenges.includes(challenge.value)}
                        onChange={(e) => handleArrayInputChange('currentChallenges', challenge.value, e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{challenge.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'preferences' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'de' ? 'Spezielle Fragen an den Referenten' : 'Specific Questions for the Presenter'}
                </label>
                <textarea
                  value={formData.specificQuestions}
                  onChange={(e) => handleInputChange('specificQuestions', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={language === 'de' ? 'Haben Sie spezielle Fragen...?' : 'Do you have any specific questions...?'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {language === 'de' ? 'Interesse an zusätzlichen Services' : 'Interest in Additional Services'}
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.interestedServices.oneOnOneConsultation}
                      onChange={(e) => handleInputChange('interestedServices', {
                        ...formData.interestedServices,
                        oneOnOneConsultation: e.target.checked
                      })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {language === 'de' ? '1:1 Beratung mit dem Referenten' : '1:1 Consultation with Presenter'}
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.interestedServices.whitepaperDownloads}
                      onChange={(e) => handleInputChange('interestedServices', {
                        ...formData.interestedServices,
                        whitepaperDownloads: e.target.checked
                      })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {language === 'de' ? 'Whitepaper-Downloads' : 'Whitepaper Downloads'}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {language === 'de' ? 'Follow-up Präferenzen' : 'Follow-up Preferences'}
                </label>
                <div className="space-y-2">
                  {followUpOptions.map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.followUpPreferences.includes(option.value)}
                        onChange={(e) => handleArrayInputChange('followUpPreferences', option.value, e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Legal Consent */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="space-y-4">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {language === 'de' 
                        ? 'Ich akzeptiere die Nutzungsbedingungen und Teilnahmebedingungen für das Webinar.'
                        : 'I accept the terms of service and webinar participation guidelines.'
                      } *
                    </span>
                  </label>
                  {validationErrors.termsAccepted && (
                    <p className="text-red-500 text-sm">{validationErrors.termsAccepted}</p>
                  )}

                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.privacyConsent}
                      onChange={(e) => handleInputChange('privacyConsent', e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {language === 'de' 
                        ? 'Ich stimme der Datenschutzerklärung zu und der Verarbeitung meiner Daten für die Webinar-Teilnahme.'
                        : 'I agree to the privacy policy and processing of my data for webinar participation.'
                      } *
                    </span>
                  </label>
                  {validationErrors.privacyConsent && (
                    <p className="text-red-500 text-sm">{validationErrors.privacyConsent}</p>
                  )}

                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.marketingConsent}
                      onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {language === 'de' 
                        ? 'Ich möchte Informationen über zukünftige Webinare und relevante Services erhalten. (Optional)'
                        : 'I would like to receive information about future webinars and relevant services. (Optional)'
                      }
                    </span>
                  </label>

                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.consultantFollowUpConsent}
                      onChange={(e) => handleInputChange('consultantFollowUpConsent', e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {language === 'de' 
                        ? 'Der Referent darf mich für Follow-up Gespräche und Beratungsangebote kontaktieren. (Optional)'
                        : 'The presenter may contact me for follow-up discussions and consultation opportunities. (Optional)'
                      }
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'confirmation' && registrationComplete && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'de' ? 'Erfolgreich registriert!' : 'Successfully Registered!'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {language === 'de' 
                    ? `Sie sind jetzt für "${webinar.title}" registriert.`
                    : `You are now registered for "${webinar.title}".`
                  }
                </p>
                {registrationId && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {language === 'de' ? 'Registrierungsnummer' : 'Registration ID'}: {registrationId}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'de' ? 'Nächste Schritte:' : 'Next Steps:'}
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left">
                  <li>✓ {language === 'de' ? 'Bestätigungs-E-Mail wurde gesendet' : 'Confirmation email sent'}</li>
                  <li>✓ {language === 'de' ? 'Kalender-Einladung enthalten' : 'Calendar invitation included'}</li>
                  <li>✓ {language === 'de' ? 'Meeting-Link wird 1 Stunde vor dem Event gesendet' : 'Meeting link will be sent 1 hour before event'}</li>
                  <li>✓ {language === 'de' ? 'Erinnerung 24 Stunden vorher' : 'Reminder 24 hours before'}</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => downloadICSFile({
                    id: webinar.id,
                    title: webinar.title,
                    description: webinar.description,
                    startDate: webinar.date,
                    endDate: new Date(webinar.date.getTime() + (parseInt(webinar.duration) * 60000)),
                    timezone: 'Europe/Berlin',
                    registrationId
                  })}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  📅 {language === 'de' ? 'Kalender-Datei herunterladen' : 'Download Calendar File'}
                </button>
                
                <button
                  onClick={() => {
                    // Share functionality
                    if (navigator.share) {
                      navigator.share({
                        title: webinar.title,
                        text: language === 'de' 
                          ? `Ich habe mich für dieses Webinar registriert: ${webinar.title}`
                          : `I've registered for this webinar: ${webinar.title}`,
                        url: window.location.href
                      })
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  📢 {language === 'de' ? 'Webinar teilen' : 'Share Webinar'}
                </button>
              </div>
            </div>
          )}

          {validationErrors.submit && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.submit}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!registrationComplete && (
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium ${
                  currentStepIndex === 0
                    ? 'text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                } transition-colors`}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                {language === 'de' ? 'Zurück' : 'Back'}
              </button>

              {currentStep !== 'preferences' ? (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  {language === 'de' ? 'Weiter' : 'Next'}
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {language === 'de' ? 'Registrierung läuft...' : 'Registering...'}
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      {language === 'de' ? 'Registrierung abschließen' : 'Complete Registration'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {registrationComplete && (
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              {language === 'de' ? 'Schließen' : 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RegistrationModal