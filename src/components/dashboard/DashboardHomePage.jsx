import React from 'react';
import { 
  FaShoppingCart, 
  FaMoneyBillWave, 
  FaUsers, 
  FaChartLine,
  FaBoxOpen,
  FaTag,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaCalendarAlt,
  FaBell
} from 'react-icons/fa';

function DashboardHomePage() {
  // Summary card data
  const summaryCards = [
    {
      id: 1,
      title: "Total Items",
      value: "1,247",
      change: "+12.5%",
      isPositive: true,
      icon: <FaBoxOpen className="text-3xl" />,
      color: "bg-blue-50 text-blue-600",
      description: "Active items in inventory"
    },
    {
      id: 2,
      title: "Monthly Revenue",
      value: "$45,289",
      change: "+8.2%",
      isPositive: true,
      icon: <FaMoneyBillWave className="text-3xl" />,
      color: "bg-green-50 text-green-600",
      description: "This month's sales"
    },
    {
      id: 3,
      title: "Low Stock Items",
      value: "24",
      change: "Needs attention",
      isPositive: false,
      icon: <FaExclamationTriangle className="text-3xl" />,
      color: "bg-yellow-50 text-yellow-600",
      description: "Items below minimum stock"
    },
    {
      id: 4,
      title: "Active Promotions",
      value: "8",
      change: "3 ending soon",
      isPositive: false,
      icon: <FaTag className="text-3xl" />,
      color: "bg-purple-50 text-purple-600",
      description: "Current running promotions"
    }
  ];

  // Notification data
  const notifications = [
    {
      id: 1,
      title: "Low Stock Alert",
      message: "Milk inventory is below minimum threshold (5 units remaining)",
      time: "10 minutes ago",
      type: "warning",
      icon: <FaExclamationTriangle className="text-yellow-500" />,
      category: "inventory",
      read: false
    },
    {
      id: 2,
      title: "New Order Received",
      message: "Order #ORD-2024-0012 has been placed by John Doe",
      time: "45 minutes ago",
      type: "success",
      icon: <FaShoppingCart className="text-green-500" />,
      category: "order",
      read: false
    },
    {
      id: 3,
      title: "Promotion Ending Soon",
      message: "Summer Sale promotion ends in 2 days",
      time: "2 hours ago",
      type: "info",
      icon: <FaTag className="text-blue-500" />,
      category: "promotion",
      read: true
    },
    {
      id: 4,
      title: "New User Registration",
      message: "Sarah Johnson has registered as a new customer",
      time: "3 hours ago",
      type: "info",
      icon: <FaUsers className="text-purple-500" />,
      category: "user",
      read: true
    },
    {
      id: 5,
      title: "High Selling Item",
      message: "Organic Apples sold 45 units today - Consider restocking",
      time: "5 hours ago",
      type: "success",
      icon: <FaChartLine className="text-green-500" />,
      category: "sales",
      read: true
    },
    {
      id: 6,
      title: "System Maintenance",
      message: "Scheduled maintenance on Sunday, 2:00 AM - 4:00 AM",
      time: "1 day ago",
      type: "info",
      icon: <FaInfoCircle className="text-blue-500" />,
      category: "system",
      read: true
    },
    {
      id: 7,
      title: "Order Delivered",
      message: "Order #ORD-2024-0010 has been successfully delivered",
      time: "1 day ago",
      type: "success",
      icon: <FaCheckCircle className="text-green-500" />,
      category: "order",
      read: true
    },
    {
      id: 8,
      title: "Payment Failed",
      message: "Payment for Order #ORD-2024-0009 failed. Retry initiated",
      time: "2 days ago",
      type: "warning",
      icon: <FaExclamationTriangle className="text-yellow-500" />,
      category: "payment",
      read: true
    }
  ];

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      action: "Item Added",
      details: "Organic Bananas added to inventory",
      user: "Admin User",
      time: "Just now",
      icon: <FaBoxOpen className="text-blue-500" />
    },
    {
      id: 2,
      action: "Price Updated",
      details: "Milk price updated from $3.49 to $3.29",
      user: "Inventory Manager",
      time: "30 minutes ago",
      icon: <FaMoneyBillWave className="text-green-500" />
    },
    {
      id: 3,
      action: "Stock Restocked",
      details: "Chicken Breast restocked (+50 units)",
      user: "Warehouse Staff",
      time: "1 hour ago",
      icon: <FaShoppingCart className="text-purple-500" />
    },
    {
      id: 4,
      action: "Promotion Created",
      details: "Weekly Sale promotion created",
      user: "Marketing Manager",
      time: "2 hours ago",
      icon: <FaTag className="text-yellow-500" />
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-full">
      <br />
      
      {/* Welcome Section */}
      <div className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden p-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store today.</p>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <FaCalendarAlt />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card) => (
          <div key={card.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${card.color}`}>
                {card.icon}
              </div>
              <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                card.isPositive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {card.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{card.value}</h3>
            <p className="text-gray-700 font-medium mb-2">{card.title}</p>
            <p className="text-sm text-gray-500">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notifications Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FaBell className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
                    <p className="text-gray-600">Recent alerts and updates</p>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {notification.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          notification.type === 'success' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {notification.category}
                        </span>
                        {!notification.read && (
                          <span className="text-xs text-blue-600 font-medium">NEW</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button className="w-full text-center text-blue-600 hover:text-blue-800 font-medium py-2">
                View All Notifications
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <FaChartLine className="text-green-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Recent Activities</h2>
                  <p className="text-gray-600">Latest store activities</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-800">{activity.action}</h4>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{activity.details}</p>
                      <p className="text-xs text-gray-500">By: {activity.user}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg">
                    <FaShoppingCart className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Quick Stats</h4>
                    <p className="text-sm text-gray-600">Today's performance</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-2xl font-bold text-gray-800">42</p>
                    <p className="text-xs text-gray-500">Orders Today</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-2xl font-bold text-gray-800">$1,245</p>
                    <p className="text-xs text-gray-500">Revenue Today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Top Selling Item</h3>
            <FaChartLine className="text-2xl" />
          </div>
          <p className="text-3xl font-bold mb-2">Organic Apples</p>
          <p className="text-blue-100">45 units sold today</p>
          <div className="mt-4 flex items-center text-blue-100 text-sm">
            <span className="mr-2">📈</span>
            <span>+18% from yesterday</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Customer Satisfaction</h3>
            <FaUsers className="text-2xl" />
          </div>
          <p className="text-3xl font-bold mb-2">96.4%</p>
          <p className="text-green-100">Based on 128 reviews</p>
          <div className="mt-4 flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-yellow-300 mr-1">★</span>
            ))}
            <span className="text-green-100 ml-2 text-sm">4.8/5 rating</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Inventory Status</h3>
            <FaBoxOpen className="text-2xl" />
          </div>
          <p className="text-3xl font-bold mb-2">94%</p>
          <p className="text-purple-100">Items in optimal stock</p>
          <div className="mt-4">
            <div className="w-full bg-purple-700 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: '94%' }}></div>
            </div>
            <div className="flex justify-between text-purple-100 text-xs mt-2">
              <span>6% low stock</span>
              <span>Optimal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHomePage;