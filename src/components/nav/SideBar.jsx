import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  FaHome, 
  FaChartBar, 
  FaUsers, 
  FaCog, 
  FaEnvelope,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaUserCircle,
  FaShoppingCart
} from 'react-icons/fa'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/dashboard', icon: <FaHome size={18} />, label: 'Dashboard' },
    { path: '/dashboard/orders', icon: <FaShoppingCart size={18} />, label: 'Orders' },
    { path: '/dashboard/analytics', icon: <FaChartBar size={18} />, label: 'Analytics' },
    { path: '/dashboard/users', icon: <FaUsers size={18} />, label: 'Users' },
    { path: '/dashboard/messages', icon: <FaEnvelope size={18} />, label: 'Messages' },
    
  ]

  const sampleMessages = [
    { id: 1, sender: 'Jehan Perera', preview: 'Meeting scheduled for tomorrow...', time: '10:30 AM' },
    { id: 2, sender: 'Sarah Smith', preview: 'Project update available', time: 'Yesterday' },
    { id: 3, sender: 'Seldel Patel', preview: 'New feature request', time: '2 days ago' },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-indigo-600 text-white shadow-lg"
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen bg-white shadow-xl z-40
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-20'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-6 border-b">
          {isOpen && (
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? <FaChevronLeft size={16} /> : <FaChevronRight size={16} />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center p-3 rounded-lg transition-all duration-200
                    ${isOpen ? 'justify-start' : 'justify-center'}
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center">
                    {item.icon}
                    {isOpen && (
                      <span className="ml-3 font-medium">{item.label}</span>
                    )}
                  </div>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sample Messages Section */}
        {isOpen && (
          <div className="mt-8 px-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Recent Messages
              </h3>
              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                {sampleMessages.length} new
              </span>
            </div>
            <div className="space-y-3">
              {sampleMessages.map((message) => (
                <div
                  key={message.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                        <FaUserCircle className="text-indigo-500" size={14} />
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        {message.sender}
                      </h4>
                    </div>
                    <span className="text-xs text-gray-500">{message.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 ml-8 truncate">
                    {message.preview}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
              <FaUserCircle className="text-indigo-600" size={18} />
            </div>
            {isOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">User Account</p>
                <p className="text-xs text-gray-500">admin@example.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar