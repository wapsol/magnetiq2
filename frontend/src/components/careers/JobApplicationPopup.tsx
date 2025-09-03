import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  XMarkIcon, 
  CloudArrowUpIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentIcon,
  LinkIcon,
  ShareIcon
} from '@heroicons/react/24/outline'

interface Position {
  title: string
  department: string
  location: string
  type: string
}

interface JobApplicationPopupProps {
  isOpen: boolean
  onClose: () => void
  position: Position | null
}

interface FormData {
  linkedin_profile: string
  github_profile: string
  consent_cv_sharing: boolean
  consent_ai_processing: boolean
  consent_communications: boolean
}

interface ValidationErrors {
  [key: string]: string
}

const JobApplicationPopup: React.FC<JobApplicationPopupProps> = ({
  isOpen,
  onClose,
  position
}) => {
  const { language } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    linkedin_profile: '',
    github_profile: '',
    consent_cv_sharing: false,
    consent_ai_processing: false,
    consent_communications: false
  })
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [submitError, setSubmitError] = useState<string>('')
  const [showSuccessActions, setShowSuccessActions] = useState(false)
  
  // Configuration
  const maxFileSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  const allowedExtensions = ['.pdf', '.doc', '.docx']

  const messages = {
    en: {
      title: 'Apply for Position',
      simplifiedProcess: 'We\'ve streamlined our application process to save your time. Simply upload your CV and share your LinkedIn profile - that gives us enough information to start evaluating your application.',
      uploading: 'Uploading...',
      success: 'Application Submitted Successfully!',
      successMessage: 'Thank you for your application. We\'ll review it and get back to you within 5-7 business days.',
      nextSteps: 'You will receive a confirmation email shortly. Please check your spam folder if you don\'t see it in your inbox.',
      shareOnLinkedIn: 'Share on LinkedIn',
      linkedInShareText: 'I just applied for a position at voltAIc Systems! Excited about the opportunity to work with AI and data innovation.',
      closeButton: 'Close',
      linkedinLabel: 'LinkedIn Profile*',
      linkedinPlaceholder: 'https://linkedin.com/in/your-profile',
      githubLabel: 'GitHub Profile',
      githubPlaceholder: 'https://github.com/your-username',
      uploadLabel: 'Upload Your CV*',
      uploadInstructions: 'Upload your CV in PDF, DOC, or DOCX format (max 10MB)',
      dropZoneText: 'Drop your CV here or click to browse',
      consentTitle: 'GDPR Compliant Privacy Consent',
      consentCvSharing: 'I allow voltAIc to share my CV with trusted recruitment partners to identify suitable career opportunities. This data will be processed in accordance with GDPR regulations.',
      consentAiProcessing: 'I consent to the GDPR-compliant processing of my application materials by AI systems in the private cloud to optimize the recruitment process.',
      consentCommunications: 'I would like to be informed about new job openings and the status of my application in accordance with GDPR communication preferences.',
      gdprNotice: 'All personal data is processed in compliance with GDPR. You have the right to access, rectify, or delete your data at any time by contacting privacy@voltaic.systems.',
      submitButton: 'Submit Application',
      cancelButton: 'Cancel',
      requiredField: 'This field is required',
      invalidLinkedin: 'Please enter a valid LinkedIn profile URL',
      invalidGithub: 'Please enter a valid GitHub profile URL',
      invalidFileType: 'Please upload a PDF, DOC, or DOCX file',
      fileTooLarge: 'File size must be less than 10MB',
      fileSelected: 'File selected:'
    },
    de: {
      title: 'Bewerbung für Position',
      simplifiedProcess: 'Wir haben unseren Bewerbungsprozess vereinfacht, um Ihre Zeit zu sparen. Laden Sie einfach Ihren Lebenslauf hoch und teilen Sie Ihr LinkedIn-Profil - das gibt uns genügend Informationen, um mit der Bewertung Ihrer Bewerbung zu beginnen.',
      uploading: 'Lädt hoch...',
      success: 'Bewerbung erfolgreich eingereicht!',
      successMessage: 'Vielen Dank für Ihre Bewerbung. Wir werden sie prüfen und uns innerhalb von 5-7 Werktagen bei Ihnen melden.',
      nextSteps: 'Sie erhalten in Kürze eine Bestätigungs-E-Mail. Bitte überprüfen Sie Ihren Spam-Ordner, falls Sie sie nicht in Ihrem Posteingang finden.',
      shareOnLinkedIn: 'Auf LinkedIn teilen',
      linkedInShareText: 'Ich habe mich gerade bei voltAIc Systems beworben! Ich freue mich auf die Möglichkeit, im Bereich KI und Dateninnovation zu arbeiten.',
      closeButton: 'Schließen',
      linkedinLabel: 'LinkedIn-Profil*',
      linkedinPlaceholder: 'https://linkedin.com/in/ihr-profil',
      githubLabel: 'GitHub-Profil',
      githubPlaceholder: 'https://github.com/ihr-benutzername',
      uploadLabel: 'Laden Sie Ihren Lebenslauf hoch*',
      uploadInstructions: 'Laden Sie Ihren Lebenslauf im PDF-, DOC- oder DOCX-Format hoch (max. 10MB)',
      dropZoneText: 'Lebenslauf hier ablegen oder klicken zum Durchsuchen',
      consentTitle: 'DSGVO-konformes Datenschutz-Einverständnis',
      consentCvSharing: 'Ich erlaube voltAIc, meinen Lebenslauf mit vertrauenswürdigen Recruiting-Partnern zu teilen, um passende Karrieremöglichkeiten zu finden. Diese Daten werden gemäß DSGVO-Bestimmungen verarbeitet.',
      consentAiProcessing: 'Ich stimme der DSGVO-konformen Verarbeitung meiner Bewerbungsunterlagen durch KI-Systeme in der privaten Cloud zu, um den Bewerbungsprozess zu optimieren.',
      consentCommunications: 'Ich möchte über neue Stellenausschreibungen und den Status meiner Bewerbung gemäß DSGVO-Kommunikationspräferenzen informiert werden.',
      gdprNotice: 'Alle personenbezogenen Daten werden DSGVO-konform verarbeitet. Sie haben jederzeit das Recht auf Zugang, Berichtigung oder Löschung Ihrer Daten durch Kontakt an privacy@voltaic.systems.',
      submitButton: 'Bewerbung einreichen',
      cancelButton: 'Abbrechen',
      requiredField: 'Dieses Feld ist erforderlich',
      invalidLinkedin: 'Bitte geben Sie eine gültige LinkedIn-Profil-URL ein',
      invalidGithub: 'Bitte geben Sie eine gültige GitHub-Profil-URL ein',
      invalidFileType: 'Bitte laden Sie eine PDF-, DOC- oder DOCX-Datei hoch',
      fileTooLarge: 'Dateigröße muss kleiner als 10MB sein',
      fileSelected: 'Datei ausgewählt:'
    }
  }

  const t = messages[language as keyof typeof messages] || messages.en

  // Form validation
  const validateForm = useCallback((): boolean => {
    const errors: ValidationErrors = {}
    
    // LinkedIn validation (required)
    if (!formData.linkedin_profile.trim()) {
      errors.linkedin_profile = t.requiredField
    } else {
      const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-\.]+\/?$/
      if (!linkedinPattern.test(formData.linkedin_profile)) {
        errors.linkedin_profile = t.invalidLinkedin
      }
    }
    
    // GitHub validation (optional)
    if (formData.github_profile.trim()) {
      const githubPattern = /^https?:\/\/(www\.)?github\.com\/[\w\-\.]+\/?$/
      if (!githubPattern.test(formData.github_profile)) {
        errors.github_profile = t.invalidGithub
      }
    }
    
    // File validation
    if (!selectedFile) {
      errors.cv_file = t.requiredField
    } else {
      if (!allowedTypes.includes(selectedFile.type)) {
        errors.cv_file = t.invalidFileType
      }
      if (selectedFile.size > maxFileSize) {
        errors.cv_file = t.fileTooLarge
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData, selectedFile, t])

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
    setValidationErrors(prev => ({ ...prev, cv_file: '' }))
  }, [])

  // Handle file input change
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      // Prepare form data for submission
      const submitFormData = new FormData()
      
      // Add position information
      submitFormData.append('position_title', position?.title || '')
      submitFormData.append('position_department', position?.department || '')
      submitFormData.append('position_location', position?.location || '')
      submitFormData.append('position_type', position?.type || '')
      
      // Add profile information
      submitFormData.append('linkedin_profile', formData.linkedin_profile)
      submitFormData.append('github_profile', formData.github_profile || '')
      
      // Add consent information
      submitFormData.append('consent_cv_sharing', formData.consent_cv_sharing.toString())
      submitFormData.append('consent_ai_processing', formData.consent_ai_processing.toString())
      submitFormData.append('consent_communications', formData.consent_communications.toString())
      
      // Add language and referrer
      submitFormData.append('application_language', language)
      submitFormData.append('referrer_url', window.location.href)
      
      // Add CV file
      if (selectedFile) {
        submitFormData.append('cv_file', selectedFile)
      }
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)
      
      // Submit to API
      const response = await fetch('/api/v1/careers/applications', {
        method: 'POST',
        body: submitFormData
      })
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Application submission failed')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setSubmitSuccess(true)
        setShowSuccessActions(true)
        // Don't auto-close anymore - user must click close button
      } else {
        throw new Error(result.error || 'Application submission failed')
      }
      
    } catch (error) {
      console.error('Application submission error:', error)
      setSubmitError(error instanceof Error ? error.message : 'An error occurred during submission')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [validationErrors])

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
      return () => document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, isSubmitting, onClose])

  // LinkedIn share handler
  const handleLinkedInShare = useCallback(() => {
    const shareText = encodeURIComponent(t.linkedInShareText)
    const shareUrl = encodeURIComponent(window.location.origin + '/about/careers')
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&text=${shareText}`
    window.open(linkedInUrl, '_blank', 'width=600,height=400')
  }, [t.linkedInShareText])

  // Close handler
  const handleClose = useCallback(() => {
    if (isSubmitting) return
    onClose()
  }, [isSubmitting, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-200 transform scale-100 opacity-100"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t.title}
                </h2>
                {position && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {position.title} - {position.department}
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {!submitSuccess && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {t.simplifiedProcess}
                </p>
              </div>
            )}
            {submitSuccess ? (
              // Success State
              <div className="text-center transition-all duration-300 opacity-100 translate-y-0">
                <div className="mb-6">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {t.success}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t.successMessage}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                    {t.nextSteps}
                  </p>
                  
                  {/* Success Actions */}
                  {showSuccessActions && (
                    <div className="space-y-3">
                      <button
                        onClick={handleLinkedInShare}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <ShareIcon className="h-5 w-5" />
                        <span>{t.shareOnLinkedIn}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setSubmitSuccess(false)
                          setShowSuccessActions(false)
                          setFormData({
                            linkedin_profile: '',
                            github_profile: '',
                            consent_cv_sharing: false,
                            consent_ai_processing: false,
                            consent_communications: false
                          })
                          setSelectedFile(null)
                          setUploadProgress(0)
                          setValidationErrors({})
                          onClose()
                        }}
                        className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                      >
                        {t.closeButton}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Application Form
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* LinkedIn Profile */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    <LinkIcon className="h-4 w-4 inline mr-1" />
                    {t.linkedinLabel}
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin_profile}
                    onChange={(e) => handleInputChange('linkedin_profile', e.target.value)}
                    placeholder={t.linkedinPlaceholder}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white ${
                      validationErrors.linkedin_profile
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {validationErrors.linkedin_profile && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.linkedin_profile}
                    </p>
                  )}
                </div>

                {/* GitHub Profile */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    <LinkIcon className="h-4 w-4 inline mr-1" />
                    {t.githubLabel}
                  </label>
                  <input
                    type="url"
                    value={formData.github_profile}
                    onChange={(e) => handleInputChange('github_profile', e.target.value)}
                    placeholder={t.githubPlaceholder}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white ${
                      validationErrors.github_profile
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {validationErrors.github_profile && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.github_profile}
                    </p>
                  )}
                </div>

                {/* CV Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    <DocumentIcon className="h-4 w-4 inline mr-1" />
                    {t.uploadLabel}
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {t.uploadInstructions}
                  </p>
                  
                  {/* Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragOver
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : validationErrors.cv_file
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={allowedExtensions.join(',')}
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    
                    {selectedFile ? (
                      <div className="space-y-2">
                        <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t.fileSelected}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <CloudArrowUpIcon className="h-8 w-8 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t.dropZoneText}
                        </p>
                      </div>
                    )}
                    
                    {/* Upload Progress */}
                    {isSubmitting && uploadProgress > 0 && (
                      <div className="mt-4">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {t.uploading} {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {validationErrors.cv_file && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.cv_file}
                    </p>
                  )}
                </div>

                {/* Consent Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t.consentTitle}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* CV Sharing Consent */}
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consent_cv_sharing}
                        onChange={(e) => handleInputChange('consent_cv_sharing', e.target.checked)}
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t.consentCvSharing}
                      </span>
                    </label>
                    
                    {/* AI Processing Consent */}
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consent_ai_processing}
                        onChange={(e) => handleInputChange('consent_ai_processing', e.target.checked)}
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t.consentAiProcessing}
                      </span>
                    </label>
                    
                    {/* Communications Consent */}
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consent_communications}
                        onChange={(e) => handleInputChange('consent_communications', e.target.checked)}
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t.consentCommunications}
                      </span>
                    </label>
                  </div>
                  
                  {/* GDPR Notice */}
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t.gdprNotice}
                    </p>
                  </div>
                </div>

                {/* Error Message */}
                {submitError && (
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{submitError}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t.cancelButton}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? t.uploading : t.submitButton}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobApplicationPopup