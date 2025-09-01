import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { PublicLayout } from '../../components/layouts/PublicLayout'
import { ArrowRightIcon, CheckCircleIcon, StarIcon } from '@heroicons/react/24/outline'
import { LinkedInLogoIcon } from '../../components/common/LinkedInLogoIcon'

interface SignupStep {
  id: string
  title: string
  description: string
  completed: boolean
}

export const ConsultantSignupPage: React.FC = () => {
  const { language } = useLanguage()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [authUrl, setAuthUrl] = useState('')
  
  const isGerman = language === 'de'

  const signupSteps: SignupStep[] = [
    {
      id: 'linkedin',
      title: isGerman ? 'LinkedIn-Profil verknüpfen' : 'Connect LinkedIn Profile',
      description: isGerman 
        ? 'Verbinden Sie Ihr LinkedIn-Profil für eine nahtlose Registrierung'
        : 'Connect your LinkedIn profile for seamless registration',
      completed: false
    },
    {
      id: 'profile',
      title: isGerman ? 'KI-Profil generieren' : 'Generate AI Profile',
      description: isGerman
        ? 'Unsere KI erstellt Ihr optimiertes Beraterprofil'
        : 'Our AI creates your optimized consultant profile',
      completed: false
    },
    {
      id: 'kyc',
      title: isGerman ? 'Identitätsprüfung' : 'Identity Verification',
      description: isGerman
        ? 'Vervollständigen Sie die KYC-Prüfung für die Aktivierung'
        : 'Complete KYC verification for activation',
      completed: false
    },
    {
      id: 'launch',
      title: isGerman ? 'Profil aktivieren' : 'Launch Profile',
      description: isGerman
        ? 'Beginnen Sie mit der Akquise von Premium-Kunden'
        : 'Start acquiring premium clients',
      completed: false
    }
  ]

  const benefits = [
    {
      title: isGerman ? 'Premium-Kunden' : 'Premium Clients',
      description: isGerman
        ? 'Zugang zu hochwertigen Unternehmenskunden mit echtem AI-Transformationsbedarf'
        : 'Access high-value enterprise clients with real AI transformation needs',
      icon: StarIcon
    },
    {
      title: isGerman ? 'KI-optimierte Profile' : 'AI-Optimized Profiles',
      description: isGerman
        ? 'Professionelle Profile mit KI-generiertem Content für maximale Conversion'
        : 'Professional profiles with AI-generated content for maximum conversion',
      icon: CheckCircleIcon
    },
    {
      title: isGerman ? 'Automatisierte Akquise' : 'Automated Acquisition',
      description: isGerman
        ? 'LinkedIn-Integration für effiziente Kundengewinnung und Projektvermittlung'
        : 'LinkedIn integration for efficient client acquisition and project matching',
      icon: ArrowRightIcon
    }
  ]

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    if (error) {
      setError(isGerman ? 'LinkedIn-Authentifizierung fehlgeschlagen' : 'LinkedIn authentication failed')
      return
    }
    
    if (code && state) {
      handleLinkedInCallback(code, state)
    }
  }, [searchParams])

  const handleLinkedInCallback = async (code: string, state: string) => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/v1/consultants/auth/linkedin/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          state,
          linkedin_url: localStorage.getItem('consultant_linkedin_url') || ''
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Store consultant data
        localStorage.setItem('consultant_id', result.data.consultant_id)
        localStorage.setItem('consultant_profile', JSON.stringify(result.data.profile_data))
        
        // Navigate to next step
        if (result.data.is_new_consultant) {
          navigate('/consultant/onboarding/profile-review')
        } else {
          navigate('/consultant/dashboard')
        }
      } else {
        setError(result.error || (isGerman ? 'Anmeldung fehlgeschlagen' : 'Signup failed'))
      }
    } catch (err) {
      setError(isGerman ? 'Netzwerkfehler bei der Anmeldung' : 'Network error during signup')
    } finally {
      setIsLoading(false)
    }
  }

  const initiateLinkedInAuth = async () => {
    if (!linkedinUrl.trim()) {
      setError(isGerman ? 'Bitte geben Sie Ihre LinkedIn-URL ein' : 'Please enter your LinkedIn URL')
      return
    }
    
    // Validate LinkedIn URL format
    const linkedinUrlPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/
    if (!linkedinUrlPattern.test(linkedinUrl)) {
      setError(isGerman ? 'Ungültige LinkedIn-URL Format' : 'Invalid LinkedIn URL format')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      // Store LinkedIn URL for callback
      localStorage.setItem('consultant_linkedin_url', linkedinUrl)
      
      const response = await fetch('/api/v1/consultants/auth/linkedin/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          linkedin_url: linkedinUrl
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Redirect to LinkedIn OAuth
        window.location.href = result.data.auth_url
      } else {
        setError(result.error || (isGerman ? 'Initialisierung fehlgeschlagen' : 'Initialization failed'))
      }
    } catch (err) {
      setError(isGerman ? 'Netzwerkfehler' : 'Network error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <div className="relative py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                {isGerman ? (
                  <>
                    Werden Sie Teil der 
                    <span className="text-blue-600"> voltAIc</span>
                    <br />
                    <span className="text-indigo-600">Premium-Berater</span>
                  </>
                ) : (
                  <>
                    Join the 
                    <span className="text-blue-600">voltAIc</span>
                    <br />
                    <span className="text-indigo-600">Premium Consultant</span> Network
                  </>
                )}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                {isGerman
                  ? 'Verbinden Sie sich mit Unternehmenskunden, die echte AI-Transformation suchen. Profitieren Sie von KI-optimierten Profilen und automatisierter Kundenakquise.'
                  : 'Connect with enterprise clients seeking real AI transformation. Benefit from AI-optimized profiles and automated client acquisition.'}
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-indigo-500">
                    <benefit.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">{benefit.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Signup Process */}
        <div className="py-16 bg-gray-50">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">
                {isGerman ? 'Ihr Weg zum Premium-Berater' : 'Your Path to Premium Consulting'}
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                {isGerman 
                  ? 'Vier einfache Schritte zu hochwertigen Beratungsaufträgen'
                  : 'Four simple steps to high-value consulting projects'}
              </p>
            </div>

            {/* Process Steps */}
            <div className="space-y-8">
              {signupSteps.map((step, index) => (
                <div key={step.id} className="relative">
                  {index < signupSteps.length - 1 && (
                    <div className="absolute left-4 mt-8 h-8 w-px bg-gray-300"></div>
                  )}
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        step.completed ? 'bg-green-100' : index === 0 ? 'bg-indigo-100' : 'bg-gray-100'
                      }`}>
                        {step.completed ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <span className={`text-sm font-medium ${
                            index === 0 ? 'text-indigo-600' : 'text-gray-500'
                          }`}>
                            {index + 1}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* LinkedIn Signup Form */}
            <div className="mt-12 rounded-lg bg-white p-8 shadow-sm border border-gray-200">
              <div className="text-center">
                <LinkedInLogoIcon className="mx-auto h-12 w-12 text-blue-600" />
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  {isGerman ? 'Mit LinkedIn anmelden' : 'Sign up with LinkedIn'}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {isGerman
                    ? 'Ihre LinkedIn-Daten werden automatisch importiert und in ein optimiertes Beraterprofil umgewandelt.'
                    : 'Your LinkedIn data will be automatically imported and transformed into an optimized consultant profile.'}
                </p>
              </div>

              {error && (
                <div className="mt-6 rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}

              <div className="mt-6">
                <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700">
                  {isGerman ? 'LinkedIn-Profil URL' : 'LinkedIn Profile URL'}
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    id="linkedin-url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/in/your-profile"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    disabled={isLoading}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {isGerman
                    ? 'Geben Sie Ihre öffentliche LinkedIn-Profil-URL ein'
                    : 'Enter your public LinkedIn profile URL'}
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={initiateLinkedInAuth}
                  disabled={isLoading || !linkedinUrl.trim()}
                  className="flex w-full justify-center items-center gap-3 rounded-md bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      {isGerman ? 'Wird verarbeitet...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <LinkedInLogoIcon className="h-5 w-5" />
                      {isGerman ? 'Mit LinkedIn fortfahren' : 'Continue with LinkedIn'}
                      <ArrowRightIcon className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  {isGerman ? (
                    <>
                      Durch die Anmeldung stimmen Sie unseren{' '}
                      <a href="/legal/terms" className="text-indigo-600 hover:text-indigo-500">
                        Nutzungsbedingungen
                      </a>{' '}
                      und der{' '}
                      <a href="/legal/privacy" className="text-indigo-600 hover:text-indigo-500">
                        Datenschutzerklärung
                      </a>{' '}
                      zu.
                    </>
                  ) : (
                    <>
                      By signing up, you agree to our{' '}
                      <a href="/legal/terms" className="text-indigo-600 hover:text-indigo-500">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/legal/privacy" className="text-indigo-600 hover:text-indigo-500">
                        Privacy Policy
                      </a>.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}