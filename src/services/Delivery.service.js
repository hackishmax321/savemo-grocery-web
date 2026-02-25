import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  startAfter,
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  writeBatch,
  GeoPoint
} from "firebase/firestore";
import { db } from "../db/Firebase.config";
import axios from "axios";

// Configure axios instance for geocoding service (Google Maps)
const mapsApi = axios.create({
  baseURL: 'https://maps.googleapis.com/maps/api',
  timeout: 10000,
});

class DeliveryService {
  constructor() {
    this.collectionName = "deliveries";
    this.googleMapsApiKey = import.meta.env.VITE_GMAP_API_KEY || '';
  }

  /**
   * Create a new delivery record from order
   * @param {Object} orderData - Order data from OrderService
   * @param {Object} deliveryOptions - Additional delivery options
   * @returns {Promise<Object>} - Created delivery record
   */
  async createDeliveryFromOrder(orderData, deliveryOptions = {}) {
    try {
      // Extract order information
      const {
        id: orderId,
        customer,
        shippingInfo,
        items,
        total,
        storeId,
        createdBy,
        orderReference
      } = orderData;

      // Validate required fields
      if (!orderId) {
        throw new Error("Order ID is required");
      }

      if (!shippingInfo || !shippingInfo.address) {
        throw new Error("Shipping address is required");
      }

      // Get coordinates from address or use provided coordinates
      let coordinates = null;
      let locationObj = null;
      
      // ADDED: Check if coordinates are already provided in the correct format
      if (shippingInfo.coordinates) {
        // Handle {lat: x, lng: y} format
        if (shippingInfo.coordinates.lat !== undefined && shippingInfo.coordinates.lng !== undefined) {
          coordinates = new GeoPoint(shippingInfo.coordinates.lat, shippingInfo.coordinates.lng);
          locationObj = {
            lat: shippingInfo.coordinates.lat,
            lng: shippingInfo.coordinates.lng
          };
        }
        // Handle GeoPoint format
        else if (shippingInfo.coordinates.latitude !== undefined && shippingInfo.coordinates.longitude !== undefined) {
          coordinates = shippingInfo.coordinates;
          locationObj = {
            lat: shippingInfo.coordinates.latitude,
            lng: shippingInfo.coordinates.longitude
          };
        }
      }
      
      // If no coordinates provided, try to geocode
      if (!coordinates) {
        const geocodeResult = await this.getCoordinatesFromAddress(shippingInfo);
        coordinates = geocodeResult.coordinates;
        locationObj = geocodeResult.location;
      }

      // Generate delivery ID
      const deliveryId = `DEL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Calculate estimated delivery time (default: 1-2 hours for local, 1-3 days for shipping)
      const estimatedDeliveryTime = this.calculateEstimatedDelivery(shippingInfo, items, deliveryOptions);

      // Create delivery document
      const deliveryDocData = {
        id: deliveryId,
        orderId: orderId,
        orderReference: orderReference || orderId,
        
        // Customer information
        customer: {
            id: customer?.id || null,
            name: customer?.name || '',
            email: customer?.email || '',
            phone: customer?.phone || shippingInfo?.phone || '',
            // ADDED: Ensure username is never undefined
            username: deliveryOptions?.username || this.resolveUsername(customer?.name) || 'customer'
        },

        // Delivery address with coordinates
        deliveryAddress: {
            fullAddress: this.formatFullAddress(shippingInfo) || '',
            address: shippingInfo?.address || '',
            address2: shippingInfo?.address2 || '',
            city: shippingInfo?.city || '',
            state: shippingInfo?.state || '',
            zipCode: shippingInfo?.zipCode || '',
            country: shippingInfo?.country || 'Sri Lanka',
            instructions: shippingInfo?.instructions || deliveryOptions?.deliveryInstructions || '',
            landmark: shippingInfo?.landmark || '',
            // ADDED: Conditional assignment to prevent undefined
            coordinates: coordinates || null,
            location: locationObj || null
        },

        // Delivery details
        deliveryDetails: {
          type: deliveryOptions.deliveryType || 'standard', // 'express', 'standard', 'scheduled'
          scheduledTime: deliveryOptions.scheduledTime || null,
          estimatedDelivery: estimatedDeliveryTime.estimated,
          estimatedTimeRange: estimatedDeliveryTime.timeRange,
          distance: estimatedDeliveryTime.distance || null,
          duration: estimatedDeliveryTime.duration || null, // in minutes
          zone: deliveryOptions.deliveryZone || null
        },

        // Package information
        packageInfo: {
        // ADDED: Safe mapping with null checks for all properties
        items: items ? items.map(item => ({
            id: item?.id || item?.productId || '',
            name: item?.name || '',
            quantity: item?.quantity || 0,
            unit: item?.unit || 'unit',
            price: item?.price || 0,
            totalPrice: item?.totalPrice || (item?.price && item?.quantity ? item.price * item.quantity : 0),
            specialHandling: this.getSpecialHandling(item) || null // ADDED: null instead of undefined
        })).filter(item => item.name) : [],
          totalItems: items ? items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0,
          totalValue: total || 0,
          weight: deliveryOptions.weight || (items ? this.estimateWeight(items) : 0), // estimated weight in kg
          specialInstructions: deliveryOptions.specialInstructions || shippingInfo.specialInstructions || ''
        },

        // Assignment tracking
        assignment: {
          status: 'pending', // 'pending', 'assigned', 'accepted', 'rejected'
          deliveryPartnerId: null,
          deliveryPartnerName: null,
          deliveryPartnerPhone: null,
          assignedAt: null,
          acceptedAt: null,
          rejectionReason: null
        },

        // Delivery progress tracking
        tracking: {
          status: 'pending', // 'pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'
          currentLocation: null,
          lastUpdated: null,
          timeline: [
            {
              status: 'pending',
              timestamp: new Date().toISOString(),
              location: locationObj,
              note: 'Delivery created and pending assignment'
            }
          ],
          proofOfDelivery: null, // Will store image URL or signature
          deliveryNotes: null
        },

        // Real-time tracking (for live map updates)
        realTimeTracking: {
          enabled: deliveryOptions.enableRealTimeTracking !== false,
          shareCode: this.generateShareCode(deliveryId),
          trackingUrl: deliveryOptions.enableRealTimeTracking ? 
            `${window.location.origin}/track/${deliveryId}` : null,
          lastPing: null,
          route: [] // Array of {lat, lng, timestamp} for route history
        },

        // Status history
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date().toISOString(),
            note: 'Delivery record created',
            updatedBy: createdBy || 'system'
          }
        ],

        // Store information
        storeId: storeId || null,
        
        // Metadata
        createdBy: createdBy || 'system',
        priority: this.calculatePriority(items, deliveryOptions),
        isActive: true,
        isCompleted: false,
        isCancelled: false,
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        estimatedDeliveryStart: estimatedDeliveryTime.start,
        estimatedDeliveryEnd: estimatedDeliveryTime.end
      };

      // Create document in Firestore
      await setDoc(doc(db, this.collectionName, deliveryId), deliveryDocData);

      // Update the order with delivery reference
      await this.updateOrderWithDelivery(orderId, deliveryId);

      // If this is an express delivery, trigger immediate assignment
      if (deliveryOptions.deliveryType === 'express') {
        await this.triggerImmediateAssignment(deliveryId);
      }

      // ADDED: Return the created delivery with proper formatting
      const createdDelivery = {
        ...deliveryDocData,
        docId: deliveryId,
        id: deliveryId
      };

      return {
        success: true,
        delivery: createdDelivery,
        // ADDED: Include tracking URL for immediate use
        trackingUrl: deliveryDocData.realTimeTracking.trackingUrl,
        shareCode: deliveryDocData.realTimeTracking.shareCode
      };

    } catch (error) {
      console.error("Error creating delivery from order:", error);
      return {
        success: false,
        error: error.message || "An error occurred while creating delivery record"
      };
    }
  }

  /**
   * Get coordinates from address using Google Maps Geocoding API
   * @param {Object} address - Shipping address object
   * @returns {Promise<Object>} - {coordinates: GeoPoint, location: {lat, lng}}
   */
  async getCoordinatesFromAddress(address) {
    try {
      if (!this.googleMapsApiKey) {
        console.warn("Google Maps API key not configured");
        return {
          coordinates: null,
          location: null
        };
      }

      const addressString = this.formatFullAddress(address);
      
      const response = await mapsApi.get('/geocode/json', {
        params: {
          address: addressString,
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return {
          coordinates: new GeoPoint(location.lat, location.lng),
          location: {
            lat: location.lat,
            lng: location.lng
          }
        };
      }

      return {
        coordinates: null,
        location: null
      };
    } catch (error) {
      console.error("Error getting coordinates:", error);
      return {
        coordinates: null,
        location: null
      };
    }
  }

  /**
   * Format full address string
   * @param {Object} address - Address object
   * @returns {string} - Formatted address
   */
  formatFullAddress(address) {
    const parts = [
      address.address,
      address.address2,
      address.city,
      address.state,
      address.zipCode,
      address.country
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ');
  }

  /**
   * Calculate estimated delivery time
   * @param {Object} address - Shipping address
   * @param {Array} items - Order items
   * @param {Object} options - Delivery options
   * @returns {Object} - Estimated delivery times
   */
  calculateEstimatedDelivery(address, items, options = {}) {
    const now = new Date();
    const estimated = new Date(now);
    
    // Base delivery time in minutes based on delivery type
    let baseMinutes = 60; // Default 1 hour for standard
    
    if (options?.deliveryType === 'express') {
        baseMinutes = 30; // 30 minutes for express
    } else if (options?.deliveryType === 'scheduled' && options?.scheduledTime) {
        // For scheduled, use the scheduled time
        const scheduledDate = new Date(options.scheduledTime);
        return {
        estimated: scheduledDate.toISOString(),
        start: scheduledDate.toISOString(),
        end: new Date(scheduledDate.getTime() + 30 * 60000).toISOString(),
        timeRange: this.formatTimeRange(scheduledDate, 30),
        distance: null,
        duration: 0
        };
    }
    
    // ADDED: Safe access to address properties
    if (address?.city?.toLowerCase() === 'colombo') {
        baseMinutes = Math.max(baseMinutes - 15, 15);
    } else if (address?.city?.toLowerCase() === 'gampaha' || address?.city?.toLowerCase() === 'kandy') {
        baseMinutes += 30;
    } else {
        baseMinutes += 60;
    }
    
    // ADDED: Safe check for items
    const itemCount = items && Array.isArray(items) 
        ? items.reduce((sum, item) => sum + (item?.quantity || 0), 0) 
        : 0;
        
    if (itemCount > 10) {
        baseMinutes += 30;
    } else if (itemCount > 5) {
        baseMinutes += 15;
    }
    
    // ADDED: Safe check for special items
    const hasFragile = items && Array.isArray(items) ? items.some(item => 
        item?.category?.toLowerCase().includes('glass') || 
        item?.name?.toLowerCase().includes('fragile')
    ) : false;
    
    if (hasFragile) {
        baseMinutes += 15;
    }
    
    // Calculate time range
    const startTime = new Date(now.getTime() + baseMinutes * 60000);
    const endTime = new Date(now.getTime() + (baseMinutes + 30) * 60000);
    
    return {
        estimated: startTime.toISOString(),
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        timeRange: this.formatTimeRange(startTime, 30),
        distance: null,
        duration: baseMinutes
    };
    }

  /**
   * Format time range for display
   * @param {Date} startTime - Start time
   * @param {number} durationMinutes - Duration in minutes
   * @returns {string} - Formatted time range
   */
  formatTimeRange(startTime, durationMinutes) {
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    return `${this.formatTime(startTime)} - ${this.formatTime(endTime)}`;
  }

  /**
   * Format time for display
   * @param {Date} date - Date object
   * @returns {string} - Formatted time
   */
  formatTime(date) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Estimate package weight based on items
   * @param {Array} items - Order items
   * @returns {number} - Estimated weight in kg
   */
  estimateWeight(items) {
    return items.reduce((sum, item) => {
      // Rough estimation: average item weight 0.5kg
      const itemWeight = item.weight || 0.5;
      return sum + (itemWeight * (item.quantity || 1));
    }, 0);
  }

  /**
   * Get special handling requirements for item
   * @param {Object} item - Order item
   * @returns {string|null} - Special handling note
   */
  getSpecialHandling(item) {
    if (item.category?.toLowerCase().includes('frozen') || 
        item.name?.toLowerCase().includes('frozen')) {
      return 'Keep frozen';
    }
    if (item.category?.toLowerCase().includes('fragile') || 
        item.name?.toLowerCase().includes('glass')) {
      return 'Fragile - handle with care';
    }
    if (item.category?.toLowerCase().includes('hazardous') || 
        item.name?.toLowerCase().includes('chemical')) {
      return 'Hazardous material - special handling required';
    }
    return null;
  }

  /**
   * Generate share code for tracking
   * @param {string} deliveryId - Delivery ID
   * @returns {string} - Share code
   */
  generateShareCode(deliveryId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${deliveryId.slice(-4)}${random}${timestamp.slice(-3)}`.toUpperCase();
  }

  /**
   * Calculate delivery priority
   * @param {Array} items - Order items
   * @param {Object} options - Delivery options
   * @returns {number} - Priority level (1-5, 5 being highest)
   */
  calculatePriority(items, options) {
    let priority = 3; // Default medium priority
    
    // Express delivery gets highest priority
    if (options?.deliveryType === 'express') {
        priority = 5;
    }
    
    // ADDED: Safe calculation of total value
    const totalValue = items && Array.isArray(items) 
        ? items.reduce((sum, item) => sum + (item?.totalPrice || item?.price * item?.quantity || 0), 0) 
        : 0;
        
    if (totalValue > 5000) {
        priority = Math.min(priority + 1, 5);
    }
    
    // ADDED: Safe check for perishable items
    const hasPerishable = items && Array.isArray(items) ? items.some(item => 
        item?.category?.toLowerCase().includes('food') ||
        item?.category?.toLowerCase().includes('grocery')
    ) : false;
    
    if (hasPerishable) {
        priority = Math.min(priority + 1, 5);
    }
    
    return priority;
    }

  /**
   * Update order with delivery reference
   * @param {string} orderId - Order ID
   * @param {string} deliveryId - Delivery ID
   */
  async updateOrderWithDelivery(orderId, deliveryId) {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        "deliveryDetails.deliveryId": deliveryId,
        "deliveryDetails.trackingNumber": deliveryId,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating order with delivery:", error);
    }
  }

  /**
   * Trigger immediate assignment for express deliveries
   * @param {string} deliveryId - Delivery ID
   */
  async triggerImmediateAssignment(deliveryId) {
    // This would typically call a cloud function or notify delivery partners
    console.log(`Triggering immediate assignment for delivery: ${deliveryId}`);
  }

  /**
   * Get delivery by ID
   * @param {string} deliveryId - Delivery ID
   * @returns {Promise<Object|null>} - Delivery object
   */
  async getDelivery(deliveryId) {
    try {
      const deliveryRef = doc(db, this.collectionName, deliveryId);
      const deliverySnap = await getDoc(deliveryRef);
      
      if (deliverySnap.exists()) {
        const data = deliverySnap.data();
        // ADDED: Convert Firestore timestamps and format response
        return {
          docId: deliveryId,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          estimatedDeliveryStart: data.estimatedDeliveryStart?.toDate(),
          estimatedDeliveryEnd: data.estimatedDeliveryEnd?.toDate(),
          // Ensure location is in {lat, lng} format
          deliveryAddress: {
            ...data.deliveryAddress,
            location: data.deliveryAddress.location || 
              (data.deliveryAddress.coordinates ? {
                lat: data.deliveryAddress.coordinates.latitude,
                lng: data.deliveryAddress.coordinates.longitude
              } : null)
          }
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting delivery:", error);
      return null;
    }
  }

  /**
   * Get delivery by order ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object|null>} - Delivery object
   */
  async getDeliveryByOrder(orderId) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("orderId", "==", orderId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
          docId: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting delivery by order:", error);
      return null;
    }
  }

  /**
   * Get delivery by tracking code
   * @param {string} shareCode - Share code
   * @returns {Promise<Object|null>} - Delivery object
   */
  async getDeliveryByShareCode(shareCode) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("realTimeTracking.shareCode", "==", shareCode),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
          docId: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting delivery by share code:", error);
      return null;
    }
  }

  /**
   * Assign delivery to partner
   * @param {string} deliveryId - Delivery ID
   * @param {Object} partnerData - Delivery partner data
   * @returns {Promise<Object>} - Updated delivery
   */
  async assignDelivery(deliveryId, partnerData) {
    try {
      const deliveryRef = doc(db, this.collectionName, deliveryId);
      
      const updates = {
        "assignment.status": "assigned",
        "assignment.deliveryPartnerId": partnerData.id,
        "assignment.deliveryPartnerName": partnerData.name,
        "assignment.deliveryPartnerPhone": partnerData.phone,
        "assignment.assignedAt": new Date().toISOString(),
        "tracking.status": "assigned",
        "tracking.timeline": arrayUnion({
          status: "assigned",
          timestamp: new Date().toISOString(),
          note: `Assigned to ${partnerData.name}`,
          updatedBy: partnerData.id
        }),
        updatedAt: serverTimestamp()
      };

      await updateDoc(deliveryRef, updates);

      return {
        success: true,
        delivery: await this.getDelivery(deliveryId)
      };
    } catch (error) {
      console.error("Error assigning delivery:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update delivery status with location
   * @param {string} deliveryId - Delivery ID
   * @param {string} status - New status
   * @param {Object} location - Current location {lat, lng}
   * @param {string} note - Status note
   * @returns {Promise<Object>} - Updated delivery
   */
  async updateDeliveryStatus(deliveryId, status, location = null, note = "") {
    try {
      const deliveryRef = doc(db, this.collectionName, deliveryId);
      const delivery = await this.getDelivery(deliveryId);
      
      if (!delivery) {
        throw new Error("Delivery not found");
      }

      const updates = {
        "tracking.status": status,
        "tracking.lastUpdated": new Date().toISOString(),
        "tracking.timeline": arrayUnion({
          status: status,
          timestamp: new Date().toISOString(),
          location: location,
          note: note || `Status updated to ${status}`
        }),
        updatedAt: serverTimestamp()
      };

      // Update real-time tracking with location
      if (location && delivery.realTimeTracking?.enabled) {
        updates["realTimeTracking.lastPing"] = new Date().toISOString();
        updates["realTimeTracking.route"] = arrayUnion({
          lat: location.lat,
          lng: location.lng,
          timestamp: new Date().toISOString()
        });
        updates["tracking.currentLocation"] = location;
      }

      // Handle status-specific updates
      if (status === 'picked_up') {
        updates["tracking.pickedUpAt"] = new Date().toISOString();
      } else if (status === 'out_for_delivery') {
        updates["tracking.outForDeliveryAt"] = new Date().toISOString();
      } else if (status === 'delivered') {
        updates["isCompleted"] = true;
        updates["tracking.deliveredAt"] = new Date().toISOString();
      } else if (status === 'failed' || status === 'returned') {
        updates["isCompleted"] = true;
        updates["isCancelled"] = status === 'returned';
      }

      await updateDoc(deliveryRef, updates);

      return {
        success: true,
        delivery: await this.getDelivery(deliveryId)
      };
    } catch (error) {
      console.error("Error updating delivery status:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mark delivery as delivered with proof
   * @param {string} deliveryId - Delivery ID
   * @param {Object} proofData - Proof of delivery
   * @returns {Promise<Object>} - Updated delivery
   */
  async markAsDelivered(deliveryId, proofData) {
    try {
      const { signature, photo, notes, deliveredBy, location } = proofData;
      
      const deliveryRef = doc(db, this.collectionName, deliveryId);
      
      const updates = {
        "tracking.status": "delivered",
        "tracking.deliveredAt": new Date().toISOString(),
        "tracking.proofOfDelivery": {
          signature: signature || null,
          photo: photo || null,
          timestamp: new Date().toISOString(),
          notes: notes || "",
          deliveredBy: deliveredBy || null,
          location: location || null
        },
        "tracking.timeline": arrayUnion({
          status: "delivered",
          timestamp: new Date().toISOString(),
          location: location,
          note: "Package delivered successfully",
          proof: signature || photo ? "Proof collected" : null
        }),
        isCompleted: true,
        updatedAt: serverTimestamp()
      };

      await updateDoc(deliveryRef, updates);

      // Update order status to delivered
      const delivery = await this.getDelivery(deliveryId);
      if (delivery) {
        const orderRef = doc(db, "orders", delivery.orderId);
        await updateDoc(orderRef, {
          orderStatus: "delivered",
          isDelivered: true,
          "deliveryDetails.actualDelivery": new Date().toISOString(),
          "deliveryDetails.deliveredBy": deliveredBy,
          updatedAt: serverTimestamp()
        });
      }

      return {
        success: true,
        delivery: await this.getDelivery(deliveryId)
      };
    } catch (error) {
      console.error("Error marking as delivered:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all deliveries with filters
   * @param {Object} filters - Filter options
   * @param {number} pageSize - Items per page
   * @param {Object} lastDoc - Last document for pagination
   * @returns {Promise<Object>} - Paginated results
   */
  async getAllDeliveries(filters = {}, pageSize = 20, lastDoc = null) {
    try {
      const queryConstraints = [];
      
      // Apply filters
      if (filters.status) {
        queryConstraints.push(where("tracking.status", "==", filters.status));
      }
      
      if (filters.assignmentStatus) {
        queryConstraints.push(where("assignment.status", "==", filters.assignmentStatus));
      }
      
      if (filters.deliveryPartnerId) {
        queryConstraints.push(where("assignment.deliveryPartnerId", "==", filters.deliveryPartnerId));
      }
      
      if (filters.deliveryType) {
        queryConstraints.push(where("deliveryDetails.type", "==", filters.deliveryType));
      }
      
      if (filters.storeId) {
        queryConstraints.push(where("storeId", "==", filters.storeId));
      }
      
      if (filters.isActive !== undefined) {
        queryConstraints.push(where("isActive", "==", filters.isActive));
      }
      
      if (filters.isCompleted !== undefined) {
        queryConstraints.push(where("isCompleted", "==", filters.isCompleted));
      }

      // Date range filters
      if (filters.startDate) {
        queryConstraints.push(where("createdAt", ">=", new Date(filters.startDate)));
      }
      
      if (filters.endDate) {
        queryConstraints.push(where("createdAt", "<=", new Date(filters.endDate)));
      }

      // Priority filter
      if (filters.minPriority) {
        queryConstraints.push(where("priority", ">=", filters.minPriority));
      }

      // Add ordering
      queryConstraints.push(orderBy("priority", "desc"));
      queryConstraints.push(orderBy("createdAt", "desc"));
      queryConstraints.push(limit(pageSize));

      // Apply pagination
      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }

      // Create query
      const q = query(collection(db, this.collectionName), ...queryConstraints);
      const snapshot = await getDocs(q);
      
      const deliveries = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          docId: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      });

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];

      return {
        success: true,
        deliveries,
        hasMore: deliveries.length === pageSize,
        lastDoc: lastVisible
      };
    } catch (error) {
      console.error("Error getting deliveries:", error);
      return {
        success: false,
        deliveries: [],
        error: error.message
      };
    }
  }

  /**
   * Get pending deliveries for assignment
   * @returns {Promise<Array>} - Array of pending deliveries
   */
  async getPendingDeliveries() {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("assignment.status", "==", "pending"),
        where("isActive", "==", true),
        where("isCompleted", "==", false),
        orderBy("priority", "desc"),
        orderBy("createdAt", "asc")
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          docId: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      });
    } catch (error) {
      console.error("Error getting pending deliveries:", error);
      return [];
    }
  }

  /**
   * Get deliveries for a specific partner
   * @param {string} partnerId - Delivery partner ID
   * @param {string} status - Filter by status
   * @returns {Promise<Array>} - Array of deliveries
   */
  async getDeliveriesByPartner(partnerId, status = null) {
    try {
      const constraints = [
        where("assignment.deliveryPartnerId", "==", partnerId),
        where("isActive", "==", true)
      ];

      if (status) {
        constraints.push(where("tracking.status", "==", status));
      }

      constraints.push(orderBy("createdAt", "desc"));

      const q = query(collection(db, this.collectionName), ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          docId: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      });
    } catch (error) {
      console.error("Error getting partner deliveries:", error);
      return [];
    }
  }

  /**
   * Get deliveries near a location (requires geoqueries)
   * @param {Object} location - {lat, lng}
   * @param {number} radius - Radius in km
   * @returns {Promise<Array>} - Array of nearby deliveries
   */
  async getNearbyDeliveries(location, radius = 5) {
    try {
      // Note: This requires geohashing or a separate geoqueries setup
      // For now, return all pending deliveries as a fallback
      return await this.getPendingDeliveries();
    } catch (error) {
      console.error("Error getting nearby deliveries:", error);
      return [];
    }
  }

  /**
   * Cancel delivery
   * @param {string} deliveryId - Delivery ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} - Updated delivery
   */
  async cancelDelivery(deliveryId, reason) {
    try {
      const deliveryRef = doc(db, this.collectionName, deliveryId);
      const delivery = await this.getDelivery(deliveryId);
      
      if (!delivery) {
        throw new Error("Delivery not found");
      }

      const updates = {
        "tracking.status": "cancelled",
        "tracking.timeline": arrayUnion({
          status: "cancelled",
          timestamp: new Date().toISOString(),
          note: `Delivery cancelled: ${reason}`
        }),
        isActive: false,
        isCancelled: true,
        cancellationReason: reason,
        updatedAt: serverTimestamp()
      };

      await updateDoc(deliveryRef, updates);

      // Update order status
      const orderRef = doc(db, "orders", delivery.orderId);
      await updateDoc(orderRef, {
        orderStatus: "delivery_cancelled",
        "deliveryDetails.cancellationReason": reason,
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        delivery: await this.getDelivery(deliveryId)
      };
    } catch (error) {
      console.error("Error cancelling delivery:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update real-time location of delivery partner
   * @param {string} deliveryId - Delivery ID
   * @param {Object} location - {lat, lng}
   * @returns {Promise<Object>} - Updated delivery
   */
  async updateLiveLocation(deliveryId, location) {
    try {
      const deliveryRef = doc(db, this.collectionName, deliveryId);
      
      const updates = {
        "realTimeTracking.lastPing": new Date().toISOString(),
        "realTimeTracking.route": arrayUnion({
          lat: location.lat,
          lng: location.lng,
          timestamp: new Date().toISOString()
        }),
        "tracking.currentLocation": location,
        updatedAt: serverTimestamp()
      };

      await updateDoc(deliveryRef, updates);

      return {
        success: true,
        location
      };
    } catch (error) {
      console.error("Error updating live location:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get delivery tracking info for customer
   * @param {string} deliveryId - Delivery ID
   * @returns {Promise<Object>} - Tracking info
   */
  async getTrackingInfo(deliveryId) {
    try {
      const delivery = await this.getDelivery(deliveryId);
      
      if (!delivery) {
        throw new Error("Delivery not found");
      }

      return {
        success: true,
        tracking: {
          status: delivery.tracking.status,
          timeline: delivery.tracking.timeline,
          currentLocation: delivery.tracking.currentLocation,
          estimatedDelivery: delivery.deliveryDetails.estimatedDelivery,
          estimatedTimeRange: delivery.deliveryDetails.estimatedTimeRange,
          deliveryAddress: delivery.deliveryAddress,
          packageInfo: {
            totalItems: delivery.packageInfo.totalItems,
            specialInstructions: delivery.packageInfo.specialInstructions
          },
          deliveryPartner: delivery.assignment.deliveryPartnerId ? {
            name: delivery.assignment.deliveryPartnerName,
            phone: delivery.assignment.deliveryPartnerPhone
          } : null,
          shareCode: delivery.realTimeTracking.shareCode,
          trackingUrl: delivery.realTimeTracking.trackingUrl
        }
      };
    } catch (error) {
      console.error("Error getting tracking info:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get delivery statistics
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} - Statistics
   */
  async getDeliveryStats(startDate, endDate) {
    try {
      const deliveries = await this.getAllDeliveries({
        startDate: startDate || new Date(0),
        endDate: endDate || new Date()
      });

      if (!deliveries.success) {
        return null;
      }

      const stats = {
        totalDeliveries: deliveries.deliveries.length,
        completedDeliveries: 0,
        pendingDeliveries: 0,
        cancelledDeliveries: 0,
        averageDeliveryTime: 0,
        deliveriesByStatus: {},
        deliveriesByType: {},
        partnerPerformance: {}
      };

      let totalDeliveryTime = 0;
      let completedCount = 0;

      deliveries.deliveries.forEach(delivery => {
        // Count by status
        stats.deliveriesByStatus[delivery.tracking.status] = 
          (stats.deliveriesByStatus[delivery.tracking.status] || 0) + 1;
        
        // Count by type
        stats.deliveriesByType[delivery.deliveryDetails.type] = 
          (stats.deliveriesByType[delivery.deliveryDetails.type] || 0) + 1;

        // Count categories
        if (delivery.tracking.status === 'delivered') {
          stats.completedDeliveries++;
          completedCount++;
          
          // Calculate delivery time
          const createdAt = new Date(delivery.createdAt);
          const deliveredAt = new Date(delivery.tracking.deliveredAt);
          const deliveryTime = (deliveredAt - createdAt) / (1000 * 60); // in minutes
          totalDeliveryTime += deliveryTime;
        } else if (delivery.tracking.status === 'cancelled') {
          stats.cancelledDeliveries++;
        } else {
          stats.pendingDeliveries++;
        }

        // Partner performance
        if (delivery.assignment.deliveryPartnerId) {
          const partnerId = delivery.assignment.deliveryPartnerId;
          if (!stats.partnerPerformance[partnerId]) {
            stats.partnerPerformance[partnerId] = {
              name: delivery.assignment.deliveryPartnerName,
              total: 0,
              completed: 0,
              cancelled: 0
            };
          }
          stats.partnerPerformance[partnerId].total++;
          if (delivery.tracking.status === 'delivered') {
            stats.partnerPerformance[partnerId].completed++;
          } else if (delivery.tracking.status === 'cancelled') {
            stats.partnerPerformance[partnerId].cancelled++;
          }
        }
      });

      // Calculate average delivery time
      stats.averageDeliveryTime = completedCount > 0 ? 
        Math.round(totalDeliveryTime / completedCount) : 0;

      return stats;
    } catch (error) {
      console.error("Error getting delivery stats:", error);
      return null;
    }
  }

  /**
   * Validate delivery address
   * @param {Object} address - Address to validate
   * @returns {Promise<Object>} - Validation result
   */
  async validateDeliveryAddress(address) {
    try {
      const errors = [];
      
      if (!address.address || address.address.trim() === '') {
        errors.push("Street address is required");
      }
      
      if (!address.city || address.city.trim() === '') {
        errors.push("City is required");
      }
      
      if (!address.phone || address.phone.trim() === '') {
        errors.push("Phone number is required");
      }

      // Try to get coordinates to validate address exists
      if (this.googleMapsApiKey && errors.length === 0) {
        const { coordinates } = await this.getCoordinatesFromAddress(address);
        if (!coordinates) {
          errors.push("Could not verify address location");
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ["Address validation failed"]
      };
    }
  }

  /**
   * Export deliveries to CSV
   * @param {Array} deliveries - Deliveries to export
   * @returns {string} - CSV string
   */
  exportToCSV(deliveries) {
    const headers = [
      "Delivery ID",
      "Order ID",
      "Customer Name",
      "Customer Phone",
      "Delivery Address",
      "Status",
      "Delivery Type",
      "Assigned To",
      "Created Date",
      "Completed Date",
      "Total Items",
      "Location Lat",
      "Location Lng"
    ];
    
    const rows = deliveries.map(delivery => [
      delivery.id,
      delivery.orderId,
      delivery.customer?.name || '',
      delivery.customer?.phone || '',
      delivery.deliveryAddress?.fullAddress || '',
      delivery.tracking?.status || '',
      delivery.deliveryDetails?.type || '',
      delivery.assignment?.deliveryPartnerName || 'Unassigned',
      delivery.createdAt?.toLocaleDateString(),
      delivery.tracking?.deliveredAt ? new Date(delivery.tracking.deliveredAt).toLocaleDateString() : '',
      delivery.packageInfo?.totalItems || 0,
      delivery.deliveryAddress?.location?.lat || '',
      delivery.deliveryAddress?.location?.lng || ''
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(","))
    ].join("\n");
    
    return csvContent;
  }

  /**
   * Resolve customer name to username
   * @param {string} customerName - Full customer name
   * @returns {string} - Username
   */
  resolveUsername(customerName) {
    if (!customerName) return 'customer';
    
    // Get first name or first part of name
    const nameParts = customerName.split(' ');
    return nameParts[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  }
}

// Create and export singleton instance
const deliveryService = new DeliveryService();
export default deliveryService;