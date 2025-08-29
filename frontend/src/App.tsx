import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from './hooks/redux'

// Layouts
import PublicLayout from './components/layouts/PublicLayout'
import AdminLayout from './components/layouts/AdminLayout'
import AuthLayout from './components/layouts/AuthLayout'

// Pages
import HomePage from './pages/public/HomePage'
import WebinarsPage from './pages/public/WebinarsPage'
import WhitepapersPage from './pages/public/WhitepapersPage'
import BookingPage from './pages/public/BookingPage'
import TemplateShowcasePage from './pages/public/TemplateShowcasePage'

// Auth pages
import LoginPage from './pages/auth/LoginPage'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import PagesManager from './pages/admin/content/PagesManager'
import WebinarsManager from './pages/admin/business/WebinarsManager'

// Error pages
import NotFound from './pages/NotFound'

// Components
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="webinars" element={<WebinarsPage />} />
          <Route path="webinars/:slug" element={<WebinarsPage />} />
          <Route path="whitepapers" element={<WhitepapersPage />} />
          <Route path="whitepapers/:slug" element={<WhitepapersPage />} />
          <Route path="book-consultation" element={<BookingPage />} />
          <Route path="templates" element={<TemplateShowcasePage />} />
          <Route path="pages/:slug" element={<HomePage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
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
          
          {/* Content Management */}
          <Route path="content">
            <Route path="pages" element={<PagesManager />} />
          </Route>
          
          {/* Business Operations */}
          <Route path="business">
            <Route path="webinars" element={<WebinarsManager />} />
          </Route>
        </Route>

        {/* 404 - Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App