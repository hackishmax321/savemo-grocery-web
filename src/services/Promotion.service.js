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
  arrayRemove
} from "firebase/firestore";
import { db } from "../db/Firebase.config";

class PromotionService {
  constructor() {
    this.collectionName = "promotions";
    this.activePromotionsCollection = "activePromotions";
  }

  // ========== CRUD OPERATIONS ==========

  /**
   * Create a new promotion
   * @param {Object} promotionData - Promotion data
   * @returns {Promise<Object>} - Created promotion or error
   */
  async createPromotion(promotionData) {
    try {
      const { 
        name,
        description,
        startDate,
        endDate,
        discountPercentage,
        discountType, // 'percentage', 'fixed', 'buy_x_get_y'
        discountValue,
        applicableItems, // Array of item IDs or 'all'
        itemCategories, // Array of categories
        minimumPurchase,
        maximumDiscount,
        usageLimit,
        usageCount = 0,
        customerEligibility, // 'all', 'new', 'existing', 'vip'
        isActive = true,
        promoCode,
        bannerImage,
        termsAndConditions,
        createdBy,
        storeId
      } = promotionData;

      // Validate required fields
      if (!name || !startDate || !endDate || !discountPercentage) {
        throw new Error("Name, start date, end date, and discount percentage are required");
      }

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        throw new Error("End date must be after start date");
      }

      // Generate promotion ID
      const promotionId = promoCode || `PROMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const promotionDocData = {
        id: promotionId,
        name,
        description: description || "",
        startDate: start,
        endDate: end,
        discountPercentage: parseFloat(discountPercentage),
        discountType: discountType || "percentage",
        discountValue: discountValue || parseFloat(discountPercentage),
        applicableItems: applicableItems || [],
        itemCategories: itemCategories || [],
        minimumPurchase: minimumPurchase ? parseFloat(minimumPurchase) : 0,
        maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        usageCount: usageCount,
        customerEligibility: customerEligibility || "all",
        isActive,
        promoCode: promoCode || promotionId,
        bannerImage: bannerImage || "",
        termsAndConditions: termsAndConditions || "",
        storeId: storeId || "",
        createdBy: createdBy || "",
        status: this.calculatePromotionStatus(start, end),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Create document in Firestore
      await setDoc(doc(db, this.collectionName, promotionId), promotionDocData);

      // If promotion is active, add to active promotions collection for quick lookup
      if (this.isPromotionActive(promotionDocData)) {
        await this.addToActivePromotions(promotionId, promotionDocData);
      }

      return {
        success: true,
        promotion: {
          ...promotionDocData,
          docId: promotionId
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code || error.message)
      };
    }
  }

  /**
   * Get single promotion by ID
   * @param {string} promotionId - Promotion ID
   * @returns {Promise<Object|null>} - Promotion object or null
   */
  async getPromotion(promotionId) {
    try {
      const promotionDocRef = doc(db, this.collectionName, promotionId);
      const promotionDocSnap = await getDoc(promotionDocRef);
      
      if (promotionDocSnap.exists()) {
        const data = promotionDocSnap.data();
        return {
          docId: promotionId,
          ...data,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting promotion:", error);
      return null;
    }
  }

  /**
   * Get promotion by promo code
   * @param {string} promoCode - Promotion code
   * @returns {Promise<Object|null>} - Promotion object or null
   */
  async getPromotionByCode(promoCode) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("promoCode", "==", promoCode),
        where("isActive", "==", true),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
          docId: doc.id,
          ...data,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate()
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting promotion by code:", error);
      return null;
    }
  }

  /**
   * Update promotion
   * @param {string} promotionId - Promotion ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated promotion or error
   */
  async updatePromotion(promotionId, updates) {
    try {
      const promotionDocRef = doc(db, this.collectionName, promotionId);
      
      // Get current promotion data
      const currentPromotion = await this.getPromotion(promotionId);
      
      if (!currentPromotion) {
        throw new Error("Promotion not found");
      }

      const cleanUpdates = { ...updates };
      delete cleanUpdates.id;
      delete cleanUpdates.docId;
      
      // Handle date updates
      if (updates.startDate) {
        cleanUpdates.startDate = new Date(updates.startDate);
      }
      if (updates.endDate) {
        cleanUpdates.endDate = new Date(updates.endDate);
      }

      // Recalculate status if dates changed
      if (updates.startDate || updates.endDate) {
        const start = cleanUpdates.startDate || currentPromotion.startDate;
        const end = cleanUpdates.endDate || currentPromotion.endDate;
        cleanUpdates.status = this.calculatePromotionStatus(start, end);
      }

      const updateData = {
        ...cleanUpdates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(promotionDocRef, updateData);

      // Update active promotions collection
      const updatedPromotion = {
        ...currentPromotion,
        ...cleanUpdates,
        startDate: cleanUpdates.startDate || currentPromotion.startDate,
        endDate: cleanUpdates.endDate || currentPromotion.endDate
      };

      if (this.isPromotionActive(updatedPromotion)) {
        await this.addToActivePromotions(promotionId, updatedPromotion);
      } else {
        await this.removeFromActivePromotions(promotionId);
      }

      // Get updated promotion
      const result = await this.getPromotion(promotionId);

      return {
        success: true,
        promotion: result
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code || error.message)
      };
    }
  }

  /**
   * Delete promotion (soft delete)
   * @param {string} promotionId - Promotion ID
   * @returns {Promise<Object>} - Success or error
   */
  async deletePromotion(promotionId) {
    try {
      await updateDoc(doc(db, this.collectionName, promotionId), {
        isActive: false,
        status: "deleted",
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Remove from active promotions
      await this.removeFromActivePromotions(promotionId);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Permanently delete promotion
   * @param {string} promotionId - Promotion ID
   * @returns {Promise<Object>} - Success or error
   */
  async permanentlyDeletePromotion(promotionId) {
    try {
      await deleteDoc(doc(db, this.collectionName, promotionId));
      await this.removeFromActivePromotions(promotionId);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Restore deleted promotion
   * @param {string} promotionId - Promotion ID
   * @returns {Promise<Object>} - Success or error
   */
  async restorePromotion(promotionId) {
    try {
      const promotion = await this.getPromotion(promotionId);
      
      if (!promotion) {
        throw new Error("Promotion not found");
      }

      const status = this.calculatePromotionStatus(promotion.startDate, promotion.endDate);
      
      await updateDoc(doc(db, this.collectionName, promotionId), {
        isActive: true,
        status,
        restoredAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Add back to active promotions if applicable
      if (this.isPromotionActive({ ...promotion, status })) {
        await this.addToActivePromotions(promotionId, { ...promotion, status });
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // ========== QUERY METHODS ==========

  /**
   * Get all promotions with filters
   * @param {Object} filters - Filter options
   * @param {number} pageSize - Items per page
   * @param {Object} lastDoc - Last document for pagination
   * @returns {Promise<Object>} - Paginated results
   */
  async getAllPromotions(filters = {}, pageSize = 20, lastDoc = null) {
    try {
      const queryConstraints = [];
      
      // Apply filters
      if (filters.status) {
        queryConstraints.push(where("status", "==", filters.status));
      }
      
      if (filters.isActive !== undefined) {
        queryConstraints.push(where("isActive", "==", filters.isActive));
      }
      
      if (filters.discountType) {
        queryConstraints.push(where("discountType", "==", filters.discountType));
      }
      
      if (filters.storeId) {
        queryConstraints.push(where("storeId", "==", filters.storeId));
      }
      
      if (filters.customerEligibility) {
        queryConstraints.push(where("customerEligibility", "==", filters.customerEligibility));
      }

      // Date range filters
      if (filters.startDateFrom) {
        queryConstraints.push(where("startDate", ">=", new Date(filters.startDateFrom)));
      }
      
      if (filters.startDateTo) {
        queryConstraints.push(where("startDate", "<=", new Date(filters.startDateTo)));
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
      
      const promotions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          docId: doc.id,
          ...data,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      });

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];

      return {
        success: true,
        promotions,
        hasMore: promotions.length === pageSize,
        lastDoc: lastVisible
      };
    } catch (error) {
      console.error("Error getting promotions:", error);
      return {
        success: false,
        promotions: [],
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Get all valid (active) promotions
   * @param {Date} referenceDate - Date to check against (defaults to now)
   * @returns {Promise<Array>} - Array of valid promotions
   */
  async getValidPromotions(referenceDate = new Date()) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("isActive", "==", true),
        where("startDate", "<=", referenceDate),
        where("endDate", ">=", referenceDate),
        orderBy("startDate", "desc")
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          docId: doc.id,
          ...data,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate()
        };
      });
    } catch (error) {
      console.error("Error getting valid promotions:", error);
      return [];
    }
  }

  /**
   * Get active promotions (from cache collection for performance)
   * @returns {Promise<Array>} - Array of active promotions
   */
  async getActivePromotions() {
    try {
      const snapshot = await getDocs(collection(db, this.activePromotionsCollection));
      
      return snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting active promotions:", error);
      return [];
    }
  }

  /**
   * Get promotions applicable to a specific item
   * @param {string} itemId - Item ID
   * @param {string} category - Item category
   * @returns {Promise<Array>} - Array of applicable promotions
   */
  async getPromotionsForItem(itemId, category) {
    try {
      const validPromotions = await this.getValidPromotions();
      
      return validPromotions.filter(promo => {
        // Check if promotion applies to all items
        if (promo.applicableItems === 'all') {
          return true;
        }
        
        // Check if item is specifically included
        if (promo.applicableItems && promo.applicableItems.includes(itemId)) {
          return true;
        }
        
        // Check if item's category is included
        if (promo.itemCategories && promo.itemCategories.includes(category)) {
          return true;
        }
        
        return false;
      });
    } catch (error) {
      console.error("Error getting promotions for item:", error);
      return [];
    }
  }

  /**
   * Get upcoming promotions
   * @param {number} daysAhead - Number of days to look ahead
   * @returns {Promise<Array>} - Array of upcoming promotions
   */
  async getUpcomingPromotions(daysAhead = 7) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const q = query(
        collection(db, this.collectionName),
        where("isActive", "==", true),
        where("startDate", ">", new Date()),
        where("startDate", "<=", futureDate),
        orderBy("startDate", "asc")
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          docId: doc.id,
          ...data,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate()
        };
      });
    } catch (error) {
      console.error("Error getting upcoming promotions:", error);
      return [];
    }
  }

  /**
   * Get expired promotions
   * @returns {Promise<Array>} - Array of expired promotions
   */
  async getExpiredPromotions() {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("endDate", "<", new Date()),
        orderBy("endDate", "desc")
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          docId: doc.id,
          ...data,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate()
        };
      });
    } catch (error) {
      console.error("Error getting expired promotions:", error);
      return [];
    }
  }

  /**
   * Search promotions
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} - Array of matching promotions
   */
  async searchPromotions(searchTerm) {
    try {
      // Get all active promotions (simplified search)
      const allPromotions = await this.getAllPromotions({ isActive: true });
      
      if (!allPromotions.success) {
        return [];
      }

      const searchLower = searchTerm.toLowerCase();
      
      return allPromotions.promotions.filter(promo => {
        return (
          (promo.name && promo.name.toLowerCase().includes(searchLower)) ||
          (promo.description && promo.description.toLowerCase().includes(searchLower)) ||
          (promo.promoCode && promo.promoCode.toLowerCase().includes(searchLower))
        );
      });
    } catch (error) {
      console.error("Error searching promotions:", error);
      return [];
    }
  }

  // ========== PROMOTION USAGE MANAGEMENT ==========

  /**
   * Apply promotion to cart/order
   * @param {string} promotionId - Promotion ID
   * @param {number} orderValue - Order total value
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} - Discount calculation result
   */
  async applyPromotion(promotionId, orderValue, customerId) {
    try {
      const promotion = await this.getPromotion(promotionId);
      
      if (!promotion) {
        throw new Error("Promotion not found");
      }

      // Check if promotion is valid
      if (!this.isPromotionActive(promotion)) {
        throw new Error("Promotion is not active");
      }

      // Check minimum purchase requirement
      if (orderValue < promotion.minimumPurchase) {
        throw new Error(`Minimum purchase of ${promotion.minimumPurchase} required`);
      }

      // Check usage limit
      if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
        throw new Error("Promotion usage limit exceeded");
      }

      // Calculate discount
      let discountAmount = 0;
      
      if (promotion.discountType === "percentage") {
        discountAmount = (orderValue * promotion.discountPercentage) / 100;
      } else if (promotion.discountType === "fixed") {
        discountAmount = promotion.discountValue;
      }

      // Apply maximum discount cap if set
      if (promotion.maximumDiscount && discountAmount > promotion.maximumDiscount) {
        discountAmount = promotion.maximumDiscount;
      }

      // Increment usage count
      await this.incrementPromotionUsage(promotionId);

      // Log promotion usage
      await this.logPromotionUsage(promotionId, customerId, orderValue, discountAmount);

      return {
        success: true,
        promotion,
        discountAmount,
        finalAmount: orderValue - discountAmount
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code || error.message)
      };
    }
  }

  /**
   * Increment promotion usage count
   * @param {string} promotionId - Promotion ID
   */
  async incrementPromotionUsage(promotionId) {
    try {
      await updateDoc(doc(db, this.collectionName, promotionId), {
        usageCount: increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error incrementing promotion usage:", error);
    }
  }

  /**
   * Log promotion usage
   * @param {string} promotionId - Promotion ID
   * @param {string} customerId - Customer ID
   * @param {number} orderValue - Order value
   * @param {number} discountAmount - Discount amount
   */
  async logPromotionUsage(promotionId, customerId, orderValue, discountAmount) {
    try {
      const usageLog = {
        promotionId,
        customerId,
        orderValue,
        discountAmount,
        timestamp: serverTimestamp()
      };
      
      const usageRef = doc(collection(db, this.collectionName, promotionId, "usage"));
      await setDoc(usageRef, usageLog);
    } catch (error) {
      console.error("Error logging promotion usage:", error);
    }
  }

  /**
   * Get promotion usage statistics
   * @param {string} promotionId - Promotion ID
   * @returns {Promise<Object>} - Usage statistics
   */
  async getPromotionUsageStats(promotionId) {
    try {
      const promotion = await this.getPromotion(promotionId);
      
      if (!promotion) {
        throw new Error("Promotion not found");
      }

      const usageSnapshot = await getDocs(collection(db, this.collectionName, promotionId, "usage"));
      
      const usage = usageSnapshot.docs.map(doc => doc.data());
      
      const stats = {
        totalUsage: usage.length,
        totalDiscount: usage.reduce((sum, log) => sum + log.discountAmount, 0),
        averageDiscount: usage.length > 0 
          ? usage.reduce((sum, log) => sum + log.discountAmount, 0) / usage.length 
          : 0,
        usageByDate: {},
        usageLeft: promotion.usageLimit ? promotion.usageLimit - promotion.usageCount : null
      };

      // Group by date
      usage.forEach(log => {
        const date = log.timestamp?.toDate().toDateString();
        if (date) {
          stats.usageByDate[date] = (stats.usageByDate[date] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error("Error getting promotion usage stats:", error);
      return null;
    }
  }

  // ========== BATCH OPERATIONS ==========

  /**
   * Create multiple promotions at once
   * @param {Array} promotions - Array of promotion data
   * @returns {Promise<Object>} - Results
   */
  async createBatchPromotions(promotions) {
    try {
      const results = [];
      const errors = [];

      for (const promoData of promotions) {
        const result = await this.createPromotion(promoData);
        if (result.success) {
          results.push(result.promotion);
        } else {
          errors.push({
            name: promoData.name,
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
   * Bulk update promotion status
   * @param {Array} promotionIds - Array of promotion IDs
   * @param {boolean} isActive - New active status
   * @returns {Promise<Object>} - Results
   */
  async bulkUpdateStatus(promotionIds, isActive) {
    try {
      const results = [];

      for (const promotionId of promotionIds) {
        const result = await this.updatePromotion(promotionId, { isActive });
        results.push({
          promotionId,
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

  // ========== ANALYTICS & REPORTS ==========

  /**
   * Get promotion analytics
   * @returns {Promise<Object>} - Analytics object
   */
  async getPromotionAnalytics() {
    try {
      const allPromotions = await this.getAllPromotions();
      const validPromotions = await this.getValidPromotions();
      
      if (!allPromotions.success) {
        return null;
      }

      const now = new Date();
      
      const analytics = {
        totalPromotions: allPromotions.promotions.length,
        activePromotions: validPromotions.length,
        upcomingPromotions: 0,
        expiredPromotions: 0,
        totalUsage: 0,
        totalDiscountGiven: 0,
        byDiscountType: {},
        byStatus: {
          active: 0,
          upcoming: 0,
          expired: 0
        }
      };

      for (const promo of allPromotions.promotions) {
        // Count by discount type
        analytics.byDiscountType[promo.discountType] = 
          (analytics.byDiscountType[promo.discountType] || 0) + 1;

        // Count by status
        const status = this.calculatePromotionStatus(promo.startDate, promo.endDate);
        analytics.byStatus[status] = (analytics.byStatus[status] || 0) + 1;

        // Get usage stats
        if (promo.docId) {
          const usageStats = await this.getPromotionUsageStats(promo.docId);
          if (usageStats) {
            analytics.totalUsage += usageStats.totalUsage;
            analytics.totalDiscountGiven += usageStats.totalDiscount;
          }
        }
      }

      // Count upcoming and expired
      analytics.upcomingPromotions = analytics.byStatus.upcoming || 0;
      analytics.expiredPromotions = analytics.byStatus.expired || 0;

      return analytics;
    } catch (error) {
      console.error("Error getting promotion analytics:", error);
      return null;
    }
  }

  /**
   * Get best performing promotions
   * @param {number} limit - Number of promotions to return
   * @returns {Promise<Array>} - Array of top promotions
   */
  async getTopPromotions(limitCount = 10) {
    try {
      const allPromotions = await this.getAllPromotions();
      
      if (!allPromotions.success) {
        return [];
      }

      const promotionsWithUsage = [];

      for (const promo of allPromotions.promotions) {
        if (promo.docId) {
          const usageSnapshot = await getDocs(
            collection(db, this.collectionName, promo.docId, "usage")
          );
          
          const usageCount = usageSnapshot.size;
          const totalDiscount = usageSnapshot.docs.reduce(
            (sum, doc) => sum + (doc.data().discountAmount || 0), 
            0
          );

          promotionsWithUsage.push({
            ...promo,
            usageCount,
            totalDiscount
          });
        }
      }

      // Sort by usage count and return top
      return promotionsWithUsage
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, limitCount);
    } catch (error) {
      console.error("Error getting top promotions:", error);
      return [];
    }
  }

  // ========== HELPER METHODS ==========

  /**
   * Calculate promotion status based on dates
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {string} - Promotion status
   */
  calculatePromotionStatus(startDate, endDate) {
    const now = new Date();
    
    if (now < startDate) {
      return "upcoming";
    } else if (now >= startDate && now <= endDate) {
      return "active";
    } else {
      return "expired";
    }
  }

  /**
   * Check if promotion is currently active
   * @param {Object} promotion - Promotion object
   * @returns {boolean} - True if active
   */
  isPromotionActive(promotion) {
    const now = new Date();
    return (
      promotion.isActive &&
      promotion.startDate <= now &&
      promotion.endDate >= now
    );
  }

  /**
   * Add promotion to active promotions collection
   * @param {string} promotionId - Promotion ID
   * @param {Object} promotionData - Promotion data
   */
  async addToActivePromotions(promotionId, promotionData) {
    try {
      const activeData = {
        ...promotionData,
        promotionId,
        addedAt: serverTimestamp()
      };
      
      delete activeData.docId;
      
      await setDoc(doc(db, this.activePromotionsCollection, promotionId), activeData);
    } catch (error) {
      console.error("Error adding to active promotions:", error);
    }
  }

  /**
   * Remove promotion from active promotions collection
   * @param {string} promotionId - Promotion ID
   */
  async removeFromActivePromotions(promotionId) {
    try {
      await deleteDoc(doc(db, this.activePromotionsCollection, promotionId));
    } catch (error) {
      console.error("Error removing from active promotions:", error);
    }
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
      'not-found': 'Promotion not found.',
      'already-exists': 'A promotion with this code already exists.',
      'failed-precondition': 'Operation failed. Please try again.',
      
      // Custom errors
      'invalid-dates': 'Please enter valid start and end dates.',
      'minimum-purchase-not-met': 'Minimum purchase requirement not met.',
      'usage-limit-exceeded': 'Promotion usage limit has been exceeded.',
      
      // Default
      'default': 'An error occurred. Please try again.'
    };
    
    return errorMessages[errorCode] || errorMessages.default;
  }

  /**
   * Validate promotion data
   * @param {Object} promotionData - Promotion data to validate
   * @returns {Object} - Validation result
   */
  validatePromotionData(promotionData) {
    const errors = [];
    
    if (!promotionData.name || promotionData.name.trim().length < 3) {
      errors.push("Name must be at least 3 characters long");
    }
    
    if (!promotionData.startDate) {
      errors.push("Start date is required");
    }
    
    if (!promotionData.endDate) {
      errors.push("End date is required");
    }
    
    if (promotionData.startDate && promotionData.endDate) {
      const start = new Date(promotionData.startDate);
      const end = new Date(promotionData.endDate);
      
      if (start >= end) {
        errors.push("End date must be after start date");
      }
    }
    
    if (!promotionData.discountPercentage || 
        promotionData.discountPercentage <= 0 || 
        promotionData.discountPercentage > 100) {
      errors.push("Discount percentage must be between 1 and 100");
    }
    
    if (promotionData.minimumPurchase && promotionData.minimumPurchase < 0) {
      errors.push("Minimum purchase cannot be negative");
    }
    
    if (promotionData.maximumDiscount && promotionData.maximumDiscount < 0) {
      errors.push("Maximum discount cannot be negative");
    }
    
    if (promotionData.usageLimit && promotionData.usageLimit < 0) {
      errors.push("Usage limit cannot be negative");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Export promotions to CSV format
   * @param {Array} promotions - Promotions to export
   * @returns {string} - CSV string
   */
  exportToCSV(promotions) {
    const headers = [
      "Name", 
      "Promo Code", 
      "Start Date", 
      "End Date", 
      "Discount %", 
      "Discount Type",
      "Minimum Purchase",
      "Usage Count",
      "Usage Limit",
      "Status"
    ];
    
    const rows = promotions.map(promo => [
      promo.name,
      promo.promoCode,
      promo.startDate?.toLocaleDateString(),
      promo.endDate?.toLocaleDateString(),
      promo.discountPercentage,
      promo.discountType,
      promo.minimumPurchase || 0,
      promo.usageCount || 0,
      promo.usageLimit || "Unlimited",
      this.calculatePromotionStatus(promo.startDate, promo.endDate)
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    return csvContent;
  }

  /**
   * Schedule promotion status updates
   * This should be called periodically (e.g., via Cloud Function)
   */
  async updatePromotionStatuses() {
    try {
      const now = new Date();
      
      // Update promotions that should now be active
      const becomeActiveQuery = query(
        collection(db, this.collectionName),
        where("isActive", "==", true),
        where("status", "==", "upcoming"),
        where("startDate", "<=", now)
      );
      
      const becomeActiveSnapshot = await getDocs(becomeActiveQuery);
      
      for (const doc of becomeActiveSnapshot.docs) {
        await updateDoc(doc.ref, {
          status: "active",
          updatedAt: serverTimestamp()
        });
        await this.addToActivePromotions(doc.id, doc.data());
      }

      // Update promotions that should now be expired
      const becomeExpiredQuery = query(
        collection(db, this.collectionName),
        where("isActive", "==", true),
        where("status", "in", ["active", "upcoming"]),
        where("endDate", "<", now)
      );
      
      const becomeExpiredSnapshot = await getDocs(becomeExpiredQuery);
      
      for (const doc of becomeExpiredSnapshot.docs) {
        await updateDoc(doc.ref, {
          status: "expired",
          updatedAt: serverTimestamp()
        });
        await this.removeFromActivePromotions(doc.id);
      }

      return {
        success: true,
        activated: becomeActiveSnapshot.size,
        expired: becomeExpiredSnapshot.size
      };
    } catch (error) {
      console.error("Error updating promotion statuses:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }
}

// Create singleton instance
const promotionService = new PromotionService();

export default promotionService;