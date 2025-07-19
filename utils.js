/**
 * HABIT TRACKER - Utilities Module
 * 
 * Common utility functions and helpers
 * 
 * @version 2.0
 * @author Nguyen Dinh Quoc
 * @updated 2025-01-20
 */

/**
 * Date and time utilities
 */
const DateUtils = {
  /**
   * Get formatted date string
   * @param {Date} date - Date object
   * @param {string} format - Format type ('detailed', 'short', 'iso')
   * @returns {string} Formatted date
   */
  formatDate(date, format = 'detailed') {
    if (!date || !(date instanceof Date)) {
      Logger.log('Invalid date provided to formatDate:', date);
      return 'Invalid Date';
    }
    
    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const dayOfWeek = dayNames[date.getDay()];
    
    switch (format) {
      case 'detailed':
        return `${dayOfWeek}, ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
      case 'short':
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      case 'iso':
        return date.toISOString().split('T')[0];
      default:
        return date.toString();
    }
  },
  
  /**
   * Get current date in specified timezone
   * @param {string} timezone - Timezone (default: 'Asia/Ho_Chi_Minh')
   * @returns {Date} Date object
   */
  getCurrentDate(timezone = 'Asia/Ho_Chi_Minh') {
    return new Date();
  },
  
  /**
   * Check if date is today
   * @param {Date} date - Date to check
   * @returns {boolean} True if date is today
   */
  isToday(date) {
    if (!date || !(date instanceof Date)) {
      return false;
    }
    
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
};

/**
 * String utilities
 */
const StringUtils = {
  /**
   * Escape HTML characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },
  
  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  truncate(text, maxLength = 50) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },
  
  /**
   * Convert to title case
   * @param {string} text - Text to convert
   * @returns {string} Title case text
   */
  toTitleCase(text) {
    if (!text) return '';
    return text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
};

/**
 * Array utilities
 */
const ArrayUtils = {
  /**
   * Get unique values from array
   * @param {Array} array - Input array
   * @returns {Array} Array with unique values
   */
  unique(array) {
    return [...new Set(array)];
  },
  
  /**
   * Chunk array into smaller arrays
   * @param {Array} array - Input array
   * @param {number} size - Chunk size
   * @returns {Array} Array of chunks
   */
  chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },
  
  /**
   * Group array by key
   * @param {Array} array - Input array
   * @param {string|Function} key - Key to group by
   * @returns {Object} Grouped object
   */
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const groupKey = typeof key === 'function' ? key(item) : item[key];
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(item);
      return groups;
    }, {});
  }
};

/**
 * Color utilities for UI
 */
const ColorUtils = {
  /**
   * Get color scheme based on completion status
   * @param {boolean} isPerfectDay - Whether it's a perfect day
   * @returns {Object} Color scheme object
   */
  getColorScheme(isPerfectDay = false) {
    return isPerfectDay ? {
      border: '#22c55e',
      headerTitle: '#22c55e',
      headerSubtitle: '#16a34a',
      dateText: '#16a34a',
      sectionTitle: '#22c55e',
      footerText: '#16a34a',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444'
    } : {
      border: '#000000',
      headerTitle: '#1a1a1a',
      headerSubtitle: '#8e8e93',
      dateText: '#495057',
      sectionTitle: '#1a1a1a',
      pendingTitle: '#dc3545',
      footerText: '#8e8e93',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444'
    };
  },
  
  /**
   * Get progress color based on percentage
   * @param {number} percentage - Completion percentage
   * @returns {string} Color hex code
   */
  getProgressColor(percentage) {
    if (percentage >= 100) return '#22c55e'; // Green
    if (percentage >= 75) return '#84cc16';  // Light green
    if (percentage >= 50) return '#f59e0b';  // Orange
    if (percentage >= 25) return '#f97316';  // Dark orange
    return '#ef4444'; // Red
  }
};

/**
 * Progress bar utilities
 */
const ProgressUtils = {
  /**
   * Build HTML progress bar
   * @param {number} percentage - Completion percentage
   * @param {boolean} isPerfectDay - Whether it's a perfect day
   * @returns {string} HTML progress bar
   */
  buildProgressBar(percentage, isPerfectDay = false) {
    const colors = ColorUtils.getColorScheme(isPerfectDay);
    const progressColor = ColorUtils.getProgressColor(percentage);
    
    return `
      <div style="background-color: #f8f9fa; border-radius: 8px; height: 12px; overflow: hidden; margin: 8px 0;">
        <div style="
          width: ${Math.round(percentage)}%; 
          height: 100%; 
          background-color: ${progressColor}; 
          transition: width 0.3s ease;
          border-radius: 8px;
        "></div>
      </div>
    `;
  },
  
  /**
   * Build text-based progress bar for Slack
   * @param {number} percentage - Completion percentage
   * @returns {string} Text progress bar
   */
  buildSlackProgressBar(percentage) {
    const totalBars = 10;
    const filledBars = Math.round((percentage / 100) * totalBars);
    const emptyBars = totalBars - filledBars;
    
    const filled = '█'.repeat(filledBars);
    const empty = '░'.repeat(emptyBars);
    
    return `${filled}${empty} ${Math.round(percentage)}%`;
  }
};

/**
 * Validation utilities
 */
const ValidationUtils = {
  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid URL
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  /**
   * Validate Slack webhook URL
   * @param {string} url - Webhook URL to validate
   * @returns {boolean} True if valid Slack webhook
   */
  isValidSlackWebhook(url) {
    return this.isValidUrl(url) && url.includes('hooks.slack.com');
  }
};

/**
 * Error handling utilities
 */
const ErrorUtils = {
  /**
   * Safe function execution with error handling
   * @param {Function} fn - Function to execute
   * @param {string} context - Context for error logging
   * @param {any} defaultValue - Default value on error
   * @returns {any} Function result or default value
   */
  safeExecute(fn, context = 'Unknown', defaultValue = null) {
    try {
      return fn();
    } catch (error) {
      Logger.log(`Error in ${context}: ${error.message}`);
      if (error.stack) {
        Logger.log(`Stack trace: ${error.stack}`);
      }
      return defaultValue;
    }
  },
  
  /**
   * Retry function execution
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum retry attempts
   * @param {number} delay - Delay between retries (ms)
   * @returns {any} Function result
   */
  retry(fn, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries) {
          Logger.log(`Retry ${i + 1}/${maxRetries} after error: ${error.message}`);
          Utilities.sleep(delay);
        }
      }
    }
    
    throw lastError;
  }
};

/**
 * Performance utilities
 */
const PerformanceUtils = {
  /**
   * Measure execution time
   * @param {Function} fn - Function to measure
   * @param {string} label - Label for logging
   * @returns {any} Function result
   */
  measure(fn, label = 'Operation') {
    const startTime = new Date().getTime();
    const result = fn();
    const endTime = new Date().getTime();
    const duration = endTime - startTime;
    
    Logger.log(`${label} took ${duration}ms`);
    return result;
  },
  
  /**
   * Batch process array with size limit
   * @param {Array} items - Items to process
   * @param {Function} processor - Processing function
   * @param {number} batchSize - Batch size
   * @returns {Array} Processed results
   */
  batchProcess(items, processor, batchSize = 10) {
    const results = [];
    const batches = ArrayUtils.chunk(items, batchSize);
    
    batches.forEach((batch, index) => {
      Logger.log(`Processing batch ${index + 1}/${batches.length}`);
      const batchResults = batch.map(processor);
      results.push(...batchResults);
    });
    
    return results;
  }
};

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DateUtils,
    StringUtils,
    ArrayUtils,
    ColorUtils,
    ProgressUtils,
    ValidationUtils,
    ErrorUtils,
    PerformanceUtils
  };
}