import axios from 'axios';

// Configure axios instance for payment backend
const paymentApi = axios.create({
  baseURL: import.meta.env.REACT_APP_PAYMENT_API_URL || 'https://payment-gate-payhere-node.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

class PaymentService {
  constructor() {
    this.baseURL = import.meta.env.REACT_APP_PAYMENT_API_URL || 'https://payment-gate-payhere-node.onrender.com/api';
  }

  /**
   * Initialize a payment with PayHere
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} - Payment initialization result
   */
  async initializePayment(paymentData) {
    try {
      const { amount, firstName, lastName, email, phone, address, city, country } = paymentData;

      // Get hash and order ID from backend
      const hashResponse = await paymentApi.get('https://payment-gate-payhere-node.onrender.com/api/payment/hash', {
        params: { amount }
      });

      const { orderId, hash, merchantId, currency } = hashResponse.data;
      

      // Prepare payment data for PayHere
      const payherePayment = {
        sandbox: import.meta.env.REACT_APP_PAYHERE_MODE === 'sandbox' || true,
        merchant_id: merchantId,
        return_url: '', // Not used with popup
        cancel_url: '', // Not used with popup
        notify_url: `${this.baseURL}/payment/notify`,
        order_id: orderId,
        items: 'Grocery Order',
        amount: amount,
        currency: currency,
        hash: hash,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        address: address,
        city: city,
        country: country || 'Sri Lanka',
        custom_1: localStorage.getItem('userId') || 'guest',
        custom_2: JSON.stringify({
          email: email,
          phone: phone
        })
      };

      return {
        success: true,
        orderId,
        paymentData: payherePayment
      };

    } catch (error) {
      console.error('Payment initialization error:', error);
      
      if (error.response) {
        // Server responded with error
        throw new Error(error.response.data.error || 'Payment initialization failed');
      } else if (error.request) {
        // Request made but no response
        throw new Error('No response from payment server');
      } else {
        // Something else happened
        throw new Error(error.message || 'Payment initialization failed');
      }
    }
  }

  /**
   * Verify payment status
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Payment verification result
   */
  async verifyPayment(orderId) {
    try {
      const response = await paymentApi.get(`https://payment-gate-payhere-node.onrender.com/api/payment/status/${orderId}`);
      
      if (response.data.success) {
        return {
          success: true,
          status: 'completed',
          payment: response.data.payment
        };
      } else {
        return {
          success: false,
          status: response.data.status || 'pending',
          message: response.data.message
        };
      }

    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        status: 'error',
        message: error.response?.data?.error || 'Payment verification failed'
      };
    }
  }

  /**
   * Retry failed payment
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Retry result
   */
  async retryPayment(orderId) {
    try {
      const response = await paymentApi.post('https://payment-gate-payhere-node.onrender.com/api/payment/retry', { orderId });
      return response.data;
    } catch (error) {
      console.error('Payment retry error:', error);
      throw error;
    }
  }

  /**
   * Get payment methods available
   * @returns {Promise<Array>} - List of payment methods
   */
  async getPaymentMethods() {
    // For PayHere, return supported methods
    return [
      {
        id: 'payhere',
        name: 'PayHere',
        description: 'Credit/Debit Cards, Online Banking',
        icon: 'payhere-icon'
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when you receive',
        icon: 'cash-icon'
      }
    ];
  }

  /**
   * Process refund
   * @param {string} orderId - Order ID
   * @param {number} amount - Refund amount
   * @param {string} reason - Refund reason
   * @returns {Promise<Object>} - Refund result
   */
  async processRefund(orderId, amount, reason) {
    try {
      const response = await paymentApi.post('https://payment-gate-payhere-node.onrender.com/api/payment/refund', {
        orderId,
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Refund processing error:', error);
      throw error;
    }
  }

  /**
   * Get payment history for an order
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} - Payment history
   */
  async getPaymentHistory(orderId) {
    try {
      const response = await paymentApi.get(`https://payment-gate-payhere-node.onrender.com/api/payment/history/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Get payment history error:', error);
      throw error;
    }
  }

  async checkHealth() {
    console.log("Hii")
    try {
      const response = await paymentApi.get('https://payment-gate-payhere-node.onrender.com/api/health');
      console.log(response)
      return {
        success: true,
        status: response.data.status,
        timestamp: response.data.timestamp,
        data: response.data
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        success: false,
        status: 'error',
        message: error.response?.data?.error || 'Backend server is not responding',
        error: error.message
      };
    }
  }

  /**
   * Check backend health with detailed status
   * @returns {Promise<Object>} - Detailed health status
   */
  async getDetailedHealth() {
    try {
      const startTime = Date.now();
      const response = await paymentApi.get('/health');
      const responseTime = Date.now() - startTime;

      return {
        success: true,
        status: response.data.status,
        timestamp: response.data.timestamp,
        responseTime: `${responseTime}ms`,
        isHealthy: response.data.status === 'OK',
        serverTime: new Date(response.data.timestamp).toLocaleString()
      };
    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        isHealthy: false,
        message: error.response?.data?.error || 'Cannot connect to payment server',
        error: error.message,
        responseTime: null
      };
    }
  }

  /**
   * Verify backend connectivity before payment
   * @returns {Promise<boolean>} - True if backend is reachable
   */
  async verifyBackendConnection() {
    try {
      const response = await paymentApi.get('/health', { timeout: 5000 });
      return response.data.status === 'OK';
    } catch (error) {
      console.error('Backend connection verification failed:', error);
      return false;
    }
  }
}

// Create and export singleton instance
const paymentService = new PaymentService();
export default paymentService;