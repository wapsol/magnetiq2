import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import SEOHead from '../../components/common/SEOHead';
import { backgrounds, textColors, getCardClasses } from '../../utils/styling';
import {
  UserIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
  CurrencyEuroIcon,
  LanguageIcon,
  CheckBadgeIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PlayIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

interface ConsultantProfile {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  profile_picture_url?: string;
  headline?: string;
  location?: string;
  industry?: string;
  specializations?: string[];
  years_experience?: number;
  hourly_rate?: number;
  currency?: string;
  availability_status?: string;
  languages_spoken?: Array<{language: string, proficiency: string}>;
  ai_summary?: string;
  ai_skills_assessment?: any;
  ai_market_positioning?: string;
  total_projects?: number;
  completed_projects?: number;
  average_rating?: number;
  response_rate?: number;
  response_time_hours?: number;
  is_featured?: boolean;
  is_verified?: boolean;
  linkedin_url?: string;
  created_at?: string;
  reviews?: ConsultantReview[];
  portfolio?: ConsultantPortfolioItem[];
}

interface ConsultantReview {
  id: string;
  client_name: string;
  rating: number;
  comment: string;
  project_type: string;
  created_at: string;
}

interface ConsultantPortfolioItem {
  id: string;
  title: string;
  description: string;
  type: 'whitepaper' | 'webinar' | 'case_study';
  url?: string;
  thumbnail_url?: string;
  created_at: string;
}

const ConsultantProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [consultant, setConsultant] = useState<ConsultantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'portfolio'>('overview');

  useEffect(() => {
    const fetchConsultantProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/consultants/public/profile/${slug}`, {
          headers: {
            'Accept-Language': language
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(language === 'de' ? 'Berater nicht gefunden' : 'Consultant not found');
          }
          throw new Error(language === 'de' ? 'Fehler beim Laden des Profils' : 'Error loading profile');
        }

        const data = await response.json();
        setConsultant(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchConsultantProfile();
    }
  }, [slug, language]);

  if (loading) {
    return (
      <div className={`min-h-screen ${backgrounds.page} flex items-center justify-center`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${backgrounds.page}`}>
        <div className="container mx-auto px-6 py-16">
          <ErrorMessage 
            title={language === 'de' ? 'Fehler' : 'Error'}
            message={error}
          />
          <div className="mt-8 text-center">
            <Link
              to="/consultants"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              {language === 'de' ? 'Zurück zu Beratern' : 'Back to Consultants'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!consultant) {
    return null;
  }

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="h-5 w-5 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <StarIconSolid className="h-5 w-5 text-yellow-400" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />);
    }

    return stars;
  };

  const handleBookConsultation = () => {
    // This will open the booking modal with the consultant pre-selected
    const bookingEvent = new CustomEvent('openBookingModal', {
      detail: { consultantId: consultant.id }
    });
    window.dispatchEvent(bookingEvent);
  };

  return (
    <>
      <SEOHead
        title={`${consultant.full_name} - ${consultant.headline || (language === 'de' ? 'Berater' : 'Consultant')} | voltAIc Systems`}
        description={consultant.ai_summary || consultant.headline || `${language === 'de' ? 'Professioneller Berater' : 'Professional Consultant'} ${consultant.full_name}`}
        canonicalUrl={`${language === 'de' ? '/de' : ''}/consultants/${slug}`}
      />

      <div className={`min-h-screen ${backgrounds.page}`}>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-50 via-primary-100 to-purple-50 py-16">
          <div className="container mx-auto px-6">
            {/* Back Navigation */}
            <div className="mb-8">
              <Link
                to="/consultants"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                {language === 'de' ? 'Zurück zu Beratern' : 'Back to Consultants'}
              </Link>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                {/* Profile Picture */}
                <div className="relative">
                  {consultant.profile_picture_url ? (
                    <img
                      src={consultant.profile_picture_url}
                      alt={consultant.full_name}
                      className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-primary-600 flex items-center justify-center border-4 border-white shadow-lg">
                      <UserIcon className="h-16 w-16 lg:h-20 lg:w-20 text-white" />
                    </div>
                  )}
                  {consultant.is_verified && (
                    <div className="absolute -bottom-2 -right-2">
                      <CheckBadgeIcon className="h-8 w-8 text-green-500 bg-white rounded-full" />
                    </div>
                  )}
                  {consultant.is_featured && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                        {language === 'de' ? 'FEATURED' : 'FEATURED'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h1 className={`text-3xl lg:text-4xl font-bold ${textColors.primary} mb-2`}>
                    {consultant.full_name}
                  </h1>
                  
                  {consultant.headline && (
                    <p className={`text-xl ${textColors.secondary} mb-4`}>
                      {consultant.headline}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 mb-6">
                    {consultant.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPinIcon className="h-5 w-5 mr-2" />
                        <span>{consultant.location}</span>
                      </div>
                    )}
                    
                    {consultant.years_experience && (
                      <div className="flex items-center text-gray-600">
                        <ClockIcon className="h-5 w-5 mr-2" />
                        <span>
                          {consultant.years_experience} {language === 'de' ? 'Jahre Erfahrung' : 'years experience'}
                        </span>
                      </div>
                    )}

                    {consultant.average_rating && (
                      <div className="flex items-center text-gray-600">
                        <div className="flex mr-2">
                          {renderStars(consultant.average_rating)}
                        </div>
                        <span>({consultant.average_rating.toFixed(1)})</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleBookConsultation}
                      className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:shadow-lg transition-all duration-200"
                    >
                      <CalendarDaysIcon className="h-5 w-5 mr-2" />
                      {language === 'de' ? 'Beratung buchen' : 'Book Consultation'}
                    </button>

                    <button className="inline-flex items-center px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                      {language === 'de' ? 'Nachricht senden' : 'Send Message'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              {/* Tab Navigation */}
              <div className="flex space-x-8 border-b border-gray-200 mb-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {language === 'de' ? 'Überblick' : 'Overview'}
                </button>

                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {language === 'de' ? 'Bewertungen' : 'Reviews'} ({consultant.reviews?.length || 0})
                </button>

                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === 'portfolio'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {language === 'de' ? 'Portfolio' : 'Portfolio'} ({consultant.portfolio?.length || 0})
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && <OverviewTab consultant={consultant} language={language} />}
              {activeTab === 'reviews' && <ReviewsTab reviews={consultant.reviews || []} language={language} />}
              {activeTab === 'portfolio' && <PortfolioTab portfolio={consultant.portfolio || []} language={language} />}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ consultant: ConsultantProfile; language: string }> = ({ consultant, language }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Main Info */}
      <div className="lg:col-span-2 space-y-8">
        {/* About Section */}
        {consultant.ai_summary && (
          <div className={getCardClasses()}>
            <h3 className={`text-2xl font-bold ${textColors.primary} mb-4`}>
              {language === 'de' ? 'Über mich' : 'About'}
            </h3>
            <div className={`${textColors.secondary} leading-relaxed whitespace-pre-line`}>
              {consultant.ai_summary}
            </div>
          </div>
        )}

        {/* Expertise Section */}
        {consultant.specializations && consultant.specializations.length > 0 && (
          <div className={getCardClasses()}>
            <h3 className={`text-2xl font-bold ${textColors.primary} mb-4`}>
              {language === 'de' ? 'Fachbereiche' : 'Expertise'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {consultant.specializations.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Market Positioning */}
        {consultant.ai_market_positioning && (
          <div className={getCardClasses()}>
            <h3 className={`text-2xl font-bold ${textColors.primary} mb-4`}>
              {language === 'de' ? 'Marktpositionierung' : 'Market Positioning'}
            </h3>
            <div className={`${textColors.secondary} leading-relaxed whitespace-pre-line`}>
              {consultant.ai_market_positioning}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Stats & Details */}
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className={getCardClasses()}>
          <h3 className={`text-lg font-bold ${textColors.primary} mb-4`}>
            {language === 'de' ? 'Statistiken' : 'Quick Stats'}
          </h3>
          
          <div className="space-y-4">
            {consultant.total_projects !== undefined && (
              <div className="flex items-center justify-between">
                <span className={`${textColors.secondary}`}>
                  {language === 'de' ? 'Projekte gesamt' : 'Total Projects'}
                </span>
                <span className={`font-semibold ${textColors.primary}`}>
                  {consultant.total_projects}
                </span>
              </div>
            )}

            {consultant.completed_projects !== undefined && (
              <div className="flex items-center justify-between">
                <span className={`${textColors.secondary}`}>
                  {language === 'de' ? 'Abgeschlossen' : 'Completed'}
                </span>
                <span className={`font-semibold ${textColors.primary}`}>
                  {consultant.completed_projects}
                </span>
              </div>
            )}

            {consultant.response_rate !== undefined && consultant.response_rate !== null && (
              <div className="flex items-center justify-between">
                <span className={`${textColors.secondary}`}>
                  {language === 'de' ? 'Antwortrate' : 'Response Rate'}
                </span>
                <span className={`font-semibold ${textColors.primary}`}>
                  {consultant.response_rate.toFixed(0)}%
                </span>
              </div>
            )}

            {consultant.response_time_hours !== undefined && consultant.response_time_hours !== null && (
              <div className="flex items-center justify-between">
                <span className={`${textColors.secondary}`}>
                  {language === 'de' ? 'Antwortzeit' : 'Response Time'}
                </span>
                <span className={`font-semibold ${textColors.primary}`}>
                  {consultant.response_time_hours < 1 
                    ? `${Math.round(consultant.response_time_hours * 60)}m`
                    : `${consultant.response_time_hours.toFixed(1)}h`
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        {consultant.hourly_rate && (
          <div className={getCardClasses()}>
            <h3 className={`text-lg font-bold ${textColors.primary} mb-4`}>
              {language === 'de' ? 'Preise' : 'Pricing'}
            </h3>
            
            <div className="flex items-center">
              <CurrencyEuroIcon className="h-6 w-6 text-green-500 mr-2" />
              <div>
                <div className={`text-2xl font-bold ${textColors.primary}`}>
                  €{consultant.hourly_rate}
                </div>
                <div className={`text-sm ${textColors.secondary}`}>
                  {language === 'de' ? 'pro Stunde' : 'per hour'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Languages */}
        {consultant.languages_spoken && consultant.languages_spoken.length > 0 && (
          <div className={getCardClasses()}>
            <h3 className={`text-lg font-bold ${textColors.primary} mb-4`}>
              <LanguageIcon className="h-5 w-5 inline mr-2" />
              {language === 'de' ? 'Sprachen' : 'Languages'}
            </h3>
            
            <div className="space-y-2">
              {consultant.languages_spoken.map((lang, index) => (
                <div key={index} className="flex justify-between">
                  <span className={`${textColors.secondary}`}>{lang.language}</span>
                  <span className={`text-sm ${textColors.primary} font-medium`}>
                    {lang.proficiency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className={getCardClasses()}>
          <h3 className={`text-lg font-bold ${textColors.primary} mb-4`}>
            {language === 'de' ? 'Verfügbarkeit' : 'Availability'}
          </h3>
          
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              consultant.availability_status === 'available' ? 'bg-green-500' :
              consultant.availability_status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className={`${textColors.secondary}`}>
              {consultant.availability_status === 'available' && (language === 'de' ? 'Verfügbar' : 'Available')}
              {consultant.availability_status === 'busy' && (language === 'de' ? 'Beschäftigt' : 'Busy')}
              {consultant.availability_status === 'unavailable' && (language === 'de' ? 'Nicht verfügbar' : 'Unavailable')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reviews Tab Component
const ReviewsTab: React.FC<{ reviews: ConsultantReview[]; language: string }> = ({ reviews, language }) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <StarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className={`text-xl font-semibold ${textColors.primary} mb-2`}>
          {language === 'de' ? 'Noch keine Bewertungen' : 'No Reviews Yet'}
        </h3>
        <p className={`${textColors.secondary}`}>
          {language === 'de' 
            ? 'Seien Sie der Erste, der diesen Berater bewertet!'
            : 'Be the first to review this consultant!'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className={getCardClasses()}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className={`font-semibold ${textColors.primary}`}>
                {review.client_name}
              </h4>
              <p className={`text-sm ${textColors.secondary}`}>
                {review.project_type} • {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <StarIconSolid
                  key={i}
                  className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>
          <p className={`${textColors.secondary}`}>{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

// Portfolio Tab Component
const PortfolioTab: React.FC<{ portfolio: ConsultantPortfolioItem[]; language: string }> = ({ portfolio, language }) => {
  if (portfolio.length === 0) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className={`text-xl font-semibold ${textColors.primary} mb-2`}>
          {language === 'de' ? 'Kein Portfolio verfügbar' : 'No Portfolio Available'}
        </h3>
        <p className={`${textColors.secondary}`}>
          {language === 'de' 
            ? 'Dieser Berater hat noch keine Portfolio-Elemente hochgeladen.'
            : 'This consultant hasn\'t uploaded any portfolio items yet.'
          }
        </p>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whitepaper':
        return <DocumentTextIcon className="h-6 w-6" />;
      case 'webinar':
        return <PlayIcon className="h-6 w-6" />;
      case 'case_study':
        return <ChartBarIcon className="h-6 w-6" />;
      default:
        return <DocumentTextIcon className="h-6 w-6" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'whitepaper':
        return language === 'de' ? 'Whitepaper' : 'Whitepaper';
      case 'webinar':
        return language === 'de' ? 'Webinar' : 'Webinar';
      case 'case_study':
        return language === 'de' ? 'Fallstudie' : 'Case Study';
      default:
        return type;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {portfolio.map((item) => (
        <div key={item.id} className={`${getCardClasses()} hover:shadow-lg transition-shadow cursor-pointer`}>
          {item.thumbnail_url && (
            <img
              src={item.thumbnail_url}
              alt={item.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          
          <div className="flex items-center mb-2">
            <div className="text-primary-600 mr-2">
              {getTypeIcon(item.type)}
            </div>
            <span className={`text-sm ${textColors.secondary} font-medium`}>
              {getTypeLabel(item.type)}
            </span>
          </div>
          
          <h4 className={`font-semibold ${textColors.primary} mb-2`}>
            {item.title}
          </h4>
          
          <p className={`${textColors.secondary} text-sm mb-4 line-clamp-3`}>
            {item.description}
          </p>
          
          <div className="flex justify-between items-center">
            <span className={`text-xs ${textColors.secondary}`}>
              {new Date(item.created_at).toLocaleDateString()}
            </span>
            
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                {language === 'de' ? 'Ansehen' : 'View'} →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConsultantProfilePage;