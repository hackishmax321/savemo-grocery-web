import React, { useState } from 'react'
import { Categories, UnitTypes } from '../../constants/Categories';
import groceryService from '../../services/Item.service';

function ItemsAddModal({
  formData, 
  successMessage, 
  setSuccessMessage, 
  errors, 
  setErrors, 
  isEditMode, 
  handleCloseModal, 
  handleInputChange, 
  handleCategoryChange, 
  setFormData, 
  loadItems, 
  selectedItem
}) {
  
  // State for size series items
  const [sizeItems, setSizeItems] = useState([
    {
      id: Date.now(),
      sizeSeries: '',
      price: '',
      quantity: '',
      unit: 'g',
      barcode: '',
      discountPercentage: 0,
      isFeatured: false,
      isOnSale: false,
      images: []
    }
  ]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Validate each size item
    sizeItems.forEach((item, index) => {
      if (!item.sizeSeries.trim()) {
        newErrors[`size_${index}`] = 'Size series is required';
      }
      if (!item.price || isNaN(item.price) || parseFloat(item.price) <= 0) {
        newErrors[`price_${index}`] = 'Valid price is required';
      }
      if (item.quantity && (isNaN(item.quantity) || parseFloat(item.quantity) < 0)) {
        newErrors[`quantity_${index}`] = 'Quantity must be non-negative';
      }
      if (item.discountPercentage && 
          (isNaN(item.discountPercentage) || 
           item.discountPercentage < 0 || 
           item.discountPercentage > 100)) {
        newErrors[`discount_${index}`] = 'Discount must be between 0 and 100';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addSizeItem = () => {
    setSizeItems([
      ...sizeItems,
      {
        id: Date.now() + Math.random(),
        sizeSeries: '',
        price: '',
        quantity: '',
        unit: 'g',
        barcode: '',
        discountPercentage: 0,
        isFeatured: false,
        isOnSale: false,
        images: []
      }
    ]);
  };

  const removeSizeItem = (id) => {
    if (sizeItems.length > 1) {
      setSizeItems(sizeItems.filter(item => item.id !== id));
    }
  };

  const handleSizeItemChange = (id, field, value) => {
    setSizeItems(sizeItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSizeItemImageChange = (id, value) => {
    setSizeItems(sizeItems.map(item => 
      item.id === id ? { ...item, images: value.split('\n').filter(url => url.trim()) } : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Create array of items from size series
      const itemsToSave = sizeItems.map(sizeItem => ({
        // Common fields
        name: `${formData.name} ${sizeItem.sizeSeries}`.trim(),
        category: formData.category,
        subCategory: formData.subCategory,
        description: formData.description,
        brand: formData.brand,
        tags: formData.tags,
        
        // Size-specific fields
        sizeSeries: sizeItem.sizeSeries,
        price: parseFloat(sizeItem.price),
        quantity: parseFloat(sizeItem.quantity) || 0,
        unit: sizeItem.unit,
        barcode: sizeItem.barcode,
        discountPercentage: parseFloat(sizeItem.discountPercentage) || 0,
        isFeatured: sizeItem.isFeatured,
        isOnSale: sizeItem.isOnSale,
        images: sizeItem.images
      }));

      if (isEditMode && selectedItem) {
        // For edit mode, you might want to handle differently
        // This example assumes you're editing a single item
        const result = await groceryService.updateItem(selectedItem.docId, itemsToSave[0]);
        
        if (result.success) {
          setSuccessMessage('Item updated successfully!');
          loadItems();
          setTimeout(() => {
            handleCloseModal();
          }, 1500);
        } else {
          setErrors({ submit: result.error });
        }
      } else {
        // Create multiple items
        const results = await Promise.all(
          itemsToSave.map(item => groceryService.createItem(item))
        );
        
        const allSuccess = results.every(result => result.success);
        const errors = results.filter(result => !result.success).map(r => r.error);
        
        if (allSuccess) {
          setSuccessMessage(`${itemsToSave.length} items created successfully!`);
          loadItems();
          setTimeout(() => {
            handleCloseModal();
          }, 1500);
        } else {
          setErrors({ submit: `Failed to create some items: ${errors.join(', ')}` });
        }
      }
    } catch (error) {
      console.error('Error saving items:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    }
  };

  const getSubcategories = () => {
    if (!formData.category) return [];
    const category = Categories.find(cat => cat.name === formData.category);
    return category ? category.subcategories : [];
  };

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-hidden">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[60vh] my-8 overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Edit Item' : 'Add New Items (Size Series)'}
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
          {/* Common Fields Section */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Common Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Base Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full text-black/80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Organic Rice"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className={`w-full text-black/80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Category</option>
                  {Categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!formData.category}
                >
                  <option value="">Select Subcategory</option>
                  {getSubcategories().map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter brand"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Common description for all sizes"
                />
              </div>

              {/* Tags */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  }))}
                  className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="organic, fresh, local, etc."
                />
              </div>
            </div>
          </div>

          {/* Size Series Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">Size Variations</h3>
              <button
                type="button"
                onClick={addSizeItem}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
              >
                + Add Size
              </button>
            </div>

            {sizeItems.map((item, index) => (
              <div key={item.id} className="p-4 border rounded-lg bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700">Size {index + 1}</h4>
                  {sizeItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSizeItem(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Size Series */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size Series *
                    </label>
                    <input
                      type="text"
                      value={item.sizeSeries}
                      onChange={(e) => handleSizeItemChange(item.id, 'sizeSeries', e.target.value)}
                      className={`w-full text-black/80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors[`size_${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 50g Pack"
                    />
                    {errors[`size_${index}`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`size_${index}`]}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">Rs.</span>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleSizeItemChange(item.id, 'price', e.target.value)}
                        step="0.01"
                        min="0"
                        className={`w-full text-black/80 pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`price_${index}`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors[`price_${index}`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`price_${index}`]}</p>
                    )}
                  </div>

                  {/* Quantity and Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleSizeItemChange(item.id, 'quantity', e.target.value)}
                        min="0"
                        step="0.01"
                        className={`w-full text-black/80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`quantity_${index}`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => handleSizeItemChange(item.id, 'unit', e.target.value)}
                        className="w-24 text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {UnitTypes.map(unit => (
                          <option key={unit.id} value={unit.id}>
                            {unit.symbol}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors[`quantity_${index}`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`quantity_${index}`]}</p>
                    )}
                  </div>

                  {/* Barcode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Barcode
                    </label>
                    <input
                      type="text"
                      value={item.barcode}
                      onChange={(e) => handleSizeItemChange(item.id, 'barcode', e.target.value)}
                      className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter barcode"
                    />
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount %
                    </label>
                    <input
                      type="number"
                      value={item.discountPercentage}
                      onChange={(e) => handleSizeItemChange(item.id, 'discountPercentage', e.target.value)}
                      min="0"
                      max="100"
                      step="1"
                      className={`w-full text-black/80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors[`discount_${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {errors[`discount_${index}`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`discount_${index}`]}</p>
                    )}
                  </div>

                  {/* Checkboxes */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.isFeatured}
                        onChange={(e) => handleSizeItemChange(item.id, 'isFeatured', e.target.checked)}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">Featured</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.isOnSale}
                        onChange={(e) => handleSizeItemChange(item.id, 'isOnSale', e.target.checked)}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">On Sale</label>
                    </div>
                  </div>

                  {/* Images URL - Full width */}
                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URLs (one per line)
                    </label>
                    <textarea
                      value={item.images.join('\n')}
                      onChange={(e) => handleSizeItemImageChange(item.id, e.target.value)}
                      rows="2"
                      className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image1.jpg"
                    />
                  </div>
                </div>
              </div>
            ))}
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
              {isEditMode ? 'Update Item' : `Create ${sizeItems.length} Items`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ItemsAddModal