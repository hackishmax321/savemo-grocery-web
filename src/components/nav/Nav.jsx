import React, { useState, useEffect } from 'react'
import { AiFillCloseSquare, AiOutlineMenu, AiOutlineSearch, AiOutlineSetting, AiOutlineShoppingCart, AiOutlineUser, AiOutlineDelete, AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai'
import { Link } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import { useCart } from '../../providers/CartProvide' 

function Nav() {
  const [logged, setLogged] = useState(false)
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isMobile = useMediaQuery({maxWidth: 853})
  const [isMobileNav, setIsMobileNav] = useState(false)
  
  // Use cart context
  const { cart, getCartItemCount, updateCartItemQuantity, removeFromCart, getCartTotal } = useCart()

  const handleLogout = () => {
    setLogged(false)
    setIsOpen(false)
    // Add your logout logic here
  }

  const handleCartToggle = () => {
    setIsCartOpen(!isCartOpen)
    // Close profile dropdown if open
    if (isOpen) setIsOpen(false)
  }

  const handleProfileToggle = () => {
    setIsOpen(!isOpen)
    // Close cart dropdown if open
    if (isCartOpen) setIsCartOpen(false)
  }

  const handleIncreaseQuantity = (itemId) => {
    const item = cart.find(item => item.id === itemId)
    if (item) {
      updateCartItemQuantity(itemId, item.quantity + 1)
    }
  }

  const handleDecreaseQuantity = (itemId) => {
    const item = cart.find(item => item.id === itemId)
    if (item && item.quantity > 1) {
      updateCartItemQuantity(itemId, item.quantity - 1)
    }
  }

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId)
  }

  return (
    <nav className='fixed top-0 left-0 w-full min-h-13 shadow-md z-50 bg-secondary '>
      <div className='container mx-auto px-1.5 py-2 inset-0 flex justify-between items-center'>
        <div className='text-xl font-bold '>
          <Link to={'/'}>ECOMhub</Link>
        </div>
        {/* Search bar */}
        <div className='flex-1 mx-6 m-y-3 max-w-2xl md:max-w-xl'>
          <div className='relative'>
            <input 
            type='text' 
            placeholder='Search Products Here'
            className='w-full px-4 py-2 pl-10 bg-primary text-font-secondary border rounded-lg border-gray-300 focus:outline-none 
            focus: ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400'
            /> 
            <AiOutlineSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg z-59' />
            <button className='absolute right-0 top-1/2 transform -translate-y-1/2 bg-secondary text-font-primary text-lg
             z-59 h-full w-14 px-auto rounded-r-lg flex justify-center items-center hover:bg-secondary/90 transition-opacity'>
              <AiOutlineSearch className='text-2xl' />
            </button>
          </div>
        </div>
        {isMobileNav && isMobile && (
        <div className="absolute top-full left-0 w-full bg-secondary/70 dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ease-out animate-fadeInDown">
          <div className="container mx-auto px-4 py-6">
            <ul className="flex flex-col gap-4">
              <li>
                <Link 
                  to="/items" 
                  className="flex items-center px-4 py-3 text-font-primary-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all duration-200 group"
                  onClick={() => setIsMobileNav(false)}
                >
                  <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Products
                  <span className="ml-auto text-xs text-blue-600 dark:text-blue-400 font-semibold bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">New</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="flex items-center px-4 py-3 text-font-primary-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all duration-200 group"
                  onClick={() => setIsMobileNav(false)}
                >
                  <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/about-us" 
                  className="flex items-center px-4 py-3 text-font-primary-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all duration-200 group"
                  onClick={() => setIsMobileNav(false)}
                >
                  <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About Us
                </Link>
              </li>
            </ul>
              
            </div>
          </div>
        )}
        {!isMobile&&<div className='flex items-center space-x-6'>
          <ul className='flex gap-6 mr-4'>
            <li><Link to={'/items'} className='text-font-primary-700 hover:text-blue-600 font-medium transition-colors'>Products</Link></li>
            <li><Link to={'/contact-us'} className='text-font-primary-700 hover:text-blue-600 font-medium transition-colors'>Contact Us</Link></li>
            <li><Link to={'/about-us'} className='text-font-primary-700 hover:text-blue-600 font-medium transition-colors'>About Us</Link></li>
          </ul>
        </div>}
        <div className='flex items-center gap-4'>
          {/* Cart Button with Dropdown */}
          <div className='relative'>
            <button 
              className='relative p-2 hover:bg-gray-100 hover:text-font-secondary rounded-full transition-colors'
              onClick={handleCartToggle}
            >
              <AiOutlineShoppingCart className='text-3xl' />
              <span className='absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                {getCartItemCount()}
              </span>
            </button>
            
            {/* Cart Dropdown */}
            {isCartOpen && (
              <div className='absolute top-full right-0 mt-3 w-80 md:w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200 animate-fadeIn'>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-800">Shopping Cart</h3>
                    <span className="text-sm text-gray-600">{cart.length} items</span>
                  </div>
                  
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-3">
                        <AiOutlineShoppingCart className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-gray-600">Your cart is empty</p>
                      <Link 
                        to="/items" 
                        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => setIsCartOpen(false)}
                      >
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-80 overflow-y-auto pr-2">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors mb-2 last:mb-0">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-contain p-1"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-800 truncate">{item.name}</h4>
                              <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleDecreaseQuantity(item.id)}
                                    className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                                  >
                                    <AiOutlineMinus className="w-3 h-3" />
                                  </button>
                                  <span className="font-medium w-8 text-center">{item.quantity}</span>
                                  <button 
                                    onClick={() => handleIncreaseQuantity(item.id)}
                                    className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                                  >
                                    <AiOutlinePlus className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-blue-600">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </span>
                                  <button 
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <AiOutlineDelete className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-bold text-xl text-gray-900">${getCartTotal().toFixed(2)}</span>
                        </div>
                        <div className="flex gap-2">
                          <Link 
                            to="/cart" 
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-center"
                            onClick={() => setIsCartOpen(false)}
                          >
                            View Cart
                          </Link>
                          <Link 
                            to="/checkout" 
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                            onClick={() => setIsCartOpen(false)}
                          >
                            Checkout
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Profile Button with Dropdown */}
          <div className='relative'>
            <button 
              className='relative p-2 hover:bg-gray-100 hover:text-font-secondary rounded-full transition-colors' 
              onClick={handleProfileToggle}
            >
              <AiOutlineUser className='text-3xl' />
            </button>
            
            {isOpen && (
              <div className='absolute top-full right-0 mt-3 w-64 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl z-50 border border-gray-200 animate-fadeIn'>
                <div className="p-4 ">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      <Link to={'/dashboard'} onClick={() => setIsOpen(false)}>
                        <img
                          src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      </Link>
                    </div>
                    <div className='text-left flex-1 min-w-0'>
                      <h3 className="font-semibold text-gray-800 truncate">Jehan Perera</h3>
                      <p className="text-sm text-gray-600 truncate">john@example.com</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <Link 
                      to="/dashboard" 
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <Link 
                      to="/orders" 
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      My Orders
                    </Link>
                    <Link 
                      to="/wishlist" 
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Wishlist
                    </Link>
                  </div>
                  
                  <div className='flex gap-2'>
                    <button 
                      onClick={handleLogout}
                      className='flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center'
                    >
                      LOGOUT
                    </button>
                    <Link 
                      to="/settings" 
                      className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center'
                      onClick={() => setIsOpen(false)}
                    >
                      <AiOutlineSetting className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          {isMobile && (
            <button 
              className='relative p-2 hover:bg-gray-100 hover:text-font-secondary rounded-full transition-colors'
              onClick={() => setIsMobileNav(!isMobileNav)}
            >
              {isMobileNav ? <AiFillCloseSquare className='text-3xl'/> : <AiOutlineMenu className='text-3xl' />}
            </button>
          )}
        </div>
      </div>
      
      {/* Add fadeIn animation to CSS or inline styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </nav>
  )
}

export default Nav