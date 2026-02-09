import React, { useState } from 'react'
import ItemsContainer from '../components/container/ItemsContainer'
import FilterContainer from '../components/container/FilterContainer'
import { sampleItems } from '../constants/SampleItems'

function ItemsPage() {
  const [filteredItems, setFilteredItems] = useState(sampleItems)

  const handleFilterChange = (filteredItems) => {
    setFilteredItems(filteredItems)
  }

  return (
    <div className='w-full c-space section-spacing bg-primary py-5'>
      <div className='flex relative'>
        <div className='flex-1 w-full mt-3'>
          <FilterContainer 
            allItems={sampleItems} 
            onFilterChange={handleFilterChange}
          />
        </div>
        <div className='flex-3 w-full'>
          <ItemsContainer items={filteredItems} />
        </div>
      </div>
    </div>
  )
}

export default ItemsPage