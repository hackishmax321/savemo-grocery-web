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
import { Categories } from "../constants/Categories"

class GroceryService {
  constructor() {
    this.collectionName = "groceryItems";
    this.categoriesCollection = "groceryCategories";
  }

  // ========== CRUD OPERATIONS ==========

  /**
   * Create a new grocery item
   * @param {Object} itemData - Grocery item data
   * @returns {Promise<Object>} - Created item or error
   */
  async createItem(itemData) {
    try {
      const { 
        name, 
        category, 
        subCategory, 
        description, 
        price, 
        quantity, 
        unit, 
        brand, 
        barcode,
        storeId,
        createdBy 
      } = itemData;

      // Validate required fields
      if (!name || !category || !price) {
        throw new Error("Name, category, and price are required");
      }

      // Generate ID or use provided barcode
      const itemId = barcode || `ITEM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const itemDocData = {
        id: itemId,
        name,
        category,
        subCategory: subCategory || "",
        description: description || "",
        price: parseFloat(price),
        originalPrice: parseFloat(price),
        quantity: parseFloat(quantity || 0),
        unit: unit || "piece",
        brand: brand || "",
        barcode: barcode || "",
        storeId: storeId || "",
        createdBy: createdBy || "",
        isActive: true,
        isFeatured: false,
        isOnSale: false,
        discountPercentage: 0,
        stockStatus: this.calculateStockStatus(parseFloat(quantity || 0)),
        images: itemData.images || [],
        nutritionalInfo: itemData.nutritionalInfo || {},
        tags: itemData.tags || [],
        ratings: {
          average: 0,
          count: 0,
          total: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastRestockedAt: serverTimestamp(),
        expiryDate: itemData.expiryDate || null
      };

      // Create document in Firestore
      await setDoc(doc(db, this.collectionName, itemId), itemDocData);

      // Update category statistics
      await this.updateCategoryStats(category, subCategory);

      return {
        success: true,
        item: {
          ...itemDocData,
          docId: itemId
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
   * Get single grocery item by ID
   * @param {string} itemId - Item ID
   * @returns {Promise<Object|null>} - Item object or null
   */
  async getItem(itemId) {
    try {
      const itemDocRef = doc(db, this.collectionName, itemId);
      const itemDocSnap = await getDoc(itemDocRef);
      
      if (itemDocSnap.exists()) {
        return {
          docId: itemId,
          ...itemDocSnap.data()
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting item:", error);
      return null;
    }
  }

  /**
   * Get grocery item by barcode
   * @param {string} barcode - Item barcode
   * @returns {Promise<Object|null>} - Item object or null
   */
  async getItemByBarcode(barcode) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("barcode", "==", barcode)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          docId: doc.id,
          ...doc.data()
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting item by barcode:", error);
      return null;
    }
  }

  /**
   * Update grocery item
   * @param {string} itemId - Item ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated item or error
   */
  async updateItem(itemId, updates) {
    try {
      const itemDocRef = doc(db, this.collectionName, itemId);
      
      const cleanUpdates = { ...updates };
      delete cleanUpdates.id;
      delete cleanUpdates.docId;
      
      const updateData = {
        ...cleanUpdates,
        updatedAt: serverTimestamp()
      };

      // If quantity is updated, recalculate stock status
      if (updates.quantity !== undefined) {
        updateData.stockStatus = this.calculateStockStatus(updates.quantity);
        updateData.lastRestockedAt = serverTimestamp();
      }

      // If price is updated and there's a discount, calculate sale price
      if (updates.price !== undefined && updates.discountPercentage !== undefined) {
        updateData.salePrice = updates.price * (1 - updates.discountPercentage / 100);
        updateData.isOnSale = updates.discountPercentage > 0;
      }

      await updateDoc(itemDocRef, updateData);

      // Get updated item
      const updatedItem = await this.getItem(itemId);

      return {
        success: true,
        item: updatedItem
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Delete grocery item (soft delete)
   * @param {string} itemId - Item ID
   * @returns {Promise<Object>} - Success or error
   */
  async deleteItem(itemId) {
    try {
      await updateDoc(doc(db, this.collectionName, itemId), {
        isActive: false,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Permanently delete grocery item
   * @param {string} itemId - Item ID
   * @returns {Promise<Object>} - Success or error
   */
  async permanentlyDeleteItem(itemId) {
    try {
      const item = await this.getItem(itemId);
      
      if (item) {
        // Update category stats before deletion
        await this.updateCategoryStats(item.category, item.subCategory, -1);
      }
      
      await deleteDoc(doc(db, this.collectionName, itemId));
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Restore deleted item
   * @param {string} itemId - Item ID
   * @returns {Promise<Object>} - Success or error
   */
  async restoreItem(itemId) {
    try {
      await updateDoc(doc(db, this.collectionName, itemId), {
        isActive: true,
        restoredAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // ========== BATCH OPERATIONS ==========

  /**
   * Create multiple items at once
   * @param {Array} items - Array of item data
   * @returns {Promise<Object>} - Results
   */
  async createBatchItems(items) {
    try {
      const results = [];
      const errors = [];

      for (const itemData of items) {
        const result = await this.createItem(itemData);
        if (result.success) {
          results.push(result.item);
        } else {
          errors.push({
            item: itemData.name,
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
   * Update item quantities in batch
   * @param {Array} updates - Array of {itemId, quantityChange}
   * @returns {Promise<Object>} - Results
   */
  async updateBatchQuantities(updates) {
    try {
      const results = [];

      for (const update of updates) {
        const { itemId, quantityChange, reason = "stock_adjustment" } = update;
        
        const item = await this.getItem(itemId);
        if (!item) {
          results.push({
            itemId,
            success: false,
            error: "Item not found"
          });
          continue;
        }

        const newQuantity = item.quantity + quantityChange;
        const result = await this.updateItem(itemId, {
          quantity: newQuantity
        });

        // Log stock movement
        await this.logStockMovement(itemId, quantityChange, reason, item.quantity, newQuantity);

        results.push({
          itemId,
          name: item.name,
          success: result.success,
          oldQuantity: item.quantity,
          newQuantity
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

  // ========== QUERY METHODS ==========

  /**
   * Get all grocery items with filters
   * @param {Object} filters - Filter options
   * @param {number} pageSize - Items per page
   * @param {Object} lastDoc - Last document for pagination
   * @returns {Promise<Object>} - Paginated results
   */
  async getAllItems(filters = {}, pageSize = 20, lastDoc = null) {
    try {
      let itemsQuery = collection(db, this.collectionName);
      
      // Apply filters
      const queryConstraints = [];
      
      if (filters.category) {
        queryConstraints.push(where("category", "==", filters.category));
      }
      
      if (filters.subCategory) {
        queryConstraints.push(where("subCategory", "==", filters.subCategory));
      }
      
      if (filters.isActive !== undefined) {
        queryConstraints.push(where("isActive", "==", filters.isActive));
      }
      
      if (filters.isFeatured !== undefined) {
        queryConstraints.push(where("isFeatured", "==", filters.isFeatured));
      }
      
      if (filters.isOnSale !== undefined) {
        queryConstraints.push(where("isOnSale", "==", filters.isOnSale));
      }
      
      if (filters.minPrice !== undefined) {
        queryConstraints.push(where("price", ">=", parseFloat(filters.minPrice)));
      }
      
      if (filters.maxPrice !== undefined) {
        queryConstraints.push(where("price", "<=", parseFloat(filters.maxPrice)));
      }
      
      if (filters.storeId) {
        queryConstraints.push(where("storeId", "==", filters.storeId));
      }
      
      if (filters.stockStatus) {
        queryConstraints.push(where("stockStatus", "==", filters.stockStatus));
      }

      // Add ordering
      queryConstraints.push(orderBy("createdAt", "desc"));
      queryConstraints.push(limit(pageSize));

      // Apply pagination
      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }

      // Create query
      const q = query(itemsQuery, ...queryConstraints);
      const snapshot = await getDocs(q);
      
      const items = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];

      return {
        success: true,
        items,
        hasMore: items.length === pageSize,
        lastDoc: lastVisible
      };
    } catch (error) {
      console.error("Error getting items:", error);
      return {
        success: false,
        items: [],
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Get items by category
   * @param {string} category - Category name
   * @param {string} subCategory - Optional subcategory
   * @returns {Promise<Array>} - Array of items
   */
  async getItemsByCategory(category, subCategory = null) {
    try {
      let itemsQuery = query(
        collection(db, this.collectionName),
        where("category", "==", category),
        where("isActive", "==", true),
        orderBy("name")
      );

      if (subCategory) {
        itemsQuery = query(itemsQuery, where("subCategory", "==", subCategory));
      }

      const snapshot = await getDocs(itemsQuery);
      return snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting items by category:", error);
      return [];
    }
  }

  /**
   * Search grocery items
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} - Array of matching items
   */
  async searchItems(searchTerm, filters = {}) {
    try {
      // Get all active items first (Firestore doesn't support native text search easily)
      const allItems = await this.getAllItems({ ...filters, isActive: true });
      
      if (!allItems.success) {
        return [];
      }

      const searchLower = searchTerm.toLowerCase();
      
      return allItems.items.filter(item => {
        return (
          (item.name && item.name.toLowerCase().includes(searchLower)) ||
          (item.description && item.description.toLowerCase().includes(searchLower)) ||
          (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
          (item.barcode && item.barcode.includes(searchTerm))
        );
      });
    } catch (error) {
      console.error("Error searching items:", error);
      return [];
    }
  }

  /**
   * Get featured items
   * @param {number} limit - Maximum number of items
   * @returns {Promise<Array>} - Array of featured items
   */
  async getFeaturedItems(limitCount = 10) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("isFeatured", "==", true),
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting featured items:", error);
      return [];
    }
  }

  /**
   * Get items on sale
   * @param {number} limit - Maximum number of items
   * @returns {Promise<Array>} - Array of sale items
   */
  async getSaleItems(limitCount = 10) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("isOnSale", "==", true),
        where("isActive", "==", true),
        orderBy("discountPercentage", "desc"),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting sale items:", error);
      return [];
    }
  }

  /**
   * Get low stock items
   * @returns {Promise<Array>} - Array of low stock items
   */
  async getLowStockItems(threshold = 10) {
    try {
      // Note: Firestore doesn't support range queries on multiple fields easily
      // This gets all items and filters locally
      const allItems = await this.getAllItems({ isActive: true });
      
      if (!allItems.success) {
        return [];
      }

      return allItems.items.filter(item => 
        item.quantity <= threshold && item.quantity > 0
      );
    } catch (error) {
      console.error("Error getting low stock items:", error);
      return [];
    }
  }

  /**
   * Get out of stock items
   * @returns {Promise<Array>} - Array of out of stock items
   */
  async getOutOfStockItems() {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("stockStatus", "==", "out_of_stock"),
        where("isActive", "==", true)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting out of stock items:", error);
      return [];
    }
  }

  // ========== CATEGORY MANAGEMENT ==========

  /**
   * Get all categories
   * @returns {Promise<Array>} - Array of categories
   */
  async getCategories() {
    try {
      // If using static categories
      return Categories;
      
      // If using Firestore for categories:
      // const snapshot = await getDocs(collection(db, this.categoriesCollection));
      // return snapshot.docs.map(doc => ({
      //   id: doc.id,
      //   ...doc.data()
      // }));
    } catch (error) {
      console.error("Error getting categories:", error);
      return Categories; // Fallback to static data
    }
  }

  /**
   * Get category statistics
   * @returns {Promise<Object>} - Category statistics
   */
  async getCategoryStats() {
    try {
      const allItems = await this.getAllItems({ isActive: true });
      
      if (!allItems.success) {
        return {};
      }

      const stats = {};
      
      allItems.items.forEach(item => {
        const category = item.category;
        const subCategory = item.subCategory;
        
        if (!stats[category]) {
          stats[category] = {
            totalItems: 0,
            totalValue: 0,
            subcategories: {}
          };
        }
        
        stats[category].totalItems++;
        stats[category].totalValue += item.price * item.quantity;
        
        if (subCategory) {
          if (!stats[category].subcategories[subCategory]) {
            stats[category].subcategories[subCategory] = {
              totalItems: 0,
              totalValue: 0
            };
          }
          
          stats[category].subcategories[subCategory].totalItems++;
          stats[category].subcategories[subCategory].totalValue += item.price * item.quantity;
        }
      });
      
      return stats;
    } catch (error) {
      console.error("Error getting category stats:", error);
      return {};
    }
  }

  /**
   * Update category statistics
   * @param {string} category - Category name
   * @param {string} subCategory - Subcategory name
   * @param {number} change - Change in count (1 for add, -1 for delete)
   */
  async updateCategoryStats(category, subCategory, change = 1) {
    try {
      // This is a simplified version
      // In production, you might want to maintain a separate stats collection
      const categoryRef = doc(db, this.categoriesCollection, category);
      
      await updateDoc(categoryRef, {
        itemCount: increment(change),
        updatedAt: serverTimestamp()
      });
      
      if (subCategory) {
        const subCategoryRef = doc(db, this.categoriesCollection, category, "subcategories", subCategory);
        await updateDoc(subCategoryRef, {
          itemCount: increment(change),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error updating category stats:", error);
    }
  }

  // ========== STOCK MANAGEMENT ==========

  /**
   * Restock item
   * @param {string} itemId - Item ID
   * @param {number} quantity - Quantity to add
   * @param {string} reason - Reason for restocking
   * @returns {Promise<Object>} - Updated item or error
   */
  async restockItem(itemId, quantity, reason = "restock") {
    try {
      const item = await this.getItem(itemId);
      
      if (!item) {
        throw new Error("Item not found");
      }
      
      const newQuantity = item.quantity + quantity;
      
      const result = await this.updateItem(itemId, {
        quantity: newQuantity
      });
      
      // Log stock movement
      await this.logStockMovement(itemId, quantity, reason, item.quantity, newQuantity);
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code || error.message)
      };
    }
  }

  /**
   * Consume item (reduce quantity)
   * @param {string} itemId - Item ID
   * @param {number} quantity - Quantity to consume
   * @param {string} reason - Reason for consumption
   * @returns {Promise<Object>} - Updated item or error
   */
  async consumeItem(itemId, quantity, reason = "consumption") {
    try {
      const item = await this.getItem(itemId);
      
      if (!item) {
        throw new Error("Item not found");
      }
      
      if (item.quantity < quantity) {
        throw new Error("Insufficient stock");
      }
      
      const newQuantity = item.quantity - quantity;
      
      const result = await this.updateItem(itemId, {
        quantity: newQuantity
      });
      
      // Log stock movement
      await this.logStockMovement(itemId, -quantity, reason, item.quantity, newQuantity);
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code || error.message)
      };
    }
  }

  /**
   * Log stock movement
   * @param {string} itemId - Item ID
   * @param {number} change - Quantity change
   * @param {string} reason - Reason for change
   * @param {number} oldQuantity - Old quantity
   * @param {number} newQuantity - New quantity
   */
  async logStockMovement(itemId, change, reason, oldQuantity, newQuantity) {
    try {
      const movementLog = {
        itemId,
        change,
        reason,
        oldQuantity,
        newQuantity,
        timestamp: serverTimestamp(),
        performedBy: "system" // In production, get from auth
      };
      
      // Add to stock movements subcollection
      const movementRef = doc(collection(db, this.collectionName, itemId, "stockMovements"));
      await setDoc(movementRef, movementLog);
    } catch (error) {
      console.error("Error logging stock movement:", error);
    }
  }

  // ========== RATING & REVIEWS ==========

  /**
   * Add rating to item
   * @param {string} itemId - Item ID
   * @param {number} rating - Rating (1-5)
   * @param {string} userId - User ID
   * @param {string} comment - Optional comment
   * @returns {Promise<Object>} - Success or error
   */
  async addRating(itemId, rating, userId, comment = "") {
    try {
      if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }
      
      const item = await this.getItem(itemId);
      
      if (!item) {
        throw new Error("Item not found");
      }
      
      const currentRatings = item.ratings;
      const newCount = currentRatings.count + 1;
      const newTotal = currentRatings.total + rating;
      const newAverage = newTotal / newCount;
      
      // Update item ratings
      await updateDoc(doc(db, this.collectionName, itemId), {
        "ratings.average": newAverage,
        "ratings.count": newCount,
        "ratings.total": newTotal,
        updatedAt: serverTimestamp()
      });
      
      // Add review document
      const reviewData = {
        itemId,
        userId,
        rating,
        comment,
        helpful: 0,
        reported: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const reviewRef = doc(collection(db, this.collectionName, itemId, "reviews"));
      await setDoc(reviewRef, reviewData);
      
      return {
        success: true,
        newAverage
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code || error.message)
      };
    }
  }

  /**
   * Get item reviews
   * @param {string} itemId - Item ID
   * @param {number} limit - Maximum reviews
   * @returns {Promise<Array>} - Array of reviews
   */
  async getItemReviews(itemId, limitCount = 10) {
    try {
      const q = query(
        collection(db, this.collectionName, itemId, "reviews"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting reviews:", error);
      return [];
    }
  }

  // ========== ANALYTICS & REPORTS ==========

  /**
   * Get grocery statistics
   * @returns {Promise<Object>} - Statistics object
   */
  async getGroceryStats() {
    try {
      const allItems = await this.getAllItems({ isActive: true });
      
      if (!allItems.success) {
        return null;
      }
      
      const stats = {
        totalItems: allItems.items.length,
        totalValue: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        categories: {},
        topItems: []
      };
      
      allItems.items.forEach(item => {
        // Calculate total value
        stats.totalValue += item.price * item.quantity;
        
        // Count low stock
        if (item.stockStatus === "low_stock") {
          stats.lowStockCount++;
        }
        
        // Count out of stock
        if (item.stockStatus === "out_of_stock") {
          stats.outOfStockCount++;
        }
        
        // Count by category
        const category = item.category;
        stats.categories[category] = (stats.categories[category] || 0) + 1;
      });
      
      // Get top rated items
      stats.topItems = allItems.items
        .filter(item => item.ratings.count > 0)
        .sort((a, b) => b.ratings.average - a.ratings.average)
        .slice(0, 10);
      
      return stats;
    } catch (error) {
      console.error("Error getting grocery stats:", error);
      return null;
    }
  }

  /**
   * Get price history for item
   * @param {string} itemId - Item ID
   * @returns {Promise<Array>} - Price history
   */
  async getPriceHistory(itemId) {
    try {
      const q = query(
        collection(db, this.collectionName, itemId, "priceHistory"),
        orderBy("timestamp", "desc")
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error getting price history:", error);
      return [];
    }
  }

  // ========== HELPER METHODS ==========

  /**
   * Calculate stock status based on quantity
   * @param {number} quantity - Current quantity
   * @returns {string} - Stock status
   */
  calculateStockStatus(quantity) {
    if (quantity <= 0) {
      return "out_of_stock";
    } else if (quantity <= 10) {
      return "low_stock";
    } else if (quantity <= 50) {
      return "in_stock";
    } else {
      return "high_stock";
    }
  }

  /**
   * Get user-friendly error message
   * @param {string} errorCode - Firebase error code
   * @returns {string} - User-friendly error message
   */
  getErrorMessage(errorCode) {
    const errorMessages = {
      // Firestore errors
      'permission-denied': 'You do not have permission to perform this action.',
      'not-found': 'Item not found.',
      'already-exists': 'An item with this ID already exists.',
      'failed-precondition': 'Operation failed. Please try again.',
      
      // Custom errors
      'insufficient-stock': 'Insufficient stock to complete this operation.',
      'invalid-quantity': 'Please enter a valid quantity.',
      'invalid-price': 'Please enter a valid price.',
      
      // Default
      'default': 'An error occurred. Please try again.'
    };
    
    return errorMessages[errorCode] || errorMessages.default;
  }

  /**
   * Validate item data
   * @param {Object} itemData - Item data to validate
   * @returns {Object} - Validation result
   */
  validateItemData(itemData) {
    const errors = [];
    
    if (!itemData.name || itemData.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long");
    }
    
    if (!itemData.category) {
      errors.push("Category is required");
    }
    
    if (itemData.price === undefined || itemData.price <= 0) {
      errors.push("Price must be greater than 0");
    }
    
    if (itemData.quantity !== undefined && itemData.quantity < 0) {
      errors.push("Quantity cannot be negative");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Export items to CSV format
   * @param {Array} items - Items to export
   * @returns {string} - CSV string
   */
  exportToCSV(items) {
    const headers = ["Name", "Category", "Subcategory", "Price", "Quantity", "Unit", "Brand", "Barcode"];
    const rows = items.map(item => [
      item.name,
      item.category,
      item.subCategory || "",
      item.price,
      item.quantity,
      item.unit,
      item.brand || "",
      item.barcode || ""
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    return csvContent;
  }
}

// Create singleton instance
const groceryService = new GroceryService();

export default groceryService;