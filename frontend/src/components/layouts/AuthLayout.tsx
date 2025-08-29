import { Outlet } from 'react-router-dom'
import { BoltIcon, ShieldCheckIcon, CpuChipIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative flex">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 xl:px-12">
          <div className="max-w-md mx-auto w-full">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="relative">
                <BoltIcon className="h-10 w-10 text-primary-600" />
                <div className="absolute inset-0 bg-primary-600/20 rounded-lg blur-md -z-10"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">
                  voltAIc Systems
                </span>
                <span className="text-sm text-gray-500 -mt-1">
                  Magnetiq v2 Platform
                </span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Welcome to the Future of 
              <span className="text-gradient block">Content Management</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Access your admin dashboard to manage content, webinars, whitepapers, 
              and consultation bookings all in one place.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <ShieldCheckIcon className="h-6 w-6 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Enterprise Security</h3>
                  <p className="text-sm text-gray-600">Your data is protected with industry-leading security measures.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CpuChipIcon className="h-6 w-6 text-accent-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">AI-Powered Insights</h3>
                  <p className="text-sm text-gray-600">Get intelligent recommendations for content optimization.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <GlobeAltIcon className="h-6 w-6 text-success-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900">Global Reach</h3>
                  <p className="text-sm text-gray-600">Manage multilingual content with ease and precision.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Login Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {/* Mobile Logo */}
            <div className="lg:hidden">
              <div className="flex items-center justify-center space-x-2 mb-8">
                <BoltIcon className="h-8 w-8 text-primary-600" />
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900">
                    voltAIc Systems
                  </span>
                  <span className="text-xs text-gray-500 -mt-0.5">
                    Magnetiq v2
                  </span>
                </div>
              </div>
            </div>
            
            {/* Form Header */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900">
                Sign in to your account
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Access your admin dashboard to manage your content and business operations
              </p>
            </div>
            
            {/* Form Container */}
            <div className="mt-8">
              <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
                <Outlet />
              </div>
              
              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Need help? Contact{' '}
                  <a href="mailto:support@voltaicsystems.com" className="font-medium text-primary-600 hover:text-primary-500">
                    support@voltaicsystems.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout