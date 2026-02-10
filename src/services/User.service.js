import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
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
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../db/Firebase.config";

class UserService {
  // ========== AUTHENTICATION METHODS ==========
  
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} userData - Additional user data
   * @returns {Promise<Object>} - User object or error
   */
  async register(email, password, userData) {
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send email verification
      await sendEmailVerification(user);
      
      // Prepare user document data
      const userDocData = {
        uid: user.uid,
        email: user.email,
        emailVerified: false,
        displayName: userData.displayName || '',
        photoURL: userData.photoURL || '',
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || {},
        role: userData.role || 'customer',
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        ...userData // Spread any additional data
      };
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), userDocData);
      
      // Update auth profile
      if (userData.displayName) {
        await updateProfile(user, {
          displayName: userData.displayName,
          photoURL: userData.photoURL || ''
        });
      }
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          emailVerified: false,
          ...userDocData
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }
  
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User object or error
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update last login time
      await updateDoc(doc(db, "users", user.uid), {
        lastLoginAt: serverTimestamp()
      });
      
      // Get user document
      const userDoc = await this.getUser(user.uid);
      
      return {
        success: true,
        user: userDoc
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }
  
  /**
   * Logout current user
   * @returns {Promise<Object>} - Success or error
   */
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }
  
  /**
   * Get current authenticated user
   * @returns {Promise<Object|null>} - User object or null
   */
  async getCurrentUser() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          const userDoc = await this.getUser(user.uid);
          resolve(userDoc);
        } else {
          resolve(null);
        }
      });
    });
  }
  
  /**
   * Listen to auth state changes
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await this.getUser(user.uid);
        callback(userDoc);
      } else {
        callback(null);
      }
    });
  }
  
  // ========== USER PROFILE METHODS ==========
  
  /**
   * Get single user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - User object or null
   */
  async getUser(userId) {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        return {
          uid: userId,
          ...userDocSnap.data()
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }
  
  /**
   * Get all users (admin only)
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} - Array of users
   */
  async getAllUsers(filters = {}) {
    try {
      let usersQuery = collection(db, "users");
      
      // Apply filters
      if (filters.role) {
        usersQuery = query(usersQuery, where("role", "==", filters.role));
      }
      if (filters.isActive !== undefined) {
        usersQuery = query(usersQuery, where("isActive", "==", filters.isActive));
      }
      
      // Order by creation date
      usersQuery = query(usersQuery, orderBy("createdAt", "desc"));
      
      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }
  
  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated user or error
   */
  async updateUser(userId, updates) {
    try {
      const userDocRef = doc(db, "users", userId);
      
      // Remove uid from updates if present
      const { uid, ...cleanUpdates } = updates;
      
      const updateData = {
        ...cleanUpdates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userDocRef, updateData);
      
      // Update auth profile if displayName or photoURL changed
      if (updates.displayName || updates.photoURL) {
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === userId) {
          await updateProfile(currentUser, {
            displayName: updates.displayName || currentUser.displayName,
            photoURL: updates.photoURL || currentUser.photoURL
          });
        }
      }
      
      // Get updated user
      const updatedUser = await this.getUser(userId);
      
      return {
        success: true,
        user: updatedUser
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }
  
  /**
   * Update user email
   * @param {string} userId - User ID
   * @param {string} newEmail - New email address
   * @param {string} password - Current password for reauthentication
   * @returns {Promise<Object>} - Success or error
   */
  async updateEmail(userId, newEmail, password) {
    try {
      const user = auth.currentUser;
      
      if (!user || user.uid !== userId) {
        throw new Error("User not authenticated");
      }
      
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      // Update email
      await updateEmail(user, newEmail);
      
      // Send verification email
      await sendEmailVerification(user);
      
      // Update email in Firestore
      await updateDoc(doc(db, "users", userId), {
        email: newEmail,
        emailVerified: false,
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
   * Update user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - Success or error
   */
  async updatePassword(userId, currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      
      if (!user || user.uid !== userId) {
        throw new Error("User not authenticated");
      }
      
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }
  
  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<Object>} - Success or error
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }
  
  /**
   * Delete user account
   * @param {string} userId - User ID
   * @param {string} password - Current password for verification
   * @returns {Promise<Object>} - Success or error
   */
  async deleteUser(userId, password) {
    try {
      const user = auth.currentUser;
      
      if (!user || user.uid !== userId) {
        throw new Error("User not authenticated");
      }
      
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      // Delete user from Firestore
      await deleteDoc(doc(db, "users", userId));
      
      // Delete user from Authentication
      await deleteUser(user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }
  
  /**
   * Deactivate user account (soft delete)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Success or error
   */
  async deactivateUser(userId) {
    try {
      await updateDoc(doc(db, "users", userId), {
        isActive: false,
        deactivatedAt: serverTimestamp(),
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
   * Reactivate user account
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Success or error
   */
  async reactivateUser(userId) {
    try {
      await updateDoc(doc(db, "users", userId), {
        isActive: true,
        reactivatedAt: serverTimestamp(),
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
   * Get users by role
   * @param {string} role - User role (admin, customer, etc.)
   * @returns {Promise<Array>} - Array of users
   */
  async getUsersByRole(role) {
    try {
      const q = query(collection(db, "users"), where("role", "==", role));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting users by role:", error);
      return [];
    }
  }
  
  /**
   * Search users by name or email
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} - Array of matching users
   */
  async searchUsers(searchTerm) {
    try {
      const allUsers = await this.getAllUsers();
      
      return allUsers.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (user.displayName && user.displayName.toLowerCase().includes(searchLower)) ||
          (user.email && user.email.toLowerCase().includes(searchLower))
        );
      });
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }
  
  /**
   * Get user statistics
   * @returns {Promise<Object>} - User statistics
   */
  async getUserStats() {
    try {
      const allUsers = await this.getAllUsers();
      
      const stats = {
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => u.isActive).length,
        inactiveUsers: allUsers.filter(u => !u.isActive).length,
        byRole: {},
        recentUsers: allUsers
          .sort((a, b) => new Date(b.createdAt?.toDate()) - new Date(a.createdAt?.toDate()))
          .slice(0, 10)
      };
      
      // Count by role
      allUsers.forEach(user => {
        const role = user.role || 'unknown';
        stats.byRole[role] = (stats.byRole[role] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error("Error getting user stats:", error);
      return null;
    }
  }
  
  // ========== HELPER METHODS ==========
  
  /**
   * Get user-friendly error message
   * @param {string} errorCode - Firebase error code
   * @returns {string} - User-friendly error message
   */
  getErrorMessage(errorCode) {
    const errorMessages = {
      // Authentication errors
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/requires-recent-login': 'Please log in again to perform this action.',
      
      // Firestore errors
      'permission-denied': 'You do not have permission to perform this action.',
      'not-found': 'User not found.',
      
      // Default
      'default': 'An error occurred. Please try again.'
    };
    
    return errorMessages[errorCode] || errorMessages.default;
  }
  
  /**
   * Check if user has specific role
   * @param {string} userId - User ID
   * @param {string} role - Role to check
   * @returns {Promise<boolean>} - True if user has role
   */
  async hasRole(userId, role) {
    try {
      const user = await this.getUser(userId);
      return user?.role === role;
    } catch (error) {
      console.error("Error checking user role:", error);
      return false;
    }
  }
  
  /**
   * Check if user is admin
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - True if user is admin
   */
  async isAdmin(userId) {
    return this.hasRole(userId, 'admin');
  }
}

// Create singleton instance
const userService = new UserService();

export default userService;