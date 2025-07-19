/**
 * Test script để kiểm tra tích hợp bài học hàng ngày vào Slack
 */

/**
 * Test hàm getMotivationMessage với bài học từ Google Sheet
 */
function testSlackMotivationWithLessons() {
  Logger.log('=== TESTING SLACK MOTIVATION WITH LESSONS ===');
  
  try {
    // Test với các tỷ lệ hoàn thành khác nhau
    const testCases = [
      { isPerfectDay: true, completionRate: 100 },
      { isPerfectDay: false, completionRate: 80 },
      { isPerfectDay: false, completionRate: 50 },
      { isPerfectDay: false, completionRate: 20 },
      { isPerfectDay: false, completionRate: 0 }
    ];
    
    testCases.forEach((testCase, index) => {
      Logger.log(`\n--- Test Case ${index + 1}: ${testCase.completionRate}% completion ---`);
      
      const motivationMessage = getMotivationMessage(testCase.isPerfectDay, testCase.completionRate);
      Logger.log(`Motivation message: ${motivationMessage}`);
      
      // Kiểm tra xem có chứa bài học không
      const hasLessons = motivationMessage.includes('📚 Bài học hôm nay:');
      const hasBullets = motivationMessage.includes('•');
      
      Logger.log(`Contains lessons: ${hasLessons ? 'YES ✅' : 'NO (using fallback) ⚠️'}`);
      Logger.log(`Has bullet points: ${hasBullets ? 'YES ✅' : 'NO ❌'}`);
    });
    
    return true;
    
  } catch (error) {
    Logger.log(`❌ Error in test: ${error.message}`);
    return false;
  }
}

/**
 * Test toàn bộ Slack message với bài học
 */
function testSlackMessageWithLessons() {
  Logger.log('\n=== TESTING COMPLETE SLACK MESSAGE WITH LESSONS ===');
  
  try {
    // Tạo dữ liệu mẫu
    const mockReportData = {
      habits: [
        { name: 'Đọc sách', completed: true, streak: 5 },
        { name: 'Tập thể dục', completed: false, streak: 0 },
        { name: 'Thiền', completed: true, streak: 3 }
      ],
      completedHabits: [
        { name: 'Đọc sách', completed: true, streak: 5 },
        { name: 'Thiền', completed: true, streak: 3 }
      ],
      pendingHabits: [
        { name: 'Tập thể dục', completed: false, streak: 0 }
      ],
      completionRate: 66.67,
      isPerfectDay: false,
      today: new Date()
    };
    
    const mockConfig = {
      slackChannel: '#habits',
      enableSlack: true
    };
    
    // Tạo Slack message
    const slackMessage = buildSlackMessage(mockReportData, mockConfig);
    
    Logger.log('Generated Slack message:');
    Logger.log(JSON.stringify(slackMessage, null, 2));
    
    // Kiểm tra các thành phần
    const hasBlocks = slackMessage.blocks && slackMessage.blocks.length > 0;
    Logger.log(`Has blocks: ${hasBlocks ? 'YES ✅' : 'NO ❌'}`);
    
    // Tìm motivation section
    const motivationBlock = slackMessage.blocks.find(block => 
      block.type === 'section' && 
      block.text && 
      (block.text.text.includes('📚 Bài học hôm nay:') || 
       block.text.text.includes('Tuyệt vời!') ||
       block.text.text.includes('Rất tốt!'))
    );
    
    if (motivationBlock) {
      Logger.log('✅ Found motivation block:');
      Logger.log(motivationBlock.text.text);
      
      const hasLessons = motivationBlock.text.text.includes('📚 Bài học hôm nay:');
      Logger.log(`Contains lessons: ${hasLessons ? 'YES ✅' : 'NO (using fallback) ⚠️'}`);
    } else {
      Logger.log('❌ No motivation block found');
    }
    
    return {
      hasBlocks: hasBlocks,
      hasMotivation: !!motivationBlock,
      messageGenerated: true
    };
    
  } catch (error) {
    Logger.log(`❌ Error testing Slack message: ${error.message}`);
    return { error: error.message };
  }
}

/**
 * Test Slack slash command với bài học
 */
function testSlackSlashCommandWithLessons() {
  Logger.log('\n=== TESTING SLACK SLASH COMMAND WITH LESSONS ===');
  
  try {
    const mockConfig = {
      spreadsheetId: '1yTWfP2PwkBvJ8WYR-d0jeE-OZJaf7snZDdBLI09gXnA',
      enableSlack: true,
      slackChannel: '#habits'
    };
    
    const mockEvent = {
      command: '/habit-report',
      text: '',
      user_name: 'testuser'
    };
    
    // Test slash command
    const response = handleSlashCommand(mockEvent, mockConfig);
    
    Logger.log('Slash command response:');
    Logger.log(JSON.stringify(response, null, 2));
    
    const hasBlocks = response.blocks && response.blocks.length > 0;
    Logger.log(`Response has blocks: ${hasBlocks ? 'YES ✅' : 'NO ❌'}`);
    
    if (hasBlocks) {
      // Tìm motivation trong response
      const motivationBlock = response.blocks.find(block => 
        block.type === 'section' && 
        block.text && 
        (block.text.text.includes('📚 Bài học hôm nay:') || 
         block.text.text.includes('Tuyệt vời!'))
      );
      
      if (motivationBlock) {
        Logger.log('✅ Found motivation in slash command response:');
        Logger.log(motivationBlock.text.text);
        
        const hasLessons = motivationBlock.text.text.includes('📚 Bài học hôm nay:');
        Logger.log(`Contains lessons: ${hasLessons ? 'YES ✅' : 'NO (using fallback) ⚠️'}`);
      }
    }
    
    return {
      responseGenerated: true,
      hasBlocks: hasBlocks,
      responseType: response.response_type
    };
    
  } catch (error) {
    Logger.log(`❌ Error testing slash command: ${error.message}`);
    return { error: error.message };
  }
}

/**
 * Test tổng hợp tất cả tính năng Slack với bài học
 */
function testAllSlackLessonsIntegration() {
  Logger.log('🔧 TESTING ALL SLACK LESSONS INTEGRATION 🔧');
  
  const motivationTest = testSlackMotivationWithLessons();
  const messageTest = testSlackMessageWithLessons();
  const slashCommandTest = testSlackSlashCommandWithLessons();
  
  Logger.log('\n=== SUMMARY ===');
  Logger.log(`Motivation Test: ${motivationTest ? '✅ PASSED' : '❌ FAILED'}`);
  Logger.log(`Message Test: ${messageTest.messageGenerated ? '✅ PASSED' : '❌ FAILED'}`);
  Logger.log(`Slash Command Test: ${slashCommandTest.responseGenerated ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = motivationTest && messageTest.messageGenerated && slashCommandTest.responseGenerated;
  Logger.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return {
    motivation: motivationTest,
    message: messageTest,
    slashCommand: slashCommandTest,
    allPassed: allPassed
  };
}

/**
 * Test nhanh chỉ motivation message
 */
function quickTestSlackLessons() {
  Logger.log('⚡ QUICK TEST SLACK LESSONS ⚡');
  
  try {
    const message = getMotivationMessage(false, 75);
    Logger.log(`Motivation message: ${message}`);
    
    const hasLessons = message.includes('📚 Bài học hôm nay:');
    Logger.log(`Result: ${hasLessons ? '✅ USING LESSONS' : '⚠️ USING FALLBACK'}`);
    
    return hasLessons;
    
  } catch (error) {
    Logger.log(`❌ Error: ${error.message}`);
    return false;
  }
}

/**
 * Hướng dẫn sử dụng
 */
function showSlackLessonsTestInstructions() {
  Logger.log('📋 SLACK LESSONS TEST INSTRUCTIONS');
  Logger.log('=====================================');
  Logger.log('1. quickTestSlackLessons() - Test nhanh motivation message');
  Logger.log('2. testSlackMotivationWithLessons() - Test chi tiết motivation');
  Logger.log('3. testSlackMessageWithLessons() - Test toàn bộ Slack message');
  Logger.log('4. testSlackSlashCommandWithLessons() - Test slash command');
  Logger.log('5. testAllSlackLessonsIntegration() - Test tổng hợp tất cả');
  Logger.log('');
  Logger.log('💡 Để test trong Slack thật:');
  Logger.log('   - Gõ /habit-report trong Slack channel');
  Logger.log('   - Kiểm tra xem có hiển thị "📚 Bài học hôm nay:" không');
}