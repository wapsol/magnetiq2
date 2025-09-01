import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to send password reset email')
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="mx-auto max-w-md">
            <div className="flex items-center mb-8">
              <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">voltAIc Systems</h1>
                <p className="text-sm text-gray-600">Magnetiq v2 • AdminPanel</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome to the Future of<br />
                <span className="text-primary-600">Content Management</span>
              </h2>
              <p className="text-lg text-gray-600">
                Access your admin dashboard to manage content, webinars, whitepapers, and consultation bookings all in one place.
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="h-6 w-6 bg-orange-100 rounded-full flex items-center justify-center mt-1 mr-4">
                    <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Enterprise Security</h3>
                    <p className="text-sm text-gray-600">Your data is protected with industry-leading security standards and encryption.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mt-1 mr-4">
                    <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI-Powered Insights</h3>
                    <p className="text-sm text-gray-600">Get intelligent recommendations for content optimization and audience engagement.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-1 mr-4">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Global Reach</h3>
                    <p className="text-sm text-gray-600">Manage multilingual content with ease and precision across all markets.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Success Message */}
        <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Check your email
              </h2>
              
              <p className="text-gray-600 mb-8">
                We've sent a password reset link to{' '}
                <span className="font-medium text-gray-900">{email}</span>
              </p>

              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    try again
                  </button>
                </p>

                <div className="pt-4">
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    ← Back to sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="mx-auto max-w-md">
          <div className="flex items-center mb-8">
            <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">voltAIc Systems</h1>
              <p className="text-sm text-gray-600">Magnetiq v2 • AdminPanel</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome to the Future of<br />
              <span className="text-primary-600">Content Management</span>
            </h2>
            <p className="text-lg text-gray-600">
              Access your admin dashboard to manage content, webinars, whitepapers, and consultation bookings all in one place.
            </p>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="h-6 w-6 bg-orange-100 rounded-full flex items-center justify-center mt-1 mr-4">
                  <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Enterprise Security</h3>
                  <p className="text-sm text-gray-600">Your data is protected with industry-leading security standards and encryption.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mt-1 mr-4">
                  <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI-Powered Insights</h3>
                  <p className="text-sm text-gray-600">Get intelligent recommendations for content optimization and audience engagement.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-1 mr-4">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Global Reach</h3>
                  <p className="text-sm text-gray-600">Manage multilingual content with ease and precision across all markets.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Reset your password
            </h2>
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Alert */}
            {error && (
              <div className="alert-error">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email-address" className="form-label required">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="form-input pl-10"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center items-center"
              >
                {isLoading ? (
                  <>
                    <div className="spinner-sm mr-2"></div>
                    Sending reset link...
                  </>
                ) : (
                  'Send reset link'
                )}
              </button>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                ← Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage