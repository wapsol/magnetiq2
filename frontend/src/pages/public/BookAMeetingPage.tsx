import React, { useState } from 'react';
import { 
  SparklesIcon, 
  ClockIcon, 
  CurrencyEuroIcon,
  StarIcon,
  CheckCircleIcon,
  UserGroupIcon,
  BoltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import ConsultationBookingModal from '../../components/booking/ConsultationBookingModal';
import SEOHead from '../../components/common/SEOHead';

const BookAMeetingPage: React.FC = () => {
  const { language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const features = [
    {
      icon: SparklesIcon,
      title: {
        en: 'AI Expert Guidance',
        de: 'KI-Experten-Beratung'
      },
      description: {
        en: 'Get personalized insights from our certified AI specialists',
        de: 'Erhalten Sie persönliche Einblicke von unseren zertifizierten KI-Spezialisten'
      }
    },
    {
      icon: ClockIcon,
      title: {
        en: 'Quick & Efficient',
        de: 'Schnell & Effizient'
      },
      description: {
        en: '30 minutes focused consultation tailored to your needs',
        de: '30 Minuten fokussierte Beratung, zugeschnitten auf Ihre Bedürfnisse'
      }
    },
    {
      icon: BoltIcon,
      title: {
        en: 'Immediate Value',
        de: 'Sofortiger Nutzen'
      },
      description: {
        en: 'Walk away with actionable insights and next steps',
        de: 'Gehen Sie mit umsetzbaren Erkenntnissen und nächsten Schritten'
      }
    },
    {
      icon: ShieldCheckIcon,
      title: {
        en: 'Enterprise Ready',
        de: 'Unternehmensbereit'
      },
      description: {
        en: 'GDPR-compliant solutions for enterprise environments',
        de: 'DSGVO-konforme Lösungen für Unternehmensumgebungen'
      }
    }
  ];

  const benefits = [
    {
      en: 'Data Management Strategy',
      de: 'Datenmanagement-Strategie'
    },
    {
      en: 'AI Application Development',
      de: 'KI-Anwendungsentwicklung'
    },
    {
      en: 'Infrastructure Planning',
      de: 'Infrastruktur-Planung'
    },
    {
      en: 'AI Model Selection',
      de: 'KI-Modell-Auswahl'
    },
    {
      en: 'Implementation Roadmap',
      de: 'Umsetzungs-Roadmap'
    },
    {
      en: 'ROI Assessment',
      de: 'ROI-Bewertung'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Mueller',
      company: 'TechCorp GmbH',
      text: {
        en: 'The consultation provided exactly what we needed to kickstart our AI initiative. Highly recommended!',
        de: 'Die Beratung gab uns genau das, was wir brauchten, um unsere KI-Initiative zu starten. Sehr empfehlenswert!'
      },
      rating: 5
    },
    {
      name: 'Michael Schmidt',
      company: 'Digital Solutions AG',
      text: {
        en: 'Great value for money. 30 minutes that saved us months of research.',
        de: 'Großartiges Preis-Leistungs-Verhältnis. 30 Minuten, die uns Monate der Recherche erspart haben.'
      },
      rating: 5
    },
    {
      name: 'Lisa Weber',
      company: 'Innovation Lab',
      text: {
        en: 'Professional, knowledgeable, and actionable advice. Exactly what we hoped for.',
        de: 'Professionelle, sachkundige und umsetzbare Beratung. Genau das, was wir uns erhofft hatten.'
      },
      rating: 5
    }
  ];

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <StarIcon
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <>
      <SEOHead
        title={language === 'de' ? '30/30 KI-Beratung buchen' : 'Book 30/30 AI Consultation'}
        description={language === 'de' 
          ? 'Buchen Sie eine 30-minütige KI-Beratung für €30 mit unseren Experten. Erhalten Sie wertvolle Einblicke in KI-Technologie für Ihr Unternehmen.'
          : 'Book a 30-minute AI consultation for €30 with our experts. Get valuable insights into AI technology for your business.'
        }
        canonicalUrl="/book-a-meeting"
      />

      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <SparklesIcon className="w-4 h-4" />
                <span>
                  {language === 'de' ? 'Begrenzte Verfügbarkeit' : 'Limited Availability'}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                {language === 'de' ? (
                  <>
                    30/30 <span className="text-blue-600">KI-Beratung</span>
                  </>
                ) : (
                  <>
                    30/30 <span className="text-blue-600">AI Consultation</span>
                  </>
                )}
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {language === 'de' 
                  ? 'Erhalten Sie in nur 30 Minuten wertvolle Einblicke in KI-Technologie für Ihr Unternehmen - für nur €30'
                  : 'Get valuable insights into AI technology for your business in just 30 minutes - for only €30'
                }
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <div className="flex items-center space-x-2 text-gray-700">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">30 {language === 'de' ? 'Minuten' : 'minutes'}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <CurrencyEuroIcon className="w-5 h-5 text-green-600" />
                  <span className="font-medium">€30 {language === 'de' ? 'Festpreis' : 'fixed price'}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <UserGroupIcon className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">{language === 'de' ? 'Experten-Beratung' : 'Expert consultation'}</span>
                </div>
              </div>

              <button
                onClick={handleOpenModal}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                {language === 'de' ? 'Jetzt Beratung buchen' : 'Book Consultation Now'}
              </button>

              <p className="text-sm text-gray-500 mt-4">
                {language === 'de' 
                  ? 'Verfügbare Termine: Werktags 10:00 und 14:00 Uhr'
                  : 'Available slots: Weekdays 10:00 AM and 2:00 PM'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {language === 'de' ? 'Was Sie erwartet' : 'What to Expect'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {language === 'de' 
                  ? 'Unsere 30/30 Beratung bietet Ihnen kompakte, aber umfassende Einblicke in die KI-Welt'
                  : 'Our 30/30 consultation provides you with compact but comprehensive insights into the AI world'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title[language as keyof typeof feature.title]}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description[language as keyof typeof feature.description]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {language === 'de' ? 'Themen unserer Beratung' : 'Consultation Topics'}
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  {language === 'de' 
                    ? 'Wir decken die wichtigsten Bereiche der KI-Technologie im Unternehmen ab:'
                    : 'We cover the most important areas of AI technology in enterprise:'
                  }
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">
                        {benefit[language as keyof typeof benefit]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:text-center">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-2">€30</div>
                    <div className="text-xl mb-4">
                      {language === 'de' ? 'für 30 Minuten' : 'for 30 minutes'}
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 mb-6">
                      <p className="text-sm">
                        {language === 'de' 
                          ? 'Keine versteckten Kosten. Transparente Preisgestaltung.'
                          : 'No hidden costs. Transparent pricing.'
                        }
                      </p>
                    </div>
                    <button
                      onClick={handleOpenModal}
                      className="bg-white text-blue-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {language === 'de' ? 'Termin buchen' : 'Book Appointment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {language === 'de' ? 'Was unsere Kunden sagen' : 'What Our Clients Say'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-gray-700 mb-4">
                    "{testimonial.text[language as keyof typeof testimonial.text]}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.company}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">
              {language === 'de' ? 'Bereit für Ihre KI-Reise?' : 'Ready for Your AI Journey?'}
            </h2>
            <p className="text-xl mb-8">
              {language === 'de' 
                ? 'Buchen Sie jetzt Ihre 30-minütige Beratung und erhalten Sie sofort umsetzbare Erkenntnisse.'
                : 'Book your 30-minute consultation now and get immediately actionable insights.'
              }
            </p>
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <CurrencyEuroIcon className="w-5 h-5 mr-2" />
              {language === 'de' ? 'Kostenpflichtig buchen - €30' : 'Book Now - €30'}
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <ConsultationBookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default BookAMeetingPage;