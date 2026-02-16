import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaStar, FaRegStar, FaStarHalfAlt, FaTruck, FaShieldAlt, FaUndo, FaShare, FaChevronLeft, FaCheckCircle } from 'react-icons/fa';
import groceryService from '../services/Item.service';
import { useCart } from '../providers/CartProvide';
import { Categories } from '../constants/Categories';

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [similarItems, setSimilarItems] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();

  // Load item details
  useEffect(() => {
    loadItemDetails();
  }, [id]);

  // Load similar items when item is loaded
  useEffect(() => {
    if (item) {
      loadSimilarItems();
      setIsWishlisted(isInWishlist(item.docId || item.id));
    }
  }, [item]);

  const loadItemDetails = async () => {
    setLoading(true);
    try {
      const result = await groceryService.getItem(id);
      if (result) {
        setItem(result);
      } else {
        setError('Item not found');
      }
    } catch (err) {
      console.error('Error loading item details:', err);
      setError('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const loadSimilarItems = async () => {
    try {
      // Get items from same category
      const result = await groceryService.getAllItems({
        category: item.category,
        isActive: true
      }, 6); // Get 6 items to filter out current item

      if (result.success) {
        // Filter out current item and limit to 5
        const filtered = result.items
          .filter(i => (i.docId || i.id) !== (item.docId || item.id))
          .slice(0, 5);
        setSimilarItems(filtered);
      }
    } catch (err) {
      console.error('Error loading similar items:', err);
    }
  };

  const handleAddToCart = () => {
    if (item.inStock) {
      addToCart(item, quantity);
      // Show success feedback
      alert(`${quantity} x ${item.name} added to cart`);
    }
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(item.docId || item.id);
      setIsWishlisted(false);
    } else {
      addToWishlist(item);
      setIsWishlisted(true);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (item.quantity || 10)) {
      setQuantity(newQuantity);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = Categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400 w-5 h-5" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 w-5 h-5" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400 w-5 h-5" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-primary mt-16 md:mt-20'>
        <div className='text-center'>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-font-secondary mx-auto mb-4"></div>
          <p className='text-gray-600'>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-primary mt-16 md:mt-20'>
        <div className='text-center'>
          <div className='text-red-500 text-5xl mb-4'>⚠️</div>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>Product Not Found</h2>
          <p className='text-gray-600 mb-6'>{error || 'The product you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/products')}
            className='px-6 py-3 bg-font-secondary text-white rounded-lg hover:bg-font-alternate transition-colors'
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  // Transform item to match expected format
  const displayItem = {
    ...item,
    id: item.docId || item.id,
    images: item.images?.length > 0 ? item.images : [item.image || 'https://via.placeholder.com/600x600?text=No+Image'],
    inStock: item.stockStatus !== 'out_of_stock' && item.quantity > 0,
    categoryName: item.category || getCategoryName(item.categoryId)
  };

  return (
    <div className='min-h-screen px-4 sm:px-8 lg:px-12 py-8 bg-primary mt-16 md:mt-20'>
      <div className='max-w-7xl mx-auto'>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className='flex items-center gap-2 text-gray-600 hover:text-font-secondary mb-6 transition-colors'
        >
          <FaChevronLeft className="text-sm" />
          Back to Products
        </button>

        {/* Main Product Section - Two Column Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16'>
          {/* Left Column - Images */}
          <div className='space-y-4'>
            {/* Main Image */}
            <div className='bg-white rounded-2xl p-8 shadow-xl border border-gray-100'>
              <div className='relative aspect-square'>
                <img
                  src={displayItem.images[selectedImage]}
                  alt={displayItem.name}
                  className='w-full h-full object-contain'
                />
                {/* Sale Badge */}
                {displayItem.isOnSale && (
                  <div className='absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold'>
                    Sale {displayItem.discountPercentage}% Off
                  </div>
                )}
                {/* Stock Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${
                  displayItem.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {displayItem.inStock ? 'In Stock' : 'Out of Stock'}
                </div>
              </div>
            </div>

            {/* Thumbnail Images */}
            {displayItem.images.length > 1 && (
              <div className='grid grid-cols-5 gap-4'>
                {displayItem.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`bg-white rounded-lg p-2 border-2 transition-all ${
                      selectedImage === index ? 'border-font-secondary' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`${displayItem.name} ${index + 1}`} className='w-full h-20 object-contain' />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className='bg-white rounded-2xl p-8 shadow-xl border border-gray-100'>
            {/* Category & Brand */}
            <div className='flex items-center gap-3 mb-4'>
              <span className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold'>
                {displayItem.categoryName}
              </span>
              {displayItem.subCategory && (
                <span className='px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm'>
                  {displayItem.subCategory}
                </span>
              )}
              {displayItem.brand && (
                <span className='text-sm text-gray-500'>{displayItem.brand}</span>
              )}
            </div>

            {/* Title */}
            <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
              {displayItem.name}
            </h1>

            {/* Rating */}
            <div className='flex items-center gap-3 mb-6'>
              <div className='flex items-center gap-1'>
                {renderRatingStars(displayItem.ratings?.average || 0)}
              </div>
              <span className='text-gray-600'>
                ({displayItem.ratings?.count || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className='mb-6'>
              {displayItem.isOnSale && displayItem.discountPercentage > 0 ? (
                <div className='flex items-center gap-3'>
                  <span className='text-3xl font-bold text-font-secondary'>
                    Rs.{(displayItem.price * (1 - displayItem.discountPercentage / 100)).toFixed(2)}
                  </span>
                  <span className='text-xl text-gray-400 line-through'>
                    Rs.{displayItem.price.toFixed(2)}
                  </span>
                  <span className='px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold'>
                    Save {displayItem.discountPercentage}%
                  </span>
                </div>
              ) : (
                <span className='text-3xl font-bold text-font-secondary'>
                  Rs.{displayItem.price.toFixed(2)}
                </span>
              )}
              <p className='text-sm text-gray-500 mt-1'>Inclusive of all taxes</p>
            </div>

            {/* Unit & Quantity */}
            <div className='mb-6'>
              <p className='text-sm text-gray-600 mb-2'>Unit: {displayItem.unit}</p>
              <div className='flex items-center gap-4'>
                <div className='flex items-center border border-gray-300 rounded-lg'>
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className='px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    -
                  </button>
                  <span className='px-4 py-2 border-x border-gray-300 font-medium text-black/80'>{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (displayItem.quantity || 10)}
                    className='px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    +
                  </button>
                </div>
                <span className='text-sm text-gray-500'>
                  {displayItem.quantity} units available
                </span>
              </div>
            </div>

            {/* Description */}
            <div className='mb-8'>
              <h3 className='font-semibold text-gray-800 mb-2'>Description</h3>
              <p className='text-gray-600 leading-relaxed'>
                {displayItem.description || 'No description available.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-4 mb-8'>
              <button
                onClick={handleAddToCart}
                disabled={!displayItem.inStock}
                className={`flex-1 px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all ${
                  displayItem.inStock
                    ? 'bg-font-secondary hover:bg-font-alternate text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FaShoppingCart className="text-xl" />
                {displayItem.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all border-2 ${
                  isWishlisted
                    ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                    : 'border-gray-300 text-gray-700 hover:border-font-secondary hover:bg-gray-50'
                }`}
              >
                <FaHeart className={`text-xl ${isWishlisted ? 'fill-current' : ''}`} />
                {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Features */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200'>
              <div className='text-center'>
                <FaTruck className='text-2xl text-font-secondary mx-auto mb-2' />
                <p className='text-xs text-gray-600'>Free Delivery</p>
                <p className='text-xs text-gray-500'>On orders over Rs.5000</p>
              </div>
              <div className='text-center'>
                <FaShieldAlt className='text-2xl text-font-secondary mx-auto mb-2' />
                <p className='text-xs text-gray-600'>Secure Payment</p>
                <p className='text-xs text-gray-500'>SSL 128bit encrypted</p>
              </div>
              <div className='text-center'>
                <FaUndo className='text-2xl text-font-secondary mx-auto mb-2' />
                <p className='text-xs text-gray-600'>Easy Returns</p>
                <p className='text-xs text-gray-500'>24h - 5 days policy</p>
              </div>
              <div className='text-center'>
                <FaCheckCircle className='text-2xl text-font-secondary mx-auto mb-2' />
                <p className='text-xs text-gray-600'>Quality Assured</p>
                <p className='text-xs text-gray-500'>Fresh & authentic</p>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Items Section */}
        {similarItems.length > 0 && (
          <div className='mt-16'>
            <div className='flex items-center justify-between mb-8'>
              <div>
                <h2 className='text-2xl md:text-3xl font-bold text-gray-800'>Similar Products</h2>
                <p className='text-gray-600 mt-2'>
                  Items similar to {displayItem.name} in {displayItem.categoryName}
                </p>
              </div>
              <button
                onClick={() => navigate(`/products?category=${encodeURIComponent(displayItem.categoryName)}`)}
                className='text-font-secondary hover:text-font-alternate font-medium'
              >
                View All →
              </button>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'>
              {similarItems.map((similarItem) => (
                <div
                  key={similarItem.docId || similarItem.id}
                  onClick={() => navigate(`/products/${similarItem.docId || similarItem.id}`)}
                  className='bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden group'
                >
                  <div className='relative h-40 bg-gray-50 p-4'>
                    <img
                      src={similarItem.images?.[0] || similarItem.image || 'https://via.placeholder.com/200x200?text=Product'}
                      alt={similarItem.name}
                      className='w-full h-full object-contain group-hover:scale-110 transition-transform duration-300'
                    />
                    {/* Stock Indicator */}
                    <div className={`absolute bottom-2 right-2 w-3 h-3 rounded-full ${
                      similarItem.stockStatus !== 'out_of_stock' && similarItem.quantity > 0
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`} />
                  </div>
                  <div className='p-4'>
                    <h3 className='font-semibold text-gray-800 mb-1 truncate'>
                      {similarItem.name}
                    </h3>
                    <div className='flex items-center gap-1 mb-2'>
                      {renderRatingStars(similarItem.ratings?.average || 0)}
                      <span className='text-xs text-gray-500 ml-1'>
                        ({similarItem.ratings?.count || 0})
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='font-bold text-font-secondary'>
                        Rs.{similarItem.price?.toFixed(2)}
                      </span>
                      {similarItem.isOnSale && (
                        <span className='text-xs bg-red-100 text-red-800 px-2 py-1 rounded'>
                          -{similarItem.discountPercentage}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Similar Items Message */}
        {similarItems.length === 0 && (
          <div className='mt-16 p-8 bg-gray-50 rounded-xl text-center'>
            <p className='text-gray-600'>No similar items found in this category.</p>
            <button
              onClick={() => navigate('/products')}
              className='mt-4 text-font-secondary hover:text-font-alternate font-medium'
            >
              Browse all products →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailsPage;