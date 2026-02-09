import React, { useState } from 'react'
import ItemsContainer from '../components/container/ItemsContainer'
import { sampleItems } from '../constants/SampleItems'

function OpenPage() {
  const [filteredItems, setFilteredItems] = useState(sampleItems)

  // Optional: If you still want some filtering functionality without UI
  const handleFilterChange = (filteredItems) => {
    setFilteredItems(filteredItems)
  }

  return (
    <div className='w-full mt-15 min-h-screen bg-primary py-5'>
        <div className='bg-secondary h-90'>
            {/* Slider */}
            <h1>Slider</h1>
        </div>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <ItemsContainer items={filteredItems} />
        </div>
    </div>
  )
}

export default OpenPage