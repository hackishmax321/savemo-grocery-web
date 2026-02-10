import React, { useState } from 'react'
import ItemsContainer from '../components/container/ItemsContainer'
import { sampleItems } from '../constants/SampleItems'
import { groceryDeals } from '../constants/GroceryDeals'
import HomeCarousel from '../components/slider/HomeCarousel'
import DealsContainer from '../components/container/DealsContainer'

function OpenPage() {
  const [filteredItems, setFilteredItems] = useState(sampleItems)

  // Optional: If you still want some filtering functionality without UI
  const handleFilterChange = (filteredItems) => {
    setFilteredItems(filteredItems)
  }

  return (
    <div className='w-full mt-15 min-h-screen bg-primary py-5'>
        <div className='bg-secondary h-150'>
            {/* Slider */}
            <HomeCarousel />
        </div>
        <div className='max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8'>
            <h1 className='text-4xl text-font-secondary font-bold'>Trending Items</h1>
            <ItemsContainer items={filteredItems} />
        </div>
        <div className='max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8'>
            <h1 className='text-4xl text-font-secondary font-bold'>Featured Deals</h1>
            <DealsContainer deals={groceryDeals} />
        </div>
    </div>
  )
}

export default OpenPage