import { Outlet } from 'react-router-dom'
import AdminSidebar from '../admin/AdminSidebar'
import AdminHeader from '../admin/AdminHeader'

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-white">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout