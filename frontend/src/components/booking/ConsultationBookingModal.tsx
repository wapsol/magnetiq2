import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription } from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import ConsultantSelectionStep from './steps/ConsultantSelectionStep';
import TimeSlotSelectionStep from './steps/TimeSlotSelectionStep';
import ContactInfoStep from './steps/ContactInfoStep';
import BillingInfoStep from './steps/BillingInfoStep';
import PaymentStep from './steps/PaymentStep';
import ConfirmationStep from './steps/ConfirmationStep';

export interface BookingData {
  selectedConsultant?: any;
  selectedDate?: Date;
  selectedTimeSlot?: string;
  contactInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    website?: string;
    phone: string;
  };
  billingInfo?: {
    billingFirstName: string;
    billingLastName: string;
    billingCompany?: string;
    billingStreet: string;
    billingPostalCode: string;
    billingCity: string;
    billingCountry: string;
    vatNumber?: string;
  };
  paymentData?: {
    paymentMethod: string;
    paymentProvider: string;
  };
  bookingId?: string;
  termsAccepted?: boolean;
}

export type BookingStep = 
  | 'consultant-selection'
  | 'time-slot-selection'
  | 'contact-info'
  | 'billing-info'
  | 'payment'
  | 'confirmation';

interface ConsultationBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: BookingStep;
}

const ConsultationBookingModal: React.FC<ConsultationBookingModalProps> = ({
  isOpen,
  onClose,
  initialStep = 'consultant-selection'
}) => {
  const { language, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<BookingStep>(initialStep);
  const [bookingData, setBookingData] = useState<BookingData>({});
  const [loading, setLoading] = useState(false);

  const steps: BookingStep[] = [
    'consultant-selection',
    'time-slot-selection', 
    'contact-info',
    'billing-info',
    'payment',
    'confirmation'
  ];

  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  }, [currentStepIndex, steps]);

  const handleBack = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  }, [currentStepIndex, steps]);

  const updateBookingData = useCallback((updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleClose = useCallback(() => {
    if (currentStep === 'confirmation') {
      onClose();
      return;
    }

    // Ask for confirmation if user has started the booking process
    if (currentStepIndex > 0) {
      const confirmMessage = language === 'de' 
        ? 'Möchten Sie den Buchungsprozess wirklich abbrechen? Alle Daten gehen verloren.'
        : 'Are you sure you want to cancel the booking process? All data will be lost.';
      
      if (window.confirm(confirmMessage)) {
        setCurrentStep('consultant-selection');
        setBookingData({});
        onClose();
      }
    } else {
      onClose();
    }
  }, [currentStep, currentStepIndex, language, onClose]);

  const getStepTitle = useCallback(() => {
    const titles = {
      'consultant-selection': {
        en: 'Select Your AI Expert',
        de: 'Wählen Sie Ihren KI-Experten'
      },
      'time-slot-selection': {
        en: 'Choose Date & Time',
        de: 'Datum & Zeit wählen'
      },
      'contact-info': {
        en: 'Contact Information',
        de: 'Kontaktinformationen'
      },
      'billing-info': {
        en: 'Billing Address',
        de: 'Rechnungsadresse'
      },
      'payment': {
        en: 'Payment',
        de: 'Zahlung'
      },
      'confirmation': {
        en: 'Booking Confirmed',
        de: 'Buchung bestätigt'
      }
    };
    
    return titles[currentStep][language as keyof typeof titles[typeof currentStep]] || titles[currentStep].en;
  }, [currentStep, language]);

  const renderCurrentStep = () => {
    const commonProps = {
      bookingData,
      updateBookingData,
      onNext: handleNext,
      onBack: handleBack,
      loading,
      setLoading,
      language
    };

    switch (currentStep) {
      case 'consultant-selection':
        return <ConsultantSelectionStep {...commonProps} />;
      case 'time-slot-selection':
        return <TimeSlotSelectionStep {...commonProps} />;
      case 'contact-info':
        return <ContactInfoStep {...commonProps} />;
      case 'billing-info':
        return <BillingInfoStep {...commonProps} />;
      case 'payment':
        return <PaymentStep {...commonProps} />;
      case 'confirmation':
        return <ConfirmationStep {...commonProps} onClose={onClose} />;
      default:
        return <ConsultantSelectionStep {...commonProps} />;
    }
  };

  const getProgressPercentage = () => {
    return ((currentStepIndex + 1) / steps.length) * 100;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
        {/* Hidden Title and Description for accessibility */}
        <VisuallyHidden.Root>
          <DialogTitle>{getStepTitle()}</DialogTitle>
          <DialogDescription>
            {language === 'de' 
              ? '30-minütige KI-Beratung für €30'
              : '30-minute AI consultation for €30'
            }
          </DialogDescription>
        </VisuallyHidden.Root>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{getStepTitle()}</h2>
            <p className="text-blue-100 mt-1">
              {language === 'de' 
                ? '30-minütige KI-Beratung für €30'
                : '30-minute AI consultation for €30'
              }
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label={language === 'de' ? 'Schließen' : 'Close'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        {currentStep !== 'confirmation' && (
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                {language === 'de' 
                  ? `Schritt ${currentStepIndex + 1} von ${steps.length}`
                  : `Step ${currentStepIndex + 1} of ${steps.length}`
                }
              </span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round(getProgressPercentage())}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {renderCurrentStep()}
        </div>

        {/* GDPR Notice - shown on all steps except confirmation */}
        {currentStep !== 'confirmation' && (
          <div className="px-6 py-4 border-t bg-gray-50 flex-shrink-0">
            <p className="text-xs text-gray-600 flex items-start">
              <span className="inline-block w-4 h-4 bg-green-500 rounded-full mr-2 mt-0.5 flex-shrink-0" />
              {language === 'de' 
                ? 'Alle Daten werden DSGVO-konform in unseren privaten Cloud-Systemen verarbeitet.'
                : 'All data is handled according to GDPR in our private cloud systems.'
              }
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationBookingModal;