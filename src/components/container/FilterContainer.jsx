import React, { useState, useEffect } from 'react'
import { AiFillStar, AiOutlineStar } from 'react-icons/ai'
import { IoFilter, IoRefresh } from 'react-icons/io5'
import { Categories } from '../../constants/Categories'

function FilterContainer({ allItems = [], onFilterChange, initialFilters = null, searchTerm = '', onReset  }) {
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [selectedCategories, setSelectedCategories] = useState({})
  const [filters, setFilters] = useState({
    ratings: {
      fourAndAbove: false,
      threeAndAbove: false
    },
    availability: true
  })

  // Initialize selectedCategories state
  useEffect(() => {
    const initialCategories = {}
    Categories.forEach(category => {
      initialCategories[category.id] = false
    })
    
    // Apply initial filters if provided
    if (initialFilters) {
      // Set category filter
      if (initialFilters.category) {
        const category = Categories.find(cat => cat.name === initialFilters.category)
        if (category) {
          initialCategories[category.id] = true
        }
      }
      
      // Set search term filter (will be handled in parent component)
      // Price range, ratings, availability remain default
    }
    
    setSelectedCategories(initialCategories)
  }, [initialFilters])

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters()
  }, [priceRange, filters, selectedCategories, searchTerm])

  const handlePriceChange = (index, value) => {
    const newRange = [...priceRange]
    newRange[index] = parseInt(value)
    setPriceRange(newRange)
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
    console.log(selectedCategories)
  }

  const handleRatingChange = (rating) => {
    // Make rating filters exclusive (only one can be selected)
    setFilters({
      ...filters,
      ratings: {
        fourAndAbove: rating === 'fourAndAbove' ? !filters.ratings.fourAndAbove : false,
        threeAndAbove: rating === 'threeAndAbove' ? !filters.ratings.threeAndAbove : false
      }
    })
  }

  const handleAvailabilityChange = () => {
    setFilters({
      ...filters,
      availability: !filters.availability
    })
  }

  const resetFilters = () => {
    setPriceRange([0, 2000])
    const resetCategories = {}
    Categories.forEach(category => {
      resetCategories[category.id] = false
    })
    
    setSelectedCategories(resetCategories)
    setFilters({
      ratings: {
        fourAndAbove: false,
        threeAndAbove: false
      },
      availability: true
    })
    onReset();
  }

  const applyFilters = () => {
    let filtered = [...allItems]

    // Price filter
    filtered = filtered.filter(item => 
      item.price >= priceRange[0] && item.price <= priceRange[1]
    )

    // Category filter (if any category is selected)
    const activeCategories = Object.keys(selectedCategories).filter(
      catId => selectedCategories[catId]
    )
    
    if (activeCategories.length > 0) {
      // Convert category IDs from string to number for comparison
      const activeCategoryIds = activeCategories.map(id => parseInt(id))
      filtered = filtered.filter(item =>
        activeCategoryIds.includes(item.categoryId)
      )
    }

    // Rating filter
    if (filters.ratings.fourAndAbove) {
      filtered = filtered.filter(item => item.rating >= 4)
    } else if (filters.ratings.threeAndAbove) {
      filtered = filtered.filter(item => item.rating >= 3)
    }

    // Availability filter
    if (filters.availability) {
      filtered = filtered.filter(item => item.inStock)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) || 
        item.description.toLowerCase().includes(term)
      );
    }

    // Pass filtered items to parent
    onFilterChange(filtered)
  }

  const getActiveFiltersCount = () => {
    const categoryCount = Object.values(selectedCategories).filter(Boolean).length
    const ratingCount = Object.values(filters.ratings).filter(Boolean).length
    const availabilityCount = filters.availability ? 1 : 0
    const priceCount = priceRange[0] > 0 || priceRange[1] < 2000 ? 1 : 0
    
    return categoryCount + ratingCount + availabilityCount + priceCount
  }

  return (
    <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-lg w-full max-w-xs sticky top-6'>
      {searchTerm && (
        <div className='mb-4 p-2 bg-blue-50 rounded-lg'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-blue-700 font-medium'>
              Search: "{searchTerm}"
            </span>
            {/* Optional: Add clear search button if needed */}
          </div>
        </div>
      )}
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
          <IoFilter className='text-blue-600' />
          Filters
        </h1>
        <button 
          onClick={resetFilters}
          className='text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors'
        >
          <IoRefresh />
          Reset
        </button>
      </div>

      {/* Price Range Filter */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-3'>Price Range</h3>
        <div className='space-y-4'>
          <div className='flex items-center justify-between text-gray-700'>
            <div className='flex justify-center items-center gap-1 bg-gray-50 px-3 py-1 rounded-lg'>
              <span className='font-medium'>Rs.{priceRange[0]}</span>
            </div>
            <span className='text-gray-400 mx-2'>to</span>
            <div className='flex items-center justify-center bg-gray-50 px-3 py-1 rounded-lg'>
              <span className='font-medium'>Rs.{priceRange[1]}</span>
            </div>
          </div>
          
          <div className='space-y-4 px-2'>
            <div className='relative'>
              <input
                type='range'
                min='0'
                max='2000'
                step='10'
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(0, e.target.value)}
                className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600'
              />
            </div>
            <div className='relative'>
              <input
                type='range'
                min='0'
                max='2000'
                step='10'
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(1, e.target.value)}
                className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-3'>Category</h3>
        <div className='space-y-3 max-h-60 overflow-y-auto pr-2'>
          {Categories.map((category) => (
            <div key={category.id} className='flex items-center gap-3 group'>
              <input
                type='checkbox'
                id={`category-${category.id}`}
                checked={selectedCategories[category.id] || false}
                onChange={() => handleCategoryChange(category.id)}
                className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer'
              />
              <label 
                htmlFor={`category-${category.id}`}
                className='text-gray-600 hover:text-gray-800 cursor-pointer select-none transition-colors group-hover:text-blue-600 flex items-center gap-2'
              >
                <span className='text-lg'>{category.icon}</span>
                <span className='flex-1'>{category.name}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Ratings Filter */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-3'>Ratings</h3>
        <div className='space-y-3'>
          <div className='flex items-center gap-3 group'>
            <input
              type='checkbox'
              id='fourAndAbove'
              checked={filters.ratings.fourAndAbove}
              onChange={() => handleRatingChange('fourAndAbove')}
              className='w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500 focus:ring-2 cursor-pointer'
            />
            <label 
              htmlFor='fourAndAbove'
              className='flex items-center gap-2 cursor-pointer select-none'
            >
              <div className='flex'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <AiFillStar key={star} className='w-4 h-4 text-yellow-400' />
                ))}
              </div>
              <span className='text-gray-600 group-hover:text-yellow-600 transition-colors ml-1'>4 & above</span>
            </label>
          </div>
          
          <div className='flex items-center gap-3 group'>
            <input
              type='checkbox'
              id='threeAndAbove'
              checked={filters.ratings.threeAndAbove}
              onChange={() => handleRatingChange('threeAndAbove')}
              className='w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500 focus:ring-2 cursor-pointer'
            />
            <label 
              htmlFor='threeAndAbove'
              className='flex items-center gap-2 cursor-pointer select-none'
            >
              <div className='flex'>
                {[1, 2, 3].map((star) => (
                  <AiFillStar key={star} className='w-4 h-4 text-yellow-400' />
                ))}
                {[4, 5].map((star) => (
                  <AiOutlineStar key={star} className='w-4 h-4 text-yellow-400' />
                ))}
              </div>
              <span className='text-gray-600 group-hover:text-yellow-600 transition-colors ml-1'>3 & above</span>
            </label>
          </div>
        </div>
      </div>

      {/* Availability Filter */}
      <div className='mb-8'>
        <h3 className='text-lg font-semibold text-gray-800 mb-3'>Availability</h3>
        <div className='flex items-center gap-3 group'>
          <input
            type='checkbox'
            id='availability'
            checked={filters.availability}
            onChange={handleAvailabilityChange}
            className='w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-2 cursor-pointer'
          />
          <label 
            htmlFor='availability'
            className='text-gray-600 hover:text-gray-800 cursor-pointer select-none transition-colors group-hover:text-green-600'
          >
            In Stock Only
          </label>
        </div>
      </div>

      {/* Active Filters Count */}
      <div className='mt-6 p-3 bg-blue-50 rounded-lg'>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-gray-700'>
            <span className='font-semibold'>{getActiveFiltersCount()}</span> filters active
          </span>
          <span className='text-sm text-blue-600 font-medium'>
            {allItems.length} items total
          </span>
        </div>
      </div>
    </div>
  )
}

export default FilterContainer