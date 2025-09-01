import React, { useState, useEffect } from 'react';
import { Star, MapPin, Briefcase, Users, ArrowRight } from 'lucide-react';
import { BookingData } from '../ConsultationBookingModal';

interface Consultant {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  profile_picture_url?: string;
  headline?: string;
  location?: string;
  industry?: string;
  specializations?: string[];
  years_experience?: number;
  average_rating?: number;
  total_projects?: number;
  is_featured: boolean;
  ai_summary?: string;
}

interface ConsultantSelectionStepProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  language: string;
}

const ConsultantSelectionStep: React.FC<ConsultantSelectionStepProps> = ({
  bookingData,
  updateBookingData,
  onNext,
  loading,
  setLoading,
  language
}) => {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(
    bookingData.selectedConsultant || null
  );
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchActiveConsultants();
  }, []);

  const fetchActiveConsultants = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/v1/consultations/public/consultants/active', {
        headers: {
          'Accept-Language': language
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch consultants');
      }
      
      const data = await response.json();
      if (data.success) {
        setConsultants(data.data.consultants);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching consultants:', err);
      setError(language === 'de' 
        ? 'Fehler beim Laden der Berater. Bitte versuchen Sie es erneut.'
        : 'Error loading consultants. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConsultantSelect = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    updateBookingData({ selectedConsultant: consultant });
  };

  const handleContinue = () => {
    if (selectedConsultant) {
      onNext();
    }
  };

  const renderConsultantCard = (consultant: Consultant) => {
    const isSelected = selectedConsultant?.id === consultant.id;
    
    return (
      <div
        key={consultant.id}
        onClick={() => handleConsultantSelect(consultant)}
        className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
          isSelected 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-200 hover:border-gray-300'
        } ${consultant.is_featured ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`}
      >
        {/* Featured Badge */}
        {consultant.is_featured && (
          <div className="absolute -top-3 -right-3">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              ⭐ {language === 'de' ? 'Empfohlen' : 'Featured'}
            </div>
          </div>
        )}

        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {consultant.profile_picture_url ? (
              <img
                src={consultant.profile_picture_url}
                alt={consultant.full_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                {consultant.first_name[0]}{consultant.last_name[0]}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {consultant.full_name}
                </h3>
                {consultant.headline && (
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {consultant.headline}
                  </p>
                )}
              </div>
              
              {/* Rating */}
              {consultant.average_rating && (
                <div className="flex items-center space-x-1 bg-white rounded-full px-3 py-1 shadow-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {consultant.average_rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-wrap gap-4 mb-3">
              {consultant.location && (
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {consultant.location}
                </div>
              )}
              
              {consultant.industry && (
                <div className="flex items-center text-gray-600 text-sm">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {consultant.industry}
                </div>
              )}
              
              {consultant.total_projects && consultant.total_projects > 0 && (
                <div className="flex items-center text-gray-600 text-sm">
                  <Users className="w-4 h-4 mr-1" />
                  {consultant.total_projects} {language === 'de' ? 'Projekte' : 'Projects'}
                </div>
              )}
            </div>

            {/* Specializations */}
            {consultant.specializations && consultant.specializations.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {consultant.specializations.slice(0, 4).map((spec, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                  {consultant.specializations.length > 4 && (
                    <span className="inline-block text-gray-500 text-xs px-2 py-1">
                      +{consultant.specializations.length - 4} {language === 'de' ? 'weitere' : 'more'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* AI Summary Preview */}
            {consultant.ai_summary && (
              <p className="text-gray-600 text-sm line-clamp-2">
                {consultant.ai_summary}
              </p>
            )}
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-4 right-4">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-600">
          {language === 'de' ? 'Lade verfügbare Berater...' : 'Loading available consultants...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-600 text-center mb-4">{error}</p>
        <button
          onClick={fetchActiveConsultants}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {language === 'de' ? 'Erneut versuchen' : 'Try Again'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {language === 'de' 
            ? 'Wählen Sie Ihren KI-Experten für eine 30-minütige Beratung'
            : 'Choose your AI expert for a 30-minute consultation'
          }
        </h3>
        <p className="text-gray-600">
          {language === 'de'
            ? 'Unsere Experten helfen Ihnen bei wichtigen Informationen über KI-Technologie im Unternehmen, einschließlich Datenmanagement, Anwendungsentwicklung, Infrastruktur und KI-Modellen.'
            : 'Our experts provide important information about AI technology in enterprise, including data management, application development, infrastructure, and AI models.'
          }
        </p>
      </div>

      {/* Consultants Grid */}
      {consultants.length > 0 ? (
        <div className="space-y-4 mb-8">
          {consultants.map(renderConsultantCard)}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">
            {language === 'de' 
              ? 'Derzeit sind keine Berater verfügbar.'
              : 'No consultants are currently available.'
            }
          </p>
        </div>
      )}

      {/* Continue Button */}
      {selectedConsultant && (
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleContinue}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span>
              {language === 'de' ? 'Weiter zum Termin' : 'Continue to Schedule'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ConsultantSelectionStep;