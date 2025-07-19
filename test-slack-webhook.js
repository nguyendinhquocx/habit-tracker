/**
 * Test Slack webhook URL
 */
function testSlackWebhookOnly() {
  Logger.log('=== TESTING SLACK WEBHOOK URL ===');
  
  const config = getAppConfig();
  
  Logger.log(`Slack enabled: ${config.enableSlack}`);
  Logger.log(`Webhook URL: ${config.slackWebhookUrl}`);
  
  if (!config.slackWebhookUrl) {
    Logger.log('❌ No webhook URL configured');
    return false;
  }
  
  // Simple test payload
  const testPayload = {
    text: '🧪 Test from Habit Tracker - ' + new Date().toISOString()
  };
  
  try {
    Logger.log('📡 Sending test message...');
    
    const response = UrlFetchApp.fetch(config.slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(testPayload),
      muteHttpExceptions: true  // This will show full error response
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log(`📊 Response Code: ${responseCode}`);
    Logger.log(`📄 Response Text: ${responseText}`);
    
    if (responseCode === 200) {
      Logger.log('✅ Webhook test successful!');
      return true;
    } else {
      Logger.log('❌ Webhook test failed');
      Logger.log(`Full error response: ${responseText}`);
      return false;
    }
    
  } catch (error) {
    Logger.log(`❌ Error testing webhook: ${error.message}`);
    Logger.log(`Error details: ${error.toString()}`);
    return false;
  }
}

/**
 * Check if webhook URL is valid format
 */
function validateWebhookUrl() {
  Logger.log('=== VALIDATING WEBHOOK URL ===');
  
  const config = getAppConfig();
  const url = config.slackWebhookUrl;
  
  Logger.log(`Current URL: ${url}`);
  
  if (!url) {
    Logger.log('❌ No URL configured');
    return false;
  }
  
  if (!url.startsWith('https://hooks.slack.com/')) {
    Logger.log('❌ Invalid URL format - should start with https://hooks.slack.com/');
    return false;
  }
  
  if (url === 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL') {
    Logger.log('❌ URL is still placeholder value');
    return false;
  }
  
  Logger.log('✅ URL format looks valid');
  return true;
}

/**
 * Full webhook diagnostic
 */
function diagnoseSlackWebhook() {
  Logger.log('=== SLACK WEBHOOK DIAGNOSTIC ===');
  
  // Step 1: Validate URL format
  const urlValid = validateWebhookUrl();
  if (!urlValid) {
    Logger.log('❌ URL validation failed - stopping diagnostic');
    return false;
  }
  
  // Step 2: Test webhook
  const webhookTest = testSlackWebhookOnly();
  
  if (webhookTest) {
    Logger.log('🎉 Webhook is working correctly!');
  } else {
    Logger.log('💡 Webhook test failed. Possible causes:');
    Logger.log('   1. Webhook URL has been revoked/disabled in Slack');
    Logger.log('   2. Slack workspace settings changed');
    Logger.log('   3. Network connectivity issues');
    Logger.log('   4. URL was copied incorrectly');
    Logger.log('');
    Logger.log('🔧 To fix:');
    Logger.log('   1. Go to your Slack workspace');
    Logger.log('   2. Create a new Incoming Webhook');
    Logger.log('   3. Update the URL in config.js or use setSlackWebhook()');
  }
  
  return webhookTest;
}