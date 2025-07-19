/**
 * Slack Integration Diagnostic Script
 * Chạy script này để kiểm tra và chẩn đoán vấn đề Slack integration
 */

/**
 * Chẩn đoán toàn diện Slack integration
 */
function diagnoseSlackIntegration() {
  Logger.log('='.repeat(60));
  Logger.log('SLACK INTEGRATION DIAGNOSTIC');
  Logger.log('='.repeat(60));
  
  const results = {
    webAppUrl: null,
    config: null,
    webhookTest: false,
    deploymentStatus: false,
    issues: [],
    recommendations: []
  };
  
  // 1. Kiểm tra Web App URL
  Logger.log('\n1. CHECKING WEB APP DEPLOYMENT...');
  try {
    results.webAppUrl = ScriptApp.getService().getUrl();
    if (results.webAppUrl) {
      Logger.log(`✅ Web App URL: ${results.webAppUrl}`);
      results.deploymentStatus = true;
    } else {
      Logger.log('❌ Web App URL not found - App not deployed');
      results.issues.push('Google Apps Script chưa được deploy as Web App');
      results.recommendations.push('Deploy Google Apps Script as Web App với settings: Execute as "Me", Access "Anyone"');
    }
  } catch (error) {
    Logger.log(`❌ Error getting Web App URL: ${error.message}`);
    results.issues.push('Không thể lấy Web App URL');
  }
  
  // 2. Kiểm tra Configuration
  Logger.log('\n2. CHECKING CONFIGURATION...');
  try {
    results.config = getAppConfig();
    
    Logger.log(`   enableSlack: ${results.config.enableSlack}`);
    Logger.log(`   slackChannel: ${results.config.slackChannel}`);
    Logger.log(`   slackWebhookUrl: ${results.config.slackWebhookUrl ? '[SET]' : '[NOT SET]'}`);
    
    if (!results.config.enableSlack) {
      results.issues.push('Slack integration bị tắt trong config');
      results.recommendations.push('Chạy enableSlack() để bật Slack integration');
    }
    
    if (!results.config.slackWebhookUrl) {
      results.issues.push('Slack webhook URL chưa được cấu hình');
      results.recommendations.push('Tạo Slack App và cấu hình Incoming Webhook, sau đó chạy setSlackWebhook(url)');
    } else {
      // Validate webhook URL format
      if (!results.config.slackWebhookUrl.startsWith('https://hooks.slack.com/')) {
        results.issues.push('Slack webhook URL không đúng format');
        results.recommendations.push('Webhook URL phải bắt đầu với https://hooks.slack.com/');
      } else {
        Logger.log('✅ Webhook URL format is valid');
      }
    }
    
  } catch (error) {
    Logger.log(`❌ Error checking configuration: ${error.message}`);
    results.issues.push('Lỗi khi kiểm tra configuration');
  }
  
  // 3. Test Webhook
  Logger.log('\n3. TESTING WEBHOOK...');
  if (results.config && results.config.slackWebhookUrl && results.config.enableSlack) {
    try {
      const testPayload = {
        text: 'Diagnostic test from Habit Tracker',
        channel: results.config.slackChannel,
        username: 'Habit Tracker Diagnostic'
      };
      
      const response = UrlFetchApp.fetch(results.config.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify(testPayload)
      });
      
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      if (responseCode === 200 && responseText === 'ok') {
        Logger.log('✅ Webhook test successful');
        results.webhookTest = true;
      } else {
        Logger.log(`❌ Webhook test failed: ${responseCode} - ${responseText}`);
        results.issues.push(`Webhook test thất bại: ${responseCode} - ${responseText}`);
        results.recommendations.push('Kiểm tra lại Slack webhook URL hoặc tạo webhook mới');
      }
      
    } catch (error) {
      Logger.log(`❌ Webhook test error: ${error.message}`);
      results.issues.push(`Lỗi khi test webhook: ${error.message}`);
      results.recommendations.push('Kiểm tra network connection và webhook URL');
    }
  } else {
    Logger.log('⏭️ Skipping webhook test - configuration incomplete');
  }
  
  // 4. Kiểm tra doPost function
  Logger.log('\n4. CHECKING doPost FUNCTION...');
  try {
    // Kiểm tra xem doPost function có tồn tại không
    if (typeof doPost === 'function') {
      Logger.log('✅ doPost function exists');
    } else {
      Logger.log('❌ doPost function not found');
      results.issues.push('doPost function không tồn tại');
      results.recommendations.push('Đảm bảo có function doPost() trong code để xử lý Slack requests');
    }
  } catch (error) {
    Logger.log(`❌ Error checking doPost: ${error.message}`);
  }
  
  // 5. Kiểm tra required functions
  Logger.log('\n5. CHECKING REQUIRED FUNCTIONS...');
  const requiredFunctions = [
    'handleCompleteHabitUltraFast',
    'handleSlashCommand',
    'getAppConfig',
    'sendSlackReport'
  ];
  
  requiredFunctions.forEach(funcName => {
    try {
      if (typeof eval(funcName) === 'function') {
        Logger.log(`✅ ${funcName} exists`);
      } else {
        Logger.log(`❌ ${funcName} not found`);
        results.issues.push(`Function ${funcName} không tồn tại`);
      }
    } catch (error) {
      Logger.log(`❌ ${funcName} not accessible`);
      results.issues.push(`Function ${funcName} không thể truy cập`);
    }
  });
  
  // 6. Tổng kết
  Logger.log('\n' + '='.repeat(60));
  Logger.log('DIAGNOSTIC SUMMARY');
  Logger.log('='.repeat(60));
  
  if (results.issues.length === 0) {
    Logger.log('🎉 EXCELLENT! Slack integration appears to be configured correctly.');
    Logger.log('\n📋 NEXT STEPS:');
    Logger.log('1. Trong Slack App settings (https://api.slack.com/apps):');
    Logger.log(`   - Cập nhật Interactivity Request URL: ${results.webAppUrl}`);
    Logger.log(`   - Cập nhật Slash Commands Request URL: ${results.webAppUrl}`);
    Logger.log('2. Test trong Slack channel: /habit-help');
    Logger.log('3. Test interactive buttons: /habit-report');
  } else {
    Logger.log(`❌ FOUND ${results.issues.length} ISSUE(S):`);
    results.issues.forEach((issue, index) => {
      Logger.log(`   ${index + 1}. ${issue}`);
    });
    
    Logger.log('\n🔧 RECOMMENDATIONS:');
    results.recommendations.forEach((rec, index) => {
      Logger.log(`   ${index + 1}. ${rec}`);
    });
  }
  
  Logger.log('\n📞 SLACK APP SETUP CHECKLIST:');
  Logger.log('□ Incoming Webhooks: Activated');
  Logger.log('□ Interactivity & Shortcuts: Enabled');
  Logger.log(`□ Interactivity Request URL: ${results.webAppUrl || '[GET FROM DEPLOYMENT]'}`);
  Logger.log('□ Slash Commands: Created (/habit-report, /habit-status, /habit-help)');
  Logger.log(`□ Slash Commands Request URL: ${results.webAppUrl || '[GET FROM DEPLOYMENT]'}`);
  Logger.log('□ OAuth Scopes: chat:write, commands, incoming-webhook');
  Logger.log('□ App installed to workspace');
  
  return results;
}

/**
 * Quick fix - Tự động sửa các vấn đề cơ bản
 */
function quickFixSlackIntegration() {
  Logger.log('=== QUICK FIX SLACK INTEGRATION ===');
  
  // 1. Enable Slack
  Logger.log('1. Enabling Slack...');
  setConfig('ENABLE_SLACK', 'true');
  
  // 2. Set default webhook if not exists
  const currentWebhook = getConfig('SLACK_WEBHOOK_URL', '');
  if (!currentWebhook) {
    Logger.log('2. Setting default webhook URL...');
    Logger.log('⚠️ You need to replace this with your actual webhook URL');
    setConfig('SLACK_WEBHOOK_URL', 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL');
  }
  
  // 3. Set default channel
  const currentChannel = getConfig('SLACK_CHANNEL', '');
  if (!currentChannel) {
    Logger.log('3. Setting default channel...');
    setConfig('SLACK_CHANNEL', '#habit-tracker');
  }
  
  Logger.log('✅ Quick fix completed!');
  Logger.log('\n📋 MANUAL STEPS REQUIRED:');
  Logger.log('1. Tạo Slack App tại https://api.slack.com/apps');
  Logger.log('2. Tạo Incoming Webhook và copy URL');
  Logger.log('3. Chạy: setSlackWebhook("YOUR_ACTUAL_WEBHOOK_URL")');
  Logger.log('4. Deploy Google Apps Script as Web App');
  Logger.log('5. Cập nhật Request URLs trong Slack App settings');
  
  // Run diagnostic
  Logger.log('\n🔍 Running diagnostic...');
  diagnoseSlackIntegration();
}

/**
 * Hiển thị hướng dẫn setup chi tiết
 */
function showDetailedSetupGuide() {
  const webAppUrl = ScriptApp.getService().getUrl() || '[DEPLOY FIRST]';
  
  Logger.log('='.repeat(80));
  Logger.log('DETAILED SLACK SETUP GUIDE');
  Logger.log('='.repeat(80));
  
  Logger.log('\n🚀 STEP 1: DEPLOY GOOGLE APPS SCRIPT');
  Logger.log('1. Click "Deploy" > "New deployment"');
  Logger.log('2. Type: "Web app"');
  Logger.log('3. Execute as: "Me"');
  Logger.log('4. Who has access: "Anyone"');
  Logger.log('5. Click "Deploy"');
  Logger.log(`6. Copy this URL: ${webAppUrl}`);
  
  Logger.log('\n🔧 STEP 2: CREATE SLACK APP');
  Logger.log('1. Go to https://api.slack.com/apps');
  Logger.log('2. Click "Create New App" > "From scratch"');
  Logger.log('3. App Name: "Habit Tracker"');
  Logger.log('4. Choose your workspace');
  
  Logger.log('\n📡 STEP 3: CONFIGURE INCOMING WEBHOOKS');
  Logger.log('1. Go to "Incoming Webhooks"');
  Logger.log('2. Toggle "Activate Incoming Webhooks" = ON');
  Logger.log('3. Click "Add New Webhook to Workspace"');
  Logger.log('4. Choose channel (e.g., #habit-tracker)');
  Logger.log('5. Copy the webhook URL');
  Logger.log('6. Run: setSlackWebhook("YOUR_WEBHOOK_URL")');
  
  Logger.log('\n🎛️ STEP 4: CONFIGURE INTERACTIVITY');
  Logger.log('1. Go to "Interactivity & Shortcuts"');
  Logger.log('2. Toggle "Interactivity" = ON');
  Logger.log(`3. Request URL: ${webAppUrl}`);
  Logger.log('4. Click "Save Changes"');
  
  Logger.log('\n⚡ STEP 5: CREATE SLASH COMMANDS');
  Logger.log('Create these 3 commands:');
  Logger.log('\nCommand 1:');
  Logger.log('  Command: /habit-report');
  Logger.log(`  Request URL: ${webAppUrl}`);
  Logger.log('  Short Description: Gửi báo cáo habit hôm nay');
  Logger.log('\nCommand 2:');
  Logger.log('  Command: /habit-status');
  Logger.log(`  Request URL: ${webAppUrl}`);
  Logger.log('  Short Description: Xem trạng thái habit hiện tại');
  Logger.log('\nCommand 3:');
  Logger.log('  Command: /habit-help');
  Logger.log(`  Request URL: ${webAppUrl}`);
  Logger.log('  Short Description: Hiển thị hướng dẫn sử dụng');
  
  Logger.log('\n🔐 STEP 6: SET PERMISSIONS');
  Logger.log('1. Go to "OAuth & Permissions"');
  Logger.log('2. In "Bot Token Scopes", add:');
  Logger.log('   - chat:write');
  Logger.log('   - commands');
  Logger.log('   - incoming-webhook');
  
  Logger.log('\n📦 STEP 7: INSTALL APP');
  Logger.log('1. Click "Install App to Workspace"');
  Logger.log('2. Review and authorize permissions');
  
  Logger.log('\n🧪 STEP 8: TEST');
  Logger.log('1. In Slack: /habit-help');
  Logger.log('2. In Slack: /habit-report');
  Logger.log('3. Click "Hoàn thành" button');
  Logger.log('4. Check Google Sheet for updates');
  
  Logger.log('\n🔍 DIAGNOSTIC COMMANDS:');
  Logger.log('- diagnoseSlackIntegration() - Kiểm tra toàn diện');
  Logger.log('- quickFixSlackIntegration() - Sửa nhanh các vấn đề cơ bản');
  Logger.log('- testSlackWithDebug() - Test với debug info');
  
  Logger.log('\n' + '='.repeat(80));
}

// Export functions for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    diagnoseSlackIntegration,
    quickFixSlackIntegration,
    showDetailedSetupGuide
  };
}