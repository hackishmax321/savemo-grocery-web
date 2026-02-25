import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaTruck, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaHome,
  FaCity,
  FaMapPin,
  FaLocationArrow,
  FaSpinner,
  FaArrowLeft,
  FaCalendarAlt,
  FaBoxOpen,
  FaRupeeSign,
  FaClock
} from 'react-icons/fa';
import { GoogleMap, LoadScript, Marker, Circle, Autocomplete } from '@react-google-maps/api';
import deliveryService from '../services/Delivery.service';
import orderService from '../services/Order.service';

// ADDED: Libraries array for Google Maps
const libraries = ['places'];

// Google Maps configuration
const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.75rem'
};

const defaultCenter = {
  lat: 6.9271, 
  lng: 79.8612
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

function DeliveryDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  
  // ADDED: State to track if Google Maps is loaded
  const [mapsLoaded, setMapsLoaded] = useState(false);
  // ADDED: State to track if there's an error loading Google Maps
  const [mapsError, setMapsError] = useState(false);
  
  // State for order data
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // State for user authentication
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // State for map and location
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [address, setAddress] = useState('');
  const [locationError, setLocationError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchBox, setSearchBox] = useState(null);
  
  // State for delivery form
  const [deliveryDetails, setDeliveryDetails] = useState({
    deliveryInstructions: '',
    deliveryType: 'standard',
    scheduledDate: '',
    scheduledTime: '',
    alternatePhone: '',
    landmark: '',
    specialInstructions: ''
  });

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Load order data when authenticated and order info is available
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      loadOrderData();
    }
  }, [isLoggedIn, currentUser, location.state]);

  // Try to get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      getUserCurrentLocation();
    }
  }, []);

  const checkAuthStatus = () => {
    const userStr = sessionStorage.getItem('currentUser');
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    
    if (userStr && isAuthenticated) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        clearAuth();
      }
    } else {
      clearAuth();
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: '/delivery', orderData: location.state } });
    }
  };

  const clearAuth = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  const loadOrderData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get order data from navigation state or fetch from service
      let order = null;
      
      if (location.state?.orderData) {
        // Use order data passed from checkout
        order = location.state.orderData;
      } else if (location.state?.orderId) {
        // Fetch order by ID
        const result = await orderService.getOrder(location.state.orderId);
        if (result) {
          order = result;
        }
      }

      if (!order) {
        throw new Error('Order information not found. Please return to checkout.');
      }

      setOrderData(order);

      // Pre-fill address from order
      if (order.shippingInfo) {
        const shippingInfo = order.shippingInfo;
        const fullAddress = [
          shippingInfo.address,
          shippingInfo.address2,
          shippingInfo.city,
          shippingInfo.state,
          shippingInfo.zipCode,
          shippingInfo.country
        ].filter(Boolean).join(', ');
        
        setAddress(fullAddress);

        // Try to get coordinates for the shipping address
        if (shippingInfo.address) {
          geocodeAddress(fullAddress);
        }
      }

    } catch (error) {
      console.error('Error loading order data:', error);
      setError(error.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  // ADDED: Check if Google Maps is loaded
  const isGoogleMapsLoaded = () => {
    return window.google && window.google.maps && window.google.maps.Geocoder;
  };

  // Geocode address to get coordinates
  const geocodeAddress = async (addressString) => {
    // ADDED: Check if Google Maps is loaded
    if (!isGoogleMapsLoaded() || !addressString) return;

    const geocoder = new window.google.maps.Geocoder();
    
    try {
      const result = await geocoder.geocode({ address: addressString });
      if (result.results[0]) {
        const location = result.results[0].geometry.location;
        const newLocation = {
          lat: location.lat(),
          lng: location.lng()
        };
        setSelectedLocation(newLocation);
        setMapCenter(newLocation);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  // Get user's current location
  const getUserCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setSelectedLocation(userLocation);
        setMapCenter(userLocation);
        
        // Reverse geocode to get address
        reverseGeocode(userLocation);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get your location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please enable location access and try again, or search for your address manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Please search for your address manually.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please search for your address manually.';
            break;
          default:
            errorMessage += 'Please search for your address manually.';
        }
        
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Reverse geocode coordinates to address
  const reverseGeocode = async (location) => {
    // ADDED: Check if Google Maps is loaded
    if (!isGoogleMapsLoaded()) return;

    const geocoder = new window.google.maps.Geocoder();
    
    try {
      const result = await geocoder.geocode({
        location: location,
        language: 'en'
      });
      
      if (result.results[0]) {
        setAddress(result.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Handle map click to set marker
  const handleMapClick = (event) => {
    // ADDED: Check if Google Maps is loaded
    if (!isGoogleMapsLoaded()) return;
    
    const newLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    setSelectedLocation(newLocation);
    
    // Reverse geocode the clicked location
    reverseGeocode(newLocation);
  };

  // Handle place selection from autocomplete
  const onPlaceSelected = () => {
    // ADDED: Check if autocompleteRef exists and Google Maps is loaded
    if (autocompleteRef.current && isGoogleMapsLoaded()) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setSelectedLocation(location);
        setMapCenter(location);
        setAddress(place.formatted_address || '');
      }
    }
  };

  const onLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onMapLoad = (map) => {
    mapRef.current = map;
    // ADDED: Set maps loaded state when map is loaded
    setMapsLoaded(true);
  };

  // ADDED: Handle Google Maps load error
  const onMapError = () => {
    console.error('Failed to load Google Maps');
    setMapsError(true);
    setError('Failed to load Google Maps. Please check your internet connection or disable ad blocker and refresh the page.');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateDeliveryDetails = () => {
    if (!selectedLocation) {
      setLocationError('Please select a delivery location on the map');
      return false;
    }

    if (!address.trim()) {
      setLocationError('Please enter or select a valid address');
      return false;
    }

    if (deliveryDetails.deliveryType === 'scheduled') {
      if (!deliveryDetails.scheduledDate) {
        setError('Please select a scheduled delivery date');
        return false;
      }
      if (!deliveryDetails.scheduledTime) {
        setError('Please select a scheduled delivery time');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateDeliveryDetails()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Prepare delivery data
      const deliveryData = {
        ...orderData,
        shippingInfo: {
          ...orderData.shippingInfo,
          address: address,
          coordinates: selectedLocation,
          instructions: deliveryDetails.deliveryInstructions,
          landmark: deliveryDetails.landmark
        }
      };

      console.log(deliveryData)

      // Create delivery record
      const result = await deliveryService.createDeliveryFromOrder(deliveryData, {
        deliveryType: deliveryDetails.deliveryType,
        scheduledTime: deliveryDetails.deliveryType === 'scheduled' 
          ? `${deliveryDetails.scheduledDate}T${deliveryDetails.scheduledTime}`
          : null,
        deliveryInstructions: deliveryDetails.deliveryInstructions,
        specialInstructions: deliveryDetails.specialInstructions,
        username: currentUser?.name || orderData.customer?.name,
        enableRealTimeTracking: true,
        weight: deliveryDetails.estimatedWeight
      });

      if (result.success) {
        setSuccess(true);
        
        // Redirect to orders management after 3 seconds
        setTimeout(() => {
          navigate('/dashboard/orders-management', {
            state: {
              message: 'Delivery details saved successfully!',
              deliveryId: result.delivery.id
            }
          });
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to create delivery record');
      }

    } catch (error) {
      console.error('Error submitting delivery details:', error);
      setError(error.message || 'An error occurred while saving delivery details');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date for scheduled delivery
  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1); // Minimum 1 day ahead
    return date.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14); // Maximum 14 days ahead
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <FaSpinner className='animate-spin text-5xl text-blue-600 mx-auto mb-4' />
          <p className='text-gray-600'>Loading delivery details...</p>
        </div>
      </div>
    );
  }

  if (!orderData && !loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-xl shadow-lg p-8 max-w-md text-center'>
          <FaExclamationTriangle className='text-5xl text-yellow-500 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Order Not Found</h2>
          <p className='text-gray-600 mb-6'>
            We couldn't find your order information. Please return to checkout and try again.
          </p>
          <Link
            to='/checkout'
            className='inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            <FaArrowLeft className='mr-2' />
            Back to Checkout
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-xl shadow-lg p-8 max-w-md text-center'>
          <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
            <FaCheckCircle className='text-5xl text-green-600' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Delivery Details Saved!</h2>
          <p className='text-gray-600 mb-6'>
            Your delivery preferences have been saved successfully. Redirecting to order management...
          </p>
          <div className='w-full bg-gray-200 rounded-full h-2 mb-4'>
            <div className='bg-green-600 h-2 rounded-full animate-pulse' style={{ width: '100%' }}></div>
          </div>
          <p className='text-sm text-gray-500'>
            You will be redirected automatically. Please wait...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-16'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <h1 className='text-3xl font-bold text-gray-900 flex items-center'>
              <FaTruck className='mr-3 text-blue-600' />
              Delivery Details
            </h1>
            <Link
              to='/checkout'
              className='text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium'
            >
              <FaArrowLeft className='mr-1' />
              Back to Checkout
            </Link>
          </div>
          <p className='text-gray-600 mt-2'>
            Please confirm your delivery location and preferences
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-sm text-red-600'>{error}</p>
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column - Map and Location Selection */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Map Section */}
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
                <FaMapMarkerAlt className='mr-2 text-red-500' />
                Select Delivery Location
              </h2>

              {/* Location Search */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Search for your address
                </label>
                {/* ADDED: Conditional rendering for LoadScript */}
                {!mapsError ? (
                  <LoadScript
                    googleMapsApiKey={import.meta.env.VITE_GMAP_API_KEY}
                    libraries={libraries}
                    loadingElement={
                      <div className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50'>
                        <FaSpinner className='animate-spin inline mr-2' />
                        Loading Google Maps...
                      </div>
                    }
                    onError={onMapError}
                  >
                    <Autocomplete
                      onLoad={onLoad}
                      onPlaceChanged={onPlaceSelected}
                      restrictions={{ country: 'lk' }}
                    >
                      <input
                        type='text'
                        placeholder='Enter your full address'
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className='w-full px-4 py-3 border text-black/80 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                      />
                    </Autocomplete>
                  </LoadScript>
                ) : (
                  <input
                    type='text'
                    placeholder='Enter your full address manually'
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className='w-full px-4 py-3 border text-black/80 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                  />
                )}
              </div>

              {/* Current Location Button */}
              <div className='mb-4'>
                <button
                  type='button'
                  onClick={getUserCurrentLocation}
                  disabled={isGettingLocation}
                  className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors'
                >
                  {isGettingLocation ? (
                    <>
                      <FaSpinner className='animate-spin mr-2' />
                      Getting location...
                    </>
                  ) : (
                    <>
                      <FaLocationArrow className='mr-2' />
                      Use My Current Location
                    </>
                  )}
                </button>
                {locationError && (
                  <p className='mt-2 text-sm text-yellow-600'>{locationError}</p>
                )}
              </div>

              {/* Google Map */}
              {/* ADDED: Conditional rendering for Google Map */}
              {!mapsError ? (
                <LoadScript
                  googleMapsApiKey={import.meta.env.VITE_GMAP_API_KEY}
                  libraries={libraries}
                  loadingElement={
                    <div className='w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center'>
                      <div className='text-center'>
                        <FaSpinner className='animate-spin text-3xl text-blue-600 mx-auto mb-2' />
                        <p className='text-gray-600'>Loading map...</p>
                      </div>
                    </div>
                  }
                  onError={onMapError}
                >
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={15}
                    options={mapOptions}
                    onClick={handleMapClick}
                    onLoad={onMapLoad}
                  >
                    {/* Show selected marker */}
                    {selectedLocation && mapsLoaded && (
                      <Marker
                        position={selectedLocation}
                        icon={{
                          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                          scaledSize: new window.google.maps.Size(40, 40)
                        }}
                      />
                    )}

                    {/* Show circle around selected location */}
                    {selectedLocation && mapsLoaded && (
                      <Circle
                        center={selectedLocation}
                        radius={100}
                        options={{
                          fillColor: '#3B82F6',
                          fillOpacity: 0.1,
                          strokeColor: '#3B82F6',
                          strokeOpacity: 0.5,
                          strokeWeight: 1
                        }}
                      />
                    )}
                  </GoogleMap>
                </LoadScript>
              ) : (
                <div className='w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center'>
                  <div className='text-center p-6'>
                    <FaExclamationTriangle className='text-4xl text-yellow-500 mx-auto mb-3' />
                    <p className='text-gray-700 font-medium mb-2'>Google Maps failed to load</p>
                    <p className='text-gray-500 text-sm mb-4'>
                      This might be due to an ad blocker or network issue.
                    </p>
                    <div className='space-y-2'>
                      <input
                        type='text'
                        placeholder='Enter your full address manually'
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className='w-full px-4 py-3 border text-black/80 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                      />
                      <p className='text-xs text-gray-400'>
                        Please enter your complete address including city and postal code
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className='text-sm text-gray-500 mt-2'>
                Click on the map to set a precise delivery location or search for your address above
              </p>
            </div>

            {/* Delivery Instructions */}
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>Delivery Instructions</h2>
              
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Landmark (Optional)
                  </label>
                  <div className='relative'>
                    <FaMapPin className='absolute left-3 top-3 text-gray-400' />
                    <input
                      type='text'
                      name='landmark'
                      value={deliveryDetails.landmark}
                      onChange={handleInputChange}
                      placeholder='E.g., Near the park, Opposite to bank'
                      className='w-full pl-10 pr-4 py-3 border text-black/80 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    name='deliveryInstructions'
                    value={deliveryDetails.deliveryInstructions}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder='Any specific instructions for the delivery partner?'
                    className='w-full px-4 py-3 border text-black/80 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Special Handling Instructions (Optional)
                  </label>
                  <textarea
                    name='specialInstructions'
                    value={deliveryDetails.specialInstructions}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder='E.g., Fragile items, Keep frozen items separate'
                    className='w-full px-4 py-3 border text-black/80 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary and Delivery Options */}
          <div className='space-y-6'>
            {/* Order Summary */}
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>Order Summary</h2>
              
              <div className='space-y-4'>
                {/* Order ID */}
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Order ID:</span>
                  <span className='font-medium text-gray-900'>{orderData?.id}</span>
                </div>

                {/* Customer Name */}
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600 flex items-center'>
                    <FaUser className='mr-1 text-sm' /> Customer:
                  </span>
                  <span className='font-medium text-gray-900'>
                    {orderData?.customer?.name || currentUser?.name}
                  </span>
                </div>

                {/* Contact */}
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600 flex items-center'>
                    <FaPhone className='mr-1 text-sm' /> Phone:
                  </span>
                  <span className='font-medium text-gray-900'>
                    {orderData?.customer?.phone || currentUser?.phone}
                  </span>
                </div>

                {/* Email */}
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600 flex items-center'>
                    <FaEnvelope className='mr-1 text-sm' /> Email:
                  </span>
                  <span className='font-medium text-gray-900'>
                    {orderData?.customer?.email || currentUser?.email}
                  </span>
                </div>

                {/* Total Amount */}
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600 flex items-center'>
                    <FaRupeeSign className='mr-1 text-sm' /> Total:
                  </span>
                  <span className='font-bold text-blue-600'>
                    Rs. {orderData?.total?.toFixed(2)}
                  </span>
                </div>

                {/* Items Count */}
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600 flex items-center'>
                    <FaBoxOpen className='mr-1 text-sm' /> Items:
                  </span>
                  <span className='font-medium text-gray-900'>
                    {orderData?.items?.length} items
                  </span>
                </div>

                {/* Shipping Address Preview */}
                <div className='pt-4 border-t border-gray-200'>
                  <h3 className='font-medium text-gray-900 mb-2'>Shipping Address</h3>
                  <p className='text-sm text-gray-600'>
                    {orderData?.shippingInfo?.address}<br />
                    {orderData?.shippingInfo?.address2 && <>{orderData.shippingInfo.address2}<br /></>}
                    {orderData?.shippingInfo?.city}, {orderData?.shippingInfo?.state}<br />
                    {orderData?.shippingInfo?.zipCode}<br />
                    {orderData?.shippingInfo?.country}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Options Form */}
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>Delivery Options</h2>
              
              <form onSubmit={handleSubmit} className='space-y-4'>
                {/* Delivery Type */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Delivery Type *
                  </label>
                  <select
                    name='deliveryType'
                    value={deliveryDetails.deliveryType}
                    onChange={handleInputChange}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                  >
                    <option className='text-black/80' value='standard'>Standard Delivery (3-5 days)</option>
                    <option className='text-black/80' value='express'>Express Delivery (1-2 days)</option>
                    <option className='text-black/80' value='scheduled'>Scheduled Delivery</option>
                  </select>
                </div>

                {/* Scheduled Date/Time (conditional) */}
                {deliveryDetails.deliveryType === 'scheduled' && (
                  <>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Scheduled Date *
                      </label>
                      <div className='relative'>
                        <FaCalendarAlt className='absolute left-3 top-3 text-gray-400' />
                        <input
                          type='date'
                          name='scheduledDate'
                          value={deliveryDetails.scheduledDate}
                          onChange={handleInputChange}
                          min={getMinDate()}
                          max={getMaxDate()}
                          className='w-full pl-10 pr-4 py-3 border text-black/80 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Scheduled Time *
                      </label>
                      <div className='relative'>
                        <FaClock className='absolute left-3 top-3 text-gray-400' />
                        <select
                          name='scheduledTime'
                          value={deliveryDetails.scheduledTime}
                          onChange={handleInputChange}
                          className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                        >
                          <option className='text-black/40' value=''>Select time slot</option>
                          <option className='text-black/80' value='09:00-12:00'>Morning (9:00 AM - 12:00 PM)</option>
                          <option className='text-black/80' value='12:00-15:00'>Afternoon (12:00 PM - 3:00 PM)</option>
                          <option className='text-black/80' value='15:00-18:00'>Evening (3:00 PM - 6:00 PM)</option>
                          <option className='text-black/80' value='18:00-21:00'>Night (6:00 PM - 9:00 PM)</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Alternate Phone */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Alternate Phone Number (Optional)
                  </label>
                  <div className='relative'>
                    <FaPhone className='absolute left-3 top-3 text-gray-400' />
                    <input
                      type='tel'
                      name='alternatePhone'
                      value={deliveryDetails.alternatePhone}
                      onChange={handleInputChange}
                      placeholder='Alternative contact number'
                      className='w-full pl-10 pr-4 py-3 border text-black/80 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                    />
                  </div>
                </div>

                {/* Location Warning */}
                {!selectedLocation && (
                  <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                    <p className='text-sm text-yellow-700 flex items-center'>
                      <FaExclamationTriangle className='mr-2 flex-shrink-0' />
                      Please select a delivery location on the map
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type='submit'
                  disabled={submitting || !selectedLocation}
                  className={`w-full py-4 px-6 rounded-lg text-white font-semibold transition-all ${
                    submitting || !selectedLocation
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  }`}
                >
                  {submitting ? (
                    <span className='flex items-center justify-center'>
                      <FaSpinner className='animate-spin mr-2' />
                      Saving Delivery Details...
                    </span>
                  ) : (
                    'Confirm Delivery Details'
                  )}
                </button>
              </form>
            </div>

            {/* Info Box */}
            <div className='bg-blue-50 rounded-xl p-6'>
              <h3 className='font-semibold text-blue-800 mb-2'>Delivery Information</h3>
              <ul className='space-y-2 text-sm text-blue-700'>
                <li className='flex items-start'>
                  <FaCheckCircle className='mr-2 mt-0.5 flex-shrink-0' />
                  Free delivery for orders above Rs. 5000
                </li>
                <li className='flex items-start'>
                  <FaCheckCircle className='mr-2 mt-0.5 flex-shrink-0' />
                  Real-time tracking available for all deliveries
                </li>
                <li className='flex items-start'>
                  <FaCheckCircle className='mr-2 mt-0.5 flex-shrink-0' />
                  Contact delivery partner via SMS updates
                </li>
                <li className='flex items-start'>
                  <FaCheckCircle className='mr-2 mt-0.5 flex-shrink-0' />
                  Proof of delivery with photo/signature
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryDetailsPage;