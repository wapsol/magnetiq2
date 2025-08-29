import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../hooks/redux'
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'

const LoginPage = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      // TODO: Implement actual login logic
      console.log('Login attempt:', { email, password, rememberMe })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For now, just show success (replace with actual auth logic)
      if (email === 'admin@voltaicsystems.com' && password === 'demo123') {
        // Success - in real app, this would dispatch login action
        console.log('Login successful')
      } else {
        setError('Invalid email or password. Please try again.')
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Error Alert */}
      {error && (
        <div className="alert-error">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      
      {/* Demo Credentials Info */}
      <div className="alert-info">
        <p className="text-sm font-medium mb-1">Demo Credentials</p>
        <p className="text-xs">Email: admin@voltaicsystems.com</p>
        <p className="text-xs">Password: demo123</p>
      </div>
      
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
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        
        {/* Password Field */}
        <div className="form-group">
          <label htmlFor="password" className="form-label required">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className="form-input pl-10 pr-10"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Remember me
          </label>
        </div>
        
        <div className="text-sm">
          <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
            Forgot your password?
          </a>
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
              Signing in...
            </>
          ) : (
            'Sign in to Dashboard'
          )}
        </button>
      </div>
      
      {/* Additional Options */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
            Contact administrator
          </a>
        </p>
      </div>
    </form>
  )
}

export default LoginPage