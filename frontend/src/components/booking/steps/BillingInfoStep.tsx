import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CreditCard, MapPin, Building } from 'lucide-react';
import { BookingData } from '../ConsultationBookingModal';

interface BillingInfoStepProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  language: string;
}

const BillingInfoStep: React.FC<BillingInfoStepProps> = ({
  bookingData,
  updateBookingData,
  onNext,
  onBack,
  setLoading,
  language
}) => {
  const [billingInfo, setBillingInfo] = useState({
    billingFirstName: bookingData.billingInfo?.billingFirstName || bookingData.contactInfo?.firstName || '',
    billingLastName: bookingData.billingInfo?.billingLastName || bookingData.contactInfo?.lastName || '',
    billingCompany: bookingData.billingInfo?.billingCompany || bookingData.contactInfo?.company || '',
    billingStreet: bookingData.billingInfo?.billingStreet || '',
    billingPostalCode: bookingData.billingInfo?.billingPostalCode || '',
    billingCity: bookingData.billingInfo?.billingCity || '',
    billingCountry: bookingData.billingInfo?.billingCountry || 'DE',
    vatNumber: bookingData.billingInfo?.vatNumber || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sameAsContact, setSameAsContact] = useState(false);

  const countries = [
    { code: 'DE', name: language === 'de' ? 'Deutschland' : 'Germany' },
    { code: 'AT', name: language === 'de' ? 'Österreich' : 'Austria' },
    { code: 'CH', name: language === 'de' ? 'Schweiz' : 'Switzerland' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSameAsContactChange = (checked: boolean) => {
    setSameAsContact(checked);
    
    if (checked && bookingData.contactInfo) {
      setBillingInfo(prev => ({
        ...prev,
        billingFirstName: bookingData.contactInfo!.firstName,
        billingLastName: bookingData.contactInfo!.lastName,
        billingCompany: bookingData.contactInfo!.company || ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!billingInfo.billingFirstName.trim()) {
      newErrors.billingFirstName = language === 'de' 
        ? 'Vorname ist erforderlich'
        : 'First name is required';
    }

    if (!billingInfo.billingLastName.trim()) {
      newErrors.billingLastName = language === 'de' 
        ? 'Nachname ist erforderlich'
        : 'Last name is required';
    }

    if (!billingInfo.billingStreet.trim()) {
      newErrors.billingStreet = language === 'de' 
        ? 'Straße ist erforderlich'
        : 'Street is required';
    }

    if (!billingInfo.billingPostalCode.trim()) {
      newErrors.billingPostalCode = language === 'de' 
        ? 'Postleitzahl ist erforderlich'
        : 'Postal code is required';
    } else if (billingInfo.billingCountry === 'DE' && !/^\d{5}$/.test(billingInfo.billingPostalCode)) {
      newErrors.billingPostalCode = language === 'de' 
        ? 'Deutsche Postleitzahl muss 5 Ziffern haben'
        : 'German postal code must be 5 digits';
    }

    if (!billingInfo.billingCity.trim()) {
      newErrors.billingCity = language === 'de' 
        ? 'Stadt ist erforderlich'
        : 'City is required';
    }

    if (billingInfo.vatNumber && !/^[A-Z]{2}[\dA-Z]+$/.test(billingInfo.vatNumber.replace(/\s/g, ''))) {
      newErrors.vatNumber = language === 'de' 
        ? 'Bitte geben Sie eine gültige USt-IdNr. ein (z.B. DE123456789)'
        : 'Please enter a valid VAT number (e.g. DE123456789)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (validateForm()) {
      setLoading(true);
      
      try {
        // Create booking first
        const bookingResponse = await fetch('/api/v1/consultations/public/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': language
          },
          body: JSON.stringify({
            consultant_id: bookingData.selectedConsultant!.id,
            consultation_date: bookingData.selectedDate!.toISOString(),
            time_slot: bookingData.selectedTimeSlot,
            contact_info: bookingData.contactInfo,
            terms_accepted: bookingData.termsAccepted
          })
        });

        if (!bookingResponse.ok) {
          throw new Error('Failed to create booking');
        }

        const bookingData_ = await bookingResponse.json();
        if (!bookingData_.success) {
          throw new Error(bookingData_.error || 'Failed to create booking');
        }

        const bookingId = bookingData_.data.booking_id;

        // Update billing information
        const billingResponse = await fetch(`/api/v1/consultations/public/bookings/${bookingId}/billing`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': language
          },
          body: JSON.stringify({
            billing_info: billingInfo
          })
        });

        if (!billingResponse.ok) {
          throw new Error('Failed to update billing information');
        }

        const billingData = await billingResponse.json();
        if (!billingData.success) {
          throw new Error(billingData.error || 'Failed to update billing information');
        }

        updateBookingData({ 
          billingInfo: billingInfo,
          bookingId: bookingId
        });
        
        onNext();
      } catch (error) {
        console.error('Error creating booking:', error);
        setErrors({
          general: language === 'de' 
            ? 'Fehler beim Erstellen der Buchung. Bitte versuchen Sie es erneut.'
            : 'Error creating booking. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {language === 'de' ? 'Rechnungsadresse' : 'Billing Address'}
        </h3>
        <p className="text-gray-600">
          {language === 'de'
            ? 'Bitte geben Sie Ihre Rechnungsadresse für die Rechnung ein.'
            : 'Please provide your billing address for the invoice.'
          }
        </p>
      </div>

      {/* Same as contact checkbox */}
      {bookingData.contactInfo && (
        <div className="mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sameAsContact}
              onChange={(e) => handleSameAsContactChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {language === 'de' 
                ? 'Gleiche Daten wie Kontaktinformationen verwenden'
                : 'Use same details as contact information'
              }
            </span>
          </label>
        </div>
      )}

      {/* General Error */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      {/* Billing Form */}
      <div className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'de' ? 'Vorname *' : 'First Name *'}
            </label>
            <input
              type="text"
              value={billingInfo.billingFirstName}
              onChange={(e) => handleInputChange('billingFirstName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.billingFirstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={language === 'de' ? 'Vorname für Rechnung' : 'First name for invoice'}
            />
            {errors.billingFirstName && (
              <p className="mt-1 text-sm text-red-600">{errors.billingFirstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'de' ? 'Nachname *' : 'Last Name *'}
            </label>
            <input
              type="text"
              value={billingInfo.billingLastName}
              onChange={(e) => handleInputChange('billingLastName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.billingLastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={language === 'de' ? 'Nachname für Rechnung' : 'Last name for invoice'}
            />
            {errors.billingLastName && (
              <p className="mt-1 text-sm text-red-600">{errors.billingLastName}</p>
            )}
          </div>
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="w-4 h-4 inline mr-1" />
            {language === 'de' ? 'Unternehmen' : 'Company'}
          </label>
          <input
            type="text"
            value={billingInfo.billingCompany}
            onChange={(e) => handleInputChange('billingCompany', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder={language === 'de' ? 'Firmenname (optional)' : 'Company name (optional)'}
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            {language === 'de' ? 'Straße und Hausnummer *' : 'Street and House Number *'}
          </label>
          <input
            type="text"
            value={billingInfo.billingStreet}
            onChange={(e) => handleInputChange('billingStreet', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.billingStreet ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={language === 'de' ? 'Musterstraße 123' : 'Main Street 123'}
          />
          {errors.billingStreet && (
            <p className="mt-1 text-sm text-red-600">{errors.billingStreet}</p>
          )}
        </div>

        {/* Postal Code and City */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'de' ? 'Postleitzahl *' : 'Postal Code *'}
            </label>
            <input
              type="text"
              value={billingInfo.billingPostalCode}
              onChange={(e) => handleInputChange('billingPostalCode', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.billingPostalCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="12345"
            />
            {errors.billingPostalCode && (
              <p className="mt-1 text-sm text-red-600">{errors.billingPostalCode}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'de' ? 'Stadt *' : 'City *'}
            </label>
            <input
              type="text"
              value={billingInfo.billingCity}
              onChange={(e) => handleInputChange('billingCity', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.billingCity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={language === 'de' ? 'München' : 'Munich'}
            />
            {errors.billingCity && (
              <p className="mt-1 text-sm text-red-600">{errors.billingCity}</p>
            )}
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'de' ? 'Land *' : 'Country *'}
          </label>
          <select
            value={billingInfo.billingCountry}
            onChange={(e) => handleInputChange('billingCountry', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* VAT Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'de' ? 'USt-IdNr.' : 'VAT Number'}
            <span className="text-gray-500 text-xs ml-1">
              ({language === 'de' ? 'optional' : 'optional'})
            </span>
          </label>
          <input
            type="text"
            value={billingInfo.vatNumber}
            onChange={(e) => handleInputChange('vatNumber', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.vatNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="DE123456789"
          />
          {errors.vatNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.vatNumber}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {language === 'de' 
              ? 'Bei Geschäftskunden für Steuerbefreiung'
              : 'For business customers for tax exemption'
            }
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-8 border-t mt-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'de' ? 'Zurück' : 'Back'}</span>
        </button>
        
        <button
          onClick={handleContinue}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>
                {language === 'de' ? 'Erstelle Buchung...' : 'Creating Booking...'}
              </span>
            </>
          ) : (
            <>
              <span>
                {language === 'de' ? 'Weiter zur Zahlung' : 'Continue to Payment'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BillingInfoStep;