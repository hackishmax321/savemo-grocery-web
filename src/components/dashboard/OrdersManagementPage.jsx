import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Confirm } from 'notiflix/build/notiflix-confirm-aio';
import orderService from '../../services/Order.service';
import deliveryService from '../../services/Delivery.service';
import OrderStatusModal from '../modals/OrderStatusModal';
import DeliveryDetailsModal from '../modals/DeliveryDetailsModal';

const OrdersManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // User authentication and role state
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('guest');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Load orders when user authentication is determined
  useEffect(() => {
    if (isLoggedIn) {
      loadOrders();
    }
  }, [isLoggedIn, userRole]);

  // Apply filters when dependencies change
  useEffect(() => {
    if (orders.length > 0) {
      applyFilters();
    }
  }, [orders, searchTerm, statusFilter, paymentFilter, dateRange, sortBy, sortOrder]);

  const checkAuthStatus = () => {
    const userStr = sessionStorage.getItem('currentUser');
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    
    if (userStr && isAuthenticated) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setIsLoggedIn(true);
        setUserRole(user.role || 'customer');
      } catch (error) {
        console.error('Error parsing user data:', error);
        clearAuth();
      }
    } else {
      clearAuth();
    }
  };

  const clearAuth = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUserRole('guest');
  };

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      let result;
      
      // Different loading strategies based on user role
      if (userRole === 'customers') {
        // Customers only see their own orders
        if (currentUser?.uid || currentUser?.id) {
          const customerId = currentUser.uid || currentUser.id;
          const customerOrders = await orderService.getOrdersByCustomer(customerId);
          setOrders(customerOrders);
          setFilteredOrders(customerOrders);
        } else {
          setOrders([]);
          setFilteredOrders([]);
        }
      } else {
        // Admins/staff see all orders
        result = await orderService.getAllOrders({ isActive: true });
        
        if (result.success) {
          setOrders(result.orders);
          setFilteredOrders(result.orders);
        } else {
          console.error('Error loading orders:', result.error);
          Notify.failure('Failed to load orders', { position: 'right-top' });
        }
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      Notify.failure('Error loading orders', { position: 'right-top' });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id?.toLowerCase().includes(term) ||
        order.customer?.name?.toLowerCase().includes(term) ||
        order.customer?.email?.toLowerCase().includes(term) ||
        order.customer?.phone?.includes(term) ||
        order.items?.some(item => item.name?.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.orderStatus === statusFilter);
    }

    // Apply payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === paymentFilter);
    }

    // Apply date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(order => new Date(order.createdAt) >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      filtered = filtered.filter(order => new Date(order.createdAt) <= endDate);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'orderId':
          aValue = a.id || '';
          bValue = b.id || '';
          break;
        case 'customerName':
          aValue = a.customer?.name || '';
          bValue = b.customer?.name || '';
          break;
        case 'total':
          aValue = a.total || 0;
          bValue = b.total || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime() || 0;
          bValue = new Date(b.createdAt).getTime() || 0;
          break;
        default:
          aValue = new Date(a.createdAt).getTime() || 0;
          bValue = new Date(b.createdAt).getTime() || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleStatusUpdate = (order) => {
    // Only non-customers can update status
    if (userRole === 'customer') {
      Notify.info('You do not have permission to update order status', {
        position: 'right-top'
      });
      return;
    }
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };

  const handleDeliveryDetails = (order) => {
    setSelectedOrder(order);
    setIsDeliveryModalOpen(true);
  };

  const handleStatusChange = async (orderId, newStatus, note) => {
    try {
      const result = await orderService.updateOrderStatus(orderId, newStatus, note);
      
      if (result.success) {
        Notify.success(`Order status updated to ${newStatus}`, {
          position: 'right-top',
          timeout: 3000
        });
        await loadOrders();
        setIsStatusModalOpen(false);
        setSelectedOrder(null);
      } else {
        Notify.failure(result.error || 'Failed to update order status', {
          position: 'right-top'
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Notify.failure('An error occurred', { position: 'right-top' });
    }
  };

  // UPDATED: Handle delivery update with new service methods
  const handleDeliveryUpdate = async (deliveryId, updates) => {
    try {
      // Only allow customers to update received status
      if (userRole === 'customer' && updates.status !== 'delivered') {
        Notify.info('You can only mark orders as received', {
          position: 'right-top'
        });
        return;
      }

      let result;
      
      // UPDATED: Use appropriate method based on update type
      if (updates.status === 'delivered' && updates.proofData) {
        // Handle delivery with proof
        result = await deliveryService.markAsDelivered(deliveryId, updates.proofData);
      } else {
        // Regular status update
        result = await deliveryService.updateDeliveryStatus(
          deliveryId,
          updates.status,
          updates.location || null,
          updates.note || ''
        );
      }
      
      if (result.success) {
        Notify.success('Delivery updated successfully', {
          position: 'right-top'
        });
        await loadOrders(); // Reload orders to get updated delivery info
      } else {
        Notify.failure(result.error || 'Failed to update delivery', {
          position: 'right-top'
        });
      }
    } catch (error) {
      console.error('Error updating delivery:', error);
      Notify.failure('An error occurred', { position: 'right-top' });
    }
  };

  const handleDeleteOrder = (order) => {
    // Only admins can delete orders
    if (userRole !== 'admin') {
      Notify.info('Only administrators can delete orders', {
        position: 'right-top'
      });
      return;
    }

    Confirm.show(
      'Delete Order',
      `Are you sure you want to delete order ${order.id}?`,
      'Yes',
      'No',
      async () => {
        try {
          const result = await orderService.deleteOrder(order.docId);
          
          if (result.success) {
            Notify.success('Order deleted successfully', {
              position: 'right-top'
            });
            await loadOrders();
          } else {
            Notify.failure(result.error || 'Failed to delete order', {
              position: 'right-top'
            });
          }
        } catch (error) {
          console.error('Error deleting order:', error);
          Notify.failure('An error occurred', { position: 'right-top' });
        }
      },
      () => {
        Notify.info('Delete cancelled', { position: 'right-top' });
      }
    );
  };

  // UPDATED: Handle mark as received with proof
  const handleMarkAsReceived = async (order) => {
    Confirm.show(
      'Mark as Received',
      'Have you received all items in this order?',
      'Yes',
      'No',
      async () => {
        try {
          // First update order status
          await orderService.updateOrderStatus(order.docId, 'delivered', 'Customer confirmed receipt');
          
          // Then update delivery if exists
          const delivery = await deliveryService.getDeliveryByOrder(order.id);
          if (delivery) {
            await deliveryService.markAsDelivered(
              delivery.docId || delivery.id,
              {
                notes: 'Customer confirmed receipt',
                deliveredBy: currentUser?.name || 'Customer'
              }
            );
          }
          
          Notify.success('Thank you for confirming receipt!', {
            position: 'right-top'
          });
          await loadOrders();
        } catch (error) {
          console.error('Error marking as received:', error);
          Notify.failure('Failed to update status', { position: 'right-top' });
        }
      }
    );
  };

  // UPDATED: Get delivery status for an order
  const getDeliveryStatus = (order) => {
    // Check if order has delivery info in order object
    if (order.deliveryDetails?.status) {
      return order.deliveryDetails.status;
    }
    return null;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'processing': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-indigo-100 text-indigo-800',
      'preparing': 'bg-purple-100 text-purple-800',
      'shipped': 'bg-cyan-100 text-cyan-800',
      'out_for_delivery': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800',
      'pending_payment': 'bg-yellow-100 text-yellow-800',
      'payment_failed': 'bg-red-100 text-red-800'
    };

    const statusIcons = {
      'processing': '⏳',
      'confirmed': '✓',
      'preparing': '👨‍🍳',
      'shipped': '🚚',
      'out_for_delivery': '🚛',
      'delivered': '✅',
      'cancelled': '❌',
      'refunded': '💰',
      'pending_payment': '💳',
      'payment_failed': '❌'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        <span>{statusIcons[status] || '📦'}</span>
        <span className="capitalize">{status?.replace(/_/g, ' ')}</span>
      </span>
    );
  };

  // UPDATED: Get delivery status badge
  const getDeliveryStatusBadge = (status) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-800',
      'assigned': 'bg-indigo-100 text-indigo-800',
      'picked_up': 'bg-purple-100 text-purple-800',
      'in_transit': 'bg-cyan-100 text-cyan-800',
      'out_for_delivery': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'returned': 'bg-yellow-100 text-yellow-800'
    };

    const icons = {
      'pending': '⏳',
      'assigned': '👤',
      'picked_up': '📦',
      'in_transit': '🚚',
      'out_for_delivery': '🚛',
      'delivered': '✅',
      'failed': '❌',
      'returned': '↩️'
    };

    if (!status) return null;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${colors[status] || 'bg-gray-100'}`}>
        <span>{icons[status] || '📦'}</span>
        <span className="capitalize">{status.replace(/_/g, ' ')}</span>
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    const colors = {
      'paid': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return `Rs. ${amount?.toFixed(2) || '0.00'}`;
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view orders</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className='bg-white rounded-xl shadow-lg overflow-hidden p-3'>
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {userRole === 'customer' ? 'My Orders' : 'Orders Management'}
              </h1>
              <p className="text-gray-600 mt-2">
                {userRole === 'customer' 
                  ? 'Track and manage your orders' 
                  : 'Track and manage customer orders'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {userRole !== 'customer' && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                  Admin View
                </span>
              )}
              <button
                onClick={() => loadOrders()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            <StatCard
              title="Total Orders"
              value={orders.length}
              icon="📦"
              color="blue"
            />
            <StatCard
              title={userRole === 'customer' ? 'In Progress' : 'Processing'}
              value={orders.filter(o => 
                userRole === 'customer' 
                  ? ['processing', 'confirmed', 'preparing', 'shipped'].includes(o.orderStatus)
                  : o.orderStatus === 'processing'
              ).length}
              icon="⏳"
              color="indigo"
            />
            <StatCard
              title="Out for Delivery"
              value={orders.filter(o => o.orderStatus === 'out_for_delivery').length}
              icon="🚚"
              color="cyan"
            />
            <StatCard
              title="Delivered"
              value={orders.filter(o => o.orderStatus === 'delivered').length}
              icon="✅"
              color="green"
            />
            <StatCard
              title={userRole === 'customer' ? 'Total Spent' : 'Revenue'}
              value={formatCurrency(orders.reduce((sum, o) => sum + (o.total || 0), 0))}
              icon="💰"
              color="yellow"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders, customers, items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-black/80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="processing">Processing</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Start Date"
              />
            </div>
            <div>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="End Date"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="createdAt">Sort by Date</option>
                <option value="orderId">Sort by Order ID</option>
                <option value="customerName">Sort by Customer</option>
                <option value="total">Sort by Total</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <motion.div
                key={order.docId || order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div
                  onClick={() => toggleOrderExpand(order.docId || order.id)}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold">#</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{order.id}</h3>
                          {getStatusBadge(order.orderStatus)}
                          {/* UPDATED: Show delivery status badge if available */}
                          {getDeliveryStatus(order) && (
                            <span className="ml-1">
                              {getDeliveryStatusBadge(getDeliveryStatus(order))}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.customer?.name} • {order.customer?.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{formatCurrency(order.total)}</div>
                        <div className="text-xs text-gray-500">{formatDateTime(order.createdAt)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPaymentBadge(order.paymentStatus)}
                        <motion.div
                          animate={{ rotate: expandedOrderId === (order.docId || order.id) ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Order Details */}
                <AnimatePresence>
                  {expandedOrderId === (order.docId || order.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 bg-gray-50"
                    >
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Order Items */}
                          <div className="md:col-span-2">
                            <h4 className="font-semibold text-gray-700 mb-3">Order Items</h4>
                            <div className="space-y-2">
                              {order.items?.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100">
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.src = 'https://via.placeholder.com/50';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        📦
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between">
                                      <div>
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.category}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-gray-900">{formatCurrency(item.totalPrice)}</p>
                                        <p className="text-xs text-gray-500">
                                          {item.quantity} x {formatCurrency(item.discountedPrice || item.price)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Details */}
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-3">Order Details</h4>
                            <div className="bg-white rounded-lg p-3 space-y-2 border border-gray-100">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                              </div>
                              {order.discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                  <span>Discount:</span>
                                  <span>-{formatCurrency(order.discountAmount)}</span>
                                </div>
                              )}
                              {order.promoCode && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Promo Code:</span>
                                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                                    {order.promoCode}
                                  </span>
                                </div>
                              )}
                              {order.deliveryFee > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Delivery:</span>
                                  <span>{formatCurrency(order.deliveryFee)}</span>
                                </div>
                              )}
                              {order.tax > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Tax:</span>
                                  <span>{formatCurrency(order.tax)}</span>
                                </div>
                              )}
                              <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between font-bold">
                                  <span>Total:</span>
                                  <span className="text-blue-600">{formatCurrency(order.total)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Shipping Info */}
                            <div className="mt-3">
                              <h4 className="font-semibold text-gray-700 mb-2">Shipping Info</h4>
                              <div className="bg-white rounded-lg p-3 border border-gray-100 text-sm">
                                <p className="text-gray-600">{order.shippingInfo?.address}</p>
                                <p className="text-gray-600">{order.shippingInfo?.city}</p>
                                <p className="text-gray-600 mt-1">Phone: {order.shippingInfo?.phone}</p>
                              </div>
                            </div>

                            {/* Payment Info */}
                            <div className="mt-3">
                              <h4 className="font-semibold text-gray-700 mb-2">Payment</h4>
                              <div className="bg-white rounded-lg p-3 border border-gray-100 text-sm">
                                <p className="text-gray-600">Method: {order.paymentMethod}</p>
                                <p className="text-gray-600">
                                  Status: {getPaymentBadge(order.paymentStatus)}
                                </p>
                              </div>
                            </div>

                            {/* UPDATED: Actions - Role based with better logic */}
                            <div className="mt-4 flex flex-col gap-2">
                              {userRole === 'customer' && order.orderStatus === 'out_for_delivery' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsReceived(order);
                                  }}
                                  className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                                >
                                  ✓ Mark as Received
                                </button>
                              )}
                              
                              {userRole !== 'customer' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(order);
                                  }}
                                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                                >
                                  Update Status
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeliveryDetails(order);
                                }}
                                className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
                              >
                                📍 {getDeliveryStatus(order) ? 'View Delivery' : 'Create Delivery'}
                              </button>
                              
                              {userRole === 'admin' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteOrder(order);
                                  }}
                                  className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                                >
                                  Delete Order
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

        {/* Status Update Modal */}
        {isStatusModalOpen && selectedOrder && (
          <OrderStatusModal
            order={selectedOrder}
            onClose={() => {
              setIsStatusModalOpen(false);
              setSelectedOrder(null);
            }}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* Delivery Details Modal */}
        {isDeliveryModalOpen && selectedOrder && (
          <DeliveryDetailsModal
            order={selectedOrder}
            userRole={userRole}
            currentUser={currentUser}
            onClose={() => {
              setIsDeliveryModalOpen(false);
              setSelectedOrder(null);
            }}
            onDeliveryUpdate={handleDeliveryUpdate}
          />
        )}
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color] || 'bg-gray-50 text-gray-600'}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default OrdersManagementPage;