/**
 * Debug utilities for Habit Tracker
 */

/**
 * Debug configuration values
 */
function debugConfig() {
  Logger.log('=== DEBUG CONFIGURATION ===');
  
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
}

/**
 * Reset all configuration
 */
function resetConfig() {
  Logger.log('=== RESETTING CONFIGURATION ===');
  
  const userProperties = PropertiesService.getUserProperties();
  userProperties.deleteAll();
  
  Logger.log('✅ All properties deleted');
  
  // Reinitialize
  initializeConfig();
  
  Logger.log('✅ Configuration reinitialized');
}

/**
 * Force set email configuration
 */
function forceSetEmail() {
  Logger.log('=== FORCE SETTING EMAIL ===');
  
  const email = 'quoc.nguyen3@hoanmy.com';
  
  // Set via setConfig function
  setConfig('EMAIL_TO', email);
  
  // Verify
  const userProperties = PropertiesService.getUserProperties();
  const storedValue = userProperties.getProperty('EMAIL_TO');
  
  Logger.log(`✅ Email set to: ${email}`);
  Logger.log(`✅ Stored value: ${storedValue}`);
  Logger.log(`✅ getConfig result: ${getConfig('EMAIL_TO', 'DEFAULT')}`);
}

/**
 * Enable Slack configuration
 */
function enableSlack() {
  Logger.log('=== ENABLING SLACK ===');
  
  // Enable Slack
  setConfig('ENABLE_SLACK', 'true');
  
  // Set webhook URL if not already set
  const currentWebhook = getConfig('SLACK_WEBHOOK_URL', '');
  if (!currentWebhook || currentWebhook === '') {
    const defaultWebhook = 'https://hooks.slack.com/services/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';
    setConfig('SLACK_WEBHOOK_URL', defaultWebhook);
    Logger.log('📡 Webhook URL set to default value');
  }
  
  // Verify configuration
  const config = getAppConfig();
  Logger.log(`✅ Slack enabled: ${config.enableSlack}`);
  Logger.log(`📡 Webhook URL: ${config.slackWebhookUrl ? '[SET]' : '[NOT SET]'}`);
  Logger.log(`📢 Channel: ${config.slackChannel}`);
  
  return config;
}

/**
 * Set Slack webhook URL
 * @param {string} webhookUrl - The Slack webhook URL
 */
function setSlackWebhook(webhookUrl) {
  Logger.log('=== SETTING SLACK WEBHOOK ===');
  
  if (!webhookUrl || webhookUrl.trim() === '') {
    Logger.log('❌ Webhook URL cannot be empty');
    return false;
  }
  
  if (!webhookUrl.startsWith('https://hooks.slack.com/')) {
    Logger.log('❌ Invalid Slack webhook URL format');
    return false;
  }
  
  setConfig('SLACK_WEBHOOK_URL', webhookUrl);
  Logger.log('✅ Slack webhook URL updated successfully');
  
  // Verify the new configuration
  const config = getAppConfig();
  Logger.log(`📡 New webhook URL: ${config.slackWebhookUrl ? '[SET]' : '[NOT SET]'}`);
  
  return true;
}

/**
 * Test Slack webhook with proper payload
 */
function testSlackWebhook() {
  Logger.log('=== TESTING SLACK WEBHOOK ===');
  
  const config = getAppConfig();
  
  if (!config.slackWebhookUrl) {
    Logger.log('❌ Slack webhook URL is not configured');
    return false;
  }
  
  // Test payload
  const testPayload = {
    text: '🧪 Test message from Habit Tracker',
    channel: config.slackChannel,
    username: 'Habit Tracker Bot',
    icon_emoji: ':chart_with_upwards_trend:'
  };
  
  try {
    Logger.log('📡 Sending test payload to Slack...');
    
    const response = UrlFetchApp.fetch(config.slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(testPayload)
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log(`📊 Response Code: ${responseCode}`);
    Logger.log(`📄 Response Text: ${responseText}`);
    
    if (responseCode === 200 && responseText === 'ok') {
      Logger.log('✅ Slack webhook test successful!');
      return true;
    } else {
      Logger.log('❌ Slack webhook test failed');
      return false;
    }
    
  } catch (error) {
    Logger.log(`❌ Slack webhook test error: ${error.message}`);
    return false;
  }
}

/**
 * Test Slack webhook with debug information
 */
function testSlackWithDebug() {
  Logger.log('=== TESTING SLACK WITH DEBUG ===');
  
  // First enable Slack
  const config = enableSlack();
  
  Logger.log('\n🔧 Slack Configuration:');
  Logger.log(`  enableSlack: ${config.enableSlack}`);
  Logger.log(`  slackChannel: ${config.slackChannel}`);
  Logger.log(`  slackWebhookUrl: ${config.slackWebhookUrl ? '[SET]' : '[NOT SET]'}`);
  
  if (!config.enableSlack) {
    Logger.log('❌ Slack is disabled in configuration');
    return false;
  }
  
  if (!config.slackWebhookUrl) {
    Logger.log('❌ Slack webhook URL is not configured');
    return false;
  }
  
  // Test webhook first
  Logger.log('\n🧪 Testing webhook...');
  const webhookTest = testSlackWebhook();
  
  if (!webhookTest) {
    Logger.log('❌ Webhook test failed, skipping full report test');
    return false;
  }
  
  // Create test report data
  const testReportData = {
    today: new Date(),
    todayDay: DateUtils.formatDate(new Date(), 'detailed'),
    completedHabits: [
      { name: 'Test Habit 1', status: 'completed' },
      { name: 'Test Habit 2', status: 'completed' }
    ],
    pendingHabits: [
      { name: 'Test Habit 3', status: 'pending' }
    ],
    completionRate: 67,
    isPerfectDay: false
  };
  
  Logger.log('\n📊 Test Report Data:');
  Logger.log(`  Completed: ${testReportData.completedHabits.length}`);
  Logger.log(`  Pending: ${testReportData.pendingHabits.length}`);
  Logger.log(`  Completion Rate: ${testReportData.completionRate}%`);
  
  try {
    Logger.log('\n🚀 Sending test Slack report...');
    const result = sendSlackReport(testReportData);
    Logger.log(`✅ Slack test completed: ${result}`);
    return true;
  } catch (error) {
    Logger.log(`❌ Slack test failed: ${error.message}`);
    Logger.log(`Error details: ${error.toString()}`);
    return false;
  }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debugConfig,
    resetConfig,
    forceSetEmail,
    enableSlack,
    setSlackWebhook,
    testSlackWebhook,
    testSlackWithDebug
  };
}