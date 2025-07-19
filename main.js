/**
 * HABIT TRACKER - Main Application File
 * 
 * Modular habit tracking system with Google Sheets, Email, and Slack integration
 * 
 * @version 2.0
 * @author Nguyen Dinh Quoc
 * @updated 2025-01-20
 * 
 * MODULES:
 * - config.js: Configuration management
 * - utils.js: Utility functions
 * - habits.js: Habit analysis and tracking
 * - reports.js: Report generation
 * - email.js: Email functionality
 * - slack.js: Slack integration
 */

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Send daily habit report via email and Slack
 * Main function called by time-based trigger
 */
function sendDailyHabitReport() {
  const startTime = new Date().getTime();
  
  try {
    Logger.log('🚀 Starting daily habit report generation...');
    
    // Get configuration
    const config = getAppConfig();
    
    if (!config.spreadsheetId) {
      Logger.log('Configuration incomplete. Please run setupConfig() first.');
      return;
    }
    
    // Validate configuration
  const validation = validateConfig();
    if (!validation.valid) {
      Logger.log('Configuration validation failed:');
      validation.issues.forEach(issue => Logger.log(`  - ${issue}`));
      return;
    }
    
    // Generate daily report
    const reportData = generateDailyReport(config);
    
    // Add required fields for email/slack compatibility
    const today = new Date();
    reportData.today = today;
    reportData.completedHabits = reportData.habits.filter(h => h.completed);
    reportData.pendingHabits = reportData.habits.filter(h => !h.completed);
    reportData.completionRate = reportData.summary.completionRate;
    reportData.isPerfectDay = reportData.summary.pendingToday === 0 && reportData.summary.completedToday > 0;
    
    // Generate insights
    const insights = generateInsights(reportData);
    
    // Send email report
    if (config.emailTo) {
      try {
        const emailSuccess = sendEmailReport(reportData, config);
        if (emailSuccess) {
          Logger.log('Email report sent successfully');
        } else {
          Logger.log('Email report failed - Invalid email configuration');
        }
      } catch (emailError) {
        Logger.log(`Email sending failed: ${emailError.message}`);
      }
    } else {
      Logger.log('Email not configured - skipping email report');
    }
    
    // Send Slack report
    if (config.enableSlack && config.slackWebhookUrl) {
      try {
        const slackSuccess = sendSlackReport(reportData, config);
        if (slackSuccess) {
          Logger.log('Slack report sent successfully');
        } else {
          Logger.log('Slack report failed - Check webhook URL and configuration');
        }
      } catch (slackError) {
        Logger.log(`Slack sending failed: ${slackError.message}`);
      }
    } else {
      Logger.log('Slack not configured - skipping Slack report');
    }
    
    const totalTime = new Date().getTime() - startTime;
    Logger.log(`Daily report completed in ${totalTime}ms`);
    
  } catch (error) {
    Logger.log(`Critical error in sendDailyHabitReport: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
    
    // Send error notification if possible
    try {
      const config = getAppConfig();
      if (config.emailTo) {
        MailApp.sendEmail({
          to: config.emailTo,
          subject: 'Habit Tracker Error',
          body: `Error occurred while generating daily report:\n\n${error.message}\n\nStack trace:\n${error.stack}`
        });
      }
    } catch (notificationError) {
      Logger.log(`Failed to send error notification: ${notificationError.message}`);
    }
  }
}

/**
 * Handle HTTP POST requests (for Slack integration)
 * @param {Object} e - Event object
 * @returns {Object} Response object
 */
function doPost(e) {
  try {
    const config = getAppConfig();
    
    if (!config.enableSlack) {
      return ContentService
        .createTextOutput('Slack integration is disabled')
        .setMimeType(ContentService.MimeType.TEXT);
    }
    
    // Parse request
    const postData = e.postData;
    if (!postData) {
      return ContentService
        .createTextOutput('No post data received')
        .setMimeType(ContentService.MimeType.TEXT);
    }
    
    // Handle URL verification for Slack app setup
    if (postData.type === 'application/json') {
      const jsonData = JSON.parse(postData.contents);
      
      if (jsonData.type === 'url_verification') {
        Logger.log('🔗 Slack URL verification request');
        return ContentService
          .createTextOutput(jsonData.challenge)
          .setMimeType(ContentService.MimeType.TEXT);
      }
      
      // Handle interactive components (buttons)
      if (jsonData.type === 'interactive') {
        return handleSlackInteraction(jsonData, config);
      }
    }
    
    // Handle form data (slash commands)
    if (postData.type === 'application/x-www-form-urlencoded') {
      const params = parseFormData(postData.contents);
      
      // Handle slash commands
      if (params.command) {
        return handleSlashCommand(params, config);
      }
    }
    
    return ContentService
      .createTextOutput('Request processed')
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (error) {
    Logger.log(`Error in doPost: ${error.message}`);
    return ContentService
      .createTextOutput(`Error: ${error.message}`)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Handle HTTP GET requests (for web interface)
 * @param {Object} e - Event object
 * @returns {Object} HTML output
 */
function doGet(e) {
  try {
    const config = getAppConfig();
    
    // Simple web interface for configuration
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Habit Tracker Configuration</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        .status { padding: 15px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .config-item { margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; }
        .webhook-url { font-family: monospace; background: #e9ecef; padding: 10px; border-radius: 3px; word-break: break-all; }
        button { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #45a049; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Habit Tracker Configuration</h1>
        
        <div class="status ${config.spreadsheetId ? 'success' : 'error'}">
          <strong>Configuration Status:</strong> ${config.spreadsheetId ? 'Configured' : 'Not Configured'}
        </div>
        
        <div class="config-item">
          <strong>Spreadsheet ID:</strong> ${config.spreadsheetId || 'Not set'}
        </div>
        
        <div class="config-item">
          <strong>Sheet Name:</strong> ${config.sheetName || 'Not set'}
        </div>
        
        <div class="config-item">
          <strong>📧 Email Recipient:</strong> ${config.emailTo || 'Not set'}
        </div>
        
        <div class="config-item">
          <strong>Slack Integration:</strong> ${config.enableSlack ? 'Enabled' : 'Disabled'}
        </div>
        
        ${config.enableSlack ? `
        <div class="config-item">
          <strong>🔗 Slack Channel:</strong> ${config.slackChannel || 'Not set'}
        </div>
        
        <div class="config-item">
          <strong>🌐 Webhook URL for Slack App:</strong>
          <div class="webhook-url">${getWebAppUrl()}</div>
          <p><em>Use this URL in your Slack App configuration for Interactivity & Shortcuts and Slash Commands.</em></p>
        </div>
        ` : ''}
        
        <div style="margin-top: 30px;">
          <h3>Quick Actions</h3>
          <p>To configure the system, run these functions in the Apps Script editor:</p>
          <ul>
            <li><code>setupConfig()</code> - Interactive configuration setup</li>
            <li><code>quickSetup()</code> - Quick setup with prompts</li>
            <li><code>testReportGeneration()</code> - Test report generation</li>
            <li><code>sendDailyHabitReport()</code> - Send test report</li>
          </ul>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>Habit Tracker v2.0 | Generated at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
    `;
    
    return HtmlService.createHtmlOutput(html)
      .setTitle('Habit Tracker Configuration')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      
  } catch (error) {
    Logger.log(`Error in doGet: ${error.message}`);
    return HtmlService.createHtmlOutput(`<h1>Error</h1><p>${error.message}</p>`);
  }
}

/**
 * Parse form data from POST request
 * @param {string} formData - Form data string
 * @returns {Object} Parsed parameters
 */
function parseFormData(formData) {
  const params = {};
  const pairs = formData.split('&');
  
  pairs.forEach(pair => {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, ' '));
    }
  });
  
  return params;
}

/**
 * Get the web app URL for Slack configuration
 * @returns {string} Web app URL
 */
function getWebAppUrl() {
  try {
    const scriptId = ScriptApp.getScriptId();
    return `https://script.google.com/macros/s/${scriptId}/exec`;
  } catch (error) {
    Logger.log(`Error getting web app URL: ${error.message}`);
    return 'Unable to determine URL';
  }
}

// ============================================================================
// SETUP AND TESTING FUNCTIONS
// ============================================================================

/**
 * Initialize the habit tracker system
 * Run this function once to set up the system
 */
function initializeHabitTracker() {
  Logger.log('🚀 Initializing Habit Tracker v2.0...');
  
  try {
    // Initialize configuration
    initializeConfig();
    Logger.log('Configuration initialized');
    
    // Run setup
    setupConfig();
    Logger.log('Setup completed');
    
    // Test the system
    const config = getAppConfig();
    
    if (config.spreadsheetId) {
      Logger.log('🧪 Running system tests...');
      
      // Test habit analysis
      if (testHabitAnalysis(config)) {
        Logger.log('Habit analysis test passed');
      }
      
      // Test report generation
      if (testReportGeneration(config)) {
        Logger.log('Report generation test passed');
      }
      
      // Test email (if configured)
      if (config.emailTo) {
        testEmailReport(config);
        Logger.log('Email test completed');
      }
      
      // Test Slack (if configured)
      if (config.enableSlack && config.slackWebhookUrl) {
        testSlackIntegration(config);
        Logger.log('Slack test completed');
      }
    }
    
    Logger.log('Habit Tracker initialization completed!');
    Logger.log('Next steps:');
    Logger.log('  1. Set up time-based triggers for sendDailyHabitReport()');
    Logger.log('  2. Deploy as web app for Slack integration');
    Logger.log('  3. Configure Slack app with the webhook URL');
    
  } catch (error) {
    Logger.log(`❌ Initialization failed: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
  }
}

/**
 * Run comprehensive system tests
 */
function runSystemTests() {
  Logger.log('🧪 Running comprehensive system tests...');
  
  try {
    const config = getAppConfig();
    
    if (!config.spreadsheetId) {
      Logger.log('❌ No configuration found. Run setupConfig() first.');
      return false;
    }
    
    let allTestsPassed = true;
    
    // Test configuration
    Logger.log('🔧 Testing configuration...');
  const validation = validateConfig();
    if (validation.valid) {
      Logger.log('✅ Configuration validation passed');
    } else {
      Logger.log('❌ Configuration validation failed');
      validation.issues.forEach(issue => Logger.log(`  - ${issue}`));
      allTestsPassed = false;
    }
    
    // Test habit analysis
    Logger.log('📊 Testing habit analysis...');
    if (testHabitAnalysis(config)) {
      Logger.log('✅ Habit analysis tests passed');
    } else {
      Logger.log('❌ Habit analysis tests failed');
      allTestsPassed = false;
    }
    
    // Test report generation
    Logger.log('📈 Testing report generation...');
    if (testReportGeneration(config)) {
      Logger.log('✅ Report generation tests passed');
    } else {
      Logger.log('❌ Report generation tests failed');
      allTestsPassed = false;
    }
    
    // Test email functionality
    if (config.emailTo) {
      Logger.log('📧 Testing email functionality...');
      try {
        testEmailReport(config);
        Logger.log('✅ Email tests passed');
      } catch (error) {
        Logger.log(`❌ Email tests failed: ${error.message}`);
        allTestsPassed = false;
      }
    }
    
    // Test Slack functionality
    if (config.enableSlack && config.slackWebhookUrl) {
      Logger.log('💬 Testing Slack functionality...');
      try {
        testSlackIntegration(config);
        Logger.log('✅ Slack tests passed');
      } catch (error) {
        Logger.log(`❌ Slack tests failed: ${error.message}`);
        allTestsPassed = false;
      }
    }
    
    // Performance test
    Logger.log('⚡ Testing performance...');
    const startTime = new Date().getTime();
    const reportData = generateDailyReport(config);
    const endTime = new Date().getTime();
    const duration = endTime - startTime;
    
    Logger.log(`📊 Report generation took ${duration}ms`);
    if (duration < 5000) {
      Logger.log('✅ Performance test passed');
    } else {
      Logger.log('⚠️ Performance test warning: Report generation is slow');
    }
    
    // Summary
    if (allTestsPassed) {
      Logger.log('🎉 All system tests passed!');
      return true;
    } else {
      Logger.log('❌ Some tests failed. Please check the logs above.');
      return false;
    }
    
  } catch (error) {
    Logger.log(`❌ System tests failed: ${error.message}`);
    return false;
  }
}

/**
 * Create time-based triggers for automatic reports
 */
function createTriggers() {
  try {
    Logger.log('⏰ Creating time-based triggers...');
    
    // Delete existing triggers first
    const existingTriggers = ScriptApp.getProjectTriggers();
    existingTriggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'sendDailyHabitReport') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // Create new daily trigger (8 AM)
    ScriptApp.newTrigger('sendDailyHabitReport')
      .timeBased()
      .everyDays(1)
      .atHour(8)
      .create();
    
    Logger.log('✅ Daily trigger created for 8:00 AM');
    
    // Optional: Create evening reminder trigger (8 PM)
    ScriptApp.newTrigger('sendDailyHabitReport')
      .timeBased()
      .everyDays(1)
      .atHour(20)
      .create();
    
    Logger.log('✅ Evening reminder trigger created for 8:00 PM');
    
    Logger.log('🎉 Triggers created successfully!');
    
  } catch (error) {
    Logger.log(`❌ Error creating triggers: ${error.message}`);
  }
}

/**
 * Delete all project triggers
 */
function deleteTriggers() {
  try {
    Logger.log('🗑️ Deleting all triggers...');
    
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      ScriptApp.deleteTrigger(trigger);
    });
    
    Logger.log(`✅ Deleted ${triggers.length} trigger(s)`);
    
  } catch (error) {
    Logger.log(`❌ Error deleting triggers: ${error.message}`);
  }
}

/**
 * Debug configuration issues
 */
function debugEmailConfig() {
  Logger.log('=== DEBUG EMAIL CONFIGURATION ===');
  
  const userProperties = PropertiesService.getUserProperties();
  const allProperties = userProperties.getProperties();
  
  Logger.log('\n📋 All stored properties:');
  Object.keys(allProperties).forEach(key => {
    const value = allProperties[key];
    const displayValue = key.includes('WEBHOOK') && value ? '[HIDDEN]' : value;
    Logger.log(`  ${key}: ${displayValue}`);
  });
  
  Logger.log('\n🔧 getAppConfig() result:');
  const config = getAppConfig();
  Object.keys(config).forEach(key => {
    const value = config[key];
    const displayValue = key.includes('webhook') && value ? '[HIDDEN]' : value;
    Logger.log(`  ${key}: ${displayValue}`);
  });
  
  Logger.log('\n🎯 Specific EMAIL_TO checks:');
  Logger.log(`  Raw property: ${userProperties.getProperty('EMAIL_TO')}`);
  Logger.log(`  getConfig result: ${getConfig('EMAIL_TO', 'DEFAULT')}`);
  Logger.log(`  config.emailTo: ${config.emailTo}`);
  
  // Force reset email
  Logger.log('\n🔄 Force setting email...');
  setConfig('EMAIL_TO', 'quoc.nguyen3@hoanmy.com');
  
  // Test again
  const newConfig = getAppConfig();
  Logger.log(`  New config.emailTo: ${newConfig.emailTo}`);
  
  return newConfig;
}

/**
 * Show system status and configuration
 */
function showSystemStatus() {
  Logger.log('📊 HABIT TRACKER SYSTEM STATUS');
  Logger.log('================================');
  
  try {
    const config = getAppConfig();
    
    // Configuration status
    Logger.log('🔧 CONFIGURATION:');
    Logger.log(`  Spreadsheet ID: ${config.spreadsheetId || 'Not set'}`); 
    Logger.log(`  Sheet Name: ${config.sheetName || 'Not set'}`);
    Logger.log(`  Email Recipient: ${config.emailTo || 'Not set'}`);
    Logger.log(`  Slack Enabled: ${config.enableSlack ? 'Yes' : 'No'}`);
    Logger.log(`  Slack Channel: ${config.slackChannel || 'Not set'}`);
    Logger.log(`  Debug Mode: ${config.debugMode ? 'On' : 'Off'}`);
    
    // Validation status
    const validation = validateConfig();
    Logger.log('\n✅ VALIDATION:');
    Logger.log(`  Status: ${validation.valid ? 'Valid' : 'Invalid'}`);
    if (!validation.valid) {
      validation.issues.forEach(issue => Logger.log(`  ❌ ${issue}`));
    }
    
    // Triggers status
    Logger.log('\n⏰ TRIGGERS:');
    const triggers = ScriptApp.getProjectTriggers();
    const habitTriggers = triggers.filter(t => t.getHandlerFunction() === 'sendDailyHabitReport');
    Logger.log(`  Active triggers: ${habitTriggers.length}`);
    habitTriggers.forEach((trigger, index) => {
      Logger.log(`  ${index + 1}. ${trigger.getEventType()} trigger`);
    });
    
    // Web app status
    Logger.log('\n🌐 WEB APP:');
    Logger.log(`  URL: ${getWebAppUrl()}`);
    
    // Recent execution status (if available)
    Logger.log('\n📈 RECENT ACTIVITY:');
    if (config.spreadsheetId) {
      try {
        const reportData = generateDailyReport(config);
        Logger.log(`  Last report: ${reportData.summary.completedToday}/${reportData.summary.totalHabits} habits completed`);
        Logger.log(`  Completion rate: ${Math.round(reportData.summary.completionRate)}%`);
      } catch (error) {
        Logger.log(`  ❌ Error generating report: ${error.message}`);
      }
    } else {
      Logger.log('  No data available (not configured)');
    }
    
    Logger.log('\n================================');
    
  } catch (error) {
    Logger.log(`❌ Error showing system status: ${error.message}`);
  }
}

// ============================================================================
// LEGACY COMPATIBILITY FUNCTIONS
// ============================================================================

/**
 * Test email with debug information
 */
function testEmailWithDebug() {
  Logger.log('=== TESTING EMAIL WITH DEBUG ===');
  
  // First debug the configuration
  const config = debugEmailConfig();
  
  // Then test email
  Logger.log('\n📧 Testing email with corrected config...');
  const success = testEmailReport(config);
  
  if (success) {
    Logger.log(`✅ Email test completed successfully to: ${config.emailTo}`);
  } else {
    Logger.log('❌ Email test failed');
  }
  
  return success;
}

/**
 * Legacy function names for backward compatibility
 */
function testSlackIntegrationLegacy() {
  const config = getAppConfig();
  return testSlackIntegration(config);
}

function testEmailReportLegacy() {
  const config = getAppConfig();
  return testEmailReport(config);
}

function generateQuickHabitReportLegacy() {
  const config = getAppConfig();
  return generateQuickHabitReport(config);
}

// ============================================================================
// MODULE INTEGRATION CHECK
// ============================================================================

/**
 * Check if all required modules are available
 * @returns {Object} Module availability status
 */
function checkModuleAvailability() {
  const modules = {
    config: typeof getAppConfig === 'function',
    utils: typeof DateUtils === 'object',
    habits: typeof analyzeHabits === 'function',
    reports: typeof generateDailyReport === 'function',
    email: typeof sendEmailReport === 'function',
    slack: typeof sendSlackReport === 'function'
  };
  
  const allAvailable = Object.values(modules).every(available => available);
  
  Logger.log('📦 MODULE AVAILABILITY:');
  Object.entries(modules).forEach(([name, available]) => {
    Logger.log(`  ${available ? '✅' : '❌'} ${name}.js`);
  });
  
  if (!allAvailable) {
    Logger.log('❌ Some modules are missing. Please ensure all module files are included in the project.');
  }
  
  return { modules, allAvailable };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Check module availability on load
if (typeof Logger !== 'undefined') {
  // Only run in Apps Script environment
  Logger.log('🚀 Habit Tracker v2.0 - Main module loaded');
  
  // Uncomment the line below to check modules on every execution
  // checkModuleAvailability();
}