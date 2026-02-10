import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../providers/CartProvide';
import { 
  AiOutlineArrowLeft, 
  AiOutlineLock, 
  AiOutlineCreditCard, 
  AiOutlineBank, 
  AiOutlineWallet, 
  AiOutlineCheckCircle,
  AiOutlineHome,
  AiOutlineEnvironment,
  AiOutlinePhone,
  AiOutlineUser,
  AiOutlineInfoCircle
} from 'react-icons/ai';
import { 
  FaCcVisa, 
  FaCcMastercard, 
  FaCcPaypal, 
  FaCcAmazonPay 
} from 'react-icons/fa';
import { RiSecurePaymentLine } from 'react-icons/ri';

function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Confirmation
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [saveAddress, setSaveAddress] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Address form state
  const [address, setAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Sri Lanka'
  });

  // Payment form state
  const [payment, setPayment] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  });

  const subtotal = getCartTotal();
  const shippingFee = subtotal > 5000 ? 0 : 250;
  const tax = subtotal * 0.12;
  const total = subtotal + shippingFee + tax;

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPayment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    // Validate address
    if (!address.fullName || !address.phone || !address.addressLine1 || !address.city) {
      alert('Please fill in all required fields');
      return;
    }
    setStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    
    if (paymentMethod === 'credit-card') {
      if (!payment.cardNumber || !payment.cardName || !payment.expiryDate || !payment.cvv) {
        alert('Please fill in all payment details');
        return;
      }
    }
    
    // Process order (in real app, this would be an API call)
    console.log('Processing order...', { address, payment, cart });
    
    // Clear cart and move to confirmation
    clearCart();
    setStep(3);
  };

  const provinces = [
    'Western Province', 'Central Province', 'Southern Province', 'Northern Province',
    'Eastern Province', 'North Western Province', 'North Central Province', 'Uva Province', 'Sabaragamuwa Province'
  ];

  if (cart.length === 0 && step !== 3) {
    return (
      <div className='w-full mt-15 min-h-screen bg-gray-50 py-5'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='text-center py-16'>
            <div className='inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-100 mb-6'>
              <AiOutlineInfoCircle className='text-5xl text-yellow-600' />
            </div>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>Your cart is empty</h2>
            <p className='text-gray-600 mb-8 max-w-md mx-auto'>
              Add items to your cart before proceeding to checkout.
            </p>
            <Link
              to='/cart'
              className='px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center'
            >
              <AiOutlineArrowLeft className='mr-2' />
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full mt-15 min-h-screen bg-gray-50 py-5'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Checkout Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <h1 className='text-3xl font-bold text-gray-900'>Checkout</h1>
            <Link
              to='/cart'
              className='text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium'
            >
              <AiOutlineArrowLeft className='mr-1' />
              Back to Cart
            </Link>
          </div>
          
          {/* Progress Steps */}
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center'>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <div className={`ml-2 text-sm font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                Shipping
              </div>
            </div>
            
            <div className='flex-1 h-1 mx-4 bg-gray-200'>
              <div className={`h-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            </div>
            
            <div className='flex items-center'>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <div className={`ml-2 text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                Payment
              </div>
            </div>
            
            <div className='flex-1 h-1 mx-4 bg-gray-200'>
              <div className={`h-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            </div>
            
            <div className='flex items-center'>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                3
              </div>
              <div className={`ml-2 text-sm font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>
                Confirm
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Left Column - Checkout Form */}
          <div className='lg:w-2/3'>
            {step === 1 && (
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center'>
                  <AiOutlineEnvironment className='mr-2 text-blue-600' />
                  Shipping Address
                </h2>
                
                <form onSubmit={handleAddressSubmit}>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Full Name *
                      </label>
                      <div className='relative'>
                        <AiOutlineUser className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                        <input
                          type='text'
                          name='fullName'
                          value={address.fullName}
                          onChange={handleAddressChange}
                          className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                          placeholder='John Doe'
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Email Address *
                      </label>
                      <input
                        type='email'
                        name='email'
                        value={address.email}
                        onChange={handleAddressChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                        placeholder='john@example.com'
                        required
                      />
                    </div>
                    
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Phone Number *
                      </label>
                      <div className='relative'>
                        <AiOutlinePhone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                        <input
                          type='tel'
                          name='phone'
                          value={address.phone}
                          onChange={handleAddressChange}
                          className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                          placeholder='071 234 5678'
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Province *
                      </label>
                      <select
                        name='province'
                        value={address.province}
                        onChange={handleAddressChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                        required
                      >
                        <option value=''>Select Province</option>
                        {provinces.map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className='md:col-span-2'>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Address Line 1 *
                      </label>
                      <div className='relative'>
                        <AiOutlineHome className='absolute left-3 top-3 text-gray-400' />
                        <input
                          type='text'
                          name='addressLine1'
                          value={address.addressLine1}
                          onChange={handleAddressChange}
                          className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                          placeholder='123 Main Street'
                          required
                        />
                      </div>
                    </div>
                    
                    <div className='md:col-span-2'>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Address Line 2
                      </label>
                      <input
                        type='text'
                        name='addressLine2'
                        value={address.addressLine2}
                        onChange={handleAddressChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                        placeholder='Apartment, suite, etc.'
                      />
                    </div>
                    
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        City *
                      </label>
                      <input
                        type='text'
                        name='city'
                        value={address.city}
                        onChange={handleAddressChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                        placeholder='Colombo'
                        required
                      />
                    </div>
                    
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Postal Code *
                      </label>
                      <input
                        type='text'
                        name='postalCode'
                        value={address.postalCode}
                        onChange={handleAddressChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                        placeholder='00100'
                        required
                      />
                    </div>
                  </div>
                  
                  <div className='flex items-center mb-6'>
                    <input
                      type='checkbox'
                      id='saveAddress'
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
                    />
                    <label htmlFor='saveAddress' className='ml-2 text-sm text-gray-700'>
                      Save this address for future orders
                    </label>
                  </div>
                  
                  <div className='flex justify-between'>
                    <Link
                      to='/cart'
                      className='px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      Back to Cart
                    </Link>
                    <button
                      type='submit'
                      className='px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors'
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center'>
                  <AiOutlineCreditCard className='mr-2 text-blue-600' />
                  Payment Method
                </h2>
                
                {/* Payment Method Selection */}
                <div className='mb-8'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>Choose Payment Method</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                    <div
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'credit-card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setPaymentMethod('credit-card')}
                    >
                      <div className='flex items-center'>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${paymentMethod === 'credit-card' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                          {paymentMethod === 'credit-card' && (
                            <div className='w-2 h-2 rounded-full bg-white'></div>
                          )}
                        </div>
                        <AiOutlineCreditCard className='text-2xl text-gray-600 mr-3' />
                        <div>
                          <h4 className='font-medium text-gray-900'>Credit/Debit Card</h4>
                          <p className='text-sm text-gray-600'>Pay with Visa, Mastercard</p>
                        </div>
                      </div>
                    </div>
                    
                    <div
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setPaymentMethod('paypal')}
                    >
                      <div className='flex items-center'>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                          {paymentMethod === 'paypal' && (
                            <div className='w-2 h-2 rounded-full bg-white'></div>
                          )}
                        </div>
                        <FaCcPaypal className='text-2xl text-blue-600 mr-3' />
                        <div>
                          <h4 className='font-medium text-gray-900'>PayPal</h4>
                          <p className='text-sm text-gray-600'>Safer, easier way to pay</p>
                        </div>
                      </div>
                    </div>
                    
                    <div
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'bank-transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setPaymentMethod('bank-transfer')}
                    >
                      <div className='flex items-center'>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${paymentMethod === 'bank-transfer' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                          {paymentMethod === 'bank-transfer' && (
                            <div className='w-2 h-2 rounded-full bg-white'></div>
                          )}
                        </div>
                        <AiOutlineBank className='text-2xl text-gray-600 mr-3' />
                        <div>
                          <h4 className='font-medium text-gray-900'>Bank Transfer</h4>
                          <p className='text-sm text-gray-600'>Direct bank payment</p>
                        </div>
                      </div>
                    </div>
                    
                    <div
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <div className='flex items-center'>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                          {paymentMethod === 'cod' && (
                            <div className='w-2 h-2 rounded-full bg-white'></div>
                          )}
                        </div>
                        <AiOutlineWallet className='text-2xl text-gray-600 mr-3' />
                        <div>
                          <h4 className='font-medium text-gray-900'>Cash on Delivery</h4>
                          <p className='text-sm text-gray-600'>Pay when you receive</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credit Card Form */}
                {paymentMethod === 'credit-card' && (
                  <div className='mb-8'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>Card Details</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div className='md:col-span-2'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Card Number
                        </label>
                        <div className='relative'>
                          <AiOutlineCreditCard className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                          <input
                            type='text'
                            name='cardNumber'
                            value={payment.cardNumber}
                            onChange={handlePaymentChange}
                            className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                            placeholder='1234 5678 9012 3456'
                            maxLength='19'
                          />
                          <div className='absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2'>
                            <FaCcVisa className='text-2xl text-gray-400' />
                            <FaCcMastercard className='text-2xl text-gray-400' />
                          </div>
                        </div>
                      </div>
                      
                      <div className='md:col-span-2'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Name on Card
                        </label>
                        <input
                          type='text'
                          name='cardName'
                          value={payment.cardName}
                          onChange={handlePaymentChange}
                          className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                          placeholder='JOHN DOE'
                        />
                      </div>
                      
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Expiry Date
                        </label>
                        <input
                          type='text'
                          name='expiryDate'
                          value={payment.expiryDate}
                          onChange={handlePaymentChange}
                          className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                          placeholder='MM/YY'
                          maxLength='5'
                        />
                      </div>
                      
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          CVV
                        </label>
                        <div className='relative'>
                          <AiOutlineLock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                          <input
                            type='text'
                            name='cvv'
                            value={payment.cvv}
                            onChange={handlePaymentChange}
                            className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                            placeholder='123'
                            maxLength='3'
                          />
                        </div>
                      </div>
                      
                      <div className='md:col-span-2'>
                        <div className='flex items-center'>
                          <input
                            type='checkbox'
                            id='saveCard'
                            checked={payment.saveCard}
                            onChange={(e) => setPayment(prev => ({ ...prev, saveCard: e.target.checked }))}
                            className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
                          />
                          <label htmlFor='saveCard' className='ml-2 text-sm text-gray-700'>
                            Save this card for future purchases
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className='mb-8'>
                  <div className='flex items-start'>
                    <input
                      type='checkbox'
                      id='agreeTerms'
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className='w-5 h-5 mt-1 text-blue-600 rounded focus:ring-blue-500'
                    />
                    <label htmlFor='agreeTerms' className='ml-3 text-sm text-gray-700'>
                      I agree to the{' '}
                      <Link to='/terms' className='text-blue-600 hover:text-blue-800'>
                        Terms and Conditions
                      </Link>
                      {' '}and{' '}
                      <Link to='/privacy' className='text-blue-600 hover:text-blue-800'>
                        Privacy Policy
                      </Link>
                      . I understand that my personal data will be processed in accordance with the Privacy Policy.
                    </label>
                  </div>
                </div>

                {/* Security Note */}
                <div className='p-4 bg-blue-50 rounded-lg mb-8'>
                  <div className='flex items-center gap-3'>
                    <RiSecurePaymentLine className='text-blue-600 text-xl flex-shrink-0' />
                    <div>
                      <p className='text-sm text-blue-800 font-medium'>Secure Payment</p>
                      <p className='text-xs text-blue-700'>
                        Your payment information is encrypted and secure. We never store your credit card details.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className='flex justify-between'>
                  <button
                    type='button'
                    onClick={() => setStep(1)}
                    className='px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    Back to Shipping
                  </button>
                  <button
                    onClick={handlePaymentSubmit}
                    className='px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-colors flex items-center'
                  >
                    <AiOutlineLock className='mr-2' />
                    Place Order
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
                <div className='text-center py-8'>
                  <div className='inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6'>
                    <AiOutlineCheckCircle className='text-5xl text-green-600' />
                  </div>
                  <h2 className='text-3xl font-bold text-gray-900 mb-4'>Order Confirmed!</h2>
                  <p className='text-gray-600 mb-6 max-w-md mx-auto'>
                    Thank you for your purchase. Your order has been confirmed and will be processed shortly.
                  </p>
                  <div className='bg-gray-50 p-6 rounded-xl mb-8 max-w-md mx-auto'>
                    <div className='text-sm text-gray-600 mb-2'>Order Number</div>
                    <div className='text-2xl font-bold text-gray-900 mb-4'>ORD-{Date.now().toString().slice(-8)}</div>
                    <div className='text-sm text-gray-600'>
                      A confirmation email has been sent to <span className='font-medium'>{address.email}</span>
                    </div>
                  </div>
                  <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                    <Link
                      to='/orders'
                      className='px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors'
                    >
                      View Order Details
                    </Link>
                    <Link
                      to='/items'
                      className='px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors'
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
                
                {/* Estimated Delivery */}
                <div className='mt-8 pt-8 border-t border-gray-200'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>What's Next?</h3>
                  <div className='space-y-4'>
                    <div className='flex items-center'>
                      <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0'>
                        <span className='text-blue-600 font-bold'>1</span>
                      </div>
                      <div>
                        <h4 className='font-medium text-gray-900'>Order Processing</h4>
                        <p className='text-sm text-gray-600'>We'll process your order within 24 hours</p>
                      </div>
                    </div>
                    <div className='flex items-center'>
                      <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0'>
                        <span className='text-blue-600 font-bold'>2</span>
                      </div>
                      <div>
                        <h4 className='font-medium text-gray-900'>Shipping</h4>
                        <p className='text-sm text-gray-600'>Estimated delivery: 3-5 business days</p>
                      </div>
                    </div>
                    <div className='flex items-center'>
                      <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0'>
                        <span className='text-blue-600 font-bold'>3</span>
                      </div>
                      <div>
                        <h4 className='font-medium text-gray-900'>Delivery</h4>
                        <p className='text-sm text-gray-600'>You'll receive tracking information via email</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className='lg:w-1/3'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 sticky top-24'>
              <div className='p-6'>
                <h2 className='text-xl font-bold text-gray-900 mb-6'>Order Summary</h2>
                
                {/* Cart Items */}
                <div className='max-h-64 overflow-y-auto pr-2 mb-6'>
                  {cart.map((item) => (
                    <div key={item.id} className='flex items-center gap-3 mb-4 last:mb-0'>
                      <div className='w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0'>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='w-full h-full object-contain p-1'
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-medium text-gray-800 text-sm truncate'>{item.name}</h4>
                        <div className='flex justify-between items-center mt-1'>
                          <span className='text-sm text-gray-600'>Qty: {item.quantity}</span>
                          <span className='font-medium text-gray-900'>Rs.{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Price Breakdown */}
                <div className='space-y-3 mb-6'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Subtotal</span>
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
                  
                  <div className='border-t border-gray-200 pt-3'>
                    <div className='flex justify-between text-lg font-bold'>
                      <span>Total</span>
                      <span className='text-blue-600'>Rs.{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address Preview */}
                {step >= 1 && address.fullName && (
                  <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
                    <h3 className='font-semibold text-gray-900 mb-2'>Shipping to</h3>
                    <p className='text-sm text-gray-700'>
                      {address.fullName}<br />
                      {address.addressLine1}<br />
                      {address.addressLine2 && <>{address.addressLine2}<br /></>}
                      {address.city}, {address.province}<br />
                      {address.postalCode}<br />
                      {address.phone}
                    </p>
                  </div>
                )}

                {/* Need Help */}
                <div className='text-center'>
                  <p className='text-sm text-gray-600 mb-3'>Need help with your order?</p>
                  <div className='flex flex-col sm:flex-row gap-3'>
                    <Link
                      to='/contact'
                      className='px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm'
                    >
                      Contact Support
                    </Link>
                    <a
                      href='tel:+94112XXXXXX'
                      className='px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm'
                    >
                      Call: 0112-XXX-XXX
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Return Policy */}
            <div className='mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
              <h3 className='font-semibold text-gray-900 mb-4'>Return Policy</h3>
              <ul className='space-y-2 text-sm text-gray-600'>
                <li className='flex items-start'>
                  <AiOutlineCheckCircle className='text-green-500 mr-2 mt-0.5 flex-shrink-0' />
                  <span>30-day return policy for all items</span>
                </li>
                <li className='flex items-start'>
                  <AiOutlineCheckCircle className='text-green-500 mr-2 mt-0.5 flex-shrink-0' />
                  <span>Free returns for defective products</span>
                </li>
                <li className='flex items-start'>
                  <AiOutlineCheckCircle className='text-green-500 mr-2 mt-0.5 flex-shrink-0' />
                  <span>Refund processed within 7 business days</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;