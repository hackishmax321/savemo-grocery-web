import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit
} from "firebase/firestore";
import { db } from "../db/Firebase.config";

class ContactService {
  constructor() {
    this.collectionName = "contactMessages";
  }

  /**
   * Submit a new contact message
   * @param {Object} messageData - Contact form data
   * @returns {Promise<Object>} - Success or error response
   */
  async submitContactMessage(messageData) {
    try {
      const { name, email, phone, subject, message } = messageData;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        throw new Error("Name, email, subject, and message are required");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      const messageDocData = {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || "",
        subject: subject.trim(),
        message: message.trim(),
        status: "unread", // unread, read, replied, archived
        isRead: false,
        isReplied: false,
        repliedAt: null,
        repliedBy: "",
        replyMessage: "",
        source: "website", // website, app, phone, email
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        ipAddress: '', // You might want to capture this from backend
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add document to Firestore
      const docRef = await addDoc(collection(db, this.collectionName), messageDocData);

      return {
        success: true,
        messageId: docRef.id,
        message: "Your message has been submitted successfully. We'll respond within 24 hours."
      };
    } catch (error) {
      console.error("Error submitting contact message:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code || error.message)
      };
    }
  }

  /**
   * Get all contact messages with pagination and filters
   * @param {Object} filters - Filter options
   * @param {number} limitCount - Number of messages per page
   * @param {Object} lastDoc - Last document for pagination
   * @returns {Promise<Object>} - Paginated messages
   */
  async getAllMessages(filters = {}, limitCount = 50, lastDoc = null) {
    try {
      let messagesQuery = collection(db, this.collectionName);
      const queryConstraints = [];
      
      // Apply filters
      if (filters.status) {
        queryConstraints.push(where("status", "==", filters.status));
      }
      
      if (filters.isRead !== undefined) {
        queryConstraints.push(where("isRead", "==", filters.isRead));
      }
      
      if (filters.isReplied !== undefined) {
        queryConstraints.push(where("isReplied", "==", filters.isReplied));
      }
      
      if (filters.subject) {
        queryConstraints.push(where("subject", "==", filters.subject));
      }
      
      if (filters.email) {
        queryConstraints.push(where("email", "==", filters.email));
      }
      
      if (filters.startDate && filters.endDate) {
        // Note: Date range queries require composite indexes
        // For simplicity, we'll filter locally
      }

      // Always order by date (most recent first)
      queryConstraints.push(orderBy("createdAt", "desc"));
      queryConstraints.push(limit(limitCount));

      // Apply pagination
      // if (lastDoc) {
      //   queryConstraints.push(startAfter(lastDoc));
      // }

      const q = query(messagesQuery, ...queryConstraints);
      const snapshot = await getDocs(q);
      
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Apply date range filter locally if needed
      let filteredMessages = messages;
      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        filteredMessages = messages.filter(msg => {
          const msgDate = msg.createdAt?.toDate();
          return msgDate >= start && msgDate <= end;
        });
      }

      return {
        success: true,
        messages: filteredMessages,
        total: filteredMessages.length,
        hasMore: filteredMessages.length === limitCount,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      console.error("Error getting contact messages:", error);
      return {
        success: false,
        messages: [],
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Get single message by ID
   * @param {string} messageId - Message document ID
   * @returns {Promise<Object|null>} - Message object or null
   */
  async getMessage(messageId) {
    try {
      const messageDocRef = doc(db, this.collectionName, messageId);
      const messageDocSnap = await getDoc(messageDocRef);
      
      if (messageDocSnap.exists()) {
        return {
          id: messageId,
          ...messageDocSnap.data()
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting message:", error);
      return null;
    }
  }

  /**
   * Mark message as read
   * @param {string} messageId - Message document ID
   * @param {string} readBy - Admin/user who read the message
   * @returns {Promise<Object>} - Success or error
   */
  async markAsRead(messageId, readBy = "admin") {
    try {
      await updateDoc(doc(db, this.collectionName, messageId), {
        isRead: true,
        status: "read",
        readAt: serverTimestamp(),
        readBy: readBy,
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
   * Reply to a contact message
   * @param {string} messageId - Message document ID
   * @param {Object} replyData - Reply details
   * @returns {Promise<Object>} - Success or error
   */
  async replyToMessage(messageId, replyData) {
    try {
      const { replyMessage, repliedBy, email, name } = replyData;
      
      if (!replyMessage || !repliedBy) {
        throw new Error("Reply message and replier are required");
      }

      await updateDoc(doc(db, this.collectionName, messageId), {
        isReplied: true,
        status: "replied",
        replyMessage: replyMessage.trim(),
        repliedBy: repliedBy.trim(),
        repliedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Here you would typically send an email to the user
      // await this.sendReplyEmail(email, name, replyMessage);

      return {
        success: true,
        message: "Reply sent successfully"
      };
    } catch (error) {
      console.error("Error replying to message:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code || error.message)
      };
    }
  }

  /**
   * Get message statistics
   * @returns {Promise<Object>} - Statistics object
   */
  async getMessageStats() {
    try {
      const result = await this.getAllMessages({}, 1000);
      
      if (!result.success) {
        throw new Error("Failed to load messages");
      }

      const messages = result.messages;
      
      const stats = {
        totalMessages: messages.length,
        unreadMessages: messages.filter(msg => !msg.isRead).length,
        repliedMessages: messages.filter(msg => msg.isReplied).length,
        todayMessages: messages.filter(msg => {
          const msgDate = msg.createdAt?.toDate();
          const today = new Date();
          return msgDate && 
                 msgDate.getDate() === today.getDate() &&
                 msgDate.getMonth() === today.getMonth() &&
                 msgDate.getFullYear() === today.getFullYear();
        }).length,
        bySubject: {},
        byStatus: {
          unread: 0,
          read: 0,
          replied: 0,
          archived: 0
        }
      };

      // Count by subject
      messages.forEach(msg => {
        const subject = msg.subject || 'general';
        stats.bySubject[subject] = (stats.bySubject[subject] || 0) + 1;
        
        // Count by status
        const status = msg.status || 'unread';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      });

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error("Error getting message stats:", error);
      return {
        success: false,
        error: "Failed to load statistics"
      };
    }
  }

  /**
   * Get recent messages
   * @param {number} count - Number of recent messages
   * @returns {Promise<Array>} - Array of recent messages
   */
  async getRecentMessages(count = 10) {
    try {
      const result = await this.getAllMessages({}, count);
      return result.success ? result.messages : [];
    } catch (error) {
      console.error("Error getting recent messages:", error);
      return [];
    }
  }

  /**
   * Archive a message (soft delete)
   * @param {string} messageId - Message document ID
   * @returns {Promise<Object>} - Success or error
   */
  async archiveMessage(messageId) {
    try {
      await updateDoc(doc(db, this.collectionName, messageId), {
        status: "archived",
        archivedAt: serverTimestamp(),
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
   * Delete a message permanently
   * @param {string} messageId - Message document ID
   * @returns {Promise<Object>} - Success or error
   */
  async deleteMessage(messageId) {
    try {
      await deleteDoc(doc(db, this.collectionName, messageId));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * Get messages by email
   * @param {string} email - Email address
   * @returns {Promise<Array>} - Array of messages
   */
  async getMessagesByEmail(email) {
    try {
      const result = await this.getAllMessages({ email });
      return result.success ? result.messages : [];
    } catch (error) {
      console.error("Error getting messages by email:", error);
      return [];
    }
  }

  /**
   * Export messages to CSV
   * @param {Array} messages - Messages to export
   * @returns {string} - CSV string
   */
  exportToCSV(messages) {
    const headers = ["ID", "Name", "Email", "Phone", "Subject", "Message", "Status", "Is Read", "Is Replied", "Created At"];
    const rows = messages.map(msg => [
      msg.id,
      `"${msg.name}"`,
      `"${msg.email}"`,
      `"${msg.phone || ''}"`,
      `"${msg.subject}"`,
      `"${msg.message.replace(/"/g, '""')}"`,
      msg.status,
      msg.isRead ? "Yes" : "No",
      msg.isReplied ? "Yes" : "No",
      msg.createdAt?.toDate().toISOString() || ""
    ]);
    
    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
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
      'not-found': 'Message not found.',
      'already-exists': 'This message already exists.',
      'failed-precondition': 'Operation failed. Please try again.',
      'invalid-argument': 'Invalid data provided.',
      
      // Custom errors
      'required-fields': 'Please fill in all required fields.',
      'invalid-email': 'Please enter a valid email address.',
      'message-too-long': 'Message is too long. Please keep it under 1000 characters.',
      
      // Default
      'default': 'An error occurred. Please try again.'
    };
    
    return errorMessages[errorCode] || errorMessages.default;
  }

  /**
   * Validate contact form data
   * @param {Object} data - Form data to validate
   * @returns {Object} - Validation result
   */
  validateContactData(data) {
    const errors = {};
    
    if (!data.name?.trim()) {
      errors.name = "Name is required";
    } else if (data.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    
    if (!data.email?.trim()) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        errors.email = "Please enter a valid email address";
      }
    }
    
    if (data.phone && !/^[\d\s\+\-\(\)]+$/.test(data.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
    
    if (!data.subject?.trim()) {
      errors.subject = "Subject is required";
    }
    
    if (!data.message?.trim()) {
      errors.message = "Message is required";
    } else if (data.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters";
    } else if (data.message.trim().length > 1000) {
      errors.message = "Message is too long (max 1000 characters)";
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Create singleton instance
const contactService = new ContactService();

export default contactService;