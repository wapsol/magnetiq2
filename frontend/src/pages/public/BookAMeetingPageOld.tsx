import { useState } from 'react'
import { 
  CalendarDaysIcon, 
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  VideoCameraIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  position: string
  consultationType: string
  preferredDate: string
  preferredTime: string
  timezone: string
  message: string
}

const BookAMeetingPage = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    consultationType: '',
    preferredDate: '',
    preferredTime: '',
    timezone: 'CET',
    message: ''
  })
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  
  const consultationTypes = [
    {
      id: 'platform-demo',
      name: 'Platform Demo',
      description: 'Get a personalized walkthrough of our platform features',
      duration: '30 minutes',
      icon: VideoCameraIcon,
      popular: false
    },
    {
      id: 'technical-consultation',
      name: 'Technical Consultation',
      description: 'Discuss technical requirements and implementation details',
      duration: '45 minutes',
      icon: ChatBubbleLeftRightIcon,
      popular: true
    },
    {
      id: 'business-strategy',
      name: 'Business Strategy',
      description: 'Strategic planning for digital transformation initiatives',
      duration: '60 minutes',
      icon: BuildingOfficeIcon,
      popular: false
    },
    {
      id: 'custom-solution',
      name: 'Custom Solution Design',
      description: 'Tailored solution architecture for your specific needs',
      duration: '90 minutes',
      icon: SparklesIcon,
      popular: false
    }
  ]
  
  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
  ]
  
  const timezones = [
    { value: 'CET', label: 'Central European Time (CET)' },
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
    { value: 'EST', label: 'Eastern Standard Time (EST)' },
    { value: 'PST', label: 'Pacific Standard Time (PST)' },
    { value: 'JST', label: 'Japan Standard Time (JST)' },
  ]
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }
  
  const validateStep = (step: number) => {
    const newErrors: Partial<FormData> = {}
    
    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
      if (!formData.email) newErrors.email = 'Email is required'
      if (!formData.phone) newErrors.phone = 'Phone is required'
    }
    
    if (step === 2) {
      if (!formData.company) newErrors.company = 'Company is required'
      if (!formData.consultationType) newErrors.consultationType = 'Please select a consultation type'
    }
    
    if (step === 3) {
      if (!formData.preferredDate) newErrors.preferredDate = 'Please select a date'
      if (!formData.preferredTime) newErrors.preferredTime = 'Please select a time'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }
  
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(3)) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Booking submitted:', formData)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting booking:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (isSubmitted) {
    return (
      <div className="bg-gray-25 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="card p-8 animate-scale-in">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="h-8 w-8 text-success-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Consultation Booked!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for booking a consultation with us. We'll send you a confirmation 
              email shortly with the meeting details and calendar invite.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Booking Details:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-4 w-4 mr-2" />
                  {formData.preferredDate}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  {formData.preferredTime} {formData.timezone}
                </div>
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  {consultationTypes.find(t => t.id === formData.consultationType)?.name}
                </div>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="btn-primary w-full"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-gray-25 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-accent-600 via-primary-600 to-secondary-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative container section-sm">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <CalendarDaysIcon className="h-12 w-12 text-primary-200" />
              <h1 className="text-4xl lg:text-6xl font-bold">
                Book Consultation
              </h1>
            </div>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Schedule a personalized consultation with our experts to discuss your 
              requirements and discover how our platform can transform your business.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="container py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step < currentStep 
                      ? 'bg-success-600 text-white' 
                      : step === currentStep 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step < currentStep ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      step
                    )}
                  </div>
                  <div className={`ml-2 text-sm font-medium ${
                    step <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step === 1 ? 'Personal Info' : step === 2 ? 'Consultation Type' : 'Schedule'}
                  </div>
                  {step < 3 && (
                    <div className={`ml-8 w-12 h-0.5 ${
                      step < currentStep ? 'bg-success-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container section">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="card p-8">
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="animate-fade-in">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Personal Information
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                          <label className="form-label required">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`form-input ${errors.firstName ? 'error' : ''}`}
                            placeholder="Enter your first name"
                          />
                          {errors.firstName && (
                            <p className="form-error">{errors.firstName}</p>
                          )}
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label required">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`form-input ${errors.lastName ? 'error' : ''}`}
                            placeholder="Enter your last name"
                          />
                          {errors.lastName && (
                            <p className="form-error">{errors.lastName}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="form-group">
                          <label className="form-label required">Email Address</label>
                          <div className="relative">
                            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className={`form-input pl-10 ${errors.email ? 'error' : ''}`}
                              placeholder="you@company.com"
                            />
                          </div>
                          {errors.email && (
                            <p className="form-error">{errors.email}</p>
                          )}
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label required">Phone Number</label>
                          <div className="relative">
                            <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className={`form-input pl-10 ${errors.phone ? 'error' : ''}`}
                              placeholder="+49 123 456 789"
                            />
                          </div>
                          {errors.phone && (
                            <p className="form-error">{errors.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 2: Consultation Details */}
                  {currentStep === 2 && (
                    <div className="animate-fade-in">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Consultation Details
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="form-group">
                          <label className="form-label required">Company</label>
                          <div className="relative">
                            <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              name="company"
                              value={formData.company}
                              onChange={handleInputChange}
                              className={`form-input pl-10 ${errors.company ? 'error' : ''}`}
                              placeholder="Your Company Name"
                            />
                          </div>
                          {errors.company && (
                            <p className="form-error">{errors.company}</p>
                          )}
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Position</label>
                          <input
                            type="text"
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Your Job Title"
                          />
                        </div>
                      </div>
                      
                      <div className="form-group mb-6">
                        <label className="form-label required">Consultation Type</label>
                        {errors.consultationType && (
                          <p className="form-error mb-3">{errors.consultationType}</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {consultationTypes.map((type) => {
                            const Icon = type.icon
                            return (
                              <label
                                key={type.id}
                                className={`relative flex cursor-pointer rounded-lg border p-4 hover:border-primary-300 transition-colors ${
                                  formData.consultationType === type.id
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 bg-white'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="consultationType"
                                  value={type.id}
                                  onChange={handleInputChange}
                                  className="sr-only"
                                />
                                <div className="flex items-start space-x-3">
                                  <Icon className={`h-6 w-6 mt-1 ${
                                    formData.consultationType === type.id
                                      ? 'text-primary-600'
                                      : 'text-gray-400'
                                  }`} />
                                  <div className="flex-1">
                                    <div className="flex items-center">
                                      <span className={`text-sm font-medium ${
                                        formData.consultationType === type.id
                                          ? 'text-primary-900'
                                          : 'text-gray-900'
                                      }`}>
                                        {type.name}
                                      </span>
                                      {type.popular && (
                                        <span className="ml-2 badge badge-primary text-xs">
                                          Popular
                                        </span>
                                      )}
                                    </div>
                                    <p className={`text-sm mt-1 ${
                                      formData.consultationType === type.id
                                        ? 'text-primary-700'
                                        : 'text-gray-600'
                                    }`}>
                                      {type.description}
                                    </p>
                                    <div className={`text-xs mt-2 flex items-center ${
                                      formData.consultationType === type.id
                                        ? 'text-primary-600'
                                        : 'text-gray-500'
                                    }`}>
                                      <ClockIcon className="h-4 w-4 mr-1" />
                                      {type.duration}
                                    </div>
                                  </div>
                                </div>
                                {formData.consultationType === type.id && (
                                  <div className="absolute top-4 right-4">
                                    <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                                  </div>
                                )}
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 3: Schedule */}
                  {currentStep === 3 && (
                    <div className="animate-fade-in">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Schedule Your Consultation
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="form-group">
                          <label className="form-label required">Preferred Date</label>
                          <input
                            type="date"
                            name="preferredDate"
                            value={formData.preferredDate}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            className={`form-input ${errors.preferredDate ? 'error' : ''}`}
                          />
                          {errors.preferredDate && (
                            <p className="form-error">{errors.preferredDate}</p>
                          )}
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label required">Timezone</label>
                          <select
                            name="timezone"
                            value={formData.timezone}
                            onChange={handleInputChange}
                            className="form-select"
                          >
                            {timezones.map((tz) => (
                              <option key={tz.value} value={tz.value}>
                                {tz.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="form-group mb-6">
                        <label className="form-label required">Preferred Time</label>
                        {errors.preferredTime && (
                          <p className="form-error mb-3">{errors.preferredTime}</p>
                        )}
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                          {timeSlots.map((time) => (
                            <label
                              key={time}
                              className={`relative flex cursor-pointer items-center justify-center rounded-lg border p-3 text-sm font-medium transition-colors hover:border-primary-300 ${
                                formData.preferredTime === time
                                  ? 'border-primary-500 bg-primary-50 text-primary-900'
                                  : 'border-gray-200 bg-white text-gray-900'
                              }`}
                            >
                              <input
                                type="radio"
                                name="preferredTime"
                                value={time}
                                onChange={handleInputChange}
                                className="sr-only"
                              />
                              {time}
                              {formData.preferredTime === time && (
                                <div className="absolute -top-1 -right-1">
                                  <CheckCircleIcon className="h-4 w-4 text-primary-600" />
                                </div>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Additional Message</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          rows={4}
                          className="form-textarea"
                          placeholder="Tell us more about your project or specific questions you'd like to discuss..."
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className={`btn-outline ${
                        currentStep === 1 ? 'invisible' : ''
                      }`}
                    >
                      Previous
                    </button>
                    
                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="btn-primary"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary flex items-center"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="spinner-sm mr-2"></div>
                            Booking...
                          </>
                        ) : (
                          'Book Consultation'
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Need Help?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <a href="mailto:contact@voltaicsystems.com" className="text-sm text-primary-600">
                        contact@voltaicsystems.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">+49 (0) 123 456 789</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Office</p>
                      <p className="text-sm text-gray-600">Berlin, Germany</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* What to Expect */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  What to Expect
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-success-600 mt-0.5" />
                    <p className="text-sm text-gray-600">
                      Personalized discussion about your requirements
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-success-600 mt-0.5" />
                    <p className="text-sm text-gray-600">
                      Live demo of relevant platform features
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-success-600 mt-0.5" />
                    <p className="text-sm text-gray-600">
                      Technical questions answered by experts
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-success-600 mt-0.5" />
                    <p className="text-sm text-gray-600">
                      Custom implementation roadmap
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-success-600 mt-0.5" />
                    <p className="text-sm text-gray-600">
                      No sales pressure - just valuable insights
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookAMeetingPage