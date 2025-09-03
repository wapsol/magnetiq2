import { useCallback } from 'react';
import { BookingData } from '../components/booking/ConsultationBookingModal';

const BOOKING_STORAGE_KEY = 'magnetiq_booking_draft';
const STORAGE_EXPIRY_HOURS = 24; // Data expires after 24 hours

interface StoredBookingData {
  data: BookingData;
  timestamp: number;
  expiresAt: number;
}

export const useBookingStorage = () => {
  
  // Save booking data to session storage
  const saveBookingData = useCallback((bookingData: BookingData, currentStep: string) => {
    try {
      const now = Date.now();
      const expiresAt = now + (STORAGE_EXPIRY_HOURS * 60 * 60 * 1000);
      
      const dataToStore: StoredBookingData = {
        data: {
          ...bookingData,
          // Don't store sensitive payment data
          paymentData: undefined
        },
        timestamp: now,
        expiresAt
      };
      
      // Store in sessionStorage (cleared when browser tab is closed)
      // Also store in localStorage as backup with expiry
      sessionStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(dataToStore));
      localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(dataToStore));
      localStorage.setItem(`${BOOKING_STORAGE_KEY}_step`, currentStep);
      
      console.log('Booking data saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save booking data:', error);
      return false;
    }
  }, []);

  // Load booking data from storage
  const loadBookingData = useCallback((): { data: BookingData | null; step: string | null } => {
    try {
      // Try sessionStorage first, then localStorage
      let storedDataStr = sessionStorage.getItem(BOOKING_STORAGE_KEY);
      let storedStep = sessionStorage.getItem(`${BOOKING_STORAGE_KEY}_step`);
      
      if (!storedDataStr) {
        storedDataStr = localStorage.getItem(BOOKING_STORAGE_KEY);
        storedStep = localStorage.getItem(`${BOOKING_STORAGE_KEY}_step`);
      }
      
      if (!storedDataStr) {
        return { data: null, step: null };
      }
      
      const storedData: StoredBookingData = JSON.parse(storedDataStr);
      
      // Check if data has expired
      if (Date.now() > storedData.expiresAt) {
        console.log('Stored booking data has expired, clearing...');
        clearBookingData();
        return { data: null, step: null };
      }
      
      console.log('Booking data loaded successfully');
      return { 
        data: storedData.data, 
        step: storedStep || 'consultant-selection' 
      };
    } catch (error) {
      console.error('Failed to load booking data:', error);
      return { data: null, step: null };
    }
  }, []);

  // Clear stored booking data
  const clearBookingData = useCallback(() => {
    try {
      sessionStorage.removeItem(BOOKING_STORAGE_KEY);
      sessionStorage.removeItem(`${BOOKING_STORAGE_KEY}_step`);
      localStorage.removeItem(BOOKING_STORAGE_KEY);
      localStorage.removeItem(`${BOOKING_STORAGE_KEY}_step`);
      console.log('Booking data cleared successfully');
      return true;
    } catch (error) {
      console.error('Failed to clear booking data:', error);
      return false;
    }
  }, []);

  // Check if there's saved booking data
  const hasSavedData = useCallback((): boolean => {
    try {
      const sessionData = sessionStorage.getItem(BOOKING_STORAGE_KEY);
      const localData = localStorage.getItem(BOOKING_STORAGE_KEY);
      
      if (sessionData || localData) {
        const dataStr = sessionData || localData;
        if (dataStr) {
          const parsedData: StoredBookingData = JSON.parse(dataStr);
          
          // Check if data hasn't expired
          if (Date.now() <= parsedData.expiresAt) {
            return true;
          } else {
            // Clean up expired data
            clearBookingData();
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check saved data:', error);
      return false;
    }
  }, [clearBookingData]);

  // Get info about saved data (for display purposes)
  const getSavedDataInfo = useCallback(() => {
    try {
      const sessionData = sessionStorage.getItem(BOOKING_STORAGE_KEY);
      const localData = localStorage.getItem(BOOKING_STORAGE_KEY);
      const dataStr = sessionData || localData;
      
      if (!dataStr) {
        return null;
      }
      
      const parsedData: StoredBookingData = JSON.parse(dataStr);
      
      // Check if expired
      if (Date.now() > parsedData.expiresAt) {
        clearBookingData();
        return null;
      }
      
      const savedAt = new Date(parsedData.timestamp);
      const expiresAt = new Date(parsedData.expiresAt);
      
      // Determine how much progress was made
      let progressDescription = 'Initial data';
      if (parsedData.data.selectedConsultant) progressDescription = 'Consultant selected';
      if (parsedData.data.selectedDate) progressDescription = 'Date & time selected';
      if (parsedData.data.contactInfo) progressDescription = 'Contact info entered';
      if (parsedData.data.billingInfo) progressDescription = 'Billing info entered';
      
      return {
        savedAt,
        expiresAt,
        progressDescription,
        hasConsultant: !!parsedData.data.selectedConsultant,
        hasDateTime: !!(parsedData.data.selectedDate && parsedData.data.selectedTimeSlot),
        hasContactInfo: !!parsedData.data.contactInfo,
        hasBillingInfo: !!parsedData.data.billingInfo
      };
    } catch (error) {
      console.error('Failed to get saved data info:', error);
      return null;
    }
  }, [clearBookingData]);

  return {
    saveBookingData,
    loadBookingData,
    clearBookingData,
    hasSavedData,
    getSavedDataInfo
  };
};

export default useBookingStorage;