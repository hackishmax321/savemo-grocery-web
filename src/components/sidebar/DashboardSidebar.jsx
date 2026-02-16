import React, { useState } from 'react';
import { 
  FaBell, 
  FaUser, 
  FaBox, 
  FaShoppingCart, 
  FaTag, 
  FaCog,
  FaHome,
  FaChevronRight,
  FaSearch,
  FaFilter,
  FaCalendar,
  FaChartBar,
  FaChartLine,
  FaUsers,
  FaDownload,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import { 
  MdNotifications, 
  MdPerson, 
  MdInventory, 
  MdLocalOffer,
  MdSettings,
  MdChevronRight,
  MdSearch,
  MdFilterList,
  MdDateRange,
  MdTrendingUp,
  MdFileDownload
} from 'react-icons/md';
import { Link } from 'react-router-dom';

function DashboardSidebar() {
  const [activeTab, setActiveTab] = useState('NOTIFICATION');
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Order Received', time: '10 min ago', read: false },
    { id: 2, title: 'Inventory Low Alert', time: '1 hour ago', read: true },
    { id: 3, title: 'Payment Received', time: '2 hours ago', read: true },
    { id: 4, title: 'New User Registration', time: '1 day ago', read: true },
  ]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const menuItems = [
    { id: 'NOTIFICATION', icon: FaBell, label: 'NOTIFICATION', badge: notifications.filter(n => !n.read).length, path: '/dashboard' },
    { id: 'PERSONAL_DETAILS', icon: FaUser, label: 'PERSONAL DETAILS', path: '/dashboard/profile' },
    { id: 'ITEMS_MANAGEMENT', icon: FaBox, label: 'ITEMS MANAGEMENT', path: '/dashboard/items-management' },
    { id: 'ORDERS_MANAGEMENT', icon: FaShoppingCart, label: 'ORDERS MANAGEMENT', path: '/dashboard/orders-management' },
    { id: 'PROMOTIONS_DISCOUNTS', icon: FaTag, label: 'PROMOTIONS', path: '/dashboard/promotions-management' },
    { id: 'SETTINGS', icon: FaCog, label: 'SETTINGS', path: '/dashboard/profile' },
  ];

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <div className="flex fixed h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-70 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FaHome size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Dashboard</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${activeTab === item.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'}`}
              to={item.path}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={18} />
                <span className="text-sm">{item.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
                <FaChevronRight size={16} className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
              </div>
            </Link>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <FaUser size={18} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Admin User</h3>
              <p className="text-xs text-gray-400">admin@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSidebar;