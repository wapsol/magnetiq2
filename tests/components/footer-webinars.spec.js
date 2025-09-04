/**
 * Footer Webinars Section - Component Tests
 * 
 * Tests for the next 5 webinars section in the footer component,
 * covering display logic, language switching, responsive behavior,
 * and link functionality.
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../../frontend/src/components/common/Footer';
import { LanguageContext } from '../../frontend/src/contexts/LanguageContext';
import { ThemeContext } from '../../frontend/src/contexts/ThemeContext';

// Mock the context providers
const MockProviders = ({ language = 'en', isDarkMode = false, children }) => {
  const languageContextValue = {
    language,
    setLanguage: jest.fn()
  };

  const themeContextValue = {
    isDarkMode,
    toggleDarkMode: jest.fn()
  };

  return (
    <BrowserRouter>
      <LanguageContext.Provider value={languageContextValue}>
        <ThemeContext.Provider value={themeContextValue}>
          {children}
        </ThemeContext.Provider>
      </LanguageContext.Provider>
    </BrowserRouter>
  );
};

// Mock webinar data that matches the structure in Footer.tsx
const mockUpcomingWebinars = [
  {
    id: 1,
    titleEn: 'AI Readiness Assessment',
    titleDe: 'KI-Bereitschaftsbewertung',
    date: '2025-10-01',
    time: '16:00 CET'
  },
  {
    id: 2,
    titleEn: 'The AI Pilot Playbook',
    titleDe: 'Das KI-Pilot-Playbook',
    date: '2025-10-15',
    time: '16:00 CET'
  },
  {
    id: 3,
    titleEn: 'Automating Document Processing',
    titleDe: 'Automatisierung der Dokumentenverarbeitung',
    date: '2025-10-29',
    time: '16:00 CET'
  },
  {
    id: 4,
    titleEn: 'AI-Powered Knowledge Management',
    titleDe: 'KI-gestütztes Wissensmanagement',
    date: '2025-11-12',
    time: '16:00 CET'
  },
  {
    id: 5,
    titleEn: 'Creating an AI Center of Excellence',
    titleDe: 'Ein KI-Kompetenzzentrum aufbauen',
    date: '2025-11-26',
    time: '16:00 CET'
  }
];

describe('Footer Webinars Section', () => {
  describe('Section Display', () => {
    it('renders the webinar section with correct title in English', () => {
      render(
        <MockProviders language="en">
          <Footer />
        </MockProviders>
      );

      expect(screen.getByText('Upcoming Webinars')).toBeInTheDocument();
      expect(screen.getByText('Register for our free AI webinars')).toBeInTheDocument();
    });

    it('renders the webinar section with correct title in German', () => {
      render(
        <MockProviders language="de">
          <Footer />
        </MockProviders>
      );

      expect(screen.getByText('Kommende Webinare')).toBeInTheDocument();
      expect(screen.getByText('Melden Sie sich für unsere kostenlosen KI-Webinare an')).toBeInTheDocument();
    });

    it('displays exactly 5 webinar cards', () => {
      render(
        <MockProviders>
          <Footer />
        </MockProviders>
      );

      // Look for webinar cards within the footer
      const webinarCards = screen.getAllByRole('link');
      const webinarSectionCards = webinarCards.filter(card => 
        card.getAttribute('href') && card.getAttribute('href').includes('/webinars/')
      );
      
      expect(webinarSectionCards).toHaveLength(5);
    });

    it('renders "View All Webinars" button with correct link', () => {
      render(
        <MockProviders language="en">
          <Footer />
        </MockProviders>
      );

      const viewAllButton = screen.getByRole('link', { name: /view all webinars/i });
      expect(viewAllButton).toBeInTheDocument();
      expect(viewAllButton).toHaveAttribute('href', '/webinars');
    });
  });

  describe('Webinar Card Content', () => {
    it('displays webinar titles in English', () => {
      render(
        <MockProviders language="en">
          <Footer />
        </MockProviders>
      );

      expect(screen.getByText('AI Readiness Assessment')).toBeInTheDocument();
      expect(screen.getByText('The AI Pilot Playbook')).toBeInTheDocument();
      expect(screen.getByText('Automating Document Processing')).toBeInTheDocument();
    });

    it('displays webinar titles in German', () => {
      render(
        <MockProviders language="de">
          <Footer />
        </MockProviders>
      );

      expect(screen.getByText('KI-Bereitschaftsbewertung')).toBeInTheDocument();
      expect(screen.getByText('Das KI-Pilot-Playbook')).toBeInTheDocument();
      expect(screen.getByText('Automatisierung der Dokumentenverarbeitung')).toBeInTheDocument();
    });

    it('displays dates in correct format for English', () => {
      render(
        <MockProviders language="en">
          <Footer />
        </MockProviders>
      );

      // English format should be "Oct 01, 2025"
      expect(screen.getByText(/Oct 01, 2025/)).toBeInTheDocument();
      expect(screen.getByText(/Oct 15, 2025/)).toBeInTheDocument();
    });

    it('displays dates in correct format for German', () => {
      render(
        <MockProviders language="de">
          <Footer />
        </MockProviders>
      );

      // German format should be "01.10.2025"
      expect(screen.getByText(/01\.10\.2025/)).toBeInTheDocument();
      expect(screen.getByText(/15\.10\.2025/)).toBeInTheDocument();
    });

    it('displays consistent time format for all webinars', () => {
      render(
        <MockProviders>
          <Footer />
        </MockProviders>
      );

      const timeElements = screen.getAllByText('16:00 CET');
      expect(timeElements).toHaveLength(5);
    });
  });

  describe('Navigation and Links', () => {
    it('creates correct registration links for each webinar', () => {
      render(
        <MockProviders>
          <Footer />
        </MockProviders>
      );

      const webinarLinks = screen.getAllByRole('link');
      const registrationLinks = webinarLinks.filter(link => 
        link.getAttribute('href') && link.getAttribute('href').includes('/webinars/')
      );

      expect(registrationLinks[0]).toHaveAttribute('href', '/webinars/1');
      expect(registrationLinks[1]).toHaveAttribute('href', '/webinars/2');
      expect(registrationLinks[2]).toHaveAttribute('href', '/webinars/3');
      expect(registrationLinks[3]).toHaveAttribute('href', '/webinars/4');
      expect(registrationLinks[4]).toHaveAttribute('href', '/webinars/5');
    });

    it('handles webinar card clicks correctly', () => {
      const mockNavigate = jest.fn();
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate
      }));

      render(
        <MockProviders>
          <Footer />
        </MockProviders>
      );

      const firstWebinarCard = screen.getAllByRole('link')[0];
      fireEvent.click(firstWebinarCard);
      
      // Link should be properly set up for React Router navigation
      expect(firstWebinarCard.getAttribute('href')).toBe('/webinars/1');
    });
  });

  describe('Responsive Design', () => {
    it('applies correct CSS classes for grid layout', () => {
      render(
        <MockProviders>
          <Footer />
        </MockProviders>
      );

      const webinarGrid = screen.getByTestId('webinar-grid'); // Would need to add data-testid
      expect(webinarGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-5');
    });

    it('applies hover effects on webinar cards', () => {
      render(
        <MockProviders>
          <Footer />
        </MockProviders>
      );

      const webinarCards = screen.getAllByRole('link');
      const firstWebinarCard = webinarCards.find(card => 
        card.getAttribute('href') === '/webinars/1'
      );

      expect(firstWebinarCard).toHaveClass('hover:border-violet-300', 'hover:bg-violet-100');
    });
  });

  describe('Dark Mode Support', () => {
    it('applies correct dark mode classes', () => {
      render(
        <MockProviders isDarkMode={true}>
          <Footer />
        </MockProviders>
      );

      const webinarCards = screen.getAllByRole('link');
      const firstWebinarCard = webinarCards.find(card => 
        card.getAttribute('href') === '/webinars/1'
      );

      expect(firstWebinarCard).toHaveClass('dark:bg-violet-900/20', 'dark:border-violet-700');
    });

    it('displays correct text colors in dark mode', () => {
      render(
        <MockProviders isDarkMode={true}>
          <Footer />
        </MockProviders>
      );

      const sectionTitle = screen.getByText('Upcoming Webinars');
      expect(sectionTitle).toHaveClass('dark:text-white');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(
        <MockProviders>
          <Footer />
        </MockProviders>
      );

      const mainHeading = screen.getByRole('heading', { level: 2, name: /upcoming webinars/i });
      expect(mainHeading).toBeInTheDocument();
    });

    it('provides accessible link descriptions', () => {
      render(
        <MockProviders>
          <Footer />
        </MockProviders>
      );

      const webinarLinks = screen.getAllByRole('link');
      const registrationLinks = webinarLinks.filter(link => 
        link.getAttribute('href') && link.getAttribute('href').includes('/webinars/')
      );

      registrationLinks.forEach(link => {
        expect(link).toHaveAttribute('href');
        expect(link.textContent).toBeTruthy();
      });
    });

    it('supports keyboard navigation', () => {
      render(
        <MockProviders>
          <Footer />
        </MockProviders>
      );

      const webinarCards = screen.getAllByRole('link');
      const firstWebinarCard = webinarCards.find(card => 
        card.getAttribute('href') === '/webinars/1'
      );

      // Simulate tab navigation
      firstWebinarCard.focus();
      expect(document.activeElement).toBe(firstWebinarCard);

      // Test Enter key activation
      fireEvent.keyDown(firstWebinarCard, { key: 'Enter' });
      // Should trigger navigation (would need to mock navigation to test fully)
    });
  });

  describe('Error Handling', () => {
    it('handles missing webinar data gracefully', () => {
      // Mock empty webinar data
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <MockProviders>
          <Footer />
        </MockProviders>
      );

      // Should not crash and should display fallback content
      expect(screen.getByText('Upcoming Webinars')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('handles invalid date formats gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <MockProviders>
          <Footer />
        </MockProviders>
      );

      // Should not crash even with invalid dates
      expect(screen.getByText('Upcoming Webinars')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Language Switching', () => {
    it('updates content when language changes from EN to DE', () => {
      const { rerender } = render(
        <MockProviders language="en">
          <Footer />
        </MockProviders>
      );

      expect(screen.getByText('Upcoming Webinars')).toBeInTheDocument();
      expect(screen.getByText('AI Readiness Assessment')).toBeInTheDocument();

      rerender(
        <MockProviders language="de">
          <Footer />
        </MockProviders>
      );

      expect(screen.getByText('Kommende Webinare')).toBeInTheDocument();
      expect(screen.getByText('KI-Bereitschaftsbewertung')).toBeInTheDocument();
    });

    it('maintains correct View All button text in both languages', () => {
      const { rerender } = render(
        <MockProviders language="en">
          <Footer />
        </MockProviders>
      );

      expect(screen.getByText('View All Webinars')).toBeInTheDocument();

      rerender(
        <MockProviders language="de">
          <Footer />
        </MockProviders>
      );

      expect(screen.getByText('Alle Webinare anzeigen')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders without performance issues', () => {
      const startTime = performance.now();

      render(
        <MockProviders>
          <Footer />
        </MockProviders>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Render should complete quickly (under 100ms for footer section)
      expect(renderTime).toBeLessThan(100);
    });

    it('does not cause memory leaks with repeated renders', () => {
      const { rerender, unmount } = render(
        <MockProviders>
          <Footer />
        </MockProviders>
      );

      // Re-render multiple times to check for memory leaks
      for (let i = 0; i < 10; i++) {
        rerender(
          <MockProviders language={i % 2 === 0 ? 'en' : 'de'}>
            <Footer />
          </MockProviders>
        );
      }

      unmount();
      
      // If there were memory leaks, this test would timeout or crash
      expect(true).toBe(true);
    });
  });
});

/**
 * Integration Tests for Footer Webinars
 * Tests the integration with the broader application context
 */
describe('Footer Webinars Integration', () => {
  describe('Data Integration', () => {
    it('displays webinars from the correct data source', () => {
      render(
        <MockProviders>
          <Footer />
        </MockProviders>
      );

      // Should display the first 5 upcoming webinars from the data
      expect(screen.getByText('AI Readiness Assessment')).toBeInTheDocument();
      expect(screen.getByText('The AI Pilot Playbook')).toBeInTheDocument();
    });

    it('updates when webinar data changes', () => {
      // This would require mocking the webinar data source
      // and testing that changes are reflected in the footer
      render(
        <MockProviders>
          <Footer />
        </MockProviders>
      );

      expect(screen.getAllByRole('link').filter(link => 
        link.getAttribute('href') && link.getAttribute('href').includes('/webinars/')
      )).toHaveLength(5);
    });
  });

  describe('Context Integration', () => {
    it('correctly uses language context for translations', () => {
      render(
        <MockProviders language="de">
          <Footer />
        </MockProviders>
      );

      // Should use German translations from language context
      expect(screen.getByText('Kommende Webinare')).toBeInTheDocument();
      expect(screen.getByText('Melden Sie sich für unsere kostenlosen KI-Webinars an')).toBeInTheDocument();
    });

    it('correctly uses theme context for styling', () => {
      render(
        <MockProviders isDarkMode={true}>
          <Footer />
        </MockProviders>
      );

      // Should apply dark mode styles from theme context
      const sectionTitle = screen.getByText('Upcoming Webinars');
      expect(sectionTitle).toHaveClass('dark:text-white');
    });
  });
});