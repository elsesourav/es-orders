import { Platform } from "react-native";

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = "USD") {
   if (amount === "" || amount === undefined || amount === null) return "";
   const num = Number(amount);
   if (isNaN(num)) return amount;

   return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
   }).format(num);
}

/**
 * Format a number as Indian currency/lakh-crore style
 * @param {number|string} x - The number to format
 * @returns {string} Formatted number string
 */
export function formatIndianNumber(x) {
   if (x === "" || x === undefined || x === null) return "";
   const num = Number(x);
   if (isNaN(num)) return x;

   // Preserve decimals if present
   const [intPart, decPart] = x.toString().split(".");
   const formattedInt = new Intl.NumberFormat("en-IN").format(Number(intPart));
   return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

/**
 * Format date for display
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
   if (!date) return "";
   const dateObj = typeof date === "string" ? new Date(date) : date;
   return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
   });
}

/**
 * Format date and time for display
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date) {
   if (!date) return "";
   const dateObj = typeof date === "string" ? new Date(date) : date;
   return dateObj.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
   });
}

/**
 * Debounce function for search inputs
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay) {
   let timeoutId;
   return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
   };
}

/**
 * Get platform-specific styles
 * @param {Object} styles - Object with ios and android keys
 * @returns {Object} Platform-specific styles
 */
export function getPlatformStyles(styles) {
   return Platform.select(styles);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return emailRegex.test(email);
}

/**
 * Generate a random ID
 * @returns {string} Random ID
 */
export function generateId() {
   return Math.random().toString(36).substr(2, 9);
}

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
   if (!str) return "";
   return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, length) {
   if (!text || text.length <= length) return text;
   return text.substring(0, length) + "...";
}

// Listing states constants for product filtering
export const LISTING_STATES = {
   READY_FOR_ACTIVATION: "READY_FOR_ACTIVATION",
   INACTIVATED: "INACTIVATED_BY_FLIPKART",
   ARCHIVED: "ARCHIVED",
   INACTIVE: "INACTIVE",
   ACTIVE: "ACTIVE",
};

// Order status constants
export const ORDER_STATUS = {
   PENDING: "PENDING",
   PROCESSING: "PROCESSING",
   SHIPPED: "SHIPPED",
   DELIVERED: "DELIVERED",
   CANCELLED: "CANCELLED",
   RETURNED: "RETURNED",
};
