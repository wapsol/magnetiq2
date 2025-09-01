import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, User, Mail, Phone, Building, Globe, Check } from 'lucide-react';
import { BookingData } from '../ConsultationBookingModal';

interface ContactInfoStepProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  language: string;
}

const ContactInfoStep: React.FC<ContactInfoStepProps> = ({
  bookingData,
  updateBookingData,
  onNext,
  onBack,
  language
}) => {
  const [contactInfo, setContactInfo] = useState({
    firstName: bookingData.contactInfo?.firstName || '',
    lastName: bookingData.contactInfo?.lastName || '',
    email: bookingData.contactInfo?.email || '',
    company: bookingData.contactInfo?.company || '',
    website: bookingData.contactInfo?.website || '',
    phone: bookingData.contactInfo?.phone || ''
  });
  
  const [termsAccepted, setTermsAccepted] = useState(
    bookingData.termsAccepted || false
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTermsChange = (accepted: boolean) => {
    setTermsAccepted(accepted);
    updateBookingData({ termsAccepted: accepted });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!contactInfo.firstName.trim()) {
      newErrors.firstName = language === 'de' 
        ? 'Vorname ist erforderlich'
        : 'First name is required';
    }

    if (!contactInfo.lastName.trim()) {
      newErrors.lastName = language === 'de' 
        ? 'Nachname ist erforderlich'
        : 'Last name is required';
    }

    if (!contactInfo.email.trim()) {
      newErrors.email = language === 'de' 
        ? 'E-Mail ist erforderlich'
        : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
      newErrors.email = language === 'de' 
        ? 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
        : 'Please enter a valid email address';
    }

    if (!contactInfo.phone.trim()) {
      newErrors.phone = language === 'de' 
        ? 'Telefonnummer ist erforderlich'
        : 'Phone number is required';
    } else if (!/^[\+]?[\d\s\-\(\)]{8,}$/.test(contactInfo.phone)) {
      newErrors.phone = language === 'de' 
        ? 'Bitte geben Sie eine gültige Telefonnummer ein'
        : 'Please enter a valid phone number';
    }

    if (contactInfo.website && !/^https?:\/\/.+/.test(contactInfo.website)) {
      newErrors.website = language === 'de' 
        ? 'Bitte geben Sie eine gültige Website-URL ein (mit http:// oder https://)'
        : 'Please enter a valid website URL (with http:// or https://)';
    }

    if (!termsAccepted) {
      newErrors.terms = language === 'de' 
        ? 'Sie müssen die Allgemeinen Geschäftsbedingungen akzeptieren'
        : 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      updateBookingData({ 
        contactInfo: contactInfo,
        termsAccepted: termsAccepted
      });
      onNext();
    }
  };

  const formatDate = (date: Date) => {
    if (language === 'de') {
      return date.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const timeSlotLabels = {
    '10:00': {
      en: '10:00 AM',
      de: '10:00 Uhr'
    },
    '14:00': {
      en: '2:00 PM', 
      de: '14:00 Uhr'
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {language === 'de' ? 'Ihre Kontaktdaten' : 'Your Contact Information'}
        </h3>
        <p className="text-gray-600">
          {language === 'de'
            ? 'Wir benötigen diese Informationen, um Ihnen die Terminbestätigung und weitere Details zu senden.'
            : 'We need this information to send you the appointment confirmation and further details.'
          }
        </p>
      </div>

      {/* Booking Summary */}
      {bookingData.selectedConsultant && bookingData.selectedDate && bookingData.selectedTimeSlot && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-3">
            {language === 'de' ? 'Zusammenfassung Ihrer Buchung:' : 'Your Booking Summary:'}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">
                {language === 'de' ? 'Berater:' : 'Consultant:'}
              </span>
              <span className="font-medium text-blue-900">
                {bookingData.selectedConsultant.full_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">
                {language === 'de' ? 'Datum:' : 'Date:'}
              </span>
              <span className="font-medium text-blue-900">
                {formatDate(bookingData.selectedDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">
                {language === 'de' ? 'Uhrzeit:' : 'Time:'}
              </span>
              <span className="font-medium text-blue-900">
                {timeSlotLabels[bookingData.selectedTimeSlot as keyof typeof timeSlotLabels][language as keyof typeof timeSlotLabels[keyof typeof timeSlotLabels]]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">
                {language === 'de' ? 'Dauer:' : 'Duration:'}
              </span>
              <span className="font-medium text-blue-900">
                30 {language === 'de' ? 'Minuten' : 'minutes'}
              </span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
              <span className="text-blue-700 font-medium">
                {language === 'de' ? 'Preis:' : 'Price:'}
              </span>
              <span className="font-bold text-blue-900">€30</span>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            {language === 'de' ? 'Vorname *' : 'First Name *'}
          </label>
          <input
            type="text"
            value={contactInfo.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={language === 'de' ? 'Ihr Vorname' : 'Your first name'}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            {language === 'de' ? 'Nachname *' : 'Last Name *'}
          </label>
          <input
            type="text"
            value={contactInfo.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={language === 'de' ? 'Ihr Nachname' : 'Your last name'}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            {language === 'de' ? 'E-Mail-Adresse *' : 'Email Address *'}
          </label>
          <input
            type="email"
            value={contactInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={language === 'de' ? 'ihre.email@beispiel.com' : 'your.email@example.com'}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            {language === 'de' ? 'Telefonnummer *' : 'Phone Number *'}
          </label>
          <input
            type="tel"
            value={contactInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={language === 'de' ? '+49 123 456 7890' : '+1 234 567 8900'}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="w-4 h-4 inline mr-1" />
            {language === 'de' ? 'Unternehmen' : 'Company'}
          </label>
          <input
            type="text"
            value={contactInfo.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder={language === 'de' ? 'Ihr Unternehmen' : 'Your company'}
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-1" />
            {language === 'de' ? 'Website' : 'Website'}
          </label>
          <input
            type="url"
            value={contactInfo.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.website ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="https://www.example.com"
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website}</p>
          )}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="mb-6">
        <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 ${
          errors.terms ? 'border-red-200 bg-red-50' : 'border-gray-200'
        }`}>
          <button
            type="button"
            onClick={() => handleTermsChange(!termsAccepted)}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              termsAccepted 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            {termsAccepted && <Check className="w-3 h-3" />}
          </button>
          
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              {language === 'de' ? (
                <>
                  Ich akzeptiere die{' '}
                  <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                    Allgemeinen Geschäftsbedingungen
                  </a>{' '}
                  und stimme der Verarbeitung meiner Daten gemäß der{' '}
                  <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                    Datenschutzerklärung
                  </a>{' '}
                  zu. *
                </>
              ) : (
                <>
                  I accept the{' '}
                  <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                    Terms and Conditions
                  </a>{' '}
                  and agree to the processing of my data in accordance with the{' '}
                  <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                    Privacy Policy
                  </a>
                  . *
                </>
              )}
            </p>
            
            {errors.terms && (
              <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'de' ? 'Zurück' : 'Back'}</span>
        </button>
        
        <button
          onClick={handleContinue}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span>
            {language === 'de' ? 'Weiter zur Rechnungsadresse' : 'Continue to Billing'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ContactInfoStep;