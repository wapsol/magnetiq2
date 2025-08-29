import { ReactNode } from 'react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface PricingTier {
  name: string
  price: {
    amount: number
    period: string
    currency?: string
  }
  description: string
  features: Array<{
    name: string
    included: boolean
  }>
  highlighted?: boolean
  ctaText: string
  ctaHref?: string
  onCtaClick?: () => void
  badge?: string
}

interface PricingTemplateProps {
  title: string
  subtitle?: string
  description?: string
  tiers: PricingTier[]
  billingToggle?: {
    monthly: string
    yearly: string
    isYearly: boolean
    onToggle: (isYearly: boolean) => void
  }
  className?: string
}

const PricingTemplate = ({
  title,
  subtitle,
  description,
  tiers,
  billingToggle,
  className = ''
}: PricingTemplateProps) => {
  return (
    <div className={className}>
      {/* Header */}
      <div className="text-center mb-12">
        {subtitle && (
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600 mb-4">
            {subtitle}
          </p>
        )}
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          {title}
        </h2>
        
        {description && (
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            {description}
          </p>
        )}
        
        {billingToggle && (
          <div className="flex items-center justify-center space-x-4 bg-gray-100 rounded-lg p-1 max-w-xs mx-auto">
            <button
              onClick={() => billingToggle.onToggle(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                !billingToggle.isYearly
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {billingToggle.monthly}
            </button>
            <button
              onClick={() => billingToggle.onToggle(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                billingToggle.isYearly
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {billingToggle.yearly}
            </button>
          </div>
        )}
      </div>

      {/* Pricing Grid */}
      <div className={`grid gap-8 ${
        tiers.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' :
        tiers.length === 3 ? 'md:grid-cols-3 max-w-6xl mx-auto' :
        'md:grid-cols-2 lg:grid-cols-4'
      }`}>
        {tiers.map((tier, index) => (
          <div
            key={tier.name}
            className={`relative rounded-2xl border ${
              tier.highlighted
                ? 'border-primary-500 shadow-2xl scale-105 bg-white'
                : 'border-gray-200 shadow-card bg-white hover:shadow-elevated'
            } transition-all duration-300 p-8`}
          >
            {tier.highlighted && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="badge badge-primary text-sm font-medium px-4 py-2">
                  Most Popular
                </span>
              </div>
            )}
            
            {tier.badge && (
              <div className="mb-4">
                <span className="badge badge-success text-xs">
                  {tier.badge}
                </span>
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {tier.name}
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                {tier.description}
              </p>
              
              <div className="mb-8">
                <div className="flex items-baseline justify-center">
                  <span className="text-sm text-gray-500 mr-1">
                    {tier.price.currency || '$'}
                  </span>
                  <span className="text-4xl font-bold text-gray-900">
                    {tier.price.amount}
                  </span>
                  <span className="text-gray-500 ml-1">
                    /{tier.price.period}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                What's included:
              </h4>
              <ul className="space-y-3">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    {feature.included ? (
                      <CheckIcon className="h-5 w-5 text-success-500 flex-shrink-0 mt-0.5 mr-3" />
                    ) : (
                      <XMarkIcon className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5 mr-3" />
                    )}
                    <span className={`text-sm ${
                      feature.included ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-auto">
              {tier.ctaHref ? (
                <a
                  href={tier.ctaHref}
                  className={`btn w-full justify-center ${
                    tier.highlighted
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  {tier.ctaText}
                </a>
              ) : (
                <button
                  onClick={tier.onCtaClick}
                  className={`btn w-full justify-center ${
                    tier.highlighted
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  {tier.ctaText}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PricingTemplate