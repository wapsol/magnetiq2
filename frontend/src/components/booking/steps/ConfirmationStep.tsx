import React from 'react';
import { CheckCircle, Calendar, Clock, User, Mail, Phone, Download, X } from 'lucide-react';
import { BookingData } from '../ConsultationBookingModal';

interface ConfirmationStepProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  language: string;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  bookingData,
  onClose,
  language
}) => {
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

  const handleDownloadConfirmation = () => {
    // In a real implementation, this would generate and download a PDF confirmation
    console.log('Downloading confirmation...');
  };

  return (
    <div className="p-6">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {language === 'de' ? 'Buchung bestätigt!' : 'Booking Confirmed!'}
        </h3>
        
        <p className="text-gray-600 text-lg">
          {language === 'de'
            ? 'Ihre 30/30 KI-Beratung wurde erfolgreich gebucht.'
            : 'Your 30/30 AI consultation has been successfully booked.'
          }
        </p>
        
        {bookingData.bookingId && (
          <p className="text-sm text-gray-500 mt-2">
            {language === 'de' ? 'Buchungsnummer:' : 'Booking number:'} 
            <span className="font-mono font-medium ml-1">{bookingData.bookingId}</span>
          </p>
        )}
      </div>

      {/* Booking Details Card */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-green-600" />
          {language === 'de' ? 'Ihre Buchungsdetails' : 'Your Booking Details'}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {bookingData.selectedConsultant && (
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'de' ? 'Ihr Berater' : 'Your Consultant'}
                  </p>
                  <p className="font-medium text-gray-900">
                    {bookingData.selectedConsultant.full_name}
                  </p>
                  {bookingData.selectedConsultant.headline && (
                    <p className="text-sm text-gray-600">
                      {bookingData.selectedConsultant.headline}
                    </p>
                  )}
                </div>
              </div>
            )}

            {bookingData.selectedDate && (
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'de' ? 'Datum' : 'Date'}
                  </p>
                  <p className="font-medium text-gray-900">
                    {formatDate(bookingData.selectedDate)}
                  </p>
                </div>
              </div>
            )}

            {bookingData.selectedTimeSlot && (
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'de' ? 'Uhrzeit' : 'Time'}
                  </p>
                  <p className="font-medium text-gray-900">
                    {timeSlotLabels[bookingData.selectedTimeSlot as keyof typeof timeSlotLabels][language as keyof typeof timeSlotLabels[keyof typeof timeSlotLabels]]}
                    <span className="text-gray-600 text-sm ml-2">
                      (30 {language === 'de' ? 'Min.' : 'min'})
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {bookingData.contactInfo && (
              <>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {language === 'de' ? 'E-Mail' : 'Email'}
                    </p>
                    <p className="font-medium text-gray-900">
                      {bookingData.contactInfo.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {language === 'de' ? 'Telefon' : 'Phone'}
                    </p>
                    <p className="font-medium text-gray-900">
                      {bookingData.contactInfo.phone}
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {language === 'de' ? 'Bezahlt:' : 'Paid:'}
                </span>
                <span className="text-xl font-bold text-green-600">€30,00</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'de' ? 'Zahlung erfolgreich' : 'Payment successful'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <h4 className="font-medium text-blue-900 mb-3">
          {language === 'de' ? 'Nächste Schritte:' : 'Next Steps:'}
        </h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="inline-block w-5 h-5 bg-blue-200 text-blue-800 rounded-full text-xs font-bold flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</span>
            {language === 'de' 
              ? 'Sie erhalten eine Bestätigungs-E-Mail mit allen Details und dem Meeting-Link.'
              : 'You will receive a confirmation email with all details and the meeting link.'
            }
          </li>
          <li className="flex items-start">
            <span className="inline-block w-5 h-5 bg-blue-200 text-blue-800 rounded-full text-xs font-bold flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</span>
            {language === 'de' 
              ? 'Ihr Berater wird sich 1 Tag vor dem Termin bei Ihnen melden.'
              : 'Your consultant will contact you 1 day before the appointment.'
            }
          </li>
          <li className="flex items-start">
            <span className="inline-block w-5 h-5 bg-blue-200 text-blue-800 rounded-full text-xs font-bold flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</span>
            {language === 'de' 
              ? 'Bereiten Sie Ihre Fragen zu KI-Technologie und Anwendungen vor.'
              : 'Prepare your questions about AI technology and applications.'
            }
          </li>
          <li className="flex items-start">
            <span className="inline-block w-5 h-5 bg-blue-200 text-blue-800 rounded-full text-xs font-bold flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">4</span>
            {language === 'de' 
              ? 'Nehmen Sie pünktlich am Online-Meeting teil.'
              : 'Join the online meeting on time.'
            }
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleDownloadConfirmation}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>
            {language === 'de' ? 'Bestätigung herunterladen' : 'Download Confirmation'}
          </span>
        </button>
        
        <button
          onClick={onClose}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span>
            {language === 'de' ? 'Fertig' : 'Done'}
          </span>
        </button>
      </div>

      {/* GDPR Notice */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          {language === 'de' 
            ? 'Alle Ihre Daten werden DSGVO-konform in unseren privaten Cloud-Systemen gespeichert und verarbeitet. Bei Fragen kontaktieren Sie uns unter support@voltaic.systems'
            : 'All your data is stored and processed according to GDPR in our private cloud systems. For questions, contact us at support@voltaic.systems'
          }
        </p>
      </div>

      {/* Close button in top right */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label={language === 'de' ? 'Schließen' : 'Close'}
      >
        <X size={20} className="text-gray-500" />
      </button>
    </div>
  );
};

export default ConfirmationStep;