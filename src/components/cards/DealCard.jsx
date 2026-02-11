import React, { useState } from 'react';
import { useCart } from '../../providers/CartProvide';

function GroceryDealCard({ deal }) {
  const {
    name,
    brand,
    originalPrice,
    discountedPrice,
    discountPercentage,
    image,
    category,
    dealType,
    dealDescription,
    timeLeft,
    unit,
    rating,
    totalRatings,
    inStock,
    tags
  } = deal;

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();

  // Initialize wishlist state
  React.useEffect(() => {
    setIsWishlisted(isInWishlist(deal.id));
  }, [deal.id, isInWishlist]);

  const handleAddToCart = () => {
    if (inStock) {
      addToCart({ ...deal, type: 'grocery' }, quantity);
      console.log(`${name} added to cart`);
    }
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(deal.id);
      setIsWishlisted(false);
    } else {
      if (addToWishlist({ ...deal, type: 'grocery' })) {
        setIsWishlisted(true);
      }
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const getDealBadgeColor = (type) => {
    const colors = {
      'flash-sale': 'bg-gradient-to-r from-red-500 to-red-600',
      'bogo': 'bg-gradient-to-r from-green-500 to-green-600',
      'limited-time': 'bg-gradient-to-r from-purple-500 to-purple-600',
      'member-only': 'bg-gradient-to-r from-blue-500 to-blue-600',
      'weekend-sale': 'bg-gradient-to-r from-orange-500 to-orange-600',
      'bulk-discount': 'bg-gradient-to-r from-teal-500 to-teal-600',
      'combo': 'bg-gradient-to-r from-pink-500 to-pink-600'
    };
    return colors[type] || 'bg-gray-600';
  };

  const getDealDisplayName = (type) => {
    const names = {
      'flash-sale': 'Flash Sale',
      'bogo': 'Buy 1 Get 1',
      'limited-time': 'Limited Time',
      'member-only': 'Members Only',
      'weekend-sale': 'Weekend Sale',
      'bulk-discount': 'Bulk Discount',
      'combo': 'Combo Deal'
    };
    return names[type] || 'Special Deal';
  };

  const formatPrice = (price) => {
    return `Rs.${price.toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group">
      {/* Top Section - Deal Badge */}
      <div className={`${getDealBadgeColor(dealType)} text-white px-4 py-2 flex justify-between items-center`}>
        <span className="font-bold text-sm tracking-wide">
          {getDealDisplayName(dealType)}
        </span>
        {timeLeft && (
          <div className="flex items-center bg-white/20 px-2 py-1 rounded-full">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-bold">{timeLeft}</span>
          </div>
        )}
      </div>

      <div className='flex'>
        {/* Image Container */}
        <div className="flex-1 relative p-4">
          <div className="relative h-40 md:h-48 overflow-hidden rounded-xl bg-gray-50">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            
            {/* Discount Badge */}
            <div className="absolute top-3 left-3">
              <div className="bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                {discountPercentage}% OFF
              </div>
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <svg
                className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
                fill={isWishlisted ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-2 p-4 pt-0">
          {/* Brand */}
          <div className="mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {brand}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1" title={name}>
            {name}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {tags?.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Deal Description */}
          {dealDescription && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-100 rounded-lg">
              <p className="text-yellow-800 text-sm font-medium">
                ⚡ {dealDescription}
              </p>
            </div>
          )}

          {/* Price Section */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-bold text-2xl text-gray-900">
                {formatPrice(discountedPrice)}
              </span>
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(originalPrice)}
              </span>
              <span className="text-sm font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                Save Rs.{(originalPrice - discountedPrice).toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <span>{unit}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold">{rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-500 text-sm ml-2">
                ({totalRatings} ratings)
              </span>
            </div>
            <div className="text-sm text-gray-600 capitalize">
              {category}
            </div>
          </div>

          {/* Quantity Selector and Add to Cart */}
          <div className="flex items-center gap-3">
            {/* Quantity Selector */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-l-lg"
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="px-4 py-2 font-semibold text-gray-900 min-w-[40px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-r-lg"
                disabled={quantity >= 10}
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                inStock
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {inStock ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </>
              ) : (
                'Out of Stock'
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Details
            </button>
            <button className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center transition-colors">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Quick Look
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

export default GroceryDealCard;