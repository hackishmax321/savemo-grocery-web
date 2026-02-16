import React, { useState, useEffect } from 'react';
import promotionService from '../../services/Promotion.service';
import PromotionsAddModal from '../modals/PromotionAddModal';

const PromotionsManagementPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    promoCode: '',
    startDate: '',
    endDate: '',
    discountPercentage: '',
    discountType: 'percentage',
    minimumPurchase: '',
    maximumDiscount: '',
    usageLimit: '',
    customerEligibility: 'all',
    isActive: true,
    bannerImage: '',
    termsAndConditions: ''
  });

  // Load promotions on component mount
  useEffect(() => {
    loadPromotions();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [promotions, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

  const loadPromotions = async () => {
    setIsLoading(true);
    try {
      const result = await promotionService.getAllPromotions();
      
      if (result.success) {
        setPromotions(result.promotions);
        setFilteredPromotions(result.promotions);
      } else {
        console.error('Error loading promotions:', result.error);
        // Create mock data for demonstration
        createMockData();
      }
    } catch (error) {
      console.error('Error loading promotions:', error);
      createMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const createMockData = () => {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const mockPromotions = [
      {
        docId: '1',
        name: 'Summer Sale 2024',
        description: 'Get amazing discounts on summer essentials',
        promoCode: 'SUMMER2024',
        startDate: now,
        endDate: nextMonth,
        discountPercentage: 20,
        discountType: 'percentage',
        applicableItems: 'all',
        minimumPurchase: 1000,
        maximumDiscount: 5000,
        usageLimit: 1000,
        usageCount: 245,
        customerEligibility: 'all',
        isActive: true,
        status: 'active',
        createdAt: lastWeek,
        bannerImage: 'https://example.com/summer.jpg'
      },
      {
        docId: '2',
        name: 'New Customer Welcome',
        description: 'Special discount for new customers',
        promoCode: 'WELCOME10',
        startDate: lastWeek,
        endDate: nextMonth,
        discountPercentage: 10,
        discountType: 'percentage',
        applicableItems: 'all',
        minimumPurchase: 500,
        usageLimit: 500,
        usageCount: 89,
        customerEligibility: 'new',
        isActive: true,
        status: 'active',
        createdAt: lastWeek
      },
      {
        docId: '3',
        name: 'Weekend Flash Sale',
        description: 'Limited time weekend offers',
        promoCode: 'FLASH50',
        startDate: now,
        endDate: nextWeek,
        discountPercentage: 15,
        discountType: 'percentage',
        applicableItems: ['Electronics', 'Fashion'],
        minimumPurchase: 2000,
        maximumDiscount: 3000,
        usageLimit: 200,
        usageCount: 156,
        customerEligibility: 'all',
        isActive: true,
        status: 'active',
        createdAt: now
      },
      {
        docId: '4',
        name: 'Clearance Sale',
        description: 'Clearance on last season items',
        promoCode: 'CLEAR50',
        startDate: lastWeek,
        endDate: lastWeek,
        discountPercentage: 50,
        discountType: 'percentage',
        applicableItems: 'all',
        minimumPurchase: 0,
        usageLimit: null,
        usageCount: 500,
        customerEligibility: 'all',
        isActive: true,
        status: 'expired',
        createdAt: lastWeek
      },
      {
        docId: '5',
        name: 'Holiday Special',
        description: 'Special holiday discounts',
        promoCode: 'HOLIDAY25',
        startDate: nextMonth,
        endDate: nextMonth,
        discountPercentage: 25,
        discountType: 'percentage',
        applicableItems: 'all',
        minimumPurchase: 1500,
        maximumDiscount: 4000,
        usageLimit: 300,
        usageCount: 0,
        customerEligibility: 'all',
        isActive: true,
        status: 'upcoming',
        createdAt: now
      }
    ];
    
    setPromotions(mockPromotions);
    setFilteredPromotions(mockPromotions);
  };

  const applyFilters = () => {
    let filtered = [...promotions];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(promo =>
        promo.name.toLowerCase().includes(term) ||
        promo.description?.toLowerCase().includes(term) ||
        promo.promoCode?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(promo => promo.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(promo => promo.discountType === typeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'discountPercentage':
          aValue = a.discountPercentage;
          bValue = b.discountPercentage;
          break;
        case 'usageCount':
          aValue = a.usageCount || 0;
          bValue = b.usageCount || 0;
          break;
        case 'startDate':
          aValue = a.startDate?.getTime() || 0;
          bValue = b.startDate?.getTime() || 0;
          break;
        case 'endDate':
          aValue = a.endDate?.getTime() || 0;
          bValue = b.endDate?.getTime() || 0;
          break;
        default:
          aValue = a.startDate?.getTime() || 0;
          bValue = b.startDate?.getTime() || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPromotions(filtered);
  };

  const handleOpenModal = (promotion = null) => {
    if (promotion) {
      // Edit mode
      setIsEditMode(true);
      setSelectedPromotion(promotion);
      
      // Format dates for datetime-local input
      const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().slice(0, 16);
      };

      setFormData({
        name: promotion.name || '',
        description: promotion.description || '',
        promoCode: promotion.promoCode || '',
        startDate: formatDateForInput(promotion.startDate),
        endDate: formatDateForInput(promotion.endDate),
        discountPercentage: promotion.discountPercentage?.toString() || '',
        discountType: promotion.discountType || 'percentage',
        minimumPurchase: promotion.minimumPurchase?.toString() || '',
        maximumDiscount: promotion.maximumDiscount?.toString() || '',
        usageLimit: promotion.usageLimit?.toString() || '',
        customerEligibility: promotion.customerEligibility || 'all',
        isActive: promotion.isActive !== undefined ? promotion.isActive : true,
        bannerImage: promotion.bannerImage || '',
        termsAndConditions: promotion.termsAndConditions || ''
      });
    } else {
      // Add mode
      setIsEditMode(false);
      setSelectedPromotion(null);
      
      // Set default dates (today to next week)
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const formatDateForInput = (date) => {
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        name: '',
        description: '',
        promoCode: '',
        startDate: formatDateForInput(today),
        endDate: formatDateForInput(nextWeek),
        discountPercentage: '',
        discountType: 'percentage',
        minimumPurchase: '',
        maximumDiscount: '',
        usageLimit: '',
        customerEligibility: 'all',
        isActive: true,
        bannerImage: '',
        termsAndConditions: ''
      });
    }
    setErrors({});
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPromotion(null);
    setFormData({
      name: '',
      description: '',
      promoCode: '',
      startDate: '',
      endDate: '',
      discountPercentage: '',
      discountType: 'percentage',
      minimumPurchase: '',
      maximumDiscount: '',
      usageLimit: '',
      customerEligibility: 'all',
      isActive: true,
      bannerImage: '',
      termsAndConditions: ''
    });
    setErrors({});
  };

  const handleDelete = async (promotionId) => {
    try {
      const result = await promotionService.deletePromotion(promotionId);
      
      if (result.success) {
        setSuccessMessage('Promotion deleted successfully!');
        loadPromotions();
        setDeleteConfirm(null);
      } else {
        console.error('Error deleting promotion:', result.error);
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  const handlePermanentDelete = async (promotionId) => {
    try {
      const result = await promotionService.permanentlyDeletePromotion(promotionId);
      
      if (result.success) {
        setSuccessMessage('Promotion permanently deleted!');
        loadPromotions();
        setDeleteConfirm(null);
      } else {
        console.error('Error deleting promotion:', result.error);
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  const handleRestore = async (promotionId) => {
    try {
      const result = await promotionService.restorePromotion(promotionId);
      
      if (result.success) {
        setSuccessMessage('Promotion restored successfully!');
        loadPromotions();
      } else {
        console.error('Error restoring promotion:', result.error);
      }
    } catch (error) {
      console.error('Error restoring promotion:', error);
    }
  };

  const handleToggleActive = async (promotionId, currentStatus) => {
    try {
      const result = await promotionService.updatePromotion(promotionId, {
        isActive: !currentStatus
      });
      
      if (result.success) {
        setSuccessMessage(`Promotion ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        loadPromotions();
      } else {
        console.error('Error toggling promotion status:', result.error);
      }
    } catch (error) {
      console.error('Error toggling promotion status:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Active</span>;
      case 'upcoming':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Upcoming</span>;
      case 'expired':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Expired</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Unknown</span>;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
      if (date instanceof Date) {
        return date.toLocaleDateString();
      } else if (date.toDate) {
        return date.toDate().toLocaleDateString();
      } else {
        return new Date(date).toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting date:', error);
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
              <h1 className="text-3xl font-bold text-gray-800">Promotions Management</h1>
              <p className="text-gray-600 mt-2">Create and manage promotional offers</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => loadPromotions()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Promotion
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <StatCard
              title="Total Promotions"
              value={promotions.length}
              icon="🎉"
              color="blue"
            />
            <StatCard
              title="Active"
              value={promotions.filter(p => p.status === 'active').length}
              icon="✅"
              color="green"
            />
            <StatCard
              title="Upcoming"
              value={promotions.filter(p => p.status === 'upcoming').length}
              icon="⏳"
              color="yellow"
            />
            <StatCard
              title="Expired"
              value={promotions.filter(p => p.status === 'expired').length}
              icon="⌛"
              color="gray"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search promotions..."
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
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="buy_x_get_y">Buy X Get Y</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="startDate">Sort by Start Date</option>
                <option value="endDate">Sort by End Date</option>
                <option value="name">Sort by Name</option>
                <option value="discountPercentage">Sort by Discount</option>
                <option value="usageCount">Sort by Usage</option>
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

        {/* Promotions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promotion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPromotions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No promotions found. {searchTerm && 'Try a different search term.'}
                    </td>
                  </tr>
                ) : (
                  filteredPromotions.map((promotion) => (
                    <tr key={promotion.docId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white">
                            {promotion.bannerImage ? (
                              <img 
                                src={promotion.bannerImage} 
                                alt={promotion.name}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <span className="text-xl">🎁</span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {promotion.name}
                              {promotion.isActive && (
                                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{promotion.promoCode}</div>
                            <div className="text-xs text-gray-400">{promotion.description?.substring(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(promotion.startDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          to {formatDate(promotion.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-blue-600">
                          {promotion.discountPercentage}% Off
                        </div>
                        {promotion.minimumPurchase > 0 && (
                          <div className="text-xs text-gray-500">
                            Min: Rs.{promotion.minimumPurchase}
                          </div>
                        )}
                        {promotion.maximumDiscount > 0 && (
                          <div className="text-xs text-gray-500">
                            Max: Rs.{promotion.maximumDiscount}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {promotion.usageCount || 0}
                        </div>
                        {promotion.usageLimit > 0 && (
                          <div className="text-xs text-gray-500">
                            Limit: {promotion.usageLimit}
                          </div>
                        )}
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="h-2 rounded-full bg-blue-500"
                            style={{ 
                              width: `${promotion.usageLimit ? 
                                ((promotion.usageCount || 0) / promotion.usageLimit) * 100 : 
                                (promotion.usageCount || 0) > 0 ? 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(promotion.status)}
                        <div className="text-xs text-gray-500 mt-1">
                          Created: {formatDate(promotion.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleActive(promotion.docId, promotion.isActive)}
                            className={`p-1 ${promotion.isActive ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'} hover:bg-gray-50 rounded`}
                            title={promotion.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleOpenModal(promotion)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(promotion.docId)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          {!promotion.isActive && (
                            <button
                              onClick={() => handleRestore(promotion.docId)}
                              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                              title="Restore"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this promotion? This action can be undone by restoring from deleted items.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => handlePermanentDelete(deleteConfirm)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                  title="Permanently delete (cannot be undone)"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Promotion Modal */}
        {isModalOpen && (
          <PromotionsAddModal 
            formData={formData}
            isEditMode={isEditMode}
            handleCloseModal={handleCloseModal}
            successMessage={successMessage}
            errors={errors}
            handleInputChange={handleInputChange}
            setFormData={setFormData}
            setErrors={setErrors}
            setSuccessMessage={setSuccessMessage}
            loadPromotions={loadPromotions}
            selectedPromotion={selectedPromotion}
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
    gray: 'bg-gray-50 text-gray-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default PromotionsManagementPage;