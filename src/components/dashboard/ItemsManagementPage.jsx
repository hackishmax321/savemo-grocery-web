import React, { useState, useEffect } from 'react';
import { Categories, UnitTypes } from '../../constants/Categories';
import groceryService from '../../services/Item.service';

const ItemsManagementPage = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCategory: '',
    description: '',
    price: '',
    quantity: '',
    unit: 'piece',
    brand: '',
    barcode: '',
    images: [],
    tags: [],
    nutritionalInfo: {},
    isFeatured: false,
    isOnSale: false,
    discountPercentage: 0
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load items on component mount
  useEffect(() => {
    loadItems();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [items, searchTerm, selectedCategory, selectedSubCategory, stockFilter, sortBy, sortOrder]);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const result = await groceryService.getAllItems();
      
      if (result.success) {
        console.log(result)
        setItems(result.items);
        setFilteredItems(result.items);
      } else {
        console.error('Error loading items:', result.error);
        // For demo, create some mock data
        createMockData();
      }
    } catch (error) {
      console.error('Error loading items:', error);
      createMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const createMockData = () => {
    // Mock data for demonstration
    const mockItems = [
      {
        docId: '1',
        name: 'Organic Apples',
        category: 'Fresh Produce',
        subCategory: 'Fruits',
        description: 'Fresh organic apples from local farms',
        price: 2.99,
        quantity: 50,
        unit: 'kg',
        brand: 'Organic Farms',
        barcode: '123456789',
        stockStatus: 'in_stock',
        isFeatured: true,
        isOnSale: false,
        createdAt: { seconds: Date.now() / 1000 }
      },
      {
        docId: '2',
        name: 'Whole Milk',
        category: 'Dairy & Eggs',
        subCategory: 'Milk & Cream',
        description: 'Fresh whole milk, pasteurized',
        price: 3.49,
        quantity: 5,
        unit: 'l',
        brand: 'Dairy Fresh',
        barcode: '987654321',
        stockStatus: 'low_stock',
        isFeatured: false,
        isOnSale: true,
        discountPercentage: 10,
        createdAt: { seconds: Date.now() / 1000 }
      },
      {
        docId: '3',
        name: 'Chicken Breast',
        category: 'Meat & Seafood',
        subCategory: 'Poultry',
        description: 'Boneless skinless chicken breast',
        price: 8.99,
        quantity: 0,
        unit: 'kg',
        brand: 'Farm Fresh',
        barcode: '456789123',
        stockStatus: 'out_of_stock',
        isFeatured: true,
        isOnSale: false,
        createdAt: { seconds: Date.now() / 1000 }
      }
    ];
    setItems(mockItems);
    setFilteredItems(mockItems);
  };

  const applyFilters = () => {
    let filtered = [...items];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.brand.toLowerCase().includes(term) ||
        item.barcode.includes(term)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply subcategory filter
    if (selectedSubCategory !== 'all') {
      filtered = filtered.filter(item => item.subCategory === selectedSubCategory);
    }

    // Apply stock filter
    if (stockFilter !== 'all') {
      filtered = filtered.filter(item => item.stockStatus === stockFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'createdAt':
          aValue = a.createdAt?.seconds || 0;
          bValue = b.createdAt?.seconds || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredItems(filtered);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      // Edit mode
      setIsEditMode(true);
      setSelectedItem(item);
      setFormData({
        name: item.name || '',
        category: item.category || '',
        subCategory: item.subCategory || '',
        description: item.description || '',
        price: item.price?.toString() || '',
        quantity: item.quantity?.toString() || '',
        unit: item.unit || 'piece',
        brand: item.brand || '',
        barcode: item.barcode || '',
        images: item.images || [],
        tags: item.tags || [],
        nutritionalInfo: item.nutritionalInfo || {},
        isFeatured: item.isFeatured || false,
        isOnSale: item.isOnSale || false,
        discountPercentage: item.discountPercentage || 0
      });
    } else {
      // Add mode
      setIsEditMode(false);
      setSelectedItem(null);
      setFormData({
        name: '',
        category: '',
        subCategory: '',
        description: '',
        price: '',
        quantity: '',
        unit: 'piece',
        brand: '',
        barcode: '',
        images: [],
        tags: [],
        nutritionalInfo: {},
        isFeatured: false,
        isOnSale: false,
        discountPercentage: 0
      });
    }
    setErrors({});
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setFormData({
      name: '',
      category: '',
      subCategory: '',
      description: '',
      price: '',
      quantity: '',
      unit: 'piece',
      brand: '',
      barcode: '',
      images: [],
      tags: [],
      nutritionalInfo: {},
      isFeatured: false,
      isOnSale: false,
      discountPercentage: 0
    });
    setErrors({});
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

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData(prev => ({
      ...prev,
      category,
      subCategory: '' // Reset subcategory when category changes
    }));
    setSelectedCategory(category);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (formData.quantity && (isNaN(formData.quantity) || parseFloat(formData.quantity) < 0)) {
      newErrors.quantity = 'Quantity must be a non-negative number';
    }

    if (formData.discountPercentage && 
        (isNaN(formData.discountPercentage) || 
         formData.discountPercentage < 0 || 
         formData.discountPercentage > 100)) {
      newErrors.discountPercentage = 'Discount must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && selectedItem) {
        // Update existing item
        const result = await groceryService.updateItem(selectedItem.docId, {
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseFloat(formData.quantity) || 0,
          discountPercentage: parseFloat(formData.discountPercentage) || 0
        });

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
        // Create new item
        const result = await groceryService.createItem({
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseFloat(formData.quantity) || 0,
          discountPercentage: parseFloat(formData.discountPercentage) || 0
        });

        if (result.success) {
          setSuccessMessage('Item created successfully!');
          loadItems();
          setTimeout(() => {
            handleCloseModal();
          }, 1500);
        } else {
          setErrors({ submit: result.error });
        }
      }
    } catch (error) {
      console.error('Error saving item:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    }
  };

  const handleDelete = async (itemId) => {
    try {
      const result = await groceryService.deleteItem(itemId);
      
      if (result.success) {
        setSuccessMessage('Item deleted successfully!');
        loadItems();
        setDeleteConfirm(null);
      } else {
        console.error('Error deleting item:', result.error);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handlePermanentDelete = async (itemId) => {
    try {
      const result = await groceryService.permanentlyDeleteItem(itemId);
      
      if (result.success) {
        setSuccessMessage('Item permanently deleted!');
        loadItems();
        setDeleteConfirm(null);
      } else {
        console.error('Error deleting item:', result.error);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleRestore = async (itemId) => {
    try {
      const result = await groceryService.restoreItem(itemId);
      
      if (result.success) {
        setSuccessMessage('Item restored successfully!');
        loadItems();
      } else {
        console.error('Error restoring item:', result.error);
      }
    } catch (error) {
      console.error('Error restoring item:', error);
    }
  };

  const getSubcategories = () => {
    if (!formData.category) return [];
    const category = Categories.find(cat => cat.name === formData.category);
    return category ? category.subcategories : [];
  };

  const getStockStatusBadge = (status) => {
    switch(status) {
      case 'in_stock':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">In Stock</span>;
      case 'low_stock':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Low Stock</span>;
      case 'out_of_stock':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Out of Stock</span>;
      case 'high_stock':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">High Stock</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Unknown</span>;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      if (timestamp.toDate) {
        const date = timestamp.toDate();
        return date.toLocaleDateString();
      } else if (timestamp.seconds) {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }
    
    return 'Invalid date';
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
        <br></br>
        <div className='bg-white rounded-xl shadow-lg overflow-hidden p-3'>
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Grocery Items Management</h1>
                    <p className="text-gray-600 mt-2">Manage your inventory of grocery items</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button
                    onClick={() => loadItems()}
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
                    Add New Item
                    </button>
                </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <StatCard
                    title="Total Items"
                    value={items.length}
                    icon="📦"
                    color="blue"
                />
                <StatCard
                    title="In Stock"
                    value={items.filter(item => item.stockStatus === 'in_stock' || item.stockStatus === 'high_stock').length}
                    icon="✅"
                    color="green"
                />
                <StatCard
                    title="Low Stock"
                    value={items.filter(item => item.stockStatus === 'low_stock').length}
                    icon="⚠️"
                    color="yellow"
                />
                <StatCard
                    title="Out of Stock"
                    value={items.filter(item => item.stockStatus === 'out_of_stock').length}
                    icon="❌"
                    color="red"
                />
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                    <div className="relative">
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-black/80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    </div>
                </div>

                {/* Category Filter */}
                <div>
                    <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                    <option value="all">All Categories</option>
                    {Categories.map(category => (
                        <option key={category.id} value={category.name}>
                        {category.icon} {category.name}
                        </option>
                    ))}
                    </select>
                </div>

                {/* Subcategory Filter */}
                <div>
                    <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={selectedCategory === 'all'}
                    >
                    <option value="all">All Subcategories</option>
                    {selectedCategory !== 'all' && 
                        Categories
                        .find(cat => cat.name === selectedCategory)
                        ?.subcategories.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))
                    }
                    </select>
                </div>

                {/* Stock Filter */}
                <div>
                    <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                    <option value="all">All Stock</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    </select>
                </div>

                {/* Sort */}
                <div className="flex gap-2">
                    <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                    <option value="name">Sort by Name</option>
                    <option value="price">Sort by Price</option>
                    <option value="quantity">Sort by Quantity</option>
                    <option value="createdAt">Sort by Date</option>
                    </select>
                    {/* <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                    </button> */}
                </div>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
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
                    {filteredItems.length === 0 ? (
                        <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                            No items found. {searchTerm && 'Try a different search term.'}
                        </td>
                        </tr>
                    ) : (
                        filteredItems.map((item) => (
                        <tr key={item.docId} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                {item.images && item.images.length > 0 ? (
                                    <img 
                                    src={item.images[0]} 
                                    alt={item.name}
                                    className="h-10 w-10 rounded-lg object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-500">📦</span>
                                )}
                                </div>
                                <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                    {item.name}
                                    {item.isFeatured && (
                                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">Featured</span>
                                    )}
                                    {item.isOnSale && (
                                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">Sale</span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500">{item.brand}</div>
                                <div className="text-xs text-gray-400">{item.barcode}</div>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{item.category}</div>
                            <div className="text-sm text-gray-500">{item.subCategory}</div>
                            </td>
                            <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                                Rs.{item.price?.toFixed(2)}
                                {item.isOnSale && item.discountPercentage > 0 && (
                                <>
                                    <br />
                                    <span className="text-xs text-red-600 line-through">
                                    Rs.{(item.price / (1 - item.discountPercentage / 100)).toFixed(2)}
                                    </span>
                                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                    -{item.discountPercentage}%
                                    </span>
                                </>
                                )}
                            </div>
                            </td>
                            <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                                {item.quantity} {item.unit}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                className={`h-2 rounded-full ${
                                    item.stockStatus === 'out_of_stock' ? 'bg-red-500' :
                                    item.stockStatus === 'low_stock' ? 'bg-yellow-500' :
                                    item.stockStatus === 'high_stock' ? 'bg-green-500' :
                                    'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(item.quantity, 100)}%` }}
                                ></div>
                            </div>
                            </td>
                            <td className="px-6 py-4">
                            {getStockStatusBadge(item.stockStatus)}
                            <div className="text-xs text-gray-500 mt-1">
                                Added: {formatDate(item.createdAt)}
                            </div>
                            </td>
                            <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                                <button
                                onClick={() => handleOpenModal(item)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="Edit"
                                >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                </button>
                                <button
                                onClick={() => setDeleteConfirm(item.docId)}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                title="Delete"
                                >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                </button>
                                {!item.isActive && (
                                <button
                                    onClick={() => handleRestore(item.docId)}
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
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Delete</h3>
                    <p className="text-gray-600 mb-6">Are you sure you want to delete this item? This action can be undone by restoring from deleted items.</p>
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

            {/* Add/Edit Item Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-xl w-full max-w-4xl my-8">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isEditMode ? 'Edit Item' : 'Add New Item'}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                        {/* Item Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Item Name *
                            </label>
                            <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full text-black/80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter item name"
                            />
                            {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Category & Subcategory */}
                        <div className="grid grid-cols-2 gap-4">
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
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                            </label>
                            <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter item description"
                            />
                        </div>

                        {/* Price & Quantity */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">Rs.</span>
                                <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                className={`w-full text-black/80 pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.price ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="0.00"
                                />
                            </div>
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                            )}
                            </div>

                            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity
                            </label>
                            <div className="flex gap-2">
                                <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className={`w-full text-black/80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="0"
                                />
                                <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleInputChange}
                                className="w-32 text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                {UnitTypes.map(unit => (
                                    <option key={unit.id} value={unit.id}>
                                    {unit.symbol}
                                    </option>
                                ))}
                                </select>
                            </div>
                            {errors.quantity && (
                                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                            )}
                            </div>
                        </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                        {/* Brand & Barcode */}
                        <div className="grid grid-cols-2 gap-4">
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

                            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Barcode
                            </label>
                            <input
                                type="text"
                                name="barcode"
                                value={formData.barcode}
                                onChange={handleInputChange}
                                className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter barcode"
                            />
                            </div>
                        </div>

                        {/* Discount & Sale */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Discount %
                            </label>
                            <input
                                type="number"
                                name="discountPercentage"
                                value={formData.discountPercentage}
                                onChange={handleInputChange}
                                min="0"
                                max="100"
                                step="1"
                                className={`w-full text-black/80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.discountPercentage ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="0"
                            />
                            {errors.discountPercentage && (
                                <p className="mt-1 text-sm text-red-600">{errors.discountPercentage}</p>
                            )}
                            </div>

                            <div className="flex items-end space-x-4">
                            <div className="flex items-center">
                                <input
                                type="checkbox"
                                id="isFeatured"
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleInputChange}
                                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
                                Featured Item
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                type="checkbox"
                                id="isOnSale"
                                name="isOnSale"
                                checked={formData.isOnSale}
                                onChange={handleInputChange}
                                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isOnSale" className="ml-2 text-sm text-gray-700">
                                On Sale
                                </label>
                            </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
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

                        {/* Images URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image URLs (one per line)
                            </label>
                            <textarea
                            value={formData.images.join('\n')}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                images: e.target.value.split('\n').filter(url => url.trim())
                            }))}
                            rows="3"
                            className="w-full text-black/80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://example.com/image1.jpg"
                            />
                        </div>
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
                        {isEditMode ? 'Update Item' : 'Create Item'}
                        </button>
                    </div>
                    </form>
                </div>
                </div>
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
    red: 'bg-red-50 text-red-600'
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

export default ItemsManagementPage;