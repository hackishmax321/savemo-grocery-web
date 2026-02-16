import React, { useState, useEffect } from 'react'
import ItemsContainer from '../components/container/ItemsContainer'
import { groceryDeals } from '../constants/GroceryDeals'
import HomeCarousel from '../components/slider/HomeCarousel'
import DealsContainer from '../components/container/DealsContainer'
import groceryService from '../services/Item.service'

function OpenPage() {
  const [trendingItems, setTrendingItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTrendingItems()
  }, [])

  // Helper function to format item data for the ItemCard component
  const formatItemForCard = (item) => {
    return {
      id: item.docId || item.id,
      docId: item.docId || item.id,
      name: item.name || '',
      description: item.description || 'No description available',
      price: item.price || 0,
      image: item.images?.[0] || 'https://via.placeholder.com/300',
      categoryId: item.category || 'general',
      rating: item.ratings?.average || 4.5, // Default rating if not available
      inStock: item.quantity > 0 && item.stockStatus !== 'out_of_stock',
      quantity: item.quantity || 0,
      unit: item.unit || 'piece',
      brand: item.brand || '',
      barcode: item.barcode || '',
      tags: item.tags || [],
      isFeatured: item.isFeatured || false,
      isOnSale: item.isOnSale || false,
      discountPercentage: item.discountPercentage || 0
    }
  }

  const loadTrendingItems = async () => {
    setIsLoading(true)
    try {
      // Get all active items
      const result = await groceryService.getAllItems({ isActive: true })
      
      if (result.success && result.items.length > 0) {
        // Filter in-stock items and sort by rating
        const inStockItems = result.items.filter(item => 
          item.quantity > 0 && 
          item.stockStatus !== 'out_of_stock'
        )

        // Sort by rating (highest first) and take top 8
        const topRatedItems = inStockItems
          .sort((a, b) => {
            const ratingA = a.ratings?.average || 0
            const ratingB = b.ratings?.average || 0
            return ratingB - ratingA
          })
          .slice(0, 8)
          .map(item => formatItemForCard(item)) // Format items for the card

        setTrendingItems(topRatedItems.length > 0 ? topRatedItems : inStockItems.slice(0, 8).map(item => formatItemForCard(item)))
      } else {
        // Fallback to sample items if no data
        const { sampleItems } = await import('../constants/SampleItems')
        const inStockSample = sampleItems
          .filter(item => item.inStock !== false)
          .map(item => formatItemForCard(item))
        setTrendingItems(inStockSample.slice(0, 8))
      }
    } catch (error) {
      console.error('Error loading trending items:', error)
      // Fallback to sample items on error
      const { sampleItems } = await import('../constants/SampleItems')
      const inStockSample = sampleItems
        .filter(item => item.inStock !== false)
        .map(item => formatItemForCard(item))
      setTrendingItems(inStockSample.slice(0, 8))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='w-full mt-15 min-h-screen bg-primary py-5'>
        <div className='bg-secondary'>
            {/* Slider */}
            <HomeCarousel />
        </div>
        
        {/* Trending Items Section */}
        <div className='max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8'>
            <div className='flex items-center justify-between mb-4'>
                <h1 className='text-4xl text-font-secondary font-bold'>Trending Items</h1>
                {!isLoading && trendingItems.length > 0 && (
                    <span className='text-sm text-gray-500'>
                        Top {trendingItems.length} items
                    </span>
                )}
            </div>
            
            {isLoading ? (
                <div className='flex justify-center items-center h-64'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
                </div>
            ) : (
                <ItemsContainer items={trendingItems} />
            )}
        </div>

        {/* Featured Deals Section - Unchanged */}
        <div className='max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8'>
            <h1 className='text-4xl text-font-secondary font-bold'>Featured Deals</h1>
            <DealsContainer deals={groceryDeals} />
        </div>
    </div>
  )
}

export default OpenPage