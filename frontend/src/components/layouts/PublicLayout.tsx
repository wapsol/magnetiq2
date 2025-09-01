import { Outlet } from 'react-router-dom'
import Header from '../common/HeaderNew'
import Footer from '../common/FooterNew'

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