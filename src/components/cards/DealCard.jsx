import React, { useState } from 'react';
import { useCart } from '../../providers/CartProvide';

function GroceryDealCard({ deal }) {
  const {
    id,
    name,
    brand,
    originalPrice,
    discountedPrice,
    discountPercentage,
    image,
    category,
    subCategory,
    dealType,
    dealDescription,
    promoCode,
    timeLeft,
    unit,
    rating,
    totalRatings,
    inStock,
    stockQuantity,
    tags,
    minimumPurchase,
    maximumDiscount,
    usageLimit,
    usageCount,
    customerEligibility,
    termsAndConditions,
    startDate,
    endDate
  } = deal;

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showTerms, setShowTerms] = useState(false);
  
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();

  // Initialize wishlist state
  React.useEffect(() => {
    setIsWishlisted(isInWishlist(id));
  }, [id, isInWishlist]);

  const handleAddToCart = () => {
    if (inStock && (!minimumPurchase || quantity * discountedPrice >= minimumPurchase)) {
      addToCart({ 
        ...deal, 
        type: 'grocery',
        appliedPromoCode: promoCode,
        discountApplied: originalPrice - discountedPrice
      }, quantity);
      console.log(`${name} added to cart with ${discountPercentage}% discount`);
    }
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(id);
      setIsWishlisted(false);
    } else {
      if (addToWishlist({ ...deal, type: 'grocery' })) {
        setIsWishlisted(true);
      }
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10 && newQuantity <= (stockQuantity || 10)) {
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
      'combo': 'bg-gradient-to-r from-pink-500 to-pink-600',
      'special-deal': 'bg-gradient-to-r from-gray-500 to-gray-600'
    };
    return colors[type] || 'bg-gradient-to-r from-indigo-500 to-indigo-600';
  };

  const getDealDisplayName = (type) => {
    const names = {
      'flash-sale': '⚡ Flash Sale',
      'bogo': '🎁 Buy 1 Get 1',
      'limited-time': '⏳ Limited Time',
      'member-only': '👑 Members Only',
      'weekend-sale': '🎉 Weekend Sale',
      'bulk-discount': '📦 Bulk Discount',
      'combo': '🔄 Combo Deal',
      'special-deal': '🏷️ Special Offer'
    };
    return names[type] || '🔥 Hot Deal';
  };

  const formatPrice = (price) => {
    return `Rs.${price?.toFixed(2) || '0.00'}`;
  };

  const getSavingsAmount = () => {
    return (originalPrice - discountedPrice) * quantity;
  };

  const getMinimumPurchaseMessage = () => {
    if (!minimumPurchase || minimumPurchase <= 0) return null;
    const remaining = minimumPurchase - (quantity * discountedPrice);
    if (remaining > 0) {
      return `Add Rs.${remaining.toFixed(2)} more to qualify`;
    }
    return null;
  };

  const getUsageStatus = () => {
    if (!usageLimit) return null;
    const percentage = (usageCount / usageLimit) * 100;
    const remaining = usageLimit - usageCount;
    return { percentage, remaining };
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const usageStatus = getUsageStatus();
  const minimumPurchaseMessage = getMinimumPurchaseMessage();

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group relative" 
    style={deal.bannerImage ? {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url(${deal.bannerImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : {}}>
      {/* Top Section - Deal Badge */}
      <div className={`${getDealBadgeColor(dealType)} text-white px-4 py-3 flex justify-between items-center`}>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm tracking-wide">
            {getDealDisplayName(dealType)}
          </span>
          {promoCode && (
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-mono">
              {promoCode}
            </span>
          )}
        </div>
        {timeLeft && timeLeft !== 'Expired' && (
          <div className="flex items-center bg-white/20 px-2 py-1 rounded-full">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-bold">{timeLeft}</span>
          </div>
        )}
      </div>

      <div className='flex flex-col md:flex-row'>
        {/* Image Container */}
        <div className="md:w-1/3 relative p-4">
          <div className="relative h-40 md:h-48 overflow-hidden rounded-xl bg-gray-50">
            <img
              src={image || 'https://via.placeholder.com/300'}
              alt={name}
              className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300';
              }}
            />
            
            {/* Discount Badge */}
            <div className="absolute top-3 left-3">
              <div className="bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                {discountPercentage}% OFF
              </div>
            </div>

            {/* Eligibility Badge */}
            {customerEligibility && customerEligibility !== 'all' && (
              <div className="absolute bottom-3 left-3">
                <div className="bg-purple-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-lg">
                  {customerEligibility === 'new' ? '🆕 New Customers' : 
                   customerEligibility === 'vip' ? '👑 VIP Only' : 
                   customerEligibility === 'existing' ? '🤝 Existing' : ''}
                </div>
              </div>
            )}

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

        <div className="md:w-2/3 p-4 pt-0 md:pt-4">
          {/* Brand and Category */}
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {brand}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {category} {subCategory && `• ${subCategory}`}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1" title={name}>
            {name}
          </h3>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Deal Description */}
          {dealDescription && (
            <div className="mb-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm font-medium flex items-start">
                <span className="text-lg mr-2">⚡</span>
                {dealDescription}
              </p>
            </div>
          )}

          {/* Price Section */}
          <div className="mb-3">
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <span className="font-bold text-2xl text-gray-900">
                {formatPrice(discountedPrice)}
              </span>
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(originalPrice)}
              </span>
              <span className="text-sm font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                Save Rs.{(originalPrice - discountedPrice).toFixed(2)} each
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{unit}</span>
              {stockQuantity !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  stockQuantity > 10 ? 'bg-green-100 text-green-700' :
                  stockQuantity > 0 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {stockQuantity > 10 ? 'In Stock' :
                   stockQuantity > 0 ? `Only ${stockQuantity} left` :
                   'Out of Stock'}
                </span>
              )}
            </div>
          </div>

          {/* Minimum Purchase Warning */}
          {minimumPurchaseMessage && (
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-xs flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {minimumPurchaseMessage}
              </p>
            </div>
          )}

          {/* Usage Status */}
          {usageStatus && usageStatus.remaining > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">Deal Usage</span>
                <span className="text-gray-800 font-medium">
                  {usageCount} / {usageLimit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${Math.min(usageStatus.percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center mb-3">
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
          )}

          {/* Total Savings for quantity */}
          {quantity > 1 && (
            <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm font-medium">
                Total Savings: {formatPrice(getSavingsAmount())}
              </p>
            </div>
          )}

          {/* Quantity Selector and Add to Cart */}
          <div className="flex items-center gap-3">
            {/* Quantity Selector */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="px-4 py-2 font-semibold text-gray-900 min-w-[40px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={quantity >= 10 || quantity >= (stockQuantity || 10)}
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock || (minimumPurchase && quantity * discountedPrice < minimumPurchase)}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                inStock && (!minimumPurchase || quantity * discountedPrice >= minimumPurchase)
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
            <button
              onClick={() => setShowTerms(!showTerms)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showTerms ? 'Hide Terms' : 'Terms & Conditions'}
            </button>
            <div className="text-xs text-gray-500">
              Valid until: {formatDate(endDate)}
            </div>
          </div>

          {/* Terms and Conditions */}
          {showTerms && termsAndConditions && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
              <p className="font-medium mb-1">Terms & Conditions:</p>
              <p>{termsAndConditions}</p>
              {minimumPurchase > 0 && (
                <p className="mt-1">• Minimum purchase: Rs.{minimumPurchase}</p>
              )}
              {maximumDiscount > 0 && (
                <p className="mt-1">• Maximum discount: Rs.{maximumDiscount}</p>
              )}
              {usageLimit > 0 && (
                <p className="mt-1">• Limited to {usageLimit} uses</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroceryDealCard;