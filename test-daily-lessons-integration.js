/**
 * HABIT TRACKER - Test Daily Lessons Integration
 * 
 * Test file để kiểm tra tích hợp bài học hàng ngày vào email
 * 
 * @version 1.0
 * @author Nguyen Dinh Quoc
 * @updated 2025-01-20
 */

/**
 * Test tích hợp bài học vào email
 */
function testDailyLessonsIntegration() {
  Logger.log('=== TESTING DAILY LESSONS INTEGRATION ===');
  
  try {
    // 1. Test đọc bài học từ Google Sheet
    Logger.log('\n📚 Step 1: Testing lesson reading...');
    const allLessons = getDailyLessons();
    Logger.log(`✅ Found ${allLessons.length} lessons in total`);
    
    if (allLessons.length > 0) {
      Logger.log('Sample lesson:', allLessons[0]);
    }
    
    // 2. Test lấy ngẫu nhiên bài học
    Logger.log('\n🎲 Step 2: Testing random lesson selection...');
    const randomLessons = getRandomLessons(4);
    Logger.log(`✅ Selected ${randomLessons.length} random lessons`);
    
    randomLessons.forEach((lesson, index) => {
      Logger.log(`${index + 1}. ${lesson.baiHoc}`);
    });
    
    // 3. Test tạo HTML cho bài học
    Logger.log('\n🎨 Step 3: Testing HTML generation...');
    const lessonsHTML = buildLessonsHTML(randomLessons);
    Logger.log(`✅ HTML generated (${lessonsHTML.length} characters)`);
    
    // 4. Test tạo text cho bài học
    Logger.log('\n📝 Step 4: Testing text generation...');
    const lessonsText = buildLessonsText(randomLessons);
    Logger.log(`✅ Text generated (${lessonsText.length} characters)`);
    Logger.log('Text preview:', lessonsText.substring(0, 100) + '...');
    
    // 5. Test motivation section với bài học
    Logger.log('\n💡 Step 5: Testing motivation section...');
    const motivationHTML = buildMotivationSection(false, 75, { sectionTitle: '#333' });
    Logger.log(`✅ Motivation section generated (${motivationHTML.length} characters)`);
    
    // 6. Test email hoàn chỉnh với bài học
    Logger.log('\n📧 Step 6: Testing complete email with lessons...');
    const testResult = testEmailWithLessons();
    
    Logger.log('\n=== INTEGRATION TEST SUMMARY ===');
    Logger.log(`📚 Lessons available: ${allLessons.length}`);
    Logger.log(`🎲 Random lessons selected: ${randomLessons.length}`);
    Logger.log(`🎨 HTML generation: ${lessonsHTML.length > 0 ? 'Success' : 'Failed'}`);
    Logger.log(`📝 Text generation: ${lessonsText.length > 0 ? 'Success' : 'Failed'}`);
    Logger.log(`💡 Motivation section: ${motivationHTML.length > 0 ? 'Success' : 'Failed'}`);
    Logger.log(`📧 Email test: ${testResult ? 'Success' : 'Failed'}`);
    
    return {
      lessonsCount: allLessons.length,
      randomLessonsCount: randomLessons.length,
      htmlGenerated: lessonsHTML.length > 0,
      textGenerated: lessonsText.length > 0,
      motivationGenerated: motivationHTML.length > 0,
      emailTestPassed: testResult
    };
    
  } catch (error) {
    Logger.log(`❌ Integration test failed: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
    return false;
  }
}

/**
 * Test email với bài học
 */
function testEmailWithLessons() {
  try {
    Logger.log('\n📧 Testing email generation with lessons...');
    
    // Mock data cho test
    const mockData = {
      habits: [
        { name: 'Đọc sách', completed: true, time: '07:00' },
        { name: 'Tập thể dục', completed: true, time: '06:30' },
        { name: 'Thiền', completed: false, time: '21:00' },
        { name: 'Viết nhật ký', completed: false, time: '22:00' }
      ],
      date: new Date(),
      completionRate: 50
    };
    
    // Tính toán dữ liệu email
    const completedHabits = mockData.habits.filter(h => h.completed);
    const pendingHabits = mockData.habits.filter(h => !h.completed);
    const isPerfectDay = pendingHabits.length === 0;
    
    const emailData = {
      subject: `📊 Báo cáo thói quen - ${mockData.date.toLocaleDateString('vi-VN')}`,
      detailedDate: mockData.date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      completedHabits,
      pendingHabits,
      habits: mockData.habits,
      completionRate: mockData.completionRate,
      isPerfectDay,
      colors: {
        sectionTitle: '#333333',
        pendingTitle: '#ff6b6b'
      }
    };
    
    // Test HTML email
    const htmlEmail = buildEmailTemplate(emailData);
    Logger.log(`✅ HTML email generated (${htmlEmail.length} characters)`);
    
    // Test plain text email
    const textEmail = buildPlainTextEmail(emailData);
    Logger.log(`✅ Plain text email generated (${textEmail.length} characters)`);
    
    // Kiểm tra xem email có chứa bài học không
    const containsLessons = htmlEmail.includes('Bài học hôm nay') || textEmail.includes('BÀI HỌC HÔM NAY');
    Logger.log(`📚 Email contains lessons: ${containsLessons ? 'Yes' : 'No'}`);
    
    return true;
    
  } catch (error) {
    Logger.log(`❌ Email test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test nhanh chỉ bài học
 */
function quickTestLessons() {
  Logger.log('=== QUICK LESSONS TEST ===');
  
  const lessons = getRandomLessons(4);
  Logger.log(`Found ${lessons.length} lessons:`);
  
  lessons.forEach((lesson, index) => {
    Logger.log(`${index + 1}. ${lesson.baiHoc}`);
  });
  
  return lessons.length > 0;
}

/**
 * Test với Google Sheet ID và sheet name tùy chỉnh
 */
function testCustomSheet(spreadsheetId, sheetName) {
  Logger.log(`=== TESTING CUSTOM SHEET: ${sheetName} ===`);
  
  try {
    const lessons = getDailyLessons(spreadsheetId, sheetName);
    Logger.log(`✅ Found ${lessons.length} lessons in custom sheet`);
    
    if (lessons.length > 0) {
      const randomLessons = getRandomLessons(2, spreadsheetId, sheetName);
      Logger.log(`🎲 Random selection: ${randomLessons.length} lessons`);
      
      randomLessons.forEach((lesson, index) => {
        Logger.log(`${index + 1}. ${lesson.baiHoc}`);
      });
    }
    
    return lessons.length > 0;
    
  } catch (error) {
    Logger.log(`❌ Custom sheet test failed: ${error.message}`);
    return false;
  }
}

/**
 * Hướng dẫn sử dụng
 */
function showUsageInstructions() {
  Logger.log('=== DAILY LESSONS INTEGRATION - USAGE INSTRUCTIONS ===');
  Logger.log('');
  Logger.log('📚 Available Test Functions:');
  Logger.log('1. testDailyLessonsIntegration() - Test tích hợp đầy đủ');
  Logger.log('2. quickTestLessons() - Test nhanh bài học');
  Logger.log('3. testEmailWithLessons() - Test email với bài học');
  Logger.log('4. testCustomSheet(id, name) - Test sheet tùy chỉnh');
  Logger.log('');
  Logger.log('🔧 Configuration:');
  Logger.log('- Google Sheet ID: 1yTWfP2PwkBvJ8WYR-d0jeE-OZJaf7snZDdBLI09gXnA');
  Logger.log('- Sheet Name: bai hoc moi ngay');
  Logger.log('- Lessons per email: 4');
  Logger.log('');
  Logger.log('📧 Integration Points:');
  Logger.log('- HTML emails: buildMotivationSection() uses buildLessonsHTML()');
  Logger.log('- Plain text emails: buildPlainTextEmail() uses buildLessonsText()');
  Logger.log('');
  Logger.log('🚀 To run full test: testDailyLessonsIntegration()');
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testDailyLessonsIntegration,
    testEmailWithLessons,
    quickTestLessons,
    testCustomSheet,
    showUsageInstructions
  };
}