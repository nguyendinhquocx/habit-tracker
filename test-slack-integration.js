/**
 * Test tích hợp Slack với bài học hàng ngày
 * File này để test trong Google Apps Script environment
 */

/**
 * Test hàm getMotivationMessage trong Slack với bài học thực
 */
function testSlackMotivationReal() {
  Logger.log('=== TESTING SLACK MOTIVATION WITH REAL DATA ===');
  
  try {
    // Test với các tỷ lệ hoàn thành khác nhau
    const testCases = [
      { isPerfectDay: true, completionRate: 100, description: 'Perfect Day' },
      { isPerfectDay: false, completionRate: 80, description: 'High Completion' },
      { isPerfectDay: false, completionRate: 50, description: 'Medium Completion' },
      { isPerfectDay: false, completionRate: 20, description: 'Low Completion' },
      { isPerfectDay: false, completionRate: 0, description: 'No Completion' }
    ];
    
    testCases.forEach((testCase, index) => {
      Logger.log(`\n--- Test Case ${index + 1}: ${testCase.description} (${testCase.completionRate}%) ---`);
      
      const motivationMessage = getMotivationMessage(testCase.isPerfectDay, testCase.completionRate);
      Logger.log(`Motivation message: ${motivationMessage}`);
      
      // Kiểm tra xem có chứa bài học không
      const hasLessons = motivationMessage.includes('📚 Bài học hôm nay:');
      const hasBullets = motivationMessage.includes('•');
      const isFallback = motivationMessage.includes('Tuyệt vời!') || 
                        motivationMessage.includes('Rất tốt!') || 
                        motivationMessage.includes('Không tệ!') ||
                        motivationMessage.includes('Khởi đầu tốt!') ||
                        motivationMessage.includes('Hôm nay chưa bắt đầu?');
      
      Logger.log(`Contains lessons: ${hasLessons ? 'YES ✅' : 'NO ❌'}`);
      Logger.log(`Has bullet points: ${hasBullets ? 'YES ✅' : 'NO ❌'}`);
      Logger.log(`Using fallback: ${isFallback ? 'YES ⚠️' : 'NO ✅'}`);
      
      if (hasLessons) {
        // Đếm số bài học
        const lessonCount = (motivationMessage.match(/•/g) || []).length;
        Logger.log(`Number of lessons: ${lessonCount}`);
      }
    });
    
    return true;
    
  } catch (error) {
    Logger.log(`❌ Error in test: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
    return false;
  }
}

/**
 * Test toàn bộ Slack message với bài học thực
 */
function testSlackMessageReal() {
  Logger.log('\n=== TESTING COMPLETE SLACK MESSAGE WITH REAL DATA ===');
  
  try {
    // Tạo dữ liệu mẫu giống như thực tế
    const mockReportData = {
      habits: [
        { name: 'Đọc sách 30 phút', completed: true, streak: 5 },
        { name: 'Tập thể dục', completed: false, streak: 0 },
        { name: 'Thiền 10 phút', completed: true, streak: 3 },
        { name: 'Viết nhật ký', completed: false, streak: 0 }
      ],
      completedHabits: [
        { name: 'Đọc sách 30 phút', completed: true, streak: 5 },
        { name: 'Thiền 10 phút', completed: true, streak: 3 }
      ],
      pendingHabits: [
        { name: 'Tập thể dục', completed: false, streak: 0 },
        { name: 'Viết nhật ký', completed: false, streak: 0 }
      ],
      completionRate: 50,
      isPerfectDay: false,
      today: new Date()
    };
    
    const mockConfig = {
      slackChannel: '#habits',
      enableSlack: true
    };
    
    // Tạo Slack message
    const slackMessage = buildSlackMessage(mockReportData, mockConfig);
    
    Logger.log('Generated Slack message structure:');
    Logger.log(`Channel: ${slackMessage.channel}`);
    Logger.log(`Number of blocks: ${slackMessage.blocks ? slackMessage.blocks.length : 0}`);
    
    // Kiểm tra các thành phần
    const hasBlocks = slackMessage.blocks && slackMessage.blocks.length > 0;
    Logger.log(`Has blocks: ${hasBlocks ? 'YES ✅' : 'NO ❌'}`);
    
    if (hasBlocks) {
      // Tìm motivation section
      const motivationBlock = slackMessage.blocks.find(block => 
        block.type === 'section' && 
        block.text && 
        (block.text.text.includes('📚 Bài học hôm nay:') || 
         block.text.text.includes('Tuyệt vời!') ||
         block.text.text.includes('Rất tốt!') ||
         block.text.text.includes('Không tệ!'))
      );
      
      if (motivationBlock) {
        Logger.log('✅ Found motivation block:');
        Logger.log(`Text: ${motivationBlock.text.text}`);
        
        const hasLessons = motivationBlock.text.text.includes('📚 Bài học hôm nay:');
        const lessonCount = hasLessons ? (motivationBlock.text.text.match(/•/g) || []).length : 0;
        
        Logger.log(`Contains lessons: ${hasLessons ? 'YES ✅' : 'NO (using fallback) ⚠️'}`);
        if (hasLessons) {
          Logger.log(`Number of lessons: ${lessonCount}`);
        }
      } else {
        Logger.log('❌ No motivation block found');
      }
      
      // Kiểm tra các block khác
      const headerBlock = slackMessage.blocks.find(block => block.type === 'header');
      const sectionBlocks = slackMessage.blocks.filter(block => block.type === 'section');
      const actionBlocks = slackMessage.blocks.filter(block => block.type === 'actions');
      
      Logger.log(`Header blocks: ${headerBlock ? 1 : 0}`);
      Logger.log(`Section blocks: ${sectionBlocks.length}`);
      Logger.log(`Action blocks: ${actionBlocks.length}`);
    }
    
    return {
      hasBlocks: hasBlocks,
      messageGenerated: true,
      blockCount: slackMessage.blocks ? slackMessage.blocks.length : 0
    };
    
  } catch (error) {
    Logger.log(`❌ Error testing Slack message: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
    return { error: error.message };
  }
}

/**
 * Test đọc bài học trực tiếp
 */
function testLessonsDirectly() {
  Logger.log('\n=== TESTING LESSONS READING DIRECTLY ===');
  
  try {
    // Test đọc tất cả bài học
    Logger.log('1. Testing getDailyLessons()...');
    const allLessons = getDailyLessons();
    Logger.log(`✅ Found ${allLessons.length} total lessons`);
    
    if (allLessons.length > 0) {
      Logger.log('Sample lesson:', JSON.stringify(allLessons[0], null, 2));
    }
    
    // Test lấy ngẫu nhiên
    Logger.log('\n2. Testing getRandomLessons(2)...');
    const randomLessons = getRandomLessons(2);
    Logger.log(`✅ Got ${randomLessons.length} random lessons`);
    
    randomLessons.forEach((lesson, index) => {
      Logger.log(`Lesson ${index + 1}: "${lesson.baiHoc}" - ${lesson.tacGia}`);
    });
    
    return {
      totalLessons: allLessons.length,
      randomLessons: randomLessons.length,
      success: true
    };
    
  } catch (error) {
    Logger.log(`❌ Error testing lessons: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
    return { error: error.message, success: false };
  }
}

/**
 * Test tổng hợp tất cả
 */
function testSlackLessonsIntegrationComplete() {
  Logger.log('🧪 COMPLETE SLACK LESSONS INTEGRATION TEST 🧪');
  Logger.log('='.repeat(60));
  
  const lessonsTest = testLessonsDirectly();
  const motivationTest = testSlackMotivationReal();
  const messageTest = testSlackMessageReal();
  
  Logger.log('\n=== FINAL SUMMARY ===');
  Logger.log(`Lessons Reading: ${lessonsTest.success ? '✅ PASSED' : '❌ FAILED'}`);
  if (lessonsTest.success) {
    Logger.log(`  - Total lessons available: ${lessonsTest.totalLessons}`);
    Logger.log(`  - Random lessons retrieved: ${lessonsTest.randomLessons}`);
  }
  
  Logger.log(`Motivation Test: ${motivationTest ? '✅ PASSED' : '❌ FAILED'}`);
  Logger.log(`Message Test: ${messageTest.messageGenerated ? '✅ PASSED' : '❌ FAILED'}`);
  if (messageTest.messageGenerated) {
    Logger.log(`  - Blocks generated: ${messageTest.blockCount}`);
  }
  
  const allPassed = lessonsTest.success && motivationTest && messageTest.messageGenerated;
  Logger.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    Logger.log('\n🎉 Tích hợp bài học vào Slack đã sẵn sàng!');
    Logger.log('💡 Để test trong Slack thật:');
    Logger.log('   1. Gõ /habit-report trong Slack channel');
    Logger.log('   2. Hoặc chạy sendSlackReport() để gửi báo cáo tự động');
    Logger.log('   3. Kiểm tra xem có hiển thị "📚 Bài học hôm nay:" không');
  } else {
    Logger.log('\n⚠️ Cần kiểm tra lại:');
    if (!lessonsTest.success) {
      Logger.log('   - Kết nối đến Google Sheet bài học');
      Logger.log('   - Cấu trúc dữ liệu trong sheet "bai hoc moi ngay"');
    }
    if (!motivationTest) {
      Logger.log('   - Hàm getMotivationMessage trong slack.js');
    }
    if (!messageTest.messageGenerated) {
      Logger.log('   - Hàm buildSlackMessage trong slack.js');
    }
  }
  
  return {
    lessons: lessonsTest,
    motivation: motivationTest,
    message: messageTest,
    allPassed: allPassed
  };
}

/**
 * Test nhanh chỉ motivation
 */
function quickTestSlackLessonsReal() {
  Logger.log('⚡ QUICK TEST SLACK LESSONS (REAL) ⚡');
  
  try {
    const message = getMotivationMessage(false, 75);
    Logger.log(`Motivation message: ${message}`);
    
    const hasLessons = message.includes('📚 Bài học hôm nay:');
    Logger.log(`Result: ${hasLessons ? '✅ USING LESSONS' : '⚠️ USING FALLBACK'}`);
    
    if (hasLessons) {
      const lessonCount = (message.match(/•/g) || []).length;
      Logger.log(`Number of lessons: ${lessonCount}`);
    }
    
    return hasLessons;
    
  } catch (error) {
    Logger.log(`❌ Error: ${error.message}`);
    return false;
  }
}

/**
 * Hướng dẫn sử dụng
 */
function showSlackTestInstructions() {
  Logger.log('📋 SLACK INTEGRATION TEST INSTRUCTIONS');
  Logger.log('======================================');
  Logger.log('1. quickTestSlackLessonsReal() - Test nhanh motivation message');
  Logger.log('2. testLessonsDirectly() - Test đọc bài học từ Google Sheet');
  Logger.log('3. testSlackMotivationReal() - Test chi tiết motivation với các tỷ lệ');
  Logger.log('4. testSlackMessageReal() - Test toàn bộ Slack message');
  Logger.log('5. testSlackLessonsIntegrationComplete() - Test tổng hợp tất cả');
  Logger.log('');
  Logger.log('💡 Để test trong Slack thật:');
  Logger.log('   - Đảm bảo đã cấu hình Slack webhook URL');
  Logger.log('   - Gõ /habit-report trong Slack channel');
  Logger.log('   - Hoặc chạy sendSlackReport() với dữ liệu thật');
  Logger.log('   - Kiểm tra xem có hiển thị "📚 Bài học hôm nay:" không');
}