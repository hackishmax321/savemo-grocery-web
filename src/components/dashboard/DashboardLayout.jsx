import { Outlet } from 'react-router-dom'
import DashboardSidebar from '../sidebar/DashboardSidebar'

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen min-w-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 p-6 md:p-8 lg:p-10 mt-10 ml-0 md:ml-64 transition-all duration-300">
        <Outlet />
      </div>
    </div>
  )
}

export default DashboardLayout