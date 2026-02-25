import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api';
import { FaMapMarkerAlt, FaTruck, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import deliveryService from '../../services/Delivery.service';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
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
  fullscreenControl: true
};

const DeliveryDetailsModal = ({ order, userRole, currentUser, onClose, onDeliveryUpdate }) => {
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [address, setAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(false);

  // UPDATED: Status options based on user role with proper disabled states
  const statusOptions = userRole === 'customer' 
    ? [
        { value: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚', color: 'orange', disabled: true },
        { value: 'delivered', label: 'Mark as Received', icon: '✅', color: 'green', disabled: false }
      ]
    : [
        { value: 'pending', label: 'Pending', icon: '⏳', color: 'gray' },
        { value: 'assigned', label: 'Assigned', icon: '👤', color: 'indigo' },
        { value: 'picked_up', label: 'Picked Up', icon: '📦', color: 'purple' },
        { value: 'in_transit', label: 'In Transit', icon: '🚚', color: 'cyan' },
        { value: 'out_for_delivery', label: 'Out for Delivery', icon: '🚛', color: 'orange' },
        { value: 'delivered', label: 'Delivered', icon: '✅', color: 'green' },
        { value: 'failed', label: 'Failed', icon: '❌', color: 'red' },
        { value: 'returned', label: 'Returned', icon: '↩️', color: 'yellow' }
      ];

  useEffect(() => {
    loadDeliveryDetails();
  }, [order]);

  // UPDATED: Load delivery details with proper error handling
  const loadDeliveryDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to get existing delivery
      let deliveryData = await deliveryService.getDeliveryByOrder(order.id);
      
      if (!deliveryData) {
        // Create new delivery record if doesn't exist
        const result = await deliveryService.createDeliveryFromOrder(order, {
          username: currentUser?.name || order.customer?.name,
          enableRealTimeTracking: true
        });
        
        if (result.success) {
          deliveryData = result.delivery;
          Notify.success('Delivery record created successfully', {
            position: 'right-top'
          });
        } else {
          throw new Error(result.error || 'Failed to create delivery');
        }
      }
      
      setDelivery(deliveryData);
      
      if (deliveryData) {
        // Set map location from coordinates
        if (deliveryData.deliveryAddress?.location) {
          const coords = deliveryData.deliveryAddress.location;
          setSelectedLocation(coords);
          setMapCenter(coords);
        } else if (deliveryData.deliveryAddress?.coordinates) {
          // Handle GeoPoint format
          const coords = {
            lat: deliveryData.deliveryAddress.coordinates.latitude,
            lng: deliveryData.deliveryAddress.coordinates.longitude
          };
          setSelectedLocation(coords);
          setMapCenter(coords);
        }
        
        setAddress(deliveryData.deliveryAddress?.fullAddress || '');
        setDeliveryNotes(deliveryData.tracking?.deliveryNotes || '');
        setDeliveryStatus(deliveryData.tracking?.status || 'pending');
      }
    } catch (error) {
      console.error('Error loading delivery details:', error);
      setError(error.message || 'Failed to load delivery details');
      Notify.failure('Failed to load delivery details', {
        position: 'right-top'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (event) => {
    if (userRole !== 'customer' && isEditing) {
      const newLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      setSelectedLocation(newLocation);
      
      // Reverse geocode to get address
      reverseGeocode(newLocation);
    }
  };

  const reverseGeocode = async (location) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    
    try {
      const result = await geocoder.geocode({ location });
      if (result.results[0]) {
        setAddress(result.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const onMapLoad = (map) => {
    setMapsLoaded(true);
  };

  const onMapError = () => {
    setMapsError(true);
    setError('Failed to load Google Maps. Please try again.');
  };

  // UPDATED: Handle form submission with proper data structure
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!delivery) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let updates = {};

      // Prepare updates based on user role
      if (userRole !== 'customer') {
        // Admin/staff updates
        updates = {
          status: deliveryStatus,
          note: deliveryNotes,
          location: selectedLocation
        };

        // If status is delivered, prepare proof data
        if (deliveryStatus === 'delivered') {
          updates.proofData = {
            notes: deliveryNotes || 'Delivered successfully',
            deliveredBy: currentUser?.name || 'Delivery Staff',
            location: selectedLocation
          };
        }
      } else {
        // Customer updates (only mark as received)
        updates = {
          status: 'delivered',
          note: 'Customer confirmed receipt',
          proofData: {
            notes: 'Customer confirmed receipt',
            deliveredBy: currentUser?.name || 'Customer'
          }
        };
      }

      await onDeliveryUpdate(delivery.docId || delivery.id, updates);
      
      // Reload delivery details after successful update
      await loadDeliveryDetails();
      
      setIsEditing(false);
      Notify.success('Delivery details updated successfully', {
        position: 'right-top'
      });
      
      // Close modal after 2 seconds if delivered by customer
      if (userRole === 'customer') {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating delivery:', error);
      setError(error.message || 'Failed to update delivery details');
      Notify.failure('Failed to update delivery details', {
        position: 'right-top'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATED: Handle create delivery manually
  const handleCreateDelivery = async () => {
    try {
      setIsSubmitting(true);
      const result = await deliveryService.createDeliveryFromOrder(order, {
        username: currentUser?.name || order.customer?.name,
        enableRealTimeTracking: true,
        deliveryInstructions: deliveryNotes
      });
      
      if (result.success) {
        setDelivery(result.delivery);
        Notify.success('Delivery created successfully', {
          position: 'right-top'
        });
        setIsEditing(true);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating delivery:', error);
      setError(error.message || 'Failed to create delivery');
      Notify.failure('Failed to create delivery', {
        position: 'right-top'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[color] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl max-w-3xl w-full p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center">
            <FaSpinner className="animate-spin text-4xl text-purple-600" />
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-4xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FaTruck className="text-2xl text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                {delivery ? 'Delivery Details' : 'Create Delivery'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Order Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Order ID:</p>
                <p className="font-semibold text-gray-900">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer:</p>
                <p className="font-semibold text-gray-900">{order.customer?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone:</p>
                <p className="font-semibold text-gray-900">{order.customer?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery ID:</p>
                <p className="font-semibold text-gray-900">{delivery?.id || 'Not created'}</p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <FaExclamationTriangle />
                {error}
              </p>
            </div>
          )}

          {/* If no delivery exists, show create button for staff */}
          {!delivery && userRole !== 'customer' && (
            <div className="mb-6 text-center">
              <button
                onClick={handleCreateDelivery}
                disabled={isSubmitting}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <FaSpinner className="animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Delivery Record'
                )}
              </button>
            </div>
          )}

          {/* Delivery Form */}
          {delivery && (
            <form onSubmit={handleSubmit}>
              {/* Map Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Location
                </label>
                {!mapsError ? (
                  <LoadScript
                    googleMapsApiKey={import.meta.env.VITE_GMAP_API_KEY}
                    libraries={['places']}
                    onError={onMapError}
                  >
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={mapCenter}
                      zoom={15}
                      onClick={handleMapClick}
                      onLoad={onMapLoad}
                      options={{
                        ...mapOptions,
                        draggable: (userRole !== 'customer' && isEditing)
                      }}
                    >
                      {selectedLocation && mapsLoaded && (
                        <>
                          <Marker
                            position={selectedLocation}
                            icon={{
                              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                              scaledSize: new window.google.maps.Size(40, 40)
                            }}
                          />
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
                        </>
                      )}
                    </GoogleMap>
                  </LoadScript>
                ) : (
                  <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Map unavailable. Please enter address manually.</p>
                  </div>
                )}
                
                {/* Address Display/Input */}
                <div className="mt-3">
                  {isEditing && userRole !== 'customer' ? (
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Delivery address"
                    />
                  ) : (
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      <FaMapMarkerAlt className="inline mr-2 text-red-500" />
                      {address || 'No address selected'}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Status - Based on Role */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {statusOptions.map((status) => {
                    const isSelected = deliveryStatus === status.value;
                    return (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => !status.disabled && setDeliveryStatus(status.value)}
                        disabled={status.disabled}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? `${getStatusColor(status.color)} border-2 border-purple-600`
                            : status.disabled
                            ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{status.icon}</div>
                        <div className="text-xs font-medium">{status.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Notes
                </label>
                {isEditing ? (
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Add delivery notes, special instructions, etc."
                  />
                ) : (
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {deliveryNotes || 'No delivery notes'}
                  </p>
                )}
              </div>

              {/* Timeline */}
              {delivery?.tracking?.timeline && delivery.tracking.timeline.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Delivery Timeline</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {delivery.tracking.timeline.map((event, index) => (
                      <div key={index} className="flex items-start gap-3 mb-3 last:mb-0">
                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-purple-600"></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {event.status?.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {event.note && (
                            <p className="text-xs text-gray-600 mt-1">{event.note}</p>
                          )}
                          {event.location && (
                            <p className="text-xs text-gray-500 mt-1">
                              📍 Lat: {event.location.lat?.toFixed(6)}, Lng: {event.location.lng?.toFixed(6)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tracking Info */}
              {delivery?.realTimeTracking?.trackingUrl && (
                <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 mb-1">Tracking URL:</p>
                  <a 
                    href={delivery.realTimeTracking.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm break-all"
                  >
                    {delivery.realTimeTracking.trackingUrl}
                  </a>
                  <p className="text-xs text-blue-600 mt-1">
                    Share Code: {delivery.realTimeTracking.shareCode}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                {userRole !== 'customer' && (
                  <>
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Edit Delivery Details
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            loadDeliveryDetails(); // Reset changes
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <FaSpinner className="animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </>
                    )}
                  </>
                )}
                
                {userRole === 'customer' && deliveryStatus === 'out_for_delivery' && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        Mark as Received
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeliveryDetailsModal;