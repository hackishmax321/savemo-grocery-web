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
  FaCcMastercard 
} from 'react-icons/fa';
import { RiSecurePaymentLine } from 'react-icons/ri';
import orderService from '../services/Order.service';
import paymentService from '../services/Payment.service';

// Add PayHere script to head
const loadPayHereScript = () => {
  return new Promise((resolve, reject) => {
    if (window.payhere) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://www.payhere.lk/lib/payhere.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load PayHere script'));
    document.head.appendChild(script);
  });
};

function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Confirmation
  const [paymentMethod, setPaymentMethod] = useState('payhere'); // Default to payhere
  const [saveAddress, setSaveAddress] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [orderRResult, setOrderRResult] = useState(null);
  
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

  // Initialize PayHere payment
  const initializePayHerePayment = async () => {
    try {
      setLoading(true);
      setPaymentError(null);

      // First check if backend is reachable
      const isBackendHealthy = await paymentService.verifyBackendConnection();
      if (!isBackendHealthy) {
        throw new Error('Payment gateway is currently unavailable. Please try again later.');
      }

      // Load PayHere script if not already loaded
      await loadPayHereScript();

      // Initialize payment with backend
      console.log('Initializing payment with data:', {
        amount: total,
        firstName: address.fullName.split(' ')[0],
        lastName: address.fullName.split(' ').slice(1).join(' ') || 'Customer',
        email: address.email,
        phone: address.phone,
        address: address.addressLine1,
        city: address.city
      });

      const paymentInit = await paymentService.initializePayment({
        amount: total,
        firstName: address.fullName.split(' ')[0],
        lastName: address.fullName.split(' ').slice(1).join(' ') || 'Customer',
        email: address.email,
        phone: address.phone,
        address: address.addressLine1,
        city: address.city,
        country: address.country
      });

      console.log('Payment initialized:', paymentInit);

      if (!paymentInit.success) {
        throw new Error('Failed to initialize payment');
      }

      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          docId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          category: item.category,
          subCategory: item.subCategory,
          brand: item.brand,
          discountedPrice: item.discountedPrice || item.price,
          totalPrice: (item.discountedPrice || item.price) * item.quantity
        })),
        total: total,
        subtotal: subtotal,
        tax: tax,
        deliveryFee: shippingFee,
        promoCode: null,
        discountAmount: 0,
        paidAmount: total,
        paymentMethod: 'payhere',
        paymentStatus: 'pending',
        orderStatus: 'pending_payment',
        shippingInfo: {
          address: address.addressLine1,
          address2: address.addressLine2,
          city: address.city,
          state: address.province,
          zipCode: address.postalCode,
          country: address.country,
          phone: address.phone,
          email: address.email
        },
        customerId: localStorage.getItem('userId') || null,
        customerEmail: address.email,
        customerName: address.fullName,
        customerPhone: address.phone,
        storeId: 'main_store',
        createdBy: localStorage.getItem('userId') || 'guest',
        orderReference: paymentInit.orderId
      };

      // Create order in pending state
      const orderResult = await orderService.createOrder(orderData);
      
      console.log('Order created:', orderResult);
      setOrderRResult(orderResult)

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      setOrderId(orderResult.order.id);

      // Set up PayHere event handlers
      window.payhere.onCompleted = async function onCompleted(transactionId) {
        console.log('✅ Payment completed. Transaction ID:', transactionId);
        
        try {
          setLoading(true);
          
          // Wait a moment for the notification webhook to process
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Verify payment with backend
          console.log('Verifying payment for order:', paymentInit.orderId);
          const verification = await paymentService.verifyPayment(paymentInit.orderId);
          
          console.log('Payment verification result:', verification);
          
          if (verification.success && verification.status === 'completed') {
            // Update order status to processing
            await orderService.updateOrderStatus(orderResult.order.id, 'processing', 'Payment completed successfully');
            
            // Clear cart and move to confirmation
            clearCart();
            setStep(3);
          } else {
            // Check status again after a delay
            setTimeout(async () => {
              const retryVerification = await paymentService.verifyPayment(paymentInit.orderId);
              if (retryVerification.success && retryVerification.status === 'completed') {
                await orderService.updateOrderStatus(orderResult.order.id, 'processing', 'Payment completed successfully');
                clearCart();
                setStep(3);
              } else {
                setPaymentError('Payment verification failed. Please check your orders page for status.');
              }
              setLoading(false);
            }, 5000);
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          setPaymentError('Payment verification failed. Please check your orders page for status.');
          setLoading(false);
        }
      };

      window.payhere.onDismissed = function onDismissed() {
        console.log('❌ Payment dismissed by user');
        setPaymentError('Payment was cancelled');
        setLoading(false);
      };

      window.payhere.onError = function onError(error) {
        console.log('❌ Payment error:', error);
        
        // Handle specific PayHere errors
        if (error.includes('declined') || error.includes('insufficient')) {
          setPaymentError('Transaction declined. Please check your card details or try another payment method.');
        } else if (error.includes('timeout')) {
          setPaymentError('Payment timeout. Please try again.');
        } else {
          setPaymentError('Payment failed: ' + error);
        }
        
        setLoading(false);
      };

      // Log payment data before starting
      console.log('Starting PayHere payment with data:', paymentInit.paymentData);

      // Start payment
      window.payhere.startPayment(paymentInit.paymentData);

    } catch (error) {
      console.error('❌ Payment initialization error:', error);
      setPaymentError(error.message || 'Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  const testPayHereConfig = async () => {
    try {
      const result = await paymentService.checkHealth();
      console.log('Health check:', result);
      
      if (!result.success) {
        alert('Payment gateway backend is not reachable. Please check your connection.');
      } else {
        alert('Payment gateway is reachable!');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      alert('Failed to connect to payment gateway');
    }
  };

  const handleCashOnDeliverySubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setPaymentError(null);

      // Prepare order data for COD
      const orderData = {
        items: cart.map(item => ({
          docId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          category: item.category,
          subCategory: item.subCategory,
          brand: item.brand,
          discountedPrice: item.discountedPrice || item.price,
          totalPrice: (item.discountedPrice || item.price) * item.quantity
        })),
        total: total,
        subtotal: subtotal,
        tax: tax,
        deliveryFee: shippingFee,
        promoCode: null,
        discountAmount: 0,
        paidAmount: 0, // Not paid yet for COD
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        orderStatus: 'processing',
        shippingInfo: {
          address: address.addressLine1,
          address2: address.addressLine2,
          city: address.city,
          state: address.province,
          zipCode: address.postalCode,
          country: address.country,
          phone: address.phone,
          email: address.email
        },
        customerId: localStorage.getItem('userId') || null,
        customerEmail: address.email,
        customerName: address.fullName,
        customerPhone: address.phone,
        storeId: 'main_store',
        createdBy: localStorage.getItem('userId') || 'guest'
      };

      // Create order
      const orderResult = await orderService.createOrder(orderData);
      
      if (!orderResult.success) {
        throw new Error(orderResult.error);
      }

      setOrderId(orderResult.order.id);

      // Clear cart and move to confirmation
      clearCart();
      setStep(3);

    } catch (error) {
      console.error('Order creation error:', error);
      setPaymentError(error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    
    if (!agreeTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    
    if (paymentMethod === 'payhere') {
      initializePayHerePayment();
    } else if (paymentMethod === 'cod') {
      handleCashOnDeliverySubmit(e);
    }
  };

  const provinces = [
    'Western Province', 'Central Province', 'Southern Province', 'Northern Province',
    'Eastern Province', 'North Western Province', 'North Central Province', 
    'Uva Province', 'Sabaragamuwa Province'
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
                          className='w-full pl-10 pr-4 py-3 border text-black/80 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
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
                        className='w-full px-4 py-3 border text-black/80 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
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
                          className='w-full pl-10 pr-4 py-3 border text-black/80 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
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
                        className='w-full px-4 py-3 border text-black/80 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                        required
                      >
                        <option value=''>Select Province</option>
                        {provinces.map(province => (
                          <option className='text-black/80' key={province} value={province}>{province}</option>
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
                          className='w-full pl-10 pr-4 py-3 border text-black/80 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
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
                        className='w-full px-4 py-3 border text-black/80 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
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
                        className='w-full px-4 py-3 border text-black/80 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
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
                        className='w-full px-4 py-3 border text-black/80 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
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
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'payhere' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setPaymentMethod('payhere')}
                    >
                      <div className='flex items-center'>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${paymentMethod === 'payhere' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                          {paymentMethod === 'payhere' && (
                            <div className='w-2 h-2 rounded-full bg-white'></div>
                          )}
                        </div>
                        <img 
                          src="https://www.payhere.lk/favicon.ico" 
                          alt="PayHere" 
                          className='w-6 h-6 mr-3'
                        />
                        <div>
                          <h4 className='font-medium text-gray-900'>PayHere</h4>
                          <p className='text-sm text-gray-600'>Credit/Debit Cards, Online Banking</p>
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

                {/* PayHere Info */}
                {paymentMethod === 'payhere' && (
                  <div className='mb-8 p-4 bg-blue-50 rounded-lg'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>Pay with PayHere</h3>
                    <p className='text-sm text-gray-700 mb-3'>
                      You will be redirected to PayHere's secure payment page to complete your payment.
                      Accepted payment methods:
                    </p>
                    <div className='flex gap-3 flex-wrap'>
                      <FaCcVisa className='text-3xl text-gray-700' />
                      <FaCcMastercard className='text-3xl text-gray-700' />
                      <img src="https://www.payhere.lk/images/logo-amex.png" alt="Amex" className='h-8' />
                      <img src="https://www.payhere.lk/images/logo-frimi.png" alt="Frimi" className='h-8' />
                    </div>
                    <div className="mb-4 flex justify-end">
                      <button
                        type="button"
                        onClick={testPayHereConfig}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                      >
                        Test Payment Gateway Connection
                      </button>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {paymentError && (
                  <div className='mb-8 p-4 bg-red-50 border border-red-200 rounded-lg'>
                    <p className='text-sm text-red-600'>{paymentError}</p>
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
                      required
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
                        Your payment information is encrypted and secure. PayHere is PCI-DSS compliant.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className='flex justify-between'>
                  <button
                    type='button'
                    onClick={() => setStep(1)}
                    className='px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors'
                    disabled={loading}
                  >
                    Back to Shipping
                  </button>
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={loading || !agreeTerms}
                    className={`px-8 py-3 font-semibold rounded-lg transition-colors flex items-center ${
                      loading || !agreeTerms
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <AiOutlineLock className='mr-2' />
                        {paymentMethod === 'payhere' ? 'Pay with PayHere' : 'Place Order (COD)'}
                      </>
                    )}
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
                    <div className='text-2xl font-bold text-gray-900 mb-4'>{orderId}</div>
                    <div className='text-sm text-gray-600'>
                      A confirmation email has been sent to <span className='font-medium'>{address.email}</span>
                    </div>
                    {paymentMethod === 'payhere' && (
                      <div className='mt-4 p-3 bg-green-50 rounded-lg'>
                        <p className='text-sm text-green-700'>
                          ✓ Payment successful. Your transaction has been completed.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                    {orderRResult&&<Link
                      to='/delivery'
                      state={{ 
                        orderData: orderRResult.order,
                        orderId: orderRResult.order.id 
                      }}
                      className='px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors'
                    >
                      Give Delivery Location
                    </Link>}
                    <Link
                      to='/products'
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
                    <a
                      onClick={() =>paymentService.checkHealth()}
                      className='px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm'
                    >
                      Contact Support
                    </a>
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