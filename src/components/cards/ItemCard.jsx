import React, { useEffect, useState } from 'react'
import { useCart } from '../../providers/CartProvide' 
import { useNavigate } from 'react-router-dom';
import Notiflix from 'notiflix';

function ItemCard({ item }) {
  const navigate = useNavigate();
  const { name, description, price, image, categoryId, rating, inStock, id } = item
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showLoginHint, setShowLoginHint] = useState(false)
  
  // Use the cart context
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()

  Notiflix.Notify.init({
    position: 'right-bottom',
    distance: '15px',
    timeout: 3000,
    clickToClose: true,
  });

  // Check authentication status
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const userStr = sessionStorage.getItem('currentUser');
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    
    if (userStr && isAuthenticated) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  };

  // Initialize wishlist state
  useEffect(() => { 
    setIsWishlisted(isInWishlist(item.id))
  }, [item.id, isInWishlist])

  const handleAddToCart = () => {
    // Check if user is logged in
    if (!currentUser) {
      setShowLoginHint(true);
      // Auto-hide hint after 3 seconds
      setTimeout(() => setShowLoginHint(false), 3000);
      return;
    }

    if (inStock) {
      addToCart(item, 1)
      Notiflix.Notify.success(`${name} added to cart successfully!`);
    } else {
      Notiflix.Notify.failure('Sorry! This item is out of stock.');
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
    window.scrollTo(0, 0)
    navigate(`/products/${item.id || item.docId}`);
  };

  const handleLoginClick = () => {
    // You can replace this with your actual login navigation
    navigate('/login', { state: { from: '/' } });
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
    <div className='bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 relative'>
      {/* Image Container */}
      <div className='relative h-48 md:h-56 overflow-hidden bg-gray-50'>
        <img 
          src={image} 
          alt={name}
          className='w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300'
          loading='lazy'
          onError={(e) => {
            e.target.src = 'https://png.pngtree.com/png-vector/20190501/ourmid/pngtree-verified-cart-items-icon-design-png-image_1013191.png';
          }}
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
          {/* Rating comment kept for reference */}
        </div>

        {/* Description */}
        <p className='text-gray-600 text-sm mb-3 line-clamp-2 min-h-[40px]'>
          {description}
        </p>

        {/* Price and Action Button - Responsive Layout */}
        <div className='flex flex-row lg:flex-col lg:justify-between lg:items-center gap-3 lg:gap-0'>
          {/* Price - Centered on mobile, left-aligned on desktop */}
          <div className='text-center sm:text-left'>
            <span className='font-bold text-xl text-gray-900'>Rs.{price.toFixed(2)}</span>
          </div>
          
          {/* Action Button - Full width on mobile, auto on desktop */}
          <div className='relative w-full sm:w-auto'>
            {!currentUser && inStock ? (
              <div className='relative w-full sm:w-auto'>
                <button 
                  onClick={handleAddToCart}
                  className='w-full sm:w-auto px-4 py-2 text-xs rounded-lg font-medium transition-all duration-200 bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2'
                >
                  Add to Cart
                </button>
                {/* Login Hint Bubble */}
                {showLoginHint && (
                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 sm:w-56 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 text-center z-10 shadow-xl'>
                    <div className='relative'>
                      🔒 Please login to add items to cart
                      <div className='absolute top-full left-1/2 transform -translate-x-1/2 -mt-1'>
                        <div className='border-8 border-transparent border-t-gray-900'></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={handleAddToCart}
                className={`w-full sm:w-auto px-4 py-2 text-xs rounded-lg font-medium transition-all duration-200 ${
                  inStock 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!inStock}
              >
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className='flex justify-between mt-4 pt-4 border-t border-gray-100'>
          <button 
            onClick={handleWishlistToggle}
            className={`text-sm font-medium flex items-center transition-colors ${
              isWishlisted ? 'text-red-600 hover:text-red-800' : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            <svg className='w-4 h-4 mr-1' fill={isWishlisted ? 'currentColor' : 'none'} stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
            </svg>
            {isWishlisted ? 'Wishlisted' : 'Wishlist'}
          </button>
          <button 
            onClick={handleQuickView}
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