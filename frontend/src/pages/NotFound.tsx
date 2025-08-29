import { Link } from 'react-router-dom'
import { HomeIcon, ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative text-center max-w-2xl mx-auto">
        {/* 404 Animation */}
        <div className="relative mb-8 animate-fade-in">
          <div className="text-9xl font-bold text-primary-600/10 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <ExclamationTriangleIcon className="h-24 w-24 text-primary-600 animate-pulse" />
              <div className="absolute inset-0 bg-primary-600/20 rounded-full blur-xl -z-10 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been 
            moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn-primary btn-lg group"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="btn-outline btn-lg group"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Looking for something specific? Try these popular pages:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                to="/webinars"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Webinars
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                to="/whitepapers"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Whitepapers
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                to="/book-consultation"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Book Consultation
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600">
              Still need help? Contact our support team at{' '}
              <a 
                href="mailto:support@voltaicsystems.com" 
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                support@voltaicsystems.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound