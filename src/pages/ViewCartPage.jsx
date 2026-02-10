import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineDelete, AiOutlinePlus, AiOutlineMinus, AiOutlineArrowLeft, AiOutlineShoppingCart, AiOutlineHeart, AiOutlineShareAlt } from 'react-icons/ai';
import { MdLocalShipping, MdSecurity } from 'react-icons/md';
import { RiRefund2Line } from 'react-icons/ri';
import { useCart } from '../providers/CartProvide';

function ViewCartPage() {
  const { cart, updateCartItemQuantity, removeFromCart, getCartTotal, getCartItemCount, clearCart } = useCart();
  const navigate = useNavigate();
  
  const subtotal = getCartTotal();
  const shippingFee = subtotal > 5000 ? 0 : 250;
  const tax = subtotal * 0.12; // 12% tax
  const total = subtotal + shippingFee + tax;

  const handleIncreaseQuantity = (itemId) => {
    const item = cart.find(item => item.id === itemId);
    if (item) {
      updateCartItemQuantity(itemId, item.quantity + 1);
    }
  };

  const handleDecreaseQuantity = (itemId) => {
    const item = cart.find(item => item.id === itemId);
    if (item && item.quantity > 1) {
      updateCartItemQuantity(itemId, item.quantity - 1);
    }
  };

  const handleRemoveItem = (itemId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      removeFromCart(itemId);
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/items');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  if (cart.length === 0) {
    return (
      <div className='w-full mt-15 min-h-screen bg-gray-50 py-5'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='text-center py-16'>
            <div className='inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-6'>
              <AiOutlineShoppingCart className='text-5xl text-blue-600' />
            </div>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>Your cart is empty</h2>
            <p className='text-gray-600 mb-8 max-w-md mx-auto'>
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                to='/items'
                className='px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center'
              >
                <AiOutlineArrowLeft className='mr-2' />
                Continue Shopping
              </Link>
              <Link
                to='/deals'
                className='px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-colors'
              >
                View Today's Deals
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full mt-15 min-h-screen bg-gray-50 py-5'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Shopping Cart</h1>
          <div className='flex items-center text-gray-600'>
            <AiOutlineShoppingCart className='mr-2' />
            <span>{getCartItemCount()} items in your cart</span>
            <button
              onClick={handleClearCart}
              className='ml-auto text-sm text-red-600 hover:text-red-800 flex items-center'
            >
              <AiOutlineDelete className='mr-1' />
              Clear Cart
            </button>
          </div>
        </div>

        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Left Column - Cart Items */}
          <div className='lg:w-2/3'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
              {/* Cart Items List */}
              <div className='divide-y divide-gray-100'>
                {cart.map((item) => (
                  <div key={item.id} className='p-6 hover:bg-gray-50 transition-colors'>
                    <div className='flex flex-col sm:flex-row gap-6'>
                      {/* Product Image */}
                      <div className='flex-shrink-0 w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-gray-100'>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='w-full h-full object-contain p-3'
                        />
                      </div>

                      {/* Product Details */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex flex-col sm:flex-row sm:justify-between gap-4'>
                          <div className='flex-1'>
                            <h3 className='font-semibold text-lg text-gray-900 mb-1'>
                              <Link to={`/item/${item.id}`} className='hover:text-blue-600'>
                                {item.name}
                              </Link>
                            </h3>
                            {item.brand && (
                              <p className='text-sm text-gray-500 mb-2'>Brand: {item.brand}</p>
                            )}
                            {item.category && (
                              <span className='inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mb-3'>
                                {item.category}
                              </span>
                            )}
                          </div>
                          <div className='text-right'>
                            <div className='font-bold text-xl text-gray-900 mb-2'>
                              Rs.{(item.price * item.quantity).toFixed(2)}
                            </div>
                            <div className='text-sm text-gray-600'>
                              <span className='text-red-600 font-medium'>Rs.{item.price.toFixed(2)}</span> each
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className='flex items-center justify-between mt-4'>
                          <div className='flex items-center gap-4'>
                            <div className='flex items-center border border-gray-300 rounded-lg'>
                              <button
                                onClick={() => handleDecreaseQuantity(item.id)}
                                className='w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed'
                                disabled={item.quantity <= 1}
                              >
                                <AiOutlineMinus className='w-4 h-4' />
                              </button>
                              <span className='w-12 text-center font-semibold text-gray-900'>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleIncreaseQuantity(item.id)}
                                className='w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-r-lg'
                              >
                                <AiOutlinePlus className='w-4 h-4' />
                              </button>
                            </div>
                            
                            <div className='flex items-center gap-2'>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className='p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center'
                              >
                                <AiOutlineDelete className='w-5 h-5 mr-1' />
                                <span className='text-sm'>Remove</span>
                              </button>
                              <button className='p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center'>
                                <AiOutlineHeart className='w-5 h-5 mr-1' />
                                <span className='text-sm'>Save</span>
                              </button>
                            </div>
                          </div>

                          <div className='text-right'>
                            <div className='text-sm text-gray-500 mb-1'>Subtotal</div>
                            <div className='font-bold text-lg text-blue-600'>
                              Rs.{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Actions */}
              <div className='p-6 bg-gray-50 border-t border-gray-200'>
                <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
                  <button
                    onClick={handleContinueShopping}
                    className='px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center'
                  >
                    <AiOutlineArrowLeft className='mr-2' />
                    Continue Shopping
                  </button>
                  
                  <div className='flex gap-3'>
                    <button className='px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center'>
                      <AiOutlineShareAlt className='mr-2' />
                      Share Cart
                    </button>
                    <button
                      onClick={handleClearCart}
                      className='px-6 py-3 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition-colors'
                    >
                      Clear Entire Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4'>
                <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0'>
                  <MdLocalShipping className='text-2xl text-blue-600' />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900'>Free Shipping</h4>
                  <p className='text-sm text-gray-600'>On orders over Rs.5000</p>
                </div>
              </div>
              
              <div className='bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4'>
                <div className='w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0'>
                  <RiRefund2Line className='text-2xl text-green-600' />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900'>Easy Returns</h4>
                  <p className='text-sm text-gray-600'>30-day return policy</p>
                </div>
              </div>
              
              <div className='bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4'>
                <div className='w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0'>
                  <MdSecurity className='text-2xl text-purple-600' />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900'>Secure Payment</h4>
                  <p className='text-sm text-gray-600'>100% secure & safe</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className='lg:w-1/3'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 sticky top-24'>
              <div className='p-6'>
                <h2 className='text-xl font-bold text-gray-900 mb-6'>Order Summary</h2>
                
                {/* Price Breakdown */}
                <div className='space-y-4 mb-6'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Subtotal ({getCartItemCount()} items)</span>
                    <span className='font-medium'>Rs.{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Shipping</span>
                    <span className={shippingFee === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                      {shippingFee === 0 ? 'FREE' : `Rs.${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Tax (12%)</span>
                    <span className='font-medium'>Rs.{tax.toFixed(2)}</span>
                  </div>
                  
                  <div className='border-t border-gray-200 pt-4'>
                    <div className='flex justify-between text-lg font-bold'>
                      <span>Total</span>
                      <span className='text-blue-600'>Rs.{total.toFixed(2)}</span>
                    </div>
                    <p className='text-sm text-gray-500 mt-1'>Including all taxes</p>
                  </div>
                </div>

                {/* Discount Code */}
                <div className='mb-6'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Discount Code
                  </label>
                  <div className='flex gap-2'>
                    <input
                      type='text'
                      placeholder='Enter promo code'
                      className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                    />
                    <button className='px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors'>
                      Apply
                    </button>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToCheckout}
                  className='w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 mb-4 shadow-lg hover:shadow-xl'
                >
                  Proceed to Checkout
                </button>

                {/* Payment Methods */}
                <div className='text-center'>
                  <p className='text-sm text-gray-600 mb-3'>We accept</p>
                  <div className='flex justify-center gap-4'>
                    <div className='w-10 h-6 bg-gray-200 rounded flex items-center justify-center'>
                      <span className='text-xs font-bold text-gray-700'>VISA</span>
                    </div>
                    <div className='w-10 h-6 bg-blue-100 rounded flex items-center justify-center'>
                      <span className='text-xs font-bold text-blue-700'>MC</span>
                    </div>
                    <div className='w-10 h-6 bg-yellow-100 rounded flex items-center justify-center'>
                      <span className='text-xs font-bold text-yellow-700'>PP</span>
                    </div>
                    <div className='w-10 h-6 bg-gray-900 rounded flex items-center justify-center'>
                      <span className='text-xs font-bold text-white'>COD</span>
                    </div>
                  </div>
                </div>

                {/* Safe Shopping Guarantee */}
                <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <MdSecurity className='text-blue-600 text-xl flex-shrink-0' />
                    <div>
                      <p className='text-sm text-blue-800 font-medium'>Safe Shopping Guarantee</p>
                      <p className='text-xs text-blue-700'>Your information is protected by 256-bit SSL encryption</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Help Section */}
            <div className='mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
              <h3 className='font-semibold text-gray-900 mb-4'>Need Help?</h3>
              <div className='space-y-3'>
                <Link to='/faq' className='flex items-center text-blue-600 hover:text-blue-800'>
                  <span className='text-sm'>Shipping Information</span>
                </Link>
                <Link to='/returns' className='flex items-center text-blue-600 hover:text-blue-800'>
                  <span className='text-sm'>Return Policy</span>
                </Link>
                <Link to='/contact' className='flex items-center text-blue-600 hover:text-blue-800'>
                  <span className='text-sm'>Contact Support</span>
                </Link>
              </div>
              <div className='mt-4 pt-4 border-t border-gray-200'>
                <p className='text-sm text-gray-600'>Call us at: <span className='font-semibold text-gray-900'>0112-XXX-XXX</span></p>
                <p className='text-xs text-gray-500 mt-1'>Mon-Fri, 9AM-6PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Viewed Suggestions (Optional) */}
        <div className='mt-12'>
          <h3 className='text-xl font-bold text-gray-900 mb-6'>Frequently Bought Together</h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {/* You can map through suggested items here */}
            <div className='bg-white p-4 rounded-xl border border-gray-200 text-center'>
              <div className='w-20 h-20 mx-auto mb-3 bg-gray-100 rounded-lg'></div>
              <p className='text-sm text-gray-600 mb-2'>Product Suggestion 1</p>
              <button className='text-sm text-blue-600 hover:text-blue-800 font-medium'>
                + Add to Cart
              </button>
            </div>
            {/* Add more suggestions as needed */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewCartPage;