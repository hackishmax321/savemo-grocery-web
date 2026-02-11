import React, { useEffect, useState } from 'react';
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
  FaBell,
  FaEnvelope, // ADDED
  FaReply, // ADDED
  FaCheck, // ADDED
  FaArchive // ADDED
} from 'react-icons/fa';
import contactService from '../../services/Contact.service';

function DashboardHomePage() {
  // variables
  const [contactMessages, setContactMessages] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [contactError, setContactError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [stats, setStats] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    todayMessages: 0
  });

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
      value: "Rs.45,289",
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
  const notifications = [];

  // Recent activities
  const recentActivities = [];

  const unreadCount = contactMessages.length;

  

  useEffect(() => {
    loadContactMessages();
    loadContactStats();
  }, []);

  const loadContactMessages = async (loadMore = false) => {
    setIsLoadingContacts(true);
    try {
      const result = await contactService.getAllMessages(
        { isRead: false }, // Show unread first
        10, // Limit per page
        loadMore ? lastDoc : null
      );
      
      if (result.success) {
        if (loadMore) {
          setContactMessages(prev => [...prev, ...result.messages]);
        } else {
          setContactMessages(result.messages);
        }
        setHasMoreMessages(result.hasMore);
        setLastDoc(result.lastDoc);
      } else {
        setContactError('Failed to load contact messages');
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      setContactError('Error loading messages');
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const loadContactStats = async () => {
    try {
      const result = await contactService.getMessageStats();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error loading contact stats:', error);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      const result = await contactService.markAsRead(messageId, 'admin');
      if (result.success) {
        // Remove from list or update UI
        setContactMessages(prev => 
          prev.filter(msg => msg.id !== messageId)
        );
        loadContactStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleOpenReply = (message) => {
    setSelectedMessage(message);
    setReplyModalOpen(true);
    setReplyText('');
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    setIsReplying(true);
    try {
      const result = await contactService.replyToMessage(selectedMessage.id, {
        replyMessage: replyText,
        repliedBy: 'Admin User', // Get from auth context
        email: selectedMessage.email,
        name: selectedMessage.name
      });
      
      if (result.success) {
        setReplyModalOpen(false);
        setReplyText('');
        // Remove from list after replying
        setContactMessages(prev => 
          prev.filter(msg => msg.id !== selectedMessage.id)
        );
        loadContactStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsReplying(false);
    }
  };

  const handleArchiveMessage = async (messageId) => {
    try {
      const result = await contactService.archiveMessage(messageId);
      if (result.success) {
        setContactMessages(prev => 
          prev.filter(msg => msg.id !== messageId)
        );
        loadContactStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error archiving message:', error);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

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
                    <FaEnvelope className="text-blue-600 text-xl" /> {/* UPDATED: FaBell to FaEnvelope */}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Contact Messages</h2>
                    <p className="text-gray-600">Customer inquiries and feedback</p>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoadingContacts && (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading messages...</p>
              </div>
            )}

            {/* Error State */}
            {contactError && !isLoadingContacts && (
              <div className="p-8 text-center text-red-600">
                <p>{contactError}</p>
                <button 
                  onClick={() => loadContactMessages()}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Messages List */}
            {!isLoadingContacts && !contactError && (
              <>
                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                  {contactMessages.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <FaEnvelope className="text-4xl mx-auto mb-2 text-gray-300" />
                      <p>No unread messages</p>
                      <p className="text-sm mt-1">All caught up!</p>
                    </div>
                  ) : (
                    contactMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className="p-4 hover:bg-gray-50 transition-colors duration-200 bg-blue-50"
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            <FaEnvelope className="text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <h4 className="font-semibold text-gray-800">
                                  {message.name || 'Anonymous'}
                                </h4>
                                <p className="text-xs text-gray-500">{message.email}</p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatMessageTime(message.createdAt)}
                              </span>
                            </div>
                            <div className="mb-2">
                              <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {message.subject || 'General Inquiry'}
                              </span>
                              {message.phone && (
                                <span className="text-xs text-gray-500 ml-2">
                                  📞 {message.phone}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-3">
                              {message.message}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleMarkAsRead(message.id)}
                                className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors flex items-center gap-1"
                                title="Mark as read"
                              >
                                <FaCheck className="text-xs" />
                                Mark Read
                              </button>
                              <button
                                onClick={() => handleOpenReply(message)}
                                className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors flex items-center gap-1"
                                title="Reply"
                              >
                                <FaReply className="text-xs" />
                                Reply
                              </button>
                              <button
                                onClick={() => handleArchiveMessage(message.id)}
                                className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1"
                                title="Archive"
                              >
                                <FaArchive className="text-xs" />
                                Archive
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Load More Button */}
                {hasMoreMessages && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={() => loadContactMessages(true)}
                      className="w-full text-center text-blue-600 hover:text-blue-800 font-medium py-2"
                    >
                      Load More Messages
                    </button>
                  </div>
                )}
              </>
            )}
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