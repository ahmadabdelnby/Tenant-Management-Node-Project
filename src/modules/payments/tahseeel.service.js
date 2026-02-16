const axios = require('axios');
const logger = require('../../shared/utils/logger');

/**
 * Tahseeel Payment Gateway Service
 * Kuwait Apple Pay integration
 * API: https://lounge.tahseeel.com/api/
 */

const TAHSEEEL_API_URL = 'https://lounge.tahseeel.com/api/';

// Tahseeel credentials - should be in environment variables
const getTahseeelConfig = () => ({
  uid: process.env.TAHSEEEL_UID || '',
  pwd: process.env.TAHSEEEL_PWD || '',
  secret: process.env.TAHSEEEL_SECRET || '',
  callbackUrl: process.env.TAHSEEEL_CALLBACK_URL || 'http://localhost:3000/payments/callback',
});

const tahseeelService = {
  /**
   * Create a payment order on Tahseeel
   * Returns payment link that user can use to pay via Apple Pay
   * 
   * @param {Object} orderData
   * @param {string} orderData.orderNo - Unique order number (e.g., PAY-{paymentId})
   * @param {number} orderData.amount - Amount in KWD (up to 3 decimals)
   * @param {string} orderData.customerName - Customer name
   * @param {string} orderData.customerEmail - Customer email (optional if mobile provided)
   * @param {string} orderData.customerMobile - Customer mobile (optional if email provided)
   * @param {string} orderData.phoneCode - Country code (e.g., 965 for Kuwait)
   * @param {string} orderData.remarks - Optional remarks
   * @returns {Object} { success, link, error }
   */
  async createOrder(orderData) {
    try {
      const config = getTahseeelConfig();

      // Check for missing or placeholder credentials
      const isPlaceholder = (val) => !val || val.startsWith('your_') || val === 'changeme';
      if (isPlaceholder(config.uid) || isPlaceholder(config.pwd) || isPlaceholder(config.secret)) {
        logger.warn('Tahseeel credentials not configured or still using placeholder values');
        return { 
          success: false, 
          error: 'Tahseeel payment gateway is not configured. Please set valid TAHSEEEL_UID, TAHSEEEL_PWD, and TAHSEEEL_SECRET in your .env file.' 
        };
      }

      const params = new URLSearchParams();
      params.append('uid', config.uid);
      params.append('pwd', config.pwd);
      params.append('secret', config.secret);
      params.append('order_no', orderData.orderNo);
      params.append('order_amt', parseFloat(orderData.amount).toFixed(3));
      params.append('delivery_charges', '0.000');
      params.append('total_items', '1');
      params.append('cust_name', orderData.customerName);
      params.append('callback_url', config.callbackUrl);
      params.append('knet_allowed', '0');
      params.append('aPay_allowed', '1');

      if (orderData.customerEmail) {
        params.append('cust_email', orderData.customerEmail);
      }
      if (orderData.customerMobile) {
        params.append('cust_mobile', orderData.customerMobile);
      }
      if (orderData.phoneCode) {
        params.append('phone_code', orderData.phoneCode);
      }
      if (orderData.remarks) {
        params.append('remarks', orderData.remarks);
      }

      const response = await axios.post(
        `${TAHSEEEL_API_URL}?p=order`,
        params.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 30000,
        }
      );

      const data = response.data;

      if (data.error) {
        logger.error('Tahseeel create order error:', data.msg);
        return { success: false, error: data.msg };
      }

      logger.info(`Tahseeel order created: ${orderData.orderNo}, link: ${data.link}`);
      return {
        success: true,
        link: data.link,
        message: data.msg,
      };
    } catch (error) {
      logger.error('Tahseeel API error:', error.message);
      return { success: false, error: `Payment gateway error: ${error.message}` };
    }
  },

  /**
   * Get order info from Tahseeel
   * 
   * @param {string} invId - Invoice ID from callback
   * @param {string} hash - Hash from callback
   * @returns {Object} Order details
   */
  async getOrderInfo(invId, hash) {
    try {
      const config = getTahseeelConfig();

      const params = new URLSearchParams();
      params.append('uid', config.uid);
      params.append('pwd', config.pwd);
      params.append('secret', config.secret);
      params.append('id', invId);
      params.append('hash', hash);

      const response = await axios.post(
        `${TAHSEEEL_API_URL}?p=order_info`,
        params.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 30000,
        }
      );

      const data = response.data;

      if (data.error) {
        logger.error('Tahseeel get order info error:', data.msg);
        return { success: false, error: data.msg };
      }

      return { success: true, data };
    } catch (error) {
      logger.error('Tahseeel get order info error:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Parse callback response from Tahseeel
   * After payment, Tahseeel redirects to callback_url with these query params
   * 
   * @param {Object} callbackData - Query parameters from callback URL
   * @returns {Object} Parsed callback data
   */
  parseCallback(callbackData) {
    return {
      cancelled: callbackData.cancelled === '1',
      hash: callbackData.hash || null,
      invId: callbackData.inv_id || callbackData.order_id || null,
      txDate: callbackData.tx_date || null,
      txAmount: callbackData.tx_amt ? parseFloat(callbackData.tx_amt) : null,
      result: callbackData.Result || callbackData.result || null,
      paymentId: callbackData.PaymentID || null,
      postDate: callbackData.PostDate || null,
      tranId: callbackData.TranID || null,
      auth: callbackData.Auth || null,
      ref: callbackData.Ref || null,
      txId: callbackData.tx_id || null,
      txMode: callbackData.tx_mode || null,
      txStatus: callbackData.tx_status || null,
      isSuccess: (callbackData.tx_status || '').toLowerCase() === 'approved' ||
                 (callbackData.Result || '').toUpperCase() === 'CAPTURED',
    };
  },
};

module.exports = tahseeelService;
