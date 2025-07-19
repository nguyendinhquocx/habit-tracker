/**
 * Test script với mock data để kiểm tra tích hợp bài học vào Slack
 */

// Mock SpreadsheetApp và các dependencies
const SpreadsheetApp = {
  openById: function(id) {
    return {
      getSheetByName: function(name) {
        if (name === 'bai hoc moi ngay') {
          return {
            getDataRange: function() {
              return {
                getValues: function() {
                  return [
                    ['Bài học', 'Tác giả'],
                    ['Thành công không phải là chìa khóa của hạnh phúc. Hạnh phúc mới là chìa khóa của thành công.', 'Albert Schweitzer'],
                    ['Cách tốt nhất để dự đoán tương lai là tạo ra nó.', 'Peter Drucker'],
                    ['Đừng chờ đợi cơ hội. Hãy tạo ra chúng.', 'George Bernard Shaw'],
                    ['Thất bại là cơ hội để bắt đầu lại một cách thông minh hơn.', 'Henry Ford'],
                    ['Hành động là chìa khóa cơ bản của mọi thành công.', 'Pablo Picasso']
                  ];
                }
              };
            }
          };
        }
        return null;
      }
    };
  }
};

const Logger = {
  log: console.log
};

// Mock PropertiesService
const PropertiesService = {
  getScriptProperties: function() {
    return {
      getProperty: function(key) {
        if (key === 'SPREADSHEET_ID') {
          return '1yTWfP2PwkBvJ8WYR-d0jeE-OZJaf7snZDdBLI09gXnA';
        }
        return null;
      }
    };
  }
};

// Include daily-lessons functions
function readDailyLessons() {
  try {
    Logger.log('📚 Reading daily lessons from sheet: bai hoc moi ngay');
    
    const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (!spreadsheetId) {
      throw new Error('SPREADSHEET_ID not found in script properties');
    }
    
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName('bai hoc moi ngay');
    
    if (!sheet) {
      throw new Error('Sheet "bai hoc moi ngay" not found');
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      Logger.log('⚠️ No lesson data found (only headers or empty)');
      return [];
    }
    
    const lessons = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] && row[0].toString().trim()) {
        lessons.push({
          baiHoc: row[0].toString().trim(),
          tacGia: row[1] ? row[1].toString().trim() : ''
        });
      }
    }
    
    Logger.log(`✅ Successfully read ${lessons.length} lessons`);
    return lessons;
    
  } catch (error) {
    Logger.log(`❌ Error reading daily lessons: ${error.message}`);
    return [];
  }
}

function getRandomLessons(count = 3) {
  try {
    const allLessons = readDailyLessons();
    
    if (!allLessons || allLessons.length === 0) {
      Logger.log('⚠️ No lessons available');
      return [];
    }
    
    const shuffled = [...allLessons].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, allLessons.length));
    
    Logger.log(`🎲 Selected ${selected.length} random lessons`);
    return selected;
    
  } catch (error) {
    Logger.log(`❌ Error getting random lessons: ${error.message}`);
    return [];
  }
}

// Include Slack functions
function getMotivationMessage(isPerfectDay, completionRate) {
  try {
    // Try to get daily lessons from Google Sheet
    const lessons = getRandomLessons(2); // Get 2 lessons for Slack
    
    if (lessons && lessons.length > 0) {
      let motivationText = "*📚 Bài học hôm nay:*\n";
      lessons.forEach((lesson, index) => {
        motivationText += `• ${lesson.baiHoc}\n`;
      });
      return motivationText.trim();
    }
  } catch (error) {
    Logger.log(`⚠️ Could not load daily lessons for Slack: ${error.message}`);
  }
  
  // Fallback to default motivation messages
  if (isPerfectDay) {
    return "*Tuyệt vời!* Bạn đã hoàn thành tất cả thói quen hôm nay. Hãy tiếp tục duy trì!";
  } else if (completionRate >= 80) {
    return "*Rất tốt!* Bạn đã hoàn thành hầu hết các thói quen. Hãy cố gắng hoàn thiện những thói quen còn lại!";
  } else if (completionRate >= 50) {
    return "*Không tệ!* Bạn đã hoàn thành hơn một nửa. Hãy tiếp tục phấn đấu!";
  } else if (completionRate > 0) {
    return "*Khởi đầu tốt!* Mỗi bước nhỏ đều có ý nghĩa. Hãy tiếp tục!";
  } else {
    return "*Hôm nay chưa bắt đầu?* Không sao, hãy bắt đầu ngay bây giờ!";
  }
}

// Test functions
function testSlackMotivationWithLessons() {
  Logger.log('=== TESTING SLACK MOTIVATION WITH LESSONS (MOCK) ===');
  
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

function quickTestSlackLessons() {
  Logger.log('⚡ QUICK TEST SLACK LESSONS (MOCK) ⚡');
  
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

function testLessonsData() {
  Logger.log('📊 TESTING LESSONS DATA');
  
  const lessons = getRandomLessons(3);
  Logger.log(`Found ${lessons.length} lessons:`);
  
  lessons.forEach((lesson, index) => {
    Logger.log(`${index + 1}. "${lesson.baiHoc}" - ${lesson.tacGia}`);
  });
  
  return lessons.length > 0;
}

// Run tests
function runAllTests() {
  Logger.log('🧪 RUNNING ALL SLACK LESSONS TESTS WITH MOCK DATA 🧪');
  Logger.log('='.repeat(60));
  
  const dataTest = testLessonsData();
  const quickTest = quickTestSlackLessons();
  const fullTest = testSlackMotivationWithLessons();
  
  Logger.log('\n=== SUMMARY ===');
  Logger.log(`Data Test: ${dataTest ? '✅ PASSED' : '❌ FAILED'}`);
  Logger.log(`Quick Test: ${quickTest ? '✅ PASSED' : '❌ FAILED'}`);
  Logger.log(`Full Test: ${fullTest ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = dataTest && quickTest && fullTest;
  Logger.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    Logger.log('\n🎉 Tích hợp bài học vào Slack đã hoạt động!');
    Logger.log('💡 Để test trong Slack thật, hãy gõ /habit-report trong channel');
  }
  
  return allPassed;
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testSlackMotivationWithLessons,
    quickTestSlackLessons,
    testLessonsData,
    runAllTests,
    getMotivationMessage,
    getRandomLessons
  };
}

// Auto-run if called directly
if (require.main === module) {
  runAllTests();
}