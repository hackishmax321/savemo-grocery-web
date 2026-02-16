import React, { useState, useEffect } from 'react';
import { Categories } from '../../constants/Categories';
import groceryService from '../../services/Item.service';
import promotionService from '../../services/Promotion.service';

function PromotionsAddModal({
  formData,
  successMessage,
  setSuccessMessage,
  errors,
  setErrors,
  isEditMode,
  handleCloseModal,
  handleInputChange,
  setFormData,
  loadPromotions,
  selectedPromotion
}) {
  
  const [applicableItems, setApplicableItems] = useState([
    {
      id: Date.now(),
      type: 'all', // 'all', 'categories', 'specific'
      categories: [], // For multiple categories
      items: [] // For multiple specific items
    }
  ]);

  const [itemSearchResults, setItemSearchResults] = useState({});
  const [searchTerms, setSearchTerms] = useState({});
  const [showCategoryDropdown, setShowCategoryDropdown] = useState({});
  const [showItemDropdown, setShowItemDropdown] = useState({});
  const [allItems, setAllItems] = useState([]);

  // Load all items on component mount
  useEffect(() => {
    loadAllItems();
  }, []);

  const loadAllItems = async () => {
    try {
      const result = await groceryService.getAllItems({ isActive: true });
      if (result.success) {
        setAllItems(result.items);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Promotion name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start >= end) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (!formData.discountPercentage || formData.discountPercentage <= 0 || formData.discountPercentage > 100) {
      newErrors.discountPercentage = 'Valid discount percentage (1-100) is required';
    }

    if (formData.minimumPurchase && (isNaN(formData.minimumPurchase) || formData.minimumPurchase < 0)) {
      newErrors.minimumPurchase = 'Minimum purchase must be a non-negative number';
    }

    if (formData.maximumDiscount && (isNaN(formData.maximumDiscount) || formData.maximumDiscount < 0)) {
      newErrors.maximumDiscount = 'Maximum discount must be a non-negative number';
    }

    if (formData.usageLimit && (isNaN(formData.usageLimit) || formData.usageLimit < 0)) {
      newErrors.usageLimit = 'Usage limit must be a non-negative number';
    }

    // Validate applicable items
    applicableItems.forEach((item, index) => {
      if (item.type === 'categories' && (!item.categories || item.categories.length === 0)) {
        newErrors[`applicable_${index}`] = 'At least one category is required';
      }
      if (item.type === 'specific' && (!item.items || item.items.length === 0)) {
        newErrors[`applicable_${index}`] = 'At least one item is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addApplicableItem = () => {
    setApplicableItems([
      ...applicableItems,
      {
        id: Date.now() + Math.random(),
        type: 'all',
        categories: [],
        items: []
      }
    ]);
  };

  const removeApplicableItem = (id) => {
    if (applicableItems.length > 1) {
      setApplicableItems(applicableItems.filter(item => item.id !== id));
    }
  };

  const handleApplicableItemChange = (id, field, value) => {
    setApplicableItems(applicableItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleCategorySelect = (ruleId, category) => {
    setApplicableItems(applicableItems.map(rule => {
      if (rule.id === ruleId) {
        const categories = rule.categories || [];
        if (!categories.includes(category)) {
          return {
            ...rule,
            categories: [...categories, category]
          };
        }
      }
      return rule;
    }));
    setShowCategoryDropdown(prev => ({ ...prev, [ruleId]: false }));
  };

  const removeCategory = (ruleId, categoryToRemove) => {
    setApplicableItems(applicableItems.map(rule => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          categories: (rule.categories || []).filter(cat => cat !== categoryToRemove)
        };
      }
      return rule;
    }));
  };

  const handleItemSelect = (ruleId, item) => {
    setApplicableItems(applicableItems.map(rule => {
      if (rule.id === ruleId) {
        const items = rule.items || [];
        if (!items.some(i => i.docId === item.docId)) {
          return {
            ...rule,
            items: [...items, item]
          };
        }
      }
      return rule;
    }));
    setSearchTerms(prev => ({ ...prev, [ruleId]: '' }));
    setShowItemDropdown(prev => ({ ...prev, [ruleId]: false }));
  };

  const removeItem = (ruleId, itemToRemove) => {
    setApplicableItems(applicableItems.map(rule => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          items: (rule.items || []).filter(item => item.docId !== itemToRemove.docId)
        };
      }
      return rule;
    }));
  };

  const searchItems = (ruleId, term) => {
    setSearchTerms(prev => ({ ...prev, [ruleId]: term }));
    
    if (!term.trim()) {
      setItemSearchResults(prev => ({ ...prev, [ruleId]: [] }));
      return;
    }

    const searchLower = term.toLowerCase();
    const results = allItems.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.brand?.toLowerCase().includes(searchLower) ||
      item.barcode?.includes(term)
    ).slice(0, 10);

    setItemSearchResults(prev => ({ ...prev, [ruleId]: results }));
    setShowItemDropdown(prev => ({ ...prev, [ruleId]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare applicable items data
      const applicableItemsData = applicableItems.map(rule => {
        if (rule.type === 'all') {
          return 'all';
        } else if (rule.type === 'categories') {
          return { 
            type: 'categories',
            categories: rule.categories 
          };
        } else if (rule.type === 'specific') {
          return { 
            type: 'specific',
            items: (rule.items || []).map(item => item.docId || item.id)
          };
        }
        return rule.type;
      });

      const promotionData = {
        name: formData.name,
        description: formData.description,
        promoCode: formData.promoCode,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        discountPercentage: parseFloat(formData.discountPercentage),
        discountType: formData.discountType || 'percentage',
        discountValue: parseFloat(formData.discountPercentage),
        applicableItems: applicableItemsData,
        minimumPurchase: formData.minimumPurchase ? parseFloat(formData.minimumPurchase) : 0,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        customerEligibility: formData.customerEligibility || 'all',
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        bannerImage: formData.bannerImage || '',
        termsAndConditions: formData.termsAndConditions || ''
      };

      let result;
      
      if (isEditMode && selectedPromotion) {
        result = await promotionService.updatePromotion(selectedPromotion.docId, promotionData);
      } else {
        result = await promotionService.createPromotion(promotionData);
      }

      if (result.success) {
        setSuccessMessage(isEditMode ? 'Promotion updated successfully!' : 'Promotion created successfully!');
        loadPromotions();
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error('Error saving promotion:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-hidden">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] my-8 overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Edit Promotion' : 'Create New Promotion'}
          </h2>
          <button
            onClick={handleCloseModal}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="m-6 p-4 bg-green-100 text-green-800 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Promotion Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promotion Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className={`w-full text-black/80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Summer Sale, New Year Special"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Promo Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <input
                    type="text"
                    name="promoCode"
                    value={formData.promoCode || ''}
                    onChange={handleInputChange}
                    className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., SUMMER2024"
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave empty for auto-generated code</p>
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Percentage *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="discountPercentage"
                      value={formData.discountPercentage || ''}
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                      step="1"
                      className={`w-full text-black/80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.discountPercentage ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="10"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                  </div>
                  {errors.discountPercentage && (
                    <p className="mt-1 text-sm text-red-600">{errors.discountPercentage}</p>
                  )}
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type
                  </label>
                  <select
                    name="discountType"
                    value={formData.discountType || 'percentage'}
                    onChange={handleInputChange}
                    className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="buy_x_get_y">Buy X Get Y</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate || ''}
                    onChange={handleInputChange}
                    className={`w-full text-black/80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate || ''}
                    onChange={handleInputChange}
                    className={`w-full text-black/80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>

                {/* Customer Eligibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Eligibility
                  </label>
                  <select
                    name="customerEligibility"
                    value={formData.customerEligibility || 'all'}
                    onChange={handleInputChange}
                    className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Customers</option>
                    <option value="new">New Customers Only</option>
                    <option value="existing">Existing Customers Only</option>
                    <option value="vip">VIP Customers Only</option>
                  </select>
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive || false}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Description & Terms</h3>
              <div className="space-y-4">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the promotion details..."
                  />
                </div>

                {/* Terms and Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms and Conditions
                  </label>
                  <textarea
                    name="termsAndConditions"
                    value={formData.termsAndConditions || ''}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter terms and conditions..."
                  />
                </div>

                {/* Banner Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image URL
                  </label>
                  <input
                    type="url"
                    name="bannerImage"
                    value={formData.bannerImage || ''}
                    onChange={handleInputChange}
                    className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Restrictions Section */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Restrictions & Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Minimum Purchase */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Purchase
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">Rs.</span>
                    <input
                      type="number"
                      name="minimumPurchase"
                      value={formData.minimumPurchase || ''}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full text-black/80 pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.minimumPurchase ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.minimumPurchase && (
                    <p className="mt-1 text-sm text-red-600">{errors.minimumPurchase}</p>
                  )}
                </div>

                {/* Maximum Discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Discount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">Rs.</span>
                    <input
                      type="number"
                      name="maximumDiscount"
                      value={formData.maximumDiscount || ''}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full text-black/80 pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.maximumDiscount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Unlimited"
                    />
                  </div>
                  {errors.maximumDiscount && (
                    <p className="mt-1 text-sm text-red-600">{errors.maximumDiscount}</p>
                  )}
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className={`w-full text-black/80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.usageLimit ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Unlimited"
                  />
                  {errors.usageLimit && (
                    <p className="mt-1 text-sm text-red-600">{errors.usageLimit}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Applicable Items Section */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Applicable Items</h3>
                <button
                  type="button"
                  onClick={addApplicableItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                >
                  + Add Rule
                </button>
              </div>

              {applicableItems.map((rule, index) => (
                <div key={rule.id} className="mb-4 p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">Rule {index + 1}</h4>
                    {applicableItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeApplicableItem(rule.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Rule Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rule Type
                      </label>
                      <select
                        value={rule.type}
                        onChange={(e) => handleApplicableItemChange(rule.id, 'type', e.target.value)}
                        className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Items</option>
                        <option value="categories">By Categories</option>
                        <option value="specific">Specific Items</option>
                      </select>
                    </div>

                    {/* Categories Selection */}
                    {rule.type === 'categories' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Categories
                        </label>
                        
                        {/* Selected Categories Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(rule.categories || []).map(category => (
                            <span
                              key={category}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                            >
                              {category}
                              <button
                                type="button"
                                onClick={() => removeCategory(rule.id, category)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Category Dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowCategoryDropdown(prev => ({ 
                              ...prev, [rule.id]: !prev[rule.id] 
                            }))}
                            className="w-full text-left px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          >
                            {rule.categories?.length > 0 
                              ? `${rule.categories.length} categories selected` 
                              : 'Select categories...'}
                          </button>

                          {showCategoryDropdown[rule.id] && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {Categories.map(category => (
                                <div
                                  key={category.id}
                                  onClick={() => handleCategorySelect(rule.id, category.name)}
                                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                    rule.categories?.includes(category.name) ? 'bg-blue-50 text-blue-600' : ''
                                  }`}
                                >
                                  <span className="mr-2">{category.icon}</span>
                                  {category.name}
                                  {rule.categories?.includes(category.name) && (
                                    <span className="float-right text-blue-600">✓</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Specific Items Selection */}
                    {rule.type === 'specific' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search and Select Items
                        </label>

                        {/* Selected Items Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(rule.items || []).map(item => (
                            <span
                              key={item.docId}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                            >
                              {item.name}
                              <button
                                type="button"
                                onClick={() => removeItem(rule.id, item)}
                                className="ml-2 text-green-600 hover:text-green-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Item Search Input */}
                        <div className="relative">
                          <input
                            type="text"
                            value={searchTerms[rule.id] || ''}
                            onChange={(e) => searchItems(rule.id, e.target.value)}
                            onFocus={() => setShowItemDropdown(prev => ({ ...prev, [rule.id]: true }))}
                            className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search items by name, brand, or barcode..."
                          />

                          {/* Search Results Dropdown */}
                          {showItemDropdown[rule.id] && searchTerms[rule.id] && (
                            <div className="absolute z-20 w-full mt-1 text-black/80  bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {itemSearchResults[rule.id]?.length > 0 ? (
                                itemSearchResults[rule.id].map(item => (
                                  <div
                                    key={item.docId}
                                    onClick={() => handleItemSelect(rule.id, item)}
                                    className="flex gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                                  >
                                    <div>
                                        <img 
                                        src={item.images[0]} 
                                        alt={item.name}
                                        className="h-10 w-10 rounded-lg object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-gray-500">
                                        {item.brand} - Rs.{item.price} 
                                        {item.barcode && ` (${item.barcode})`}
                                        </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-2 text-gray-500">
                                  No items found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {rule.type === 'all' && (
                      <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
                        This promotion applies to all items in the store
                      </div>
                    )}

                    {errors[`applicable_${index}`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`applicable_${index}`]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {isEditMode ? 'Update Promotion' : 'Create Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PromotionsAddModal;