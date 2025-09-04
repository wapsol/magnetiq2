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
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl z-[60] p-0 overflow-hidden border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900 dark:to-purple-900 border-violet-200 dark:border-violet-700">
          <div className="flex items-center space-x-3">
            <AlertTriangle size={24} className="text-violet-600 dark:text-violet-400" />
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              {t.title}
            </DialogTitle>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-violet-100 dark:hover:bg-violet-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {t.message}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {/* Save and Exit Option */}
            <button
              onClick={onSaveAndExit}
              className="w-full p-4 border-2 border-violet-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 dark:border-violet-700 dark:hover:border-violet-600 dark:hover:bg-violet-900/20 transition-colors text-left group"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-full flex items-center justify-center group-hover:bg-violet-200 dark:group-hover:bg-violet-800 transition-colors">
                  <Save size={16} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm mb-1">
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
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800/20 transition-colors text-left group"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                  <X size={16} className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm mb-1">
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
              className="w-full p-4 border-2 border-violet-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 dark:border-violet-700 dark:hover:border-violet-600 dark:hover:bg-violet-900/20 transition-colors text-left group"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-full flex items-center justify-center group-hover:bg-violet-200 dark:group-hover:bg-violet-800 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-violet-600 dark:text-violet-400">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm mb-1">
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
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <span className="inline-block w-2 h-2 bg-violet-500 rounded-full mr-2" />
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