import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Confirm } from 'notiflix/build/notiflix-confirm-aio';
import orderService from '../../services/Order.service';
import OrderStatusModal from '../modals/OrderStatusModal';

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
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Load orders on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter, paymentFilter, dateRange, sortBy, sortOrder]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const result = await orderService.getAllOrders({ isActive: true });
      
      if (result.success) {
        setOrders(result.orders);
        setFilteredOrders(result.orders);
      } else {
        console.error('Error loading orders:', result.error);
        createMockData();
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      createMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const createMockData = () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const mockOrders = [
      {
        docId: 'ORD_1',
        id: 'ORD_20240215_001',
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '0771234567'
        },
        items: [
          {
            name: 'Organic Apples',
            quantity: 2,
            price: 2.99,
            discountedPrice: 2.99,
            totalPrice: 5.98,
            image: 'https://via.placeholder.com/50',
            category: 'Fresh Produce'
          },
          {
            name: 'Whole Milk',
            quantity: 1,
            price: 3.49,
            discountedPrice: 3.49,
            totalPrice: 3.49,
            image: 'https://via.placeholder.com/50',
            category: 'Dairy & Eggs'
          }
        ],
        total: 9.47,
        subtotal: 9.47,
        tax: 0,
        deliveryFee: 0,
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        paymentMethod: 'card',
        createdAt: threeDaysAgo,
        shippingInfo: {
          address: '123 Main St',
          city: 'Colombo',
          phone: '0771234567'
        }
      },
      {
        docId: 'ORD_2',
        id: 'ORD_20240216_002',
        customer: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '0777654321'
        },
        items: [
          {
            name: 'Chicken Breast',
            quantity: 1,
            price: 8.99,
            discountedPrice: 8.99,
            totalPrice: 8.99,
            image: 'https://via.placeholder.com/50',
            category: 'Meat & Seafood'
          },
          {
            name: 'Organic Rice',
            quantity: 2,
            price: 5.99,
            discountedPrice: 5.99,
            totalPrice: 11.98,
            image: 'https://via.placeholder.com/50',
            category: 'Pantry Staples'
          },
          {
            name: 'Olive Oil',
            quantity: 1,
            price: 12.99,
            discountedPrice: 12.99,
            totalPrice: 12.99,
            image: 'https://via.placeholder.com/50',
            category: 'Cooking Essentials'
          }
        ],
        total: 33.96,
        subtotal: 33.96,
        tax: 0,
        deliveryFee: 0,
        paymentStatus: 'paid',
        orderStatus: 'processing',
        paymentMethod: 'cash',
        createdAt: yesterday,
        shippingInfo: {
          address: '456 Park Ave',
          city: 'Kandy',
          phone: '0777654321'
        }
      },
      {
        docId: 'ORD_3',
        id: 'ORD_20240217_003',
        customer: {
          name: 'Bob Wilson',
          email: 'bob@example.com',
          phone: '0789876543'
        },
        items: [
          {
            name: 'Fresh Bread',
            quantity: 2,
            price: 1.99,
            discountedPrice: 1.99,
            totalPrice: 3.98,
            image: 'https://via.placeholder.com/50',
            category: 'Bakery'
          },
          {
            name: 'Eggs (Dozen)',
            quantity: 1,
            price: 4.99,
            discountedPrice: 4.49,
            totalPrice: 4.49,
            image: 'https://via.placeholder.com/50',
            category: 'Dairy & Eggs'
          }
        ],
        total: 8.47,
        subtotal: 8.97,
        discountAmount: 0.50,
        promoCode: 'FRESH10',
        paymentStatus: 'pending',
        orderStatus: 'confirmed',
        paymentMethod: 'card',
        createdAt: now,
        shippingInfo: {
          address: '789 Beach Rd',
          city: 'Galle',
          phone: '0789876543'
        }
      }
    ];
    
    setOrders(mockOrders);
    setFilteredOrders(mockOrders);
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
        order.items?.some(item => item.name.toLowerCase().includes(term))
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
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };

  const handleStatusChange = async (orderId, newStatus, note) => {
    try {
      const result = await orderService.updateOrderStatus(orderId, newStatus, note);
      
      if (result.success) {
        Notify.success(`Order status updated to ${newStatus}`, {
          position: 'right-top',
          timeout: 3000
        });
        loadOrders();
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

  const handleDeleteOrder = (order) => {
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
            loadOrders();
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

  const getStatusBadge = (status) => {
    const statusColors = {
      'processing': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-indigo-100 text-indigo-800',
      'preparing': 'bg-purple-100 text-purple-800',
      'shipped': 'bg-cyan-100 text-cyan-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800'
    };

    const statusIcons = {
      'processing': '⏳',
      'confirmed': '✓',
      'preparing': '👨‍🍳',
      'shipped': '🚚',
      'delivered': '✅',
      'cancelled': '❌',
      'refunded': '💰'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        <span>{statusIcons[status] || '📦'}</span>
        <span className="capitalize">{status}</span>
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
              <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
              <p className="text-gray-600 mt-2">Track and manage customer orders</p>
            </div>
            
            <div className="flex items-center gap-4">
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
              title="Processing"
              value={orders.filter(o => o.orderStatus === 'processing').length}
              icon="⏳"
              color="indigo"
            />
            <StatCard
              title="Shipped"
              value={orders.filter(o => o.orderStatus === 'shipped').length}
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
              title="Revenue"
              value={`Rs. ${orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)}`}
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
                <option value="processing">Processing</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="shipped">Shipped</option>
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
                key={order.docId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div
                  onClick={() => toggleOrderExpand(order.docId)}
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
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{order.id}</h3>
                          {getStatusBadge(order.orderStatus)}
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
                          animate={{ rotate: expandedOrderId === order.docId ? 180 : 0 }}
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
                  {expandedOrderId === order.docId && (
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

                            {/* Actions */}
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(order);
                                }}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                              >
                                Update Status
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteOrder(order);
                                }}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                              >
                                Delete
                              </button>
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