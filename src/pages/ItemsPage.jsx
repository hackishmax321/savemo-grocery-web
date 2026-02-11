import React, { useState, useEffect } from 'react'
import ItemsContainer from '../components/container/ItemsContainer'
import FilterContainer from '../components/container/FilterContainer'
import groceryService from '../services/Item.service'
import { Categories } from '../constants/Categories'
import { sampleItems } from '../constants/SampleItems'

function ItemsPage() {
  const [filteredItems, setFilteredItems] = useState([])
  const [allItems, setAllItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Function to transform Firebase item to required format
  const transformItem = (firebaseItem) => {
    // Find category ID based on category name
    const category = Categories.find(cat => 
      cat.name.toLowerCase() === firebaseItem.category?.toLowerCase()
    )
    
    // If category not found, look for it in subcategories
    let categoryId = 0
    if (!category) {
      // Try to find category by checking subcategories
      for (const cat of Categories) {
        if (cat.subcategories?.some(sub => 
          sub.toLowerCase() === firebaseItem.subCategory?.toLowerCase()
        )) {
          categoryId = cat.id
          break
        }
      }
    } else {
      categoryId = category.id
    }

    // Get rating or default to 0
    const rating = firebaseItem.ratings?.average || 0

    // Get stock status - convert isActive and quantity to inStock boolean
    const inStock = firebaseItem.isActive && 
                   firebaseItem.quantity !== undefined && 
                   firebaseItem.quantity > 0 &&
                   firebaseItem.stockStatus !== 'out_of_stock'

    // Get first image or use a placeholder
    const image = firebaseItem.images?.[0] || 
                  firebaseItem.image || 
                  'https://via.placeholder.com/300x300?text=No+Image'

    return {
      id: firebaseItem.id || firebaseItem.docId || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: firebaseItem.name || 'Unnamed Item',
      description: firebaseItem.description || '',
      price: firebaseItem.price || 0,
      image: image,
      categoryId: categoryId,
      rating: rating,
      inStock: inStock,
      // Keep original data for filtering
      originalData: firebaseItem
    }
  }

  // Load items from Firebase
  const loadItems = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get all items from Firebase
      const result = await groceryService.getAllItems({
        isActive: true
      }, 100) 

      if (result.success) {
        // Transform items to required format
        const transformedItems = result.items.map(item => transformItem(item))
        
        setAllItems(transformedItems)
        setFilteredItems(transformedItems)
      } else {
        throw new Error(result.error || 'Failed to load items')
      }
    } catch (err) {
      console.error('Error loading items:', err)
      setError(err.message || 'Failed to load items. Please try again.')
      setAllItems([])
      setFilteredItems([])
    } finally {
      setLoading(false)
    }
  }

  // Load items on component mount
  useEffect(() => {
    loadItems()
  }, [])

  const handleFilterChange = (filteredItems) => {
    setFilteredItems(filteredItems)
  }

  // Refresh items function
  const handleRefreshItems = async () => {
    await loadItems()
  }

  if (loading) {
    return (
      <div className='w-full c-space section-spacing bg-primary py-5'>
        <div className='flex justify-center items-center h-64'>
          <div className='text-center'>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className='text-gray-600'>Loading items...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='w-full c-space section-spacing bg-primary py-5'>
        <div className='flex justify-center items-center h-64'>
          <div className='text-center'>
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className='text-red-600 mb-4'>{error}</p>
            <button
              onClick={handleRefreshItems}
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full c-space section-spacing bg-primary py-5'>
      <div className='flex relative'>
        <div className='flex-1 w-full mt-3'>
          <FilterContainer 
            allItems={allItems} 
            onFilterChange={handleFilterChange}
            onRefresh={handleRefreshItems}
          />
        </div>
        <div className='flex-3 w-full'>
          <ItemsContainer 
            items={filteredItems}
            emptyMessage={allItems.length === 0 ? "No items found" : "No items match your filters"}
          />
        </div>
      </div>
    </div>
  )
}

export default ItemsPage