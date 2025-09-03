import React from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from '@radix-ui/react-dialog';
import { Save, X, AlertTriangle } from 'lucide-react';

interface CancellationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: () => void;
  onSaveAndExit: () => void;
  language: 'en' | 'de';
  hasProgress: boolean;
}

const CancellationDialog: React.FC<CancellationDialogProps> = ({
  isOpen,
  onClose,
  onConfirmCancel,
  onSaveAndExit,
  language,
  hasProgress
}) => {
  const texts = {
    en: {
      title: 'Cancel Booking Process',
      message: 'You have started the booking process. What would you like to do?',
      saveAndExit: 'Save Progress & Exit',
      saveDescription: 'Your booking data will be saved in your browser and restored when you return',
      cancelAndLose: 'Exit Without Saving',
      cancelDescription: 'All your progress will be lost permanently',
      continueBooking: 'Continue Booking',
      continueDescription: 'Return to the booking process'
    },
    de: {
      title: 'Buchungsprozess abbrechen',
      message: 'Sie haben mit dem Buchungsprozess begonnen. Was möchten Sie tun?',
      saveAndExit: 'Fortschritt speichern & Verlassen',
      saveDescription: 'Ihre Buchungsdaten werden in Ihrem Browser gespeichert und beim nächsten Besuch wiederhergestellt',
      cancelAndLose: 'Ohne Speichern verlassen',
      cancelDescription: 'Ihr gesamter Fortschritt geht dauerhaft verloren',
      continueBooking: 'Buchung fortsetzen',
      continueDescription: 'Zum Buchungsprozess zurückkehren'
    }
  };

  const t = texts[language];

  if (!hasProgress) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/50 z-[60]" />
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-[60] p-0 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="flex items-center space-x-3">
            <AlertTriangle size={24} />
            <DialogTitle className="text-xl font-semibold">
              {t.title}
            </DialogTitle>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            {t.message}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {/* Save and Exit Option */}
            <button
              onClick={onSaveAndExit}
              className="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left group"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Save size={16} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t.saveAndExit}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t.saveDescription}
                  </p>
                </div>
              </div>
            </button>

            {/* Cancel and Lose Option */}
            <button
              onClick={onConfirmCancel}
              className="w-full p-4 border-2 border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-left group"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <X size={16} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t.cancelAndLose}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t.cancelDescription}
                  </p>
                </div>
              </div>
            </button>

            {/* Continue Booking Option */}
            <button
              onClick={onClose}
              className="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left group"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t.continueBooking}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t.continueDescription}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <p className="text-xs text-gray-500 flex items-center">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2" />
            {language === 'de' 
              ? 'Gespeicherte Daten werden nur lokal in Ihrem Browser gespeichert'
              : 'Saved data is stored locally in your browser only'
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancellationDialog;