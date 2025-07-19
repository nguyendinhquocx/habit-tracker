/**
 * Quick Slack Integration Test
 * Script nhanh để test Slack integration sau khi sửa lỗi
 */

/**
 * Test nhanh Slack button interaction
 */
function quickTestSlackButton() {
  Logger.log('=== QUICK SLACK BUTTON TEST ===');
  
  // Test với habit name thực tế
  const testHabitName = 'Uống nước'; // Thay bằng tên habit có trong sheet
  
  Logger.log(`Testing habit completion: ${testHabitName}`);
  
  try {
    // Test function handleCompleteHabitUltraFast trực tiếp
    const result = handleCompleteHabitUltraFast(testHabitName);
    
    if (result.success) {
      Logger.log(`✅ SUCCESS: ${result.message}`);
      if (result.streak) {
        Logger.log(`   Streak: ${result.streak} ngày`);
      }
    } else {
      Logger.log(`❌ FAILED: ${result.message}`);
    }
    
  } catch (error) {
    Logger.log(`❌ ERROR: ${error.message}`);
  }
  
  Logger.log('=== TEST COMPLETED ===');
}

/**
 * Test doPost function với mock Slack payload
 */
function testDoPostWithMockPayload() {
  Logger.log('=== TESTING doPost WITH MOCK PAYLOAD ===');
  
  // Mock Slack payload với format mới
  const mockPayload = {
    type: 'block_actions',
    user: {
      id: 'U1234567890',
      username: 'testuser'
    },
    actions: [{
      action_id: 'complete_habit_Uống nước',  // Format mới
      value: 'Uống nước',  // Chỉ tên habit
      type: 'button'
    }],
    channel: {
      id: 'C1234567890',
      name: 'habit-tracker'
    }
  };
  
  // Mock request object
  const mockRequest = {
    parameter: {
      payload: JSON.stringify(mockPayload)
    },
    postData: {
      contents: `payload=${encodeURIComponent(JSON.stringify(mockPayload))}`,
      type: 'application/x-www-form-urlencoded'
    }
  };
  
  try {
    Logger.log('Calling doPost with mock request...');
    const response = doPost(mockRequest);
    
    if (response) {
      Logger.log('✅ doPost returned response');
      
      if (response.getContentText) {
        const content = response.getContentText();
        Logger.log(`Response content: ${content}`);
        
        // Parse JSON response
        try {
          const jsonResponse = JSON.parse(content);
          if (jsonResponse.blocks && jsonResponse.blocks.length > 0) {
            Logger.log('✅ Response contains blocks (good for Slack)');
            jsonResponse.blocks.forEach((block, index) => {
              if (block.text && block.text.text) {
                Logger.log(`   Block ${index}: ${block.text.text}`);
              }
            });
          }
        } catch (parseError) {
          Logger.log(`Response parsing error: ${parseError.message}`);
        }
      }
    } else {
      Logger.log('❌ doPost returned no response');
    }
    
  } catch (error) {
    Logger.log(`❌ Error testing doPost: ${error.message}`);
  }
  
  Logger.log('=== TEST COMPLETED ===');
}

/**
 * Test gửi Slack report và kiểm tra buttons
 */
function testSlackReportButtons() {
  Logger.log('=== TESTING SLACK REPORT BUTTONS ===');
  
  try {
    // Kiểm tra config
    const config = getAppConfig();
    
    if (!config.enableSlack) {
      Logger.log('❌ Slack is disabled in config');
      Logger.log('   Run: enableSlack() to enable');
      return;
    }
    
    if (!config.slackWebhookUrl) {
      Logger.log('❌ Slack webhook URL not configured');
      Logger.log('   Run: setSlackWebhook("YOUR_WEBHOOK_URL")');
      return;
    }
    
    Logger.log('✅ Slack configuration looks good');
    Logger.log(`   Channel: ${config.slackChannel}`);
    Logger.log(`   Webhook: ${config.slackWebhookUrl.substring(0, 50)}...`);
    
    // Gửi test report
    Logger.log('\n📤 Sending test Slack report...');
    const result = sendSlackReport();
    
    if (result && result.success) {
      Logger.log('✅ Slack report sent successfully!');
      Logger.log('\n📋 NEXT STEPS:');
      Logger.log('1. Check your Slack channel for the message');
      Logger.log('2. Look for "Hoàn thành" buttons next to pending habits');
      Logger.log('3. Click a button to test the interaction');
      Logger.log('4. Check Google Sheet to see if the habit is marked as completed');
      Logger.log('5. Check this script\'s logs for any errors');
    } else {
      Logger.log(`❌ Failed to send Slack report: ${result ? result.message : 'Unknown error'}`);
    }
    
  } catch (error) {
    Logger.log(`❌ Error testing Slack report: ${error.message}`);
  }
  
  Logger.log('=== TEST COMPLETED ===');
}

/**
 * Comprehensive test - chạy tất cả tests
 */
function runQuickTests() {
  Logger.log('🚀 RUNNING QUICK SLACK TESTS');
  Logger.log('='.repeat(50));
  
  // Test 1: Direct function test
  Logger.log('\n1️⃣ TESTING DIRECT FUNCTION...');
  quickTestSlackButton();
  
  // Test 2: doPost mock test
  Logger.log('\n2️⃣ TESTING doPost FUNCTION...');
  testDoPostWithMockPayload();
  
  // Test 3: Slack report test
  Logger.log('\n3️⃣ TESTING SLACK REPORT...');
  testSlackReportButtons();
  
  Logger.log('\n' + '='.repeat(50));
  Logger.log('🏁 ALL QUICK TESTS COMPLETED');
  
  Logger.log('\n📋 TROUBLESHOOTING CHECKLIST:');
  Logger.log('□ Google Apps Script deployed as Web App');
  Logger.log('□ Web App permissions: Execute as "Me", Access "Anyone"');
  Logger.log('□ Slack App created with Incoming Webhooks enabled');
  Logger.log('□ Slack App Interactivity enabled with correct Request URL');
  Logger.log('□ Slack webhook URL configured in script');
  Logger.log('□ Habit names in Slack buttons match exactly with Google Sheet');
  
  Logger.log('\n🔧 USEFUL COMMANDS:');
  Logger.log('- diagnoseSlackIntegration() - Full diagnostic');
  Logger.log('- quickTestSlackButton() - Test habit completion');
  Logger.log('- testSlackReportButtons() - Send test report to Slack');
  Logger.log('- showDetailedSetupGuide() - Show setup instructions');
}

/**
 * Debug function để kiểm tra habit names trong sheet
 */
function debugHabitNames() {
  Logger.log('=== DEBUG HABIT NAMES ===');
  
  try {
    const config = getAppConfig();
    const sheet = SpreadsheetApp.openById(config.spreadsheetId).getSheetByName(config.sheetName);
    
    // Lấy habit names từ cột C (từ row 16 trở đi)
    const habitNamesRange = sheet.getRange('C16:C31');
    const habitNames = habitNamesRange.getValues().flat();
    
    Logger.log('Habit names found in Google Sheet:');
    habitNames.forEach((name, index) => {
      if (name && name.toString().trim()) {
        Logger.log(`   ${index + 16}: "${name}"`);
      }
    });
    
    Logger.log('\n💡 Use these exact names when testing:');
    const validNames = habitNames.filter(name => name && name.toString().trim());
    validNames.forEach(name => {
      Logger.log(`   quickTestSlackButton() with habitName = "${name}"`);
    });
    
  } catch (error) {
    Logger.log(`❌ Error reading habit names: ${error.message}`);
  }
  
  Logger.log('=== DEBUG COMPLETED ===');
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    quickTestSlackButton,
    testDoPostWithMockPayload,
    testSlackReportButtons,
    runQuickTests,
    debugHabitNames
  };
}