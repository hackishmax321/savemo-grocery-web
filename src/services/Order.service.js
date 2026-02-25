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
  writeBatch
} from "firebase/firestore";
import { db } from "../db/Firebase.config";
import axios from "axios";

// Configure axios for payment backend
const paymentApi = axios.create({
  baseURL: import.meta.env.REACT_APP_PAYMENT_API_URL || 'https://payment-gate-payhere-node.onrender.com/api',
  timeout: 10000,
});

class OrderService {
  constructor() {
    this.collectionName = "orders";
    this.orderItemsCollection = "orderItems";
  }

  // ========== CRUD OPERATIONS ==========
  /**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} - Created order or error
 */
async createOrder(orderData) {
  try {
    const {
      items,
      total,
      subtotal,
      tax,
      deliveryFee,
      promoCode,
      discountAmount,
      paidAmount,
      paymentMethod,
      paymentStatus,
      orderStatus,
      shippingInfo,
      billingInfo,
      customerId,
      customerEmail,
      customerName,
      customerPhone,
      notes,
      storeId,
      createdBy,
      orderReference
    } = orderData;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Order must contain at least one item");
    }

    if (!customerId && !customerEmail) {
      throw new Error("Customer information is required");
    }

    // Generate order ID (use orderReference if provided for payment orders)
    const orderId = orderReference || `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const orderDocData = {
      id: orderId,
      items: items.map(item => ({
        itemId: item.docId || item.id || null,
        name: item.name || '',
        category: item.category || '',
        subCategory: item.subCategory || '',
        brand: item.brand || '',
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
        unit: item.unit || '',
        discountPercentage: parseFloat(item.discountPercentage) || 0,
        discountedPrice: parseFloat(item.discountedPrice) || parseFloat(item.price) || 0,
        totalPrice: (parseFloat(item.discountedPrice) || parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1),
        image: item.images?.[0] || item.image || '',
        barcode: item.barcode || '',
        appliedPromoCode: item.appliedPromoCode || null
      })),
      total: parseFloat(total) || 0,
      subtotal: subtotal ? parseFloat(subtotal) : parseFloat(total) || 0,
      tax: tax ? parseFloat(tax) : 0,
      deliveryFee: deliveryFee ? parseFloat(deliveryFee) : 0,
      promoCode: promoCode || null,
      discountAmount: discountAmount ? parseFloat(discountAmount) : 0,
      paidAmount: paidAmount ? parseFloat(paidAmount) : parseFloat(total) || 0,
      paymentMethod: paymentMethod || "cash",
      paymentStatus: paymentStatus || "pending",
      orderStatus: orderStatus || "processing",
      
      shippingInfo: {
        address: shippingInfo?.address || "",
        address2: shippingInfo?.address2 || "",
        city: shippingInfo?.city || "",
        state: shippingInfo?.state || "",
        zipCode: shippingInfo?.zipCode || "",
        country: shippingInfo?.country || "Sri Lanka",
        phone: shippingInfo?.phone || customerPhone || "",
        email: shippingInfo?.email || customerEmail || "",
        instructions: shippingInfo?.instructions || ""
      },
      
      billingInfo: billingInfo || shippingInfo || {},
      
      customer: {
        id: customerId || null,
        name: customerName || "",
        email: customerEmail || "",
        phone: customerPhone || ""
      },
      
      notes: notes || "",
      storeId: storeId || "",
      createdBy: createdBy || "",
      
      // Payment tracking
      paymentDetails: {
        transactionId: null,
        paidAt: null,
        paymentMethod: paymentMethod || "cash",
        paymentReference: orderReference || null,
        gatewayResponse: null
      },
      
      // Delivery tracking
      deliveryDetails: {
        estimatedDelivery: null,
        actualDelivery: null,
        deliveredBy: null,
        trackingNumber: null,
        carrier: null
      },
      
      // Status history
      statusHistory: [
        {
          status: orderStatus || "processing",
          timestamp: new Date().toISOString(),
          note: "Order created"
        }
      ],
      
      // Flags
      isActive: true,
      isPaid: paymentStatus === "paid",
      isDelivered: false,
      isCancelled: false,
      
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Create document in Firestore
    await setDoc(doc(db, this.collectionName, orderId), orderDocData);

    // Create order items in subcollection for detailed tracking
    const batch = writeBatch(db);
    
    items.forEach((item, index) => {
      const itemId = item.docId || item.id || `item_${index}`;
      const itemRef = doc(db, this.collectionName, orderId, this.orderItemsCollection, itemId);
      
      // Clean the item data to remove any undefined values
      const cleanItemData = {
        itemId: item.docId || item.id || null,
        name: item.name || '',
        category: item.category || '',
        subCategory: item.subCategory || '',
        brand: item.brand || '',
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
        unit: item.unit || '',
        discountPercentage: parseFloat(item.discountPercentage) || 0,
        discountedPrice: parseFloat(item.discountedPrice) || parseFloat(item.price) || 0,
        totalPrice: (parseFloat(item.discountedPrice) || parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1),
        image: item.images?.[0] || item.image || '',
        barcode: item.barcode || '',
        appliedPromoCode: item.appliedPromoCode || null,
        orderId: orderId,
        addedAt: serverTimestamp()
      };
      
      // Remove any fields that might still be undefined
      Object.keys(cleanItemData).forEach(key => {
        if (cleanItemData[key] === undefined) {
          delete cleanItemData[key];
        }
      });
      
      batch.set(itemRef, cleanItemData);
    });
    
    await batch.commit();

    // Update inventory (reduce stock quantities)
    await this.updateInventory(items, 'decrease');

    return {
      success: true,
      order: {
        ...orderDocData,
        docId: orderId,
        id: orderId
      }
    };
  } catch (error) {
    console.error("Error creating order - full error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    return {
      success: false,
      error: error.message || "An error occurred while creating the order"
    };
  }
}

  /**
   * Get single order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object|null>} - Order object or null
   */
  async getOrder(orderId) {
    try {
      const orderDocRef = doc(db, this.collectionName, orderId);
      const orderDocSnap = await getDoc(orderDocRef);
      
      if (orderDocSnap.exists()) {
        const data = orderDocSnap.data();
        return {
          docId: orderId,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting order:", error);
      return null;
    }
  }

  /**
   * Get order by reference (for payment verification)
   * @param {string} reference - Payment reference
   * @returns {Promise<Object|null>} - Order object or null
   */
  async getOrderByReference(reference) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("paymentDetails.paymentReference", "==", reference),
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
      console.error("Error getting order by reference:", error);
      return null;
    }
  }

  /**
   * Update order payment status
   * @param {string} orderId - Order ID
   * @param {Object} paymentData - Payment data from gateway
   * @returns {Promise<Object>} - Updated order or error
   */
  async updateOrderPayment(orderId, paymentData) {
    try {
      const orderDocRef = doc(db, this.collectionName, orderId);
      
      const updates = {
        paymentStatus: "paid",
        isPaid: true,
        orderStatus: "processing", // Move from pending_payment to processing
        "paymentDetails.transactionId": paymentData.transactionId,
        "paymentDetails.paidAt": new Date().toISOString(),
        "paymentDetails.gatewayResponse": paymentData,
        statusHistory: arrayUnion({
          status: "paid",
          timestamp: new Date().toISOString(),
          note: `Payment received via ${paymentData.method || 'PayHere'}`
        }),
        updatedAt: serverTimestamp()
      };

      await updateDoc(orderDocRef, updates);

      return {
        success: true,
        order: await this.getOrder(orderId)
      };
    } catch (error) {
      console.error("Error updating order payment:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Mark order payment as failed
   * @param {string} orderId - Order ID
   * @param {string} reason - Failure reason
   * @returns {Promise<Object>} - Updated order or error
   */
  async markPaymentFailed(orderId, reason) {
    try {
      const orderDocRef = doc(db, this.collectionName, orderId);
      
      const updates = {
        paymentStatus: "failed",
        orderStatus: "payment_failed",
        "paymentDetails.failureReason": reason,
        statusHistory: arrayUnion({
          status: "payment_failed",
          timestamp: new Date().toISOString(),
          note: `Payment failed: ${reason}`
        }),
        updatedAt: serverTimestamp()
      };

      await updateDoc(orderDocRef, updates);

      // Restore inventory for failed payment
      const order = await this.getOrder(orderId);
      if (order) {
        await this.updateInventory(order.items, 'increase');
      }

      return {
        success: true,
        order: await this.getOrder(orderId)
      };
    } catch (error) {
      console.error("Error marking payment failed:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Get order by order number (for customer reference)
   * @param {string} orderNumber - Order number
   * @returns {Promise<Object|null>} - Order object or null
   */
  async getOrderByNumber(orderNumber) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("id", "==", orderNumber),
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
      console.error("Error getting order by number:", error);
      return null;
    }
  }

  /**
   * Update order
   * @param {string} orderId - Order ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated order or error
   */
  async updateOrder(orderId, updates) {
    try {
      const orderDocRef = doc(db, this.collectionName, orderId);
      
      // Get current order data
      const currentOrder = await this.getOrder(orderId);
      
      if (!currentOrder) {
        throw new Error("Order not found");
      }

      const cleanUpdates = { ...updates };
      delete cleanUpdates.id;
      delete cleanUpdates.docId;
      delete cleanUpdates.createdAt;

      // Handle status change
      if (updates.orderStatus && updates.orderStatus !== currentOrder.orderStatus) {
        cleanUpdates.statusHistory = arrayUnion({
          status: updates.orderStatus,
          timestamp: new Date().toISOString(),
          note: updates.statusNote || `Status changed to ${updates.orderStatus}`
        });
      }

      // Handle payment status change
      if (updates.paymentStatus && updates.paymentStatus !== currentOrder.paymentStatus) {
        cleanUpdates.isPaid = updates.paymentStatus === "paid";
        
        if (updates.paymentStatus === "paid") {
          cleanUpdates.paymentDetails = {
            ...currentOrder.paymentDetails,
            transactionId: updates.transactionId || currentOrder.paymentDetails?.transactionId,
            paidAt: new Date().toISOString(),
            paymentReference: updates.paymentReference || currentOrder.paymentDetails?.paymentReference
          };
        }
      }

      // Handle delivery status change
      if (updates.orderStatus === "delivered" && !currentOrder.isDelivered) {
        cleanUpdates.isDelivered = true;
        cleanUpdates.deliveryDetails = {
          ...currentOrder.deliveryDetails,
          actualDelivery: new Date().toISOString(),
          deliveredBy: updates.deliveredBy
        };
      }

      // Handle cancellation
      if (updates.orderStatus === "cancelled" && !currentOrder.isCancelled) {
        cleanUpdates.isCancelled = true;
        
        // Restore inventory for cancelled orders
        await this.updateInventory(currentOrder.items, 'increase');
      }

      const updateData = {
        ...cleanUpdates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(orderDocRef, updateData);

      // Get updated order
      const result = await this.getOrder(orderId);

      return {
        success: true,
        order: result
      };
    } catch (error) {
      console.error("Error updating order:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code || error.message)
      };
    }
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status
   * @param {string} note - Status change note
   * @returns {Promise<Object>} - Updated order or error
   */
  async updateOrderStatus(orderId, status, note = "") {
    try {
      return await this.updateOrder(orderId, {
        orderStatus: status,
        statusNote: note
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Cancel order
   * @param {string} orderId - Order ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} - Updated order or error
   */
  async cancelOrder(orderId, reason = "") {
    try {
      const result = await this.updateOrder(orderId, {
        orderStatus: "cancelled",
        statusNote: reason || "Order cancelled"
      });

      return result;
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Mark order as delivered
   * @param {string} orderId - Order ID
   * @param {string} deliveredBy - Person who delivered
   * @returns {Promise<Object>} - Updated order or error
   */
  async markAsDelivered(orderId, deliveredBy = "") {
    try {
      return await this.updateOrder(orderId, {
        orderStatus: "delivered",
        deliveredBy
      });
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // ========== QUERY METHODS ==========

  /**
   * Get all orders with filters
   * @param {Object} filters - Filter options
   * @param {number} pageSize - Items per page
   * @param {Object} lastDoc - Last document for pagination
   * @returns {Promise<Object>} - Paginated results
   */
  async getAllOrders(filters = {}, pageSize = 20, lastDoc = null) {
    try {
      const queryConstraints = [];
      
      // Apply filters
      if (filters.orderStatus) {
        queryConstraints.push(where("orderStatus", "==", filters.orderStatus));
      }
      
      if (filters.paymentStatus) {
        queryConstraints.push(where("paymentStatus", "==", filters.paymentStatus));
      }
      
      if (filters.customerId) {
        queryConstraints.push(where("customer.id", "==", filters.customerId));
      }
      
      if (filters.customerEmail) {
        queryConstraints.push(where("customer.email", "==", filters.customerEmail));
      }
      
      if (filters.storeId) {
        queryConstraints.push(where("storeId", "==", filters.storeId));
      }
      
      if (filters.isActive !== undefined) {
        queryConstraints.push(where("isActive", "==", filters.isActive));
      }
      
      if (filters.isPaid !== undefined) {
        queryConstraints.push(where("isPaid", "==", filters.isPaid));
      }
      
      if (filters.isDelivered !== undefined) {
        queryConstraints.push(where("isDelivered", "==", filters.isDelivered));
      }

      // Date range filters
      if (filters.startDate) {
        queryConstraints.push(where("createdAt", ">=", new Date(filters.startDate)));
      }
      
      if (filters.endDate) {
        queryConstraints.push(where("createdAt", "<=", new Date(filters.endDate)));
      }

      // Price range filters
      if (filters.minTotal) {
        queryConstraints.push(where("total", ">=", parseFloat(filters.minTotal)));
      }
      
      if (filters.maxTotal) {
        queryConstraints.push(where("total", "<=", parseFloat(filters.maxTotal)));
      }

      // Add ordering
      queryConstraints.push(orderBy("createdAt", "desc"));
      queryConstraints.push(limit(pageSize));

      // Apply pagination
      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }

      // Create query
      const q = query(collection(db, this.collectionName), ...queryConstraints);
      const snapshot = await getDocs(q);
      
      const orders = snapshot.docs.map(doc => {
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
        orders,
        hasMore: orders.length === pageSize,
        lastDoc: lastVisible
      };
    } catch (error) {
      console.error("Error getting orders:", error);
      return {
        success: false,
        orders: [],
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Get orders by customer
   * @param {string} customerId - Customer ID
   * @returns {Promise<Array>} - Array of orders
   */
  async getOrdersByCustomer(customerId) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("customer.id", "==", customerId),
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
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
      console.error("Error getting customer orders:", error);
      return [];
    }
  }

  /**
   * Get orders by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} - Array of orders
   */
  async getOrdersByDateRange(startDate, endDate) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("createdAt", ">=", startDate),
        where("createdAt", "<=", endDate),
        orderBy("createdAt", "desc")
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
      console.error("Error getting orders by date range:", error);
      return [];
    }
  }

  /**
   * Get pending orders
   * @returns {Promise<Array>} - Array of pending orders
   */
  async getPendingOrders() {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("orderStatus", "in", ["processing", "confirmed", "preparing"]),
        where("isActive", "==", true),
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
      console.error("Error getting pending orders:", error);
      return [];
    }
  }

  /**
   * Get orders by promo code
   * @param {string} promoCode - Promo code
   * @returns {Promise<Array>} - Array of orders
   */
  async getOrdersByPromoCode(promoCode) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("promoCode", "==", promoCode),
        orderBy("createdAt", "desc")
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
      console.error("Error getting orders by promo code:", error);
      return [];
    }
  }

  /**
   * Search orders
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} - Array of matching orders
   */
  async searchOrders(searchTerm) {
    try {
      const allOrders = await this.getAllOrders({ isActive: true });
      
      if (!allOrders.success) {
        return [];
      }

      const searchLower = searchTerm.toLowerCase();
      
      return allOrders.orders.filter(order => {
        return (
          order.id.toLowerCase().includes(searchLower) ||
          order.customer?.name?.toLowerCase().includes(searchLower) ||
          order.customer?.email?.toLowerCase().includes(searchLower) ||
          order.customer?.phone?.includes(searchTerm) ||
          order.shippingInfo?.address?.toLowerCase().includes(searchLower) ||
          order.promoCode?.toLowerCase().includes(searchLower) ||
          order.items?.some(item => item.name.toLowerCase().includes(searchLower))
        );
      });
    } catch (error) {
      console.error("Error searching orders:", error);
      return [];
    }
  }

  // ========== INVENTORY MANAGEMENT ==========

  /**
   * Update inventory based on order
   * @param {Array} items - Order items
   * @param {string} action - 'increase' or 'decrease'
   */
  async updateInventory(items, action = 'decrease') {
    try {
      const batch = writeBatch(db);
      
      for (const item of items) {
        if (item.itemId) {
          const itemRef = doc(db, "groceryItems", item.itemId);
          const quantity = action === 'decrease' ? -item.quantity : item.quantity;
          
          batch.update(itemRef, {
            quantity: increment(quantity),
            updatedAt: serverTimestamp()
          });
        }
      }
      
      await batch.commit();
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  }

  // ========== ANALYTICS & REPORTS ==========

  /**
   * Get order statistics
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} - Statistics object
   */
  async getOrderStats(startDate, endDate) {
    try {
      const orders = await this.getOrdersByDateRange(startDate || new Date(0), endDate || new Date());
      
      const stats = {
        totalOrders: orders.length,
        totalRevenue: 0,
        averageOrderValue: 0,
        ordersByStatus: {},
        ordersByPaymentMethod: {},
        dailyRevenue: {},
        topItems: [],
        promoCodeUsage: {},
        cancelledOrders: 0,
        deliveredOrders: 0
      };

      const itemCount = {};

      orders.forEach(order => {
        // Total revenue
        stats.totalRevenue += order.total || 0;
        
        // Orders by status
        stats.ordersByStatus[order.orderStatus] = (stats.ordersByStatus[order.orderStatus] || 0) + 1;
        
        // Orders by payment method
        stats.ordersByPaymentMethod[order.paymentMethod] = (stats.ordersByPaymentMethod[order.paymentMethod] || 0) + 1;
        
        // Daily revenue
        const date = order.createdAt?.toDateString() || new Date().toDateString();
        stats.dailyRevenue[date] = (stats.dailyRevenue[date] || 0) + (order.total || 0);
        
        // Promo code usage
        if (order.promoCode) {
          stats.promoCodeUsage[order.promoCode] = (stats.promoCodeUsage[order.promoCode] || 0) + 1;
        }
        
        // Count statuses
        if (order.orderStatus === 'cancelled') {
          stats.cancelledOrders++;
        }
        if (order.orderStatus === 'delivered') {
          stats.deliveredOrders++;
        }
        
        // Track item popularity
        order.items?.forEach(item => {
          const key = item.name;
          itemCount[key] = (itemCount[key] || 0) + item.quantity;
        });
      });

      // Average order value
      stats.averageOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;
      
      // Top items
      stats.topItems = Object.entries(itemCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      return stats;
    } catch (error) {
      console.error("Error getting order stats:", error);
      return null;
    }
  }

  /**
   * Get revenue by period
   * @param {string} period - 'daily', 'weekly', 'monthly', 'yearly'
   * @returns {Promise<Object>} - Revenue data
   */
  async getRevenueByPeriod(period = 'monthly') {
    try {
      const orders = await this.getAllOrders({ isActive: true });
      
      if (!orders.success) {
        return null;
      }

      const revenue = {};

      orders.orders.forEach(order => {
        if (!order.createdAt) return;
        
        let key;
        const date = new Date(order.createdAt);
        
        switch(period) {
          case 'daily':
            key = date.toISOString().split('T')[0];
            break;
          case 'weekly':
            const week = this.getWeekNumber(date);
            key = `${date.getFullYear()}-W${week}`;
            break;
          case 'monthly':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          case 'yearly':
            key = date.getFullYear().toString();
            break;
          default:
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
        
        revenue[key] = (revenue[key] || 0) + (order.total || 0);
      });

      // Sort by date
      const sortedRevenue = Object.entries(revenue)
        .sort(([a], [b]) => a.localeCompare(b))
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});

      return sortedRevenue;
    } catch (error) {
      console.error("Error getting revenue by period:", error);
      return null;
    }
  }

  // ========== BATCH OPERATIONS ==========

  /**
   * Create multiple orders at once
   * @param {Array} orders - Array of order data
   * @returns {Promise<Object>} - Results
   */
  async createBatchOrders(orders) {
    try {
      const results = [];
      const errors = [];

      for (const orderData of orders) {
        const result = await this.createOrder(orderData);
        if (result.success) {
          results.push(result.order);
        } else {
          errors.push({
            order: orderData.id || 'Unknown',
            error: result.error
          });
        }
      }

      return {
        success: errors.length === 0,
        createdCount: results.length,
        errorCount: errors.length,
        results,
        errors
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Bulk update order status
   * @param {Array} orderIds - Array of order IDs
   * @param {string} status - New status
   * @returns {Promise<Object>} - Results
   */
  async bulkUpdateStatus(orderIds, status) {
    try {
      const results = [];

      for (const orderId of orderIds) {
        const result = await this.updateOrderStatus(orderId, status);
        results.push({
          orderId,
          success: result.success,
          error: result.error
        });
      }

      return {
        success: true,
        results
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // ========== HELPER METHODS ==========

  /**
   * Get week number for date
   * @param {Date} date - Date
   * @returns {number} - Week number
   */
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /**
   * Calculate order totals
   * @param {Array} items - Order items
   * @param {Object} options - Additional options (tax, delivery, discount)
   * @returns {Object} - Calculated totals
   */
  calculateOrderTotals(items, options = {}) {
    const subtotal = items.reduce((sum, item) => {
      const price = item.discountedPrice || item.price;
      return sum + (price * item.quantity);
    }, 0);

    const tax = options.tax ? subtotal * (options.tax / 100) : 0;
    const deliveryFee = options.deliveryFee || 0;
    const discount = options.discount || 0;
    
    const total = subtotal + tax + deliveryFee - discount;

    return {
      subtotal,
      tax,
      deliveryFee,
      discount,
      total
    };
  }

  /**
   * Get user-friendly error message
   * @param {string} errorCode - Error code
   * @returns {string} - User-friendly error message
   */
  getErrorMessage(errorCode) {
    const errorMessages = {
      // Firestore errors
      'permission-denied': 'You do not have permission to perform this action.',
      'not-found': 'Order not found.',
      'already-exists': 'An order with this ID already exists.',
      'failed-precondition': 'Operation failed. Please try again.',
      
      // Custom errors
      'invalid-items': 'Please provide valid order items.',
      'invalid-customer': 'Customer information is required.',
      'invalid-payment': 'Invalid payment information.',
      'invalid-status': 'Invalid order status.',
      
      // Default
      'default': 'An error occurred. Please try again.'
    };
    
    return errorMessages[errorCode] || errorMessages.default;
  }

  /**
   * Validate order data
   * @param {Object} orderData - Order data to validate
   * @returns {Object} - Validation result
   */
  validateOrderData(orderData) {
    const errors = [];
    
    // Validate items
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      errors.push("Order must contain at least one item");
    } else {
      orderData.items.forEach((item, index) => {
        if (!item.name) {
          errors.push(`Item at position ${index + 1} is missing name`);
        }
        if (!item.price || item.price <= 0) {
          errors.push(`Item "${item.name || 'Unknown'}" has invalid price`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item "${item.name || 'Unknown'}" has invalid quantity`);
        }
      });
    }
    
    // Validate customer
    if (!orderData.customerId && !orderData.customerEmail) {
      errors.push("Customer information is required");
    }
    
    // Validate payment
    if (orderData.paidAmount && orderData.paidAmount < 0) {
      errors.push("Paid amount cannot be negative");
    }
    
    // Validate dates if present
    if (orderData.estimatedDelivery) {
      const estDelivery = new Date(orderData.estimatedDelivery);
      if (isNaN(estDelivery.getTime())) {
        errors.push("Invalid estimated delivery date");
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Export orders to CSV format
   * @param {Array} orders - Orders to export
   * @returns {string} - CSV string
   */
  exportToCSV(orders) {
    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Total",
      "Payment Status",
      "Order Status",
      "Payment Method",
      "Promo Code",
      "Items Count"
    ];
    
    const rows = orders.map(order => [
      order.id,
      order.createdAt?.toLocaleDateString(),
      order.customer?.name || '',
      order.customer?.email || '',
      order.customer?.phone || '',
      order.total,
      order.paymentStatus,
      order.orderStatus,
      order.paymentMethod,
      order.promoCode || '',
      order.items?.length || 0
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
   * Generate invoice for order
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Invoice data
   */
  async generateInvoice(orderId) {
    try {
      const order = await this.getOrder(orderId);
      
      if (!order) {
        throw new Error("Order not found");
      }

      const invoice = {
        invoiceNumber: `INV-${order.id}`,
        orderId: order.id,
        date: new Date().toISOString(),
        customer: order.customer,
        shippingInfo: order.shippingInfo,
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          discount: item.discountPercentage,
          total: item.totalPrice
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        deliveryFee: order.deliveryFee,
        discount: order.discountAmount,
        total: order.total,
        paid: order.paidAmount,
        due: order.total - order.paidAmount,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod
      };

      return invoice;
    } catch (error) {
      console.error("Error generating invoice:", error);
      return null;
    }
  }
}

// Create singleton instance
const orderService = new OrderService();

export default orderService;