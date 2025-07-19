/**
 * TEST FIXES - Kiểm tra các sửa lỗi đã áp dụng
 * 
 * Script này sẽ kiểm tra:
 * 1. Hàm findTodayColumn có tìm đúng cột ngày hôm nay không
 * 2. Hàm analyzeHabits có đọc đúng trạng thái habit không
 * 3. Tính toán streak và stats có chính xác không
 * 
 * @version 1.0
 * @author Assistant
 * @created 2025-01-20
 */

/**
 * Test tổng thể tất cả các sửa lỗi
 */
function testAllFixes() {
  Logger.log('🧪 ===== TESTING ALL FIXES =====');
  
  try {
    const config = getConfig();
    
    if (!config.spreadsheetId) {
      Logger.log('❌ Configuration incomplete. Please run setupConfig() first.');
      return false;
    }
    
    // Test 1: Configuration
    Logger.log('\n📋 Test 1: Configuration');
    testConfiguration(config);
    
    // Test 2: Find Today Column
    Logger.log('\n📅 Test 2: Find Today Column');
    const todayColResult = testFindTodayColumn(config);
    
    if (todayColResult.success) {
      // Test 3: Analyze Habits
      Logger.log('\n🔍 Test 3: Analyze Habits');
      testAnalyzeHabits(config, todayColResult.todayColIndex);
      
      // Test 4: Generate Reports
      Logger.log('\n📊 Test 4: Generate Reports');
      testReportGeneration(config);
    }
    
    Logger.log('\n✅ All tests completed!');
    return true;
    
  } catch (error) {
    Logger.log(`❌ Test failed: ${error.message}`);
    Logger.log(`Stack: ${error.stack}`);
    return false;
  }
}

/**
 * Test cấu hình ứng dụng
 */
function testConfiguration(config) {
  Logger.log(`📋 Spreadsheet ID: ${config.spreadsheetId}`);
  Logger.log(`📋 Sheet Name: ${config.sheetName}`);
  Logger.log(`📋 Data Range: ${config.dataRange}`);
  Logger.log(`📋 Date Row: ${config.dateRow}`);
  Logger.log(`📋 Data Start Col: ${config.dataStartCol}`);
  Logger.log(`📋 Habit Name Col: ${config.habitNameCol}`);
  Logger.log(`📋 Debug Mode: ${config.debugMode}`);
}

/**
 * Test hàm findTodayColumn
 */
function testFindTodayColumn(config) {
  try {
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    const sheet = ss.getSheetByName(config.sheetName);
    
    if (!sheet) {
      Logger.log('❌ Sheet not found!');
      return { success: false };
    }
    
    const today = new Date();
    const todayDay = today.getDate();
    
    Logger.log(`🔍 Looking for day: ${todayDay}`);
    
    // Test the fixed findTodayColumn function
    const todayColIndex = findTodayColumn(sheet, config);
    
    if (todayColIndex === -1) {
      Logger.log(`❌ Today's column not found for day ${todayDay}`);
      
      // Debug: Show what's in the date row
      const dateRowRange = sheet.getRange(`C${config.dateRow}:AI${config.dateRow}`);
      const dateRowValues = dateRowRange.getValues()[0];
      Logger.log(`📅 Date row values: ${dateRowValues.slice(0, 15)}`);
      
      return { success: false };
    }
    
    Logger.log(`✅ Found today's column at index: ${todayColIndex}`);
    
    // Verify the column contains the correct day
    const dateRowRange = sheet.getRange(`C${config.dateRow}:AI${config.dateRow}`);
    const dateRowValues = dateRowRange.getValues()[0];
    const foundDay = dateRowValues[todayColIndex];
    
    Logger.log(`📅 Column ${todayColIndex} contains day: ${foundDay}`);
    
    if (foundDay == todayDay) {
      Logger.log(`✅ Column verification successful!`);
      return { success: true, todayColIndex: todayColIndex };
    } else {
      Logger.log(`❌ Column verification failed! Expected ${todayDay}, got ${foundDay}`);
      return { success: false };
    }
    
  } catch (error) {
    Logger.log(`❌ Error testing findTodayColumn: ${error.message}`);
    return { success: false };
  }
}

/**
 * Test hàm analyzeHabits
 */
function testAnalyzeHabits(config, todayColIndex) {
  try {
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    const sheet = ss.getSheetByName(config.sheetName);
    
    // Get data range
    const dataRange = sheet.getRange(config.dataRange);
    const values = dataRange.getValues();
    
    Logger.log(`📊 Data range: ${config.dataRange}`);
    Logger.log(`📊 Today column index: ${todayColIndex}`);
    
    // Test the fixed analyzeHabits function
    const habits = analyzeHabits(values, todayColIndex, config);
    
    Logger.log(`📊 Found ${habits.length} habits`);
    
    if (habits.length === 0) {
      Logger.log('⚠️ No habits found. Check data range and habit names.');
      return false;
    }
    
    // Show details for first few habits
    const habitsToShow = habits.slice(0, 5);
    habitsToShow.forEach((habit, index) => {
      const status = habit.completed ? '✅' : '❌';
      Logger.log(`${status} ${habit.name}: completed=${habit.completed}, streak=${habit.streak}`);
      
      if (habit.stats) {
        Logger.log(`   📈 Stats: ${habit.stats.completedDays}/${habit.stats.totalDays} days (${habit.stats.completionRate.toFixed(1)}%)`);
      }
    });
    
    // Test summary
    const summary = getHabitSummary(habits);
    Logger.log(`📈 Summary: ${summary.completedToday}/${summary.totalHabits} completed (${summary.completionRate.toFixed(1)}%)`);
    
    return true;
    
  } catch (error) {
    Logger.log(`❌ Error testing analyzeHabits: ${error.message}`);
    return false;
  }
}

/**
 * Test tạo báo cáo
 */
function testReportGeneration(config) {
  try {
    // Test daily report
    Logger.log('📊 Testing daily report generation...');
    const dailyReport = generateDailyReport(config);
    
    if (dailyReport) {
      Logger.log(`✅ Daily report generated successfully`);
      Logger.log(`📅 Date: ${dailyReport.date}`);
      Logger.log(`📊 Habits: ${dailyReport.habits.length}`);
      Logger.log(`📈 Summary: ${dailyReport.summary.completedToday}/${dailyReport.summary.totalHabits}`);
      Logger.log(`⏱️ Generation time: ${dailyReport.generationTime}ms`);
    } else {
      Logger.log('❌ Daily report generation failed');
      return false;
    }
    
    // Test quick report for Slack
    if (config.enableSlack) {
      Logger.log('📱 Testing Slack quick report...');
      const quickReport = generateQuickHabitReport(config);
      
      if (quickReport) {
        Logger.log(`✅ Quick report generated successfully`);
        Logger.log(`📊 Habits: ${quickReport.habits.length}`);
        Logger.log(`📈 Completion: ${quickReport.completionRate.toFixed(1)}%`);
      } else {
        Logger.log('❌ Quick report generation failed');
      }
    }
    
    return true;
    
  } catch (error) {
    Logger.log(`❌ Error testing report generation: ${error.message}`);
    return false;
  }
}

/**
 * Test cụ thể cho vấn đề người dùng báo cáo
 */
function testUserIssue() {
  Logger.log('🐛 ===== TESTING USER ISSUE =====');
  Logger.log('Kiểm tra vấn đề: "tick vào ô trên google sheet rồi nhưng nó thông báo các mục đều là Chưa thực hiện"');
  
  try {
    const config = getAppConfig();
    config.debugMode = true; // Enable debug for detailed logging
    
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    const sheet = ss.getSheetByName(config.sheetName);
    
    if (!sheet) {
      Logger.log('❌ Sheet not found!');
      return false;
    }
    
    // Step 1: Find today's column
    const todayColIndex = findTodayColumn(sheet, config);
    Logger.log(`📅 Today's column index: ${todayColIndex}`);
    
    if (todayColIndex === -1) {
      Logger.log('❌ Cannot find today\'s column');
      return false;
    }
    
    // Step 2: Check what's actually in the sheet
    const dataRange = sheet.getRange(config.dataRange);
    const values = dataRange.getValues();
    
    Logger.log('🔍 Checking actual data in sheet...');
    
    // Show date row
    const dateRowIndex = config.dateRow - 14; // Adjust for array index
    const dateRow = values[dateRowIndex];
    Logger.log(`📅 Date row (index ${dateRowIndex}): ${dateRow.slice(0, 10)}`);
    
    // Show first few habit rows
    const startRow = config.dateRow - 14 + 1;
    for (let row = startRow; row < Math.min(startRow + 5, values.length); row++) {
      const rowData = values[row];
      const habitName = rowData[0];
      
      if (habitName && habitName.toString().trim() !== '') {
        const todayValue = rowData[todayColIndex];
        const isCompleted = isHabitCompleted(todayValue);
        
        Logger.log(`📋 ${habitName}: cell[${todayColIndex}] = "${todayValue}" (type: ${typeof todayValue}) -> completed: ${isCompleted}`);
      }
    }
    
    // Step 3: Test analyzeHabits with debug
    Logger.log('🔍 Testing analyzeHabits with debug...');
    const habits = analyzeHabits(values, todayColIndex, { ...config, debugMode: true });
    
    Logger.log(`📊 Analysis result: ${habits.length} habits found`);
    habits.forEach(habit => {
      Logger.log(`${habit.completed ? '✅' : '❌'} ${habit.name}: ${habit.completed}`);
      Logger.log(`   Debug: todayValueIndex=${habit.todayValueIndex}, todayValue="${habit.todayValue}"`);
    });
    
    return true;
    
  } catch (error) {
    Logger.log(`❌ Error testing user issue: ${error.message}`);
    Logger.log(`Stack: ${error.stack}`);
    return false;
  }
}

/**
 * Chạy test nhanh để kiểm tra vấn đề cụ thể
 */
function quickTest() {
  Logger.log('⚡ ===== QUICK TEST =====');
  
  const config = getAppConfig();
  config.debugMode = true;
  
  // Test user issue specifically
  testUserIssue();
}

/**
 * Simple test to verify index calculation fix
 */
function testIndexFix() {
  Logger.log('🔧 ===== TESTING INDEX FIX =====');
  
  const config = getAppConfig();
  
  try {
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    const sheet = ss.getSheetByName(config.sheetName);
    
    if (!sheet) {
      Logger.log('❌ Sheet not found');
      return;
    }
    
    // Find today's column
    const todayColIndex = findTodayColumn(sheet, config);
    Logger.log(`📅 Today's column index from findTodayColumn: ${todayColIndex}`);
    
    // Get data and analyze
    const dataRange = sheet.getRange(config.dataRange);
    const values = dataRange.getValues();
    
    Logger.log('🔍 Testing with FIXED analyzeHabits...');
    const habits = analyzeHabits(values, todayColIndex, { ...config, debugMode: true });
    
    Logger.log(`\n📊 FINAL RESULTS:`);
    habits.forEach(habit => {
      Logger.log(`${habit.completed ? '✅' : '❌'} ${habit.name}: ${habit.completed}`);
    });
    
    Logger.log('\n🎯 Index fix test completed!');
    
  } catch (error) {
    Logger.log(`❌ Test failed: ${error.message}`);
  }
}

/**
 * Test Slack webhook quickly
 */
function testSlackQuick() {
  Logger.log('=== QUICK SLACK TEST ===');
  
  // Load the test functions
  if (typeof diagnoseSlackWebhook === 'undefined') {
    Logger.log('❌ Slack test functions not loaded. Make sure test-slack-webhook.js is available.');
    return false;
  }
  
  return diagnoseSlackWebhook();
}

/**
 * Test new webhook after update
 */
function testNewWebhook() {
  Logger.log('=== TESTING NEW WEBHOOK ===');
  
  const config = getAppConfig();
  Logger.log(`Current webhook: ${config.slackWebhookUrl}`);
  
  // Check if it's the new webhook
  if (config.slackWebhookUrl.includes('B096GH78DCN')) {
    Logger.log('✅ New webhook URL detected');
  } else {
    Logger.log('⚠️ Old webhook URL still in use');
  }
  
  // Test the webhook
  if (typeof testSlackWebhookOnly === 'function') {
    return testSlackWebhookOnly();
  } else {
    Logger.log('❌ Test function not available. Please load test-slack-webhook.js');
    return false;
  }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testAllFixes,
    testConfiguration,
    testFindTodayColumn,
    testAnalyzeHabits,
    testReportGeneration,
    testUserIssue,
    quickTest
  };
}