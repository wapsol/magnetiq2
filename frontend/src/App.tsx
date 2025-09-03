import { Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'

// Layouts
import PublicLayout from './components/layouts/PublicLayout'
import AdminLayout from './components/layouts/AdminLayout'
import AuthLayout from './components/layouts/AuthLayout'

// Pages - Services
import ServicesOverview from './pages/services/ServicesOverview'
import AIConsultingPage from './pages/services/AIConsultingPage'
import DigitalTransformationPage from './pages/services/DigitalTransformationPage'
import AutomationPage from './pages/services/AutomationPage'
import DevelopmentPage from './pages/services/DevelopmentPage'
import ManagementAdvisoryPage from './pages/services/ManagementAdvisoryPage'
import DataManagementPage from './pages/services/DataManagementPage'

// Pages - Solutions
import SolutionsOverview from './pages/solutions/SolutionsOverview'
import TechnologyPage from './pages/solutions/TechnologyPage'
import IndustriesPage from './pages/solutions/IndustriesPage'
import FintechPage from './pages/solutions/industries/FintechPage'
import HealthcarePage from './pages/solutions/industries/HealthcarePage'  
import ManufacturingPage from './pages/solutions/industries/ManufacturingPage'
import RetailPage from './pages/solutions/industries/RetailPage'
import EnergyPage from './pages/solutions/industries/EnergyPage'
import SalesPage from './pages/solutions/industries/SalesPage'
import ServiceProviderPage from './pages/solutions/industries/ServiceProviderPage'
import FoodBeveragePage from './pages/solutions/industries/FoodBeveragePage'

// Pages - About
import AboutPage from './pages/about/AboutPage'
import AboutOverview from './pages/about/AboutOverview'
import CareersPage from './pages/about/CareersPage'

// Pages - Products
import DataOperatingSystemPage from './pages/products/DataOperatingSystemPage'
import PrivateCloudPage from './pages/products/PrivateCloudPage'

// Pages - Contact
import ContactOverview from './pages/contact/ContactOverview'

// Pages - Legal
import ImprintPage from './pages/legal/ImprintPage'

// Pages - Public (Existing)
import HomePage from './pages/public/HomePage'
import WebinarsPage from './pages/public/WebinarsPage'
import WhitepapersPage from './pages/public/WhitepapersPage'
import BookAMeetingPage from './pages/public/BookAMeetingPage'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import ContentOverview from './pages/admin/content/ContentOverview'
import PagesManager from './pages/admin/content/PagesManager'
import IndustriesManager from './pages/admin/content/IndustriesManager'
import TranslationManager from './pages/admin/content/TranslationManager'
import BusinessOverview from './pages/admin/business/BusinessOverview'
import WebinarManagement from './pages/admin/webinars/WebinarManagement'
import WhitepapersManagement from './pages/admin/whitepapers/WhitepapersManagement'
import UsersManager from './pages/admin/users/UsersManager'
import { ConsultantManagement } from './pages/admin/consultants/ConsultantManagement'
import { ConsultantAnalytics } from './pages/admin/consultants/ConsultantAnalytics'

// Error pages
import NotFound from './pages/NotFound'

// Components
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <LanguageProvider>
      <Routes>
        {/* English Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          
          {/* Services */}
          <Route path="services">
            <Route index element={<ServicesOverview />} />
            <Route path="ai-consulting" element={<AIConsultingPage />} />
            <Route path="digital-transformation" element={<DigitalTransformationPage />} />
            <Route path="automation" element={<AutomationPage />} />
            <Route path="development" element={<DevelopmentPage />} />
            <Route path="management-advisory" element={<ManagementAdvisoryPage />} />
            <Route path="data-management" element={<DataManagementPage />} />
          </Route>
          
          {/* Solutions */}
          <Route path="solutions">
            <Route index element={<SolutionsOverview />} />
            <Route path="industries" element={<IndustriesPage />} />
            <Route path="industries/fintech" element={<FintechPage />} />
            <Route path="industries/healthcare" element={<HealthcarePage />} />
            <Route path="industries/manufacturing" element={<ManufacturingPage />} />
            <Route path="industries/retail" element={<RetailPage />} />
            <Route path="industries/energy" element={<EnergyPage />} />
            <Route path="industries/sales" element={<SalesPage />} />
            <Route path="industries/service-provider" element={<ServiceProviderPage />} />
            <Route path="industries/food-beverage" element={<FoodBeveragePage />} />
            <Route path="technology" element={<TechnologyPage />} />
            <Route path="case-studies" element={<SolutionsOverview />} />
          </Route>
          
          {/* Products */}
          <Route path="products">
            <Route path="data-operating-system" element={<DataOperatingSystemPage />} />
            <Route path="private-cloud" element={<PrivateCloudPage />} />
          </Route>
          
          {/* Resources */}
          <Route path="resources">
            <Route path="webinars" element={<WebinarsPage />} />
            <Route path="webinars/:slug" element={<WebinarsPage />} />
            <Route path="whitepapers" element={<WhitepapersPage />} />
            <Route path="whitepapers/:slug" element={<WhitepapersPage />} />
            <Route path="blog" element={<HomePage />} />
            <Route path="tools" element={<HomePage />} />
          </Route>
          
          {/* About */}
          <Route path="about">
            <Route index element={<AboutOverview />} />
            <Route path="story" element={<AboutPage />} />
            <Route path="team" element={<AboutPage />} />
            <Route path="mission" element={<AboutPage />} />
            <Route path="careers" element={<CareersPage />} />
            <Route path="partners" element={<AboutPage />} />
            <Route path="news" element={<AboutPage />} />
          </Route>
          
          {/* Contact */}
          <Route path="contact">
            <Route index element={<ContactOverview />} />
            <Route path="booking" element={<BookAMeetingPage />} />
            <Route path="general" element={<ContactOverview />} />
            <Route path="support" element={<ContactOverview />} />
            <Route path="locations" element={<ContactOverview />} />
          </Route>
          
          {/* Legal */}
          <Route path="legal">
            <Route path="imprint" element={<ImprintPage />} />
            <Route path="privacy" element={<ImprintPage />} />
            <Route path="terms" element={<ImprintPage />} />
            <Route path="cookies" element={<ImprintPage />} />
          </Route>
        </Route>

        {/* German Routes */}
        <Route path="/de" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          
          {/* Dienstleistungen (Services) */}
          <Route path="dienstleistungen">
            <Route index element={<ServicesOverview />} />
            <Route path="ki-beratung" element={<AIConsultingPage />} />
            <Route path="digitale-transformation" element={<DigitalTransformationPage />} />
            <Route path="automatisierung" element={<AutomationPage />} />
            <Route path="entwicklung" element={<DevelopmentPage />} />
            <Route path="management-beratung" element={<ManagementAdvisoryPage />} />
            <Route path="datenmanagement" element={<DataManagementPage />} />
          </Route>
          
          {/* Lösungen (Solutions) */}
          <Route path="loesungen">
            <Route index element={<SolutionsOverview />} />
            <Route path="branchen" element={<IndustriesPage />} />
            <Route path="branchen/fintech" element={<FintechPage />} />
            <Route path="branchen/gesundheitswesen" element={<HealthcarePage />} />
            <Route path="branchen/fertigung" element={<ManufacturingPage />} />
            <Route path="branchen/einzelhandel" element={<RetailPage />} />
            <Route path="branchen/energie" element={<EnergyPage />} />
            <Route path="branchen/vertrieb" element={<SalesPage />} />
            <Route path="branchen/dienstleister" element={<ServiceProviderPage />} />
            <Route path="branchen/lebensmittel" element={<FoodBeveragePage />} />
            <Route path="technologie" element={<TechnologyPage />} />
            <Route path="fallstudien" element={<SolutionsOverview />} />
          </Route>
          
          {/* Produkte (Products) */}
          <Route path="produkte">
            <Route path="daten-betriebssystem" element={<DataOperatingSystemPage />} />
            <Route path="private-cloud" element={<PrivateCloudPage />} />
          </Route>
          
          {/* Ressourcen (Resources) */}
          <Route path="ressourcen">
            <Route path="webinare" element={<WebinarsPage />} />
            <Route path="webinare/:slug" element={<WebinarsPage />} />
            <Route path="whitepapers" element={<WhitepapersPage />} />
            <Route path="whitepapers/:slug" element={<WhitepapersPage />} />
            <Route path="blog" element={<HomePage />} />
            <Route path="tools" element={<HomePage />} />
          </Route>
          
          {/* Über uns (About) */}
          <Route path="ueber-uns">
            <Route index element={<AboutOverview />} />
            <Route path="geschichte" element={<AboutPage />} />
            <Route path="team" element={<AboutPage />} />
            <Route path="mission" element={<AboutPage />} />
            <Route path="karriere" element={<CareersPage />} />
            <Route path="partner" element={<AboutPage />} />
            <Route path="presse" element={<AboutPage />} />
          </Route>
          
          {/* Kontakt (Contact) */}
          <Route path="kontakt">
            <Route index element={<ContactOverview />} />
            <Route path="terminbuchung" element={<BookAMeetingPage />} />
            <Route path="allgemein" element={<ContactOverview />} />
            <Route path="support" element={<ContactOverview />} />
            <Route path="standorte" element={<ContactOverview />} />
          </Route>
          
          {/* Legal */}
          <Route path="legal">
            <Route path="impressum" element={<ImprintPage />} />
            <Route path="datenschutz" element={<ImprintPage />} />
            <Route path="nutzungsbedingungen" element={<ImprintPage />} />
            <Route path="cookies" element={<ImprintPage />} />
          </Route>
        </Route>

        {/* Redirect old German routes */}
        <Route path="/services/*" element={<Navigate to="/services" replace />} />
        <Route path="/de/services/*" element={<Navigate to="/de/dienstleistungen" replace />} />

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route index element={<Navigate to="/auth/login" replace />} />
        </Route>

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          
          {/* Content Management */}
          <Route path="content">
            <Route index element={<ContentOverview />} />
            <Route path="pages" element={<PagesManager />} />
            <Route path="industries" element={<IndustriesManager />} />
            <Route path="translations" element={<TranslationManager />} />
          </Route>
          
          {/* User Management */}
          <Route path="users" element={<UsersManager />} />
          
          {/* Webinars Management */}
          <Route path="webinars" element={<WebinarManagement />} />
          
          {/* Whitepapers Management */}
          <Route path="whitepapers" element={<WhitepapersManagement />} />
          
          {/* Consultant Management */}
          <Route path="consultants">
            <Route index element={<ConsultantManagement />} />
            <Route path="analytics" element={<ConsultantAnalytics />} />
          </Route>
          
          {/* Business Operations (legacy route for backwards compatibility) */}
          <Route path="business">
            <Route index element={<BusinessOverview />} />
            <Route path="webinars" element={<WebinarManagement />} />
          </Route>
        </Route>

        {/* 404 - Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LanguageProvider>
  )
}

export default App