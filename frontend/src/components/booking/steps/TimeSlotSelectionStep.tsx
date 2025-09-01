import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, ArrowLeft, User } from 'lucide-react';
import { BookingData } from '../ConsultationBookingModal';

interface TimeSlotSelectionStepProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  language: string;
}

const TimeSlotSelectionStep: React.FC<TimeSlotSelectionStepProps> = ({
  bookingData,
  updateBookingData,
  onNext,
  onBack,
  loading,
  setLoading,
  language
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    bookingData.selectedDate || null
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(
    bookingData.selectedTimeSlot || ''
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [error, setError] = useState<string>('');

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

  useEffect(() => {
    generateAvailableDates();
  }, []);

  useEffect(() => {
    if (selectedDate && bookingData.selectedConsultant) {
      fetchAvailableSlots();
    }
  }, [selectedDate, bookingData.selectedConsultant]);

  const generateAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    
    // Generate next 14 days, excluding weekends for business consultations
    for (let i = 1; i <= 21; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Only include weekdays (Monday = 1, Friday = 5)
      if (date.getDay() >= 1 && date.getDay() <= 5) {
        dates.push(date);
      }
    }
    
    setAvailableDates(dates);
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !bookingData.selectedConsultant) return;
    
    setLoading(true);
    setError('');
    
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(
        `/api/v1/consultations/public/consultants/${bookingData.selectedConsultant.id}/availability?target_date=${dateStr}&timezone=Europe/Berlin`,
        {
          headers: {
            'Accept-Language': language
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      
      const data = await response.json();
      if (data.success) {
        setAvailableSlots(data.data.available_slots);
        
        // Clear selected time slot if it's no longer available
        if (selectedTimeSlot && !data.data.available_slots.includes(selectedTimeSlot)) {
          setSelectedTimeSlot('');
          updateBookingData({ selectedTimeSlot: '' });
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(language === 'de' 
        ? 'Fehler beim Laden der verfügbaren Zeiten.'
        : 'Error loading available times.'
      );
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot('');
    updateBookingData({ 
      selectedDate: date,
      selectedTimeSlot: '' 
    });
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    updateBookingData({ selectedTimeSlot: timeSlot });
  };

  const handleContinue = () => {
    if (selectedDate && selectedTimeSlot) {
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

  const isDateAvailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    return date >= today;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        {bookingData.selectedConsultant && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'de' ? 'Gewählter Berater:' : 'Selected consultant:'}
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
          </div>
        )}

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {language === 'de' 
            ? 'Wählen Sie Datum und Uhrzeit'
            : 'Choose Date and Time'
          }
        </h3>
        <p className="text-gray-600">
          {language === 'de'
            ? 'Verfügbare Termine sind an Werktagen um 10:00 und 14:00 Uhr.'
            : 'Available appointments are on weekdays at 10:00 AM and 2:00 PM.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Date Selection */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            {language === 'de' ? 'Datum wählen' : 'Select Date'}
          </h4>
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {availableDates.map((date, index) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isAvailable = isDateAvailable(date);
              
              return (
                <button
                  key={index}
                  onClick={() => isAvailable && handleDateSelect(date)}
                  disabled={!isAvailable}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : isAvailable
                      ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="font-medium">
                    {formatDate(date)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {language === 'de' ? 'Verfügbar' : 'Available'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slot Selection */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            {language === 'de' ? 'Uhrzeit wählen' : 'Select Time'}
          </h4>
          
          {!selectedDate ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>
                {language === 'de' 
                  ? 'Bitte wählen Sie zuerst ein Datum'
                  : 'Please select a date first'
                }
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
              <p className="text-gray-600">
                {language === 'de' ? 'Lade verfügbare Zeiten...' : 'Loading available times...'}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
              <button
                onClick={fetchAvailableSlots}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                {language === 'de' ? 'Erneut versuchen' : 'Try again'}
              </button>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>
                {language === 'de' 
                  ? 'Keine freien Termine an diesem Tag verfügbar.'
                  : 'No available appointments on this date.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableSlots.map((timeSlot) => {
                const isSelected = selectedTimeSlot === timeSlot;
                const label = timeSlotLabels[timeSlot as keyof typeof timeSlotLabels][language as keyof typeof timeSlotLabels[keyof typeof timeSlotLabels]] || timeSlot;
                
                return (
                  <button
                    key={timeSlot}
                    onClick={() => handleTimeSlotSelect(timeSlot)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-lg">{label}</div>
                        <div className="text-sm text-gray-600">
                          30 {language === 'de' ? 'Minuten' : 'minutes'} • €30
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 mt-8 border-t">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'de' ? 'Zurück' : 'Back'}</span>
        </button>
        
        {selectedDate && selectedTimeSlot && (
          <button
            onClick={handleContinue}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span>
              {language === 'de' ? 'Weiter zu Kontaktdaten' : 'Continue to Contact Info'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Selected Summary */}
      {selectedDate && selectedTimeSlot && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h5 className="font-medium text-green-900 mb-2">
            {language === 'de' ? 'Gewählter Termin:' : 'Selected Appointment:'}
          </h5>
          <p className="text-green-800">
            <strong>{formatDate(selectedDate)}</strong> {language === 'de' ? 'um' : 'at'}{' '}
            <strong>
              {timeSlotLabels[selectedTimeSlot as keyof typeof timeSlotLabels][language as keyof typeof timeSlotLabels[keyof typeof timeSlotLabels]]}
            </strong>
          </p>
          <p className="text-sm text-green-700 mt-1">
            30 {language === 'de' ? 'Minuten Beratung für' : 'minute consultation for'} €30
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelectionStep;