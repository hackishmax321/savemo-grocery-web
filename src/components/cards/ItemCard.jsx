import React, { useEffect, useState } from 'react'
import { useCart } from '../../providers/CartProvide' 
import { useNavigate } from 'react-router-dom';

function ItemCard({ item }) {
  const navigate = useNavigate();
  const { name, description, price, image, categoryId, rating, inStock, id } = item
  const [isWishlisted, setIsWishlisted] = useState(false)
  
  // Use the cart context
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()

  // Initialize wishlist state
  useEffect(() => { 
    setIsWishlisted(isInWishlist(item.id))
  }, [item.id, isInWishlist])

  const handleAddToCart = () => {
    if (inStock) {
      addToCart(item, 1)
      // You can add a toast notification here
      console.log(`${name} added to cart`)
    }
  }

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(item.id)
      setIsWishlisted(false)
      console.log(`${name} removed from wishlist`)
    } else {
      if (addToWishlist(item)) {
        setIsWishlisted(true)
        console.log(`${name} added to wishlist`)
      }
    }
  }

  const handleQuickView = () => {
    navigate(`/products/${item.id || item.docId}`);
  };

  const getCategoryDisplayName = (cat) => {
    const categories = {
      electronics: 'Electronics',
      fashion: 'Fashion',
      homeKitchen: 'Home & Kitchen'
    }
    return cat
  }

  return (
    <div className='bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100'>
      {/* Image Container */}
      <div className='relative h-48 md:h-56 overflow-hidden bg-gray-50'>
        <img 
          src={image} 
          alt={name}
          className='w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300'
          loading='lazy'
        />
        {/* Stock Status Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {inStock ? 'In Stock' : 'Out of Stock'}
        </div>
        {/* Category Badge */}
        <div className='absolute top-2 left-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold'>
          {getCategoryDisplayName(categoryId)}
        </div>
      </div>

      {/* Content Container */}
      <div className='p-4'>
        {/* Title and Rating */}
        <div className='flex justify-between items-start mb-2'>
          <h3 className='font-bold text-gray-900 text-lg truncate pr-2' title={name}>
            {name}
          </h3>
          <div className='flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-semibold min-w-[60px] justify-center'>
            <svg className='w-4 h-4 mr-1' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
            </svg>
            {rating.toFixed(1)}
          </div>
        </div>

        {/* Description */}
        <p className='text-gray-600 text-sm mb-3 line-clamp-2 min-h-[40px]'>
          {description}
        </p>

        {/* Price and Action Button */}
        <div className='flex justify-between items-center'>
          <div>
            <span className='font-bold text-xl text-gray-900 mr-1'>Rs.{price.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleAddToCart} // Updated to use handleAddToCart
            className={`px-4 py-2 text-xs rounded-lg font-medium transition-all duration-200 ${inStock ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            disabled={!inStock}
          >
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>

        {/* Quick Actions */}
        <div className='flex justify-between mt-4 pt-4 border-t border-gray-100'>
          <button 
            onClick={handleWishlistToggle} // Updated to use handleWishlistToggle
            className={`text-sm font-medium flex items-center transition-colors ${isWishlisted ? 'text-red-600 hover:text-red-800' : 'text-blue-600 hover:text-blue-800'}`}
          >
            <svg className='w-4 h-4 mr-1' fill={isWishlisted ? 'currentColor' : 'none'} stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
            </svg>
            {isWishlisted ? 'Wishlisted' : 'Wishlist'}
          </button>
          <button 
            onClick={handleQuickView} // Updated to use handleQuickView
            className='text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center transition-colors'
          >
            <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
            </svg>
            Quick View
          </button>
        </div>
      </div>
    </div>
  )
}

export default ItemCard