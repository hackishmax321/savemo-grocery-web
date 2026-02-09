import React from 'react'
import ItemCard from '../cards/ItemCard'

function ItemsContainer({ items = [] }) {
  if (items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] p-8 text-center'>
        <div className='text-gray-400 mb-4'>
          <svg className='w-16 h-16 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
        </div>
        <h3 className='text-xl font-semibold text-gray-600 mb-2'>No items found</h3>
        <p className='text-gray-500'>Try adjusting your filters to see more results</p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 md:p-6'>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}

export default ItemsContainer