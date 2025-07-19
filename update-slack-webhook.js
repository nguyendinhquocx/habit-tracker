/**
 * Update Slack webhook URL to new one
 */
function updateSlackWebhook() {
  Logger.log('=== UPDATING SLACK WEBHOOK URL ===');
  
  const newWebhookUrl = 'https://hooks.slack.com/services/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';
  
  // Update the configuration
  setConfig('SLACK_WEBHOOK_URL', newWebhookUrl);
  
  // Verify the update
  const config = getAppConfig();
  Logger.log(`✅ Webhook URL updated to: ${config.slackWebhookUrl}`);
  
  // Test the new webhook
  Logger.log('\n🧪 Testing new webhook...');
  const testResult = testSlackWebhookOnly();
  
  if (testResult) {
    Logger.log('🎉 New webhook is working correctly!');
  } else {
    Logger.log('❌ New webhook test failed. Please check the URL.');
  }
  
  return testResult;
}

/**
 * Quick test and update
 */
function quickUpdateAndTest() {
  Logger.log('=== QUICK UPDATE AND TEST ===');
  
  // Update webhook
  const success = updateSlackWebhook();
  
  if (success) {
    Logger.log('\n✅ Slack webhook successfully updated and tested!');
    Logger.log('You can now run the main habit tracker and Slack reports should work.');
  } else {
    Logger.log('\n❌ Webhook update failed. Please check:');
    Logger.log('1. The webhook URL is correct');
    Logger.log('2. The webhook is active in your Slack workspace');
    Logger.log('3. Network connectivity');
  }
  
  return success;
}