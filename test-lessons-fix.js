/**
 * Test script để kiểm tra việc sửa lỗi màu chữ và loại bỏ icon trong bài học
 */

/**
 * Test hiển thị HTML của bài học sau khi sửa
 */
function testLessonsHTMLFix() {
  Logger.log('=== TESTING LESSONS HTML FIX ===');
  
  try {
    // Test với dữ liệu mẫu
    const sampleLessons = [
      { baiHoc: 'Thành công không phải là đích đến mà là hành trình.' },
      { baiHoc: 'Mỗi ngày là một cơ hội mới để trở thành phiên bản tốt hơn của chính mình.' },
      { baiHoc: 'Kiên trì là chìa khóa để vượt qua mọi thử thách.' },
      { baiHoc: 'Hãy tập trung vào tiến bộ, không phải sự hoàn hảo.' }
    ];
    
    // Test HTML generation
    const html = buildLessonsHTML(sampleLessons);
    Logger.log('Generated HTML:');
    Logger.log(html);
    
    // Kiểm tra xem có còn icon không
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(html);
    Logger.log(`Contains emoji/icons: ${hasEmoji ? 'YES (❌ FAILED)' : 'NO (✅ PASSED)'}`);
    
    // Kiểm tra màu chữ
    const hasWhiteColor = html.includes('color: white');
    const hasProperColor = html.includes('color: #333333');
    Logger.log(`Has white color: ${hasWhiteColor ? 'YES (❌ FAILED)' : 'NO (✅ PASSED)'}`);
    Logger.log(`Has proper dark color: ${hasProperColor ? 'YES (✅ PASSED)' : 'NO (❌ FAILED)'}`);
    
    // Test với empty lessons
    const emptyHTML = buildLessonsHTML([]);
    Logger.log('\nEmpty lessons HTML:');
    Logger.log(emptyHTML);
    
    const emptyHasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(emptyHTML);
    Logger.log(`Empty HTML contains emoji: ${emptyHasEmoji ? 'YES (❌ FAILED)' : 'NO (✅ PASSED)'}`);
    
    return {
      htmlGenerated: html.length > 0,
      noEmojis: !hasEmoji,
      properColors: hasProperColor && !hasWhiteColor,
      emptyHandled: emptyHTML.length > 0 && !emptyHasEmoji
    };
    
  } catch (error) {
    Logger.log(`❌ Error in test: ${error.message}`);
    return { error: error.message };
  }
}

/**
 * Test hiển thị text của bài học sau khi sửa
 */
function testLessonsTextFix() {
  Logger.log('\n=== TESTING LESSONS TEXT FIX ===');
  
  try {
    const sampleLessons = [
      { baiHoc: 'Thành công không phải là đích đến mà là hành trình.' },
      { baiHoc: 'Mỗi ngày là một cơ hội mới để trở thành phiên bản tốt hơn của chính mình.' }
    ];
    
    const text = buildLessonsText(sampleLessons);
    Logger.log('Generated Text:');
    Logger.log(text);
    
    // Kiểm tra xem có còn emoji không
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(text);
    Logger.log(`Contains emoji/icons: ${hasEmoji ? 'YES (❌ FAILED)' : 'NO (✅ PASSED)'}`);
    
    // Kiểm tra có bullet point không
    const hasBullet = text.includes('•');
    Logger.log(`Has bullet points: ${hasBullet ? 'YES (✅ PASSED)' : 'NO (❌ FAILED)'}`);
    
    return {
      textGenerated: text.length > 0,
      noEmojis: !hasEmoji,
      hasBullets: hasBullet
    };
    
  } catch (error) {
    Logger.log(`❌ Error in test: ${error.message}`);
    return { error: error.message };
  }
}

/**
 * Test tổng hợp tất cả các sửa đổi
 */
function testAllFixes() {
  Logger.log('\n=== COMPREHENSIVE FIX TEST ===');
  
  const htmlResult = testLessonsHTMLFix();
  const textResult = testLessonsTextFix();
  
  Logger.log('\n=== SUMMARY ===');
  Logger.log(`HTML Test - Generated: ${htmlResult.htmlGenerated}, No Emojis: ${htmlResult.noEmojis}, Proper Colors: ${htmlResult.properColors}`);
  Logger.log(`Text Test - Generated: ${textResult.textGenerated}, No Emojis: ${textResult.noEmojis}, Has Bullets: ${textResult.hasBullets}`);
  
  const allPassed = htmlResult.htmlGenerated && htmlResult.noEmojis && htmlResult.properColors && 
                   textResult.textGenerated && textResult.noEmojis && textResult.hasBullets;
  
  Logger.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return {
    html: htmlResult,
    text: textResult,
    allPassed: allPassed
  };
}

/**
 * Test với dữ liệu thực từ Google Sheet
 */
function testRealDataFix() {
  Logger.log('\n=== TESTING WITH REAL DATA ===');
  
  try {
    // Lấy dữ liệu thực từ sheet
    const lessons = getRandomLessons(4);
    Logger.log(`Found ${lessons.length} real lessons`);
    
    if (lessons.length > 0) {
      const html = buildLessonsHTML(lessons);
      const text = buildLessonsText(lessons);
      
      const htmlHasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(html);
      const textHasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(text);
      const hasProperColor = html.includes('color: #333333');
      
      Logger.log(`Real data HTML has emojis: ${htmlHasEmoji ? 'YES (❌)' : 'NO (✅)'}`);
      Logger.log(`Real data text has emojis: ${textHasEmoji ? 'YES (❌)' : 'NO (✅)'}`);
      Logger.log(`Real data has proper colors: ${hasProperColor ? 'YES (✅)' : 'NO (❌)'}`);
      
      return {
        lessonsFound: lessons.length,
        htmlNoEmojis: !htmlHasEmoji,
        textNoEmojis: !textHasEmoji,
        properColors: hasProperColor
      };
    } else {
      Logger.log('⚠️ No real lessons found to test');
      return { lessonsFound: 0 };
    }
    
  } catch (error) {
    Logger.log(`❌ Error testing real data: ${error.message}`);
    return { error: error.message };
  }
}

// Hàm chạy tất cả test
function runAllFixTests() {
  Logger.log('🔧 RUNNING ALL FIX TESTS 🔧');
  
  testAllFixes();
  testRealDataFix();
  
  Logger.log('\n✅ All fix tests completed!');
}