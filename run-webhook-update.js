/**
 * Script để chạy trong Google Apps Script Console
 * Copy và paste code này vào Apps Script Editor và chạy hàm runWebhookUpdate()
 */

/**
 * Chạy cập nhật webhook và test
 */
function runWebhookUpdate() {
  Logger.log('=== UPDATING WEBHOOK IN APPS SCRIPT ===');
  
  try {
    // Cập nhật webhook URL mới trong PropertiesService
    const newWebhookUrl = 'https://hooks.slack.com/services/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';
    
    Logger.log('🔄 Updating PropertiesService with new webhook...');
    PropertiesService.getUserProperties().setProperty('SLACK_WEBHOOK_URL', newWebhookUrl);
    
    // Verify update
    const updatedUrl = PropertiesService.getUserProperties().getProperty('SLACK_WEBHOOK_URL');
    Logger.log(`✅ Updated webhook URL: ${updatedUrl}`);
    
    // Test the new webhook
    Logger.log('\n🧪 Testing new webhook...');
    const testPayload = {
      'text': '🧪 Test message from Habit Tracker - New webhook is working!',
      'channel': '#habit',
      'username': 'Habit Tracker Bot'
    };
    
    const options = {
      'method': 'POST',
      'headers': {
        'Content-Type': 'application/json'
      },
      'payload': JSON.stringify(testPayload)
    };
    
    const response = UrlFetchApp.fetch(newWebhookUrl, options);
    
    if (response.getResponseCode() === 200) {
      Logger.log('🎉 SUCCESS! New webhook is working correctly!');
      Logger.log('✅ Slack integration is now fixed and ready to use.');
      return true;
    } else {
      Logger.log(`❌ Test failed with response code: ${response.getResponseCode()}`);
      Logger.log(`Response: ${response.getContentText()}`);
      return false;
    }
    
  } catch (error) {
    Logger.log(`❌ Error during webhook update: ${error.message}`);
    return false;
  }
}

/**
 * Kiểm tra cấu hình hiện tại
 */
function checkCurrentConfig() {
  Logger.log('=== CURRENT CONFIGURATION ===');
  
  const properties = PropertiesService.getUserProperties().getProperties();
  
  Logger.log('Slack Configuration:');
  Logger.log(`  SLACK_WEBHOOK_URL: ${properties.SLACK_WEBHOOK_URL || 'Not set'}`);
  Logger.log(`  ENABLE_SLACK: ${properties.ENABLE_SLACK || 'Not set'}`);
  Logger.log(`  SLACK_CHANNEL: ${properties.SLACK_CHANNEL || 'Not set'}`);
  
  // Check if it's the new webhook
  if (properties.SLACK_WEBHOOK_URL && properties.SLACK_WEBHOOK_URL.includes('B096GH78DCN')) {
    Logger.log('✅ New webhook URL detected in PropertiesService');
  } else {
    Logger.log('⚠️ Old webhook URL still in PropertiesService');
  }
}

/**
 * Hướng dẫn sử dụng
 */
function showInstructions() {
  Logger.log('=== HƯỚNG DẪN SỬ DỤNG ===');
  Logger.log('1. Chạy checkCurrentConfig() để xem cấu hình hiện tại');
  Logger.log('2. Chạy runWebhookUpdate() để cập nhật webhook mới');
  Logger.log('3. Sau khi thành công, chạy lại habit tracker để test');
  Logger.log('');
  Logger.log('Webhook mới: https://hooks.slack.com/services/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');
}