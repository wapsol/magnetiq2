import { Outlet } from 'react-router-dom'
import Header from '../common/Header'
import Footer from '../common/Footer'

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PublicLayout