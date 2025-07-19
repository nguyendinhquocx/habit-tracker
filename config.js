/**
 * HABIT TRACKER - Configuration Module
 * 
 * Centralized configuration management with environment variables support
 * 
 * @version 2.0
 * @author Nguyen Dinh Quoc
 * @updated 2025-01-20
 */

/**
 * Get configuration value with fallback to default
 * @param {string} key - Configuration key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Configuration value
 */
function getConfig(key, defaultValue) {
  try {
    // Try to get from PropertiesService (environment variables)
    const userProperties = PropertiesService.getUserProperties();
    const value = userProperties.getProperty(key);
    
    if (value !== null) {
      // Parse boolean values
      if (value === 'true') return true;
      if (value === 'false') return false;
      
      // Parse numeric values
      if (!isNaN(value) && !isNaN(parseFloat(value))) {
        return parseFloat(value);
      }
      
      return value;
    }
  } catch (error) {
    Logger.log(`Error getting config for ${key}: ${error.message}`);
  }
  
  return defaultValue;
}

/**
 * Set configuration value
 * @param {string} key - Configuration key
 * @param {any} value - Configuration value
 */
function setConfig(key, value) {
  try {
    const userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty(key, String(value));
    Logger.log(`Config set: ${key} = ${value}`);
  } catch (error) {
    Logger.log(`Error setting config for ${key}: ${error.message}`);
  }
}

/**
 * Initialize default configuration
 */
function initializeConfig() {
  const defaults = {
    // Sheet Configuration
    'SPREADSHEET_ID': '1TrFiuWnxOqh7UjxRRIEaF6DFRRutdNdO-OxBRGC9Oho',
    'SHEET_NAME': 'habit',
    'DATA_RANGE': 'C14:AI31',
    'MONTH_YEAR_CELL': 'C9',
    'DAY_OF_WEEK_ROW': '14',
    'DATE_ROW': '15',
    'HABIT_NAME_COL': 'C',
    'DATA_START_COL': 'E',
    
    // Email Configuration
    'EMAIL_TO': 'quoc.nguyen3@hoanmy.com',
    
    // Slack Configuration
    'SLACK_WEBHOOK_URL': 'https://hooks.slack.com/services/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',
    'SLACK_CHANNEL': '#habit',
    'ENABLE_SLACK': 'true',
    
    // System Configuration
    'DEBUG_MODE': 'true',
    'TIMEZONE': 'Asia/Ho_Chi_Minh'
  };
  
  const userProperties = PropertiesService.getUserProperties();
  
  Object.keys(defaults).forEach(key => {
    const existing = userProperties.getProperty(key);
    if (existing === null) {
      userProperties.setProperty(key, defaults[key]);
      Logger.log(`Initialized config: ${key} = ${defaults[key]}`);
    }
  });
}

/**
 * Get all configuration as object
 * @returns {Object} Configuration object
 */
function getAppConfig() {
  return {
    // Sheet Configuration
    spreadsheetId: getConfig('SPREADSHEET_ID', '1TrFiuWnxOqh7UjxRRIEaF6DFRRutdNdO-OxBRGC9Oho'),
    sheetName: getConfig('SHEET_NAME', 'habit'),
    dataRange: getConfig('DATA_RANGE', 'C14:AI31'),
    monthYearCell: getConfig('MONTH_YEAR_CELL', 'C9'),
    dayOfWeekRow: getConfig('DAY_OF_WEEK_ROW', 14),
    dateRow: getConfig('DATE_ROW', 15),
    habitNameCol: getConfig('HABIT_NAME_COL', 'C'),
    dataStartCol: getConfig('DATA_START_COL', 'E'),
    
    // Email Configuration
    emailTo: getConfig('EMAIL_TO', 'quoc.nguyen3@hoanmy.com'),
    
    // Slack Configuration
    slackWebhookUrl: getConfig('SLACK_WEBHOOK_URL', 'https://hooks.slack.com/services/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'),
    slackChannel: getConfig('SLACK_CHANNEL', '#habit'),
    enableSlack: getConfig('ENABLE_SLACK', true),
    
    // System Configuration
    debugMode: getConfig('DEBUG_MODE', true),
    timezone: getConfig('TIMEZONE', 'Asia/Ho_Chi_Minh')
  };
}

/**
 * Setup configuration wizard
 */
function setupConfig() {
  Logger.log('=== HABIT TRACKER CONFIGURATION SETUP ===');
  
  // Initialize with defaults
  initializeConfig();
  
  Logger.log('\nCurrent Configuration:');
  const config = getAppConfig();
  Object.keys(config).forEach(key => {
    const value = config[key];
    const displayValue = key.includes('WEBHOOK') && value ? '[HIDDEN]' : value;
    Logger.log(`  ${key}: ${displayValue}`);
  });
  
  Logger.log('\n🔧 To update configuration, use:');
  Logger.log('  setConfig("EMAIL_TO", "your-email@example.com")');
  Logger.log('  setConfig("SLACK_WEBHOOK_URL", "your-webhook-url")');
  Logger.log('  setConfig("ENABLE_SLACK", "true")');
  
  return config;
}

/**
 * Validate configuration
 * @returns {Object} Validation result
 */
function validateConfig() {
  const config = getAppConfig();
  const issues = [];
  const warnings = [];
  
  // Required validations
  if (!config.spreadsheetId || config.spreadsheetId === '') {
    issues.push('SPREADSHEET_ID is required');
  }
  
  if (!config.emailTo || config.emailTo === 'your-email@example.com') {
    warnings.push('EMAIL_TO should be updated with your actual email');
  }
  
  if (config.enableSlack && (!config.slackWebhookUrl || config.slackWebhookUrl === '')) {
    issues.push('SLACK_WEBHOOK_URL is required when Slack is enabled');
  }
  
  // Test spreadsheet access
  try {
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    const sheet = ss.getSheetByName(config.sheetName);
    if (!sheet) {
      issues.push(`Sheet "${config.sheetName}" not found in spreadsheet`);
    }
  } catch (error) {
    issues.push(`Cannot access spreadsheet: ${error.message}`);
  }
  
  return {
    valid: issues.length === 0,
    issues,
    warnings,
    config
  };
}

/**
 * Quick setup for common configurations
 */
function quickSetup() {
  Logger.log('=== QUICK SETUP ===');
  Logger.log('1. Update your email:');
  Logger.log('   setConfig("EMAIL_TO", "your-email@example.com")');
  Logger.log('');
  Logger.log('2. Setup Slack (optional):');
  Logger.log('   setConfig("SLACK_WEBHOOK_URL", "your-webhook-url")');
  Logger.log('   setConfig("ENABLE_SLACK", "true")');
  Logger.log('');
  Logger.log('3. Test configuration:');
  Logger.log('   validateConfig()');
  Logger.log('');
  Logger.log('4. Send test report:');
  Logger.log('   sendDailyHabitReport()');
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getConfig,
    setConfig,
    getAppConfig,
    initializeConfig,
    setupConfig,
    validateConfig,
    quickSetup
  };
}