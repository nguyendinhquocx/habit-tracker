/**
 * HABIT TRACKER - Daily Lessons Module
 * 
 * Module để đọc và quản lý bài học hàng ngày từ Google Sheet
 * 
 * @version 1.0
 * @author Nguyen Dinh Quoc
 * @updated 2025-01-20
 */

/**
 * Đọc dữ liệu bài học từ Google Sheet
 * @param {string} spreadsheetId - ID của Google Sheet
 * @param {string} sheetName - Tên sheet
 * @returns {Array} Mảng các bài học
 */
function getDailyLessons(spreadsheetId = '1yTWfP2PwkBvJ8WYR-d0jeE-OZJaf7snZDdBLI09gXnA', sheetName = 'bai hoc moi ngay') {
  try {
    Logger.log(`📚 Reading daily lessons from sheet: ${sheetName}`);
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log(`❌ Sheet '${sheetName}' not found`);
      return [];
    }
    
    // Lấy dữ liệu từ cột A (ngày) và B (bài học)
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log('⚠️ No data found in sheet');
      return [];
    }
    
    // Đọc dữ liệu từ hàng 2 (bỏ qua header)
    const range = sheet.getRange(2, 1, lastRow - 1, 2);
    const values = range.getValues();
    
    const lessons = [];
    
    values.forEach((row, index) => {
      const [ngay, baiHoc] = row;
      
      // Bỏ qua hàng trống
      if (!baiHoc || baiHoc.toString().trim() === '') {
        return;
      }
      
      lessons.push({
        ngay: ngay ? ngay.toString() : '',
        baiHoc: baiHoc.toString().trim(),
        rowIndex: index + 2 // +2 vì bắt đầu từ hàng 2
      });
    });
    
    Logger.log(`✅ Found ${lessons.length} lessons`);
    return lessons;
    
  } catch (error) {
    Logger.log(`❌ Error reading daily lessons: ${error.message}`);
    return [];
  }
}

/**
 * Lấy ngẫu nhiên một số bài học
 * @param {number} count - Số lượng bài học cần lấy (mặc định 4)
 * @param {string} spreadsheetId - ID của Google Sheet
 * @param {string} sheetName - Tên sheet
 * @returns {Array} Mảng các bài học được chọn ngẫu nhiên
 */
function getRandomLessons(count = 4, spreadsheetId = '1yTWfP2PwkBvJ8WYR-d0jeE-OZJaf7snZDdBLI09gXnA', sheetName = 'bai hoc moi ngay') {
  try {
    const allLessons = getDailyLessons(spreadsheetId, sheetName);
    
    if (allLessons.length === 0) {
      Logger.log('⚠️ No lessons available');
      return [];
    }
    
    // Nếu số bài học ít hơn số lượng yêu cầu, trả về tất cả
    if (allLessons.length <= count) {
      Logger.log(`📚 Returning all ${allLessons.length} lessons`);
      return allLessons;
    }
    
    // Chọn ngẫu nhiên
    const shuffled = [...allLessons].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    Logger.log(`📚 Selected ${selected.length} random lessons`);
    return selected;
    
  } catch (error) {
    Logger.log(`❌ Error getting random lessons: ${error.message}`);
    return [];
  }
}

/**
 * Tạo HTML cho phần bài học động viên
 * @param {Array} lessons - Mảng các bài học
 * @returns {string} HTML content
 */
function buildLessonsHTML(lessons) {
  if (!lessons || lessons.length === 0) {
    return `
      <div style="background: white; padding: 24px; border-radius: 12px; margin: 24px 0; color: #333333; text-align: center; border: 1px solid #e9ecef;">
        <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #333333;">Bài học hôm nay</h3>
        <p style="margin: 0; font-size: 14px; color: #666666;">Mỗi bước nhỏ đều có ý nghĩa. Hãy tiếp tục!</p>
      </div>
    `;
  }
  
  let lessonsHTML = `
    <div style="background: white; padding: 24px; border-radius: 12px; margin: 24px 0; color: #333333; border: 1px solid #e9ecef;">
      <h3 style="margin: 0 0 20px; font-size: 18px; font-weight: 600; text-align: center; color: #333333;">Bài học hôm nay</h3>
  `;
  
  lessons.forEach((lesson, index) => {
    lessonsHTML += `
      <div style="margin-bottom: ${index < lessons.length - 1 ? '16px' : '0'}; padding: 12px; background: #ffffff; border-radius: 8px; border-left: 3px solid #007bff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #333333;">
          ${lesson.baiHoc}
        </p>
      </div>
    `;
  });
  
  lessonsHTML += `
    </div>
  `;
  
  return lessonsHTML;
}

/**
 * Tạo text cho phần bài học động viên (cho plain text email)
 * @param {Array} lessons - Mảng các bài học
 * @returns {string} Plain text content
 */
function buildLessonsText(lessons) {
  if (!lessons || lessons.length === 0) {
    return 'Mỗi bước nhỏ đều có ý nghĩa. Hãy tiếp tục!';
  }
  
  let text = 'BÀI HỌC HÔM NAY\n';
  text += '='.repeat(16) + '\n';
  
  lessons.forEach((lesson, index) => {
    text += `• ${lesson.baiHoc}\n`;
    if (index < lessons.length - 1) {
      text += '\n';
    }
  });
  
  return text;
}

/**
 * Test function để kiểm tra module
 */
function testDailyLessons() {
  Logger.log('=== TESTING DAILY LESSONS MODULE ===');
  
  // Test đọc tất cả bài học
  const allLessons = getDailyLessons();
  Logger.log(`Total lessons: ${allLessons.length}`);
  
  if (allLessons.length > 0) {
    Logger.log('Sample lesson:', allLessons[0]);
  }
  
  // Test lấy ngẫu nhiên 4 bài học
  const randomLessons = getRandomLessons(4);
  Logger.log(`Random lessons: ${randomLessons.length}`);
  
  randomLessons.forEach((lesson, index) => {
    Logger.log(`${index + 1}. ${lesson.baiHoc}`);
  });
  
  // Test tạo HTML
  const html = buildLessonsHTML(randomLessons);
  Logger.log('HTML generated:', html.length > 0 ? 'Success' : 'Failed');
  
  // Test tạo text
  const text = buildLessonsText(randomLessons);
  Logger.log('Text generated:', text.length > 0 ? 'Success' : 'Failed');
  
  return {
    allLessons: allLessons.length,
    randomLessons: randomLessons.length,
    htmlGenerated: html.length > 0,
    textGenerated: text.length > 0
  };
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getDailyLessons,
    getRandomLessons,
    buildLessonsHTML,
    buildLessonsText,
    testDailyLessons
  };
}