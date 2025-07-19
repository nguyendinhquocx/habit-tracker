/**
 * Test Slack Interaction Script
 * Script này giúp test và debug tương tác giữa Slack và Google Sheet
 */

/**
 * Test function để mô phỏng Slack button click
 */
function testSlackButtonClick() {
  Logger.log('=== TESTING SLACK BUTTON CLICK ===');
  
  // Mô phỏng payload từ Slack khi user click button "Hoàn thành"
  const mockSlackPayload = {
    type: 'block_actions',
    user: {
      id: 'U1234567890',
      username: 'testuser',
      name: 'Test User'
    },
    actions: [{
      action_id: 'complete_habit_Uống nước',
      block_id: 'habit_block_1',
      text: {
        type: 'plain_text',
        text: 'Hoàn thành',
        emoji: true
      },
      value: 'Uống nước',
      type: 'button',
      action_ts: '1234567890.123456'
    }],
    channel: {
      id: 'C1234567890',
      name: 'habit-tracker'
    },
    team: {
      id: 'T1234567890',
      domain: 'testworkspace'
    },
    token: 'verification_token',
    response_url: 'https://hooks.slack.com/actions/T1234567890/1234567890/abcdef123456',
    trigger_id: '1234567890.1234567890.abcdef123456'
  };
  
  // Test 1: Kiểm tra parsing payload
  Logger.log('\n1. Testing payload parsing...');
  try {
    const payloadString = JSON.stringify(mockSlackPayload);
    const parsedPayload = JSON.parse(payloadString);
    Logger.log('✅ Payload parsing successful');
    Logger.log(`   Action ID: ${parsedPayload.actions[0].action_id}`);
    Logger.log(`   Habit Name: ${parsedPayload.actions[0].value}`);
  } catch (error) {
    Logger.log(`❌ Payload parsing failed: ${error.message}`);
    return;
  }
  
  // Test 2: Kiểm tra function handleCompleteHabitUltraFast
  Logger.log('\n2. Testing handleCompleteHabitUltraFast...');
  try {
    if (typeof handleCompleteHabitUltraFast === 'function') {
      Logger.log('✅ handleCompleteHabitUltraFast function exists');
      
      // Test với habit name
      const testHabitName = 'Uống nước';
      const result = handleCompleteHabitUltraFast(testHabitName);
      
      if (result && result.success) {
        Logger.log(`✅ Habit completion successful: ${testHabitName}`);
        Logger.log(`   Message: ${result.message}`);
      } else {
        Logger.log(`❌ Habit completion failed: ${result ? result.message : 'No result'}`);
      }
    } else {
      Logger.log('❌ handleCompleteHabitUltraFast function not found');
    }
  } catch (error) {
    Logger.log(`❌ Error testing handleCompleteHabitUltraFast: ${error.message}`);
  }
  
  // Test 3: Kiểm tra doPost với mock request
  Logger.log('\n3. Testing doPost function...');
  try {
    if (typeof doPost === 'function') {
      Logger.log('✅ doPost function exists');
      
      // Tạo mock request object
      const mockRequest = {
        parameter: {
          payload: JSON.stringify(mockSlackPayload)
        },
        postData: {
          contents: `payload=${encodeURIComponent(JSON.stringify(mockSlackPayload))}`,
          type: 'application/x-www-form-urlencoded'
        }
      };
      
      Logger.log('   Testing doPost with mock Slack request...');
      const response = doPost(mockRequest);
      
      if (response) {
        Logger.log('✅ doPost returned response');
        Logger.log(`   Response type: ${typeof response}`);
        
        // Nếu response có getContentText method (HtmlOutput hoặc ContentService)
        if (response.getContentText) {
          const content = response.getContentText();
          Logger.log(`   Response content: ${content.substring(0, 200)}...`);
        }
      } else {
        Logger.log('❌ doPost returned no response');
      }
    } else {
      Logger.log('❌ doPost function not found');
    }
  } catch (error) {
    Logger.log(`❌ Error testing doPost: ${error.message}`);
  }
  
  Logger.log('\n=== TEST COMPLETED ===');
}

/**
 * Test gửi Slack report với interactive buttons
 */
function testSlackReportWithButtons() {
  Logger.log('=== TESTING SLACK REPORT WITH BUTTONS ===');
  
  try {
    // Kiểm tra config
    const config = getAppConfig();
    if (!config.enableSlack || !config.slackWebhookUrl) {
      Logger.log('❌ Slack not configured properly');
      Logger.log('   Run: enableSlack() and setSlackWebhook(url)');
      return;
    }
    
    Logger.log('✅ Slack configuration found');
    Logger.log(`   Channel: ${config.slackChannel}`);
    Logger.log(`   Webhook: ${config.slackWebhookUrl.substring(0, 50)}...`);
    
    // Test gửi report
    Logger.log('\n📤 Sending test report to Slack...');
    const result = sendSlackReport();
    
    if (result && result.success) {
      Logger.log('✅ Slack report sent successfully');
      Logger.log('   Check your Slack channel for the message with buttons');
      Logger.log('   Try clicking "Hoàn thành" button to test interaction');
    } else {
      Logger.log(`❌ Failed to send Slack report: ${result ? result.message : 'Unknown error'}`);
    }
    
  } catch (error) {
    Logger.log(`❌ Error testing Slack report: ${error.message}`);
  }
  
  Logger.log('\n=== TEST COMPLETED ===');
}

/**
 * Test slash command
 */
function testSlashCommand() {
  Logger.log('=== TESTING SLASH COMMAND ===');
  
  // Mock slash command payload
  const mockSlashPayload = {
    token: 'verification_token',
    team_id: 'T1234567890',
    team_domain: 'testworkspace',
    channel_id: 'C1234567890',
    channel_name: 'habit-tracker',
    user_id: 'U1234567890',
    user_name: 'testuser',
    command: '/habit-report',
    text: '',
    response_url: 'https://hooks.slack.com/commands/1234567890/1234567890/abcdef123456',
    trigger_id: '1234567890.1234567890.abcdef123456'
  };
  
  try {
    if (typeof handleSlashCommand === 'function') {
      Logger.log('✅ handleSlashCommand function exists');
      
      const result = handleSlashCommand(mockSlashPayload);
      
      if (result) {
        Logger.log('✅ Slash command handled successfully');
        Logger.log(`   Response type: ${typeof result}`);
        
        if (result.text) {
          Logger.log(`   Response text: ${result.text.substring(0, 100)}...`);
        }
        if (result.blocks) {
          Logger.log(`   Response has ${result.blocks.length} blocks`);
        }
      } else {
        Logger.log('❌ Slash command returned no result');
      }
    } else {
      Logger.log('❌ handleSlashCommand function not found');
    }
  } catch (error) {
    Logger.log(`❌ Error testing slash command: ${error.message}`);
  }
  
  Logger.log('\n=== TEST COMPLETED ===');
}

/**
 * Comprehensive test - chạy tất cả tests
 */
function runAllSlackTests() {
  Logger.log('🚀 RUNNING ALL SLACK TESTS');
  Logger.log('='.repeat(60));
  
  // 1. Diagnostic
  Logger.log('\n📋 1. RUNNING DIAGNOSTIC...');
  try {
    diagnoseSlackIntegration();
  } catch (error) {
    Logger.log(`❌ Diagnostic failed: ${error.message}`);
  }
  
  // 2. Button click test
  Logger.log('\n🔘 2. TESTING BUTTON INTERACTION...');
  try {
    testSlackButtonClick();
  } catch (error) {
    Logger.log(`❌ Button test failed: ${error.message}`);
  }
  
  // 3. Slash command test
  Logger.log('\n⚡ 3. TESTING SLASH COMMAND...');
  try {
    testSlashCommand();
  } catch (error) {
    Logger.log(`❌ Slash command test failed: ${error.message}`);
  }
  
  // 4. Report with buttons test
  Logger.log('\n📤 4. TESTING SLACK REPORT...');
  try {
    testSlackReportWithButtons();
  } catch (error) {
    Logger.log(`❌ Report test failed: ${error.message}`);
  }
  
  Logger.log('\n' + '='.repeat(60));
  Logger.log('🏁 ALL TESTS COMPLETED');
  Logger.log('\n📋 NEXT STEPS:');
  Logger.log('1. Check logs above for any ❌ errors');
  Logger.log('2. If Slack report was sent, check your Slack channel');
  Logger.log('3. Try clicking buttons in Slack to test interaction');
  Logger.log('4. Check Google Sheet to see if habits are marked as completed');
}

/**
 * Debug function để log chi tiết request từ Slack
 */
function debugSlackRequest(e) {
  Logger.log('=== DEBUG SLACK REQUEST ===');
  
  if (!e) {
    Logger.log('❌ No request object provided');
    return;
  }
  
  Logger.log('📥 Request details:');
  Logger.log(`   Method: ${e.method || 'Unknown'}`);
  Logger.log(`   Content Type: ${e.contentType || 'Unknown'}`);
  
  if (e.parameter) {
    Logger.log('📋 Parameters:');
    Object.keys(e.parameter).forEach(key => {
      const value = e.parameter[key];
      if (key === 'payload' && value) {
        try {
          const parsed = JSON.parse(value);
          Logger.log(`   ${key}: [PARSED JSON]`);
          Logger.log(`     Type: ${parsed.type}`);
          if (parsed.actions) {
            Logger.log(`     Actions: ${parsed.actions.length}`);
            parsed.actions.forEach((action, i) => {
              Logger.log(`       Action ${i}: ${action.action_id} = ${action.value}`);
            });
          }
        } catch (error) {
          Logger.log(`   ${key}: ${value.substring(0, 100)}...`);
        }
      } else {
        Logger.log(`   ${key}: ${value}`);
      }
    });
  }
  
  if (e.postData) {
    Logger.log('📤 Post Data:');
    Logger.log(`   Type: ${e.postData.type}`);
    Logger.log(`   Length: ${e.postData.length}`);
    if (e.postData.contents) {
      Logger.log(`   Contents: ${e.postData.contents.substring(0, 200)}...`);
    }
  }
  
  Logger.log('=== END DEBUG ===');
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testSlackButtonClick,
    testSlackReportWithButtons,
    testSlashCommand,
    runAllSlackTests,
    debugSlackRequest
  };
}