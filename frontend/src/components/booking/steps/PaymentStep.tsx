import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CreditCard, Euro, Shield } from 'lucide-react';
import { BookingData } from '../ConsultationBookingModal';

interface PaymentStepProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  language: string;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  bookingData,
  updateBookingData,
  onNext,
  onBack,
  loading,
  setLoading,
  language
}) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!bookingData.bookingId) {
      setError(language === 'de' 
        ? 'Buchungs-ID fehlt. Bitte versuchen Sie es erneut.'
        : 'Booking ID missing. Please try again.'
      );
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const response = await fetch(`/api/v1/consultations/public/bookings/${bookingData.bookingId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': language
        },
        body: JSON.stringify({
          payment_method: paymentMethod,
          payment_provider: 'stripe'
        })
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Payment failed');
      }

      updateBookingData({
        paymentData: {
          paymentMethod: paymentMethod,
          paymentProvider: 'stripe'
        }
      });

      onNext();
    } catch (err) {
      console.error('Payment error:', err);
      setError(language === 'de' 
        ? 'Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.'
        : 'Payment failed. Please try again.'
      );
    } finally {
      setProcessing(false);
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
          {language === 'de' ? 'Zahlung' : 'Payment'}
        </h3>
        <p className="text-gray-600">
          {language === 'de'
            ? 'Schließen Sie Ihre Buchung ab und zahlen Sie sicher online.'
            : 'Complete your booking and pay securely online.'
          }
        </p>
      </div>

      {/* Booking Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Euro className="w-5 h-5 mr-2 text-blue-600" />
          {language === 'de' ? 'Buchungsübersicht' : 'Booking Summary'}
        </h4>
        
        <div className="space-y-3">
          {bookingData.selectedConsultant && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700">
                {language === 'de' ? 'Berater:' : 'Consultant:'}
              </span>
              <span className="font-medium">{bookingData.selectedConsultant.full_name}</span>
            </div>
          )}
          
          {bookingData.selectedDate && bookingData.selectedTimeSlot && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  {language === 'de' ? 'Datum:' : 'Date:'}
                </span>
                <span className="font-medium">{formatDate(bookingData.selectedDate)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  {language === 'de' ? 'Uhrzeit:' : 'Time:'}
                </span>
                <span className="font-medium">
                  {timeSlotLabels[bookingData.selectedTimeSlot as keyof typeof timeSlotLabels][language as keyof typeof timeSlotLabels[keyof typeof timeSlotLabels]]}
                </span>
              </div>
            </>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-gray-700">
              {language === 'de' ? 'Dauer:' : 'Duration:'}
            </span>
            <span className="font-medium">30 {language === 'de' ? 'Minuten' : 'minutes'}</span>
          </div>

          {bookingData.contactInfo && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700">
                {language === 'de' ? 'Teilnehmer:' : 'Participant:'}
              </span>
              <span className="font-medium">
                {bookingData.contactInfo.firstName} {bookingData.contactInfo.lastName}
              </span>
            </div>
          )}

          <div className="border-t border-gray-200 pt-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                {language === 'de' ? 'Gesamt:' : 'Total:'}
              </span>
              <span className="text-2xl font-bold text-blue-600">€30,00</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {language === 'de' ? 'Inkl. MwSt.' : 'Including VAT'}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-4">
          {language === 'de' ? 'Zahlungsmethode wählen' : 'Choose Payment Method'}
        </h4>
        
        <div className="space-y-3">
          <label className="flex items-center p-4 border-2 border-blue-500 bg-blue-50 rounded-lg cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="stripe"
              checked={paymentMethod === 'stripe'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">
                    {language === 'de' ? 'Kreditkarte / Debitkarte' : 'Credit Card / Debit Card'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <img src="/images/visa.svg" alt="Visa" className="h-6" />
                  <img src="/images/mastercard.svg" alt="Mastercard" className="h-6" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {language === 'de' 
                  ? 'Sicher und schnell mit Stripe bezahlen'
                  : 'Pay securely and quickly with Stripe'
                }
              </p>
            </div>
          </label>
          
          {/* Future payment methods can be added here */}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-medium text-gray-900 mb-1">
              {language === 'de' ? 'Sichere Zahlung' : 'Secure Payment'}
            </h5>
            <p className="text-sm text-gray-600">
              {language === 'de'
                ? 'Ihre Zahlungsdaten werden SSL-verschlüsselt übertragen und nicht gespeichert. Alle Transaktionen werden über Stripe abgewickelt.'
                : 'Your payment data is transmitted with SSL encryption and not stored. All transactions are processed via Stripe.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Legal Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          {language === 'de' ? (
            <>
              <strong>Wichtiger Hinweis:</strong> Durch Klick auf "Kostenpflichtig bestellen" schließen Sie einen verbindlichen Kaufvertrag ab. Sie erhalten eine Bestätigung per E-Mail mit allen Details zur Beratung.
            </>
          ) : (
            <>
              <strong>Important Notice:</strong> By clicking "Order with Payment Obligation" you enter into a binding purchase contract. You will receive a confirmation email with all consultation details.
            </>
          )}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          disabled={processing}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'de' ? 'Zurück' : 'Back'}</span>
        </button>
        
        <button
          onClick={handlePayment}
          disabled={processing || !paymentMethod}
          className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold text-lg rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              <span>
                {language === 'de' ? 'Verarbeite Zahlung...' : 'Processing Payment...'}
              </span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>
                {language === 'de' ? 'Kostenpflichtig bestellen' : 'Order with Payment Obligation'}
              </span>
              <span className="font-bold">€30</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentStep;