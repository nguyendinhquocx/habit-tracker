/**
 * DEBUG SHEET READING - Kiểm tra cách ứng dụng đọc dữ liệu từ Google Sheet
 * 
 * @version 1.0
 * @author Debug Helper
 * @updated 2025-01-20
 */

/**
 * Debug function để kiểm tra cách đọc dữ liệu từ sheet
 */
function debugSheetReading() {
  Logger.log('=== DEBUG SHEET READING ===');
  
  try {
    const config = getAppConfig();
    Logger.log(`📋 Config:`);
    Logger.log(`  Spreadsheet ID: ${config.spreadsheetId}`);
    Logger.log(`  Sheet Name: ${config.sheetName}`);
    Logger.log(`  Data Range: ${config.dataRange}`);
    Logger.log(`  Date Row: ${config.dateRow}`);
    Logger.log(`  Habit Name Col: ${config.habitNameCol}`);
    
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    const sheet = ss.getSheetByName(config.sheetName);
    
    if (!sheet) {
      Logger.log('❌ Sheet not found!');
      return;
    }
    
    Logger.log('✅ Sheet found successfully');
    
    // Lấy dữ liệu từ data range
    const dataRange = sheet.getRange(config.dataRange);
    const values = dataRange.getValues();
    
    Logger.log(`📊 Data Range ${config.dataRange} contains ${values.length} rows`);
    
    // Kiểm tra date row
    const dateRowIndex = config.dateRow - 14; // Convert to array index
    Logger.log(`\n📅 Date Row (row ${config.dateRow}, array index ${dateRowIndex}):`);
    if (dateRowIndex >= 0 && dateRowIndex < values.length) {
      const dateRow = values[dateRowIndex];
      Logger.log(`  Date row data: [${dateRow.slice(0, 10).join(', ')}...]`);
      
      // Tìm cột của ngày hôm nay
      const today = new Date();
      const todayDay = today.getDate();
      Logger.log(`  Looking for today: ${todayDay}`);
      
      let todayColIndex = -1;
      for (let col = 0; col < dateRow.length; col++) {
        if (dateRow[col] == todayDay) {
          todayColIndex = col;
          Logger.log(`  ✅ Found today at column index: ${col} (sheet column: ${String.fromCharCode(67 + col)})`);
          break;
        }
      }
      
      if (todayColIndex === -1) {
        Logger.log(`  ❌ Today (${todayDay}) not found in date row`);
      }
    } else {
      Logger.log(`  ❌ Date row index ${dateRowIndex} is out of bounds`);
    }
    
    // Kiểm tra habit names
    Logger.log(`\n📝 Habit Names:`);
    const startRow = config.dateRow - 14 + 1; // Start from row after date row
    Logger.log(`  Starting from array index: ${startRow} (sheet row: ${startRow + 14})`);
    
    for (let row = startRow; row < Math.min(startRow + 10, values.length); row++) {
      const rowData = values[row];
      const habitName = rowData[0]; // Column C is index 0 in data range C14:AI31
      const sheetRow = row + 14;
      
      if (habitName && habitName.toString().trim() !== '') {
        Logger.log(`  Row ${sheetRow}: "${habitName}"`);
        
        // Kiểm tra giá trị hôm nay cho habit này
        if (todayColIndex >= 0) {
          const todayValue = rowData[todayColIndex];
          const completed = isHabitCompleted(todayValue);
          Logger.log(`    Today's value: "${todayValue}" (type: ${typeof todayValue}) -> Completed: ${completed}`);
        }
      } else {
        Logger.log(`  Row ${sheetRow}: [EMPTY]`);
      }
    }
    
    // Kiểm tra một vài ô cụ thể
    Logger.log(`\n🔍 Sample Cell Values:`);
    const sampleCells = ['C16', 'D16', 'E16', 'F16'];
    sampleCells.forEach(cellAddress => {
      try {
        const cellValue = sheet.getRange(cellAddress).getValue();
        Logger.log(`  ${cellAddress}: "${cellValue}" (type: ${typeof cellValue})`);
      } catch (error) {
        Logger.log(`  ${cellAddress}: ERROR - ${error.message}`);
      }
    });
    
  } catch (error) {
    Logger.log(`❌ Error in debugSheetReading: ${error.message}`);
    Logger.log(`Error stack: ${error.stack}`);
  }
}

/**
 * Debug function để kiểm tra isHabitCompleted với các giá trị khác nhau
 */
function debugHabitCompletedLogic() {
  Logger.log('=== DEBUG HABIT COMPLETED LOGIC ===');
  
  const testValues = [
    true,
    false,
    'TRUE',
    'true',
    'True',
    'FALSE',
    'false',
    'False',
    '✓',
    '✗',
    'x',
    'X',
    'yes',
    'YES',
    'no',
    'NO',
    1,
    0,
    2,
    -1,
    '',
    null,
    undefined,
    ' ',
    'random text'
  ];
  
  Logger.log('Testing isHabitCompleted function:');
  testValues.forEach(value => {
    const result = isHabitCompleted(value);
    Logger.log(`  "${value}" (${typeof value}) -> ${result}`);
  });
}

/**
 * Debug function để test analyzeHabits với dữ liệu thực
 */
function debugAnalyzeHabits() {
  Logger.log('=== DEBUG ANALYZE HABITS ===');
  
  try {
    const config = getAppConfig();
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    const sheet = ss.getSheetByName(config.sheetName);
    
    if (!sheet) {
      Logger.log('❌ Sheet not found!');
      return;
    }
    
    // Lấy dữ liệu
    const dataRange = sheet.getRange(config.dataRange);
    const values = dataRange.getValues();
    
    // Tìm cột hôm nay
    const today = new Date();
    const todayDay = today.getDate();
    const dateRow = values[config.dateRow - 14];
    
    let todayColIndex = -1;
    for (let col = 0; col < dateRow.length; col++) {
      if (dateRow[col] == todayDay) {
        todayColIndex = col;
        break;
      }
    }
    
    if (todayColIndex === -1) {
      Logger.log(`❌ Today (${todayDay}) not found in date row`);
      return;
    }
    
    Logger.log(`✅ Today found at column index: ${todayColIndex}`);
    
    // Gọi analyzeHabits
    const habits = analyzeHabits(values, todayColIndex, config);
    
    Logger.log(`\n📊 Analyzed ${habits.length} habits:`);
    habits.forEach((habit, index) => {
      Logger.log(`  ${index + 1}. ${habit.completed ? '[✅]' : '[❌]'} "${habit.name}"`);
      Logger.log(`     Today's value: "${habit.todayValue}" (type: ${typeof habit.todayValue})`);
      Logger.log(`     Streak: ${habit.streak}`);
    });
    
  } catch (error) {
    Logger.log(`❌ Error in debugAnalyzeHabits: ${error.message}`);
  }
}

/**
 * Chạy tất cả debug functions
 */
function runAllDebugTests() {
  Logger.log('🚀 RUNNING ALL DEBUG TESTS\n');
  
  debugSheetReading();
  Logger.log('\n' + '='.repeat(50) + '\n');
  
  debugHabitCompletedLogic();
  Logger.log('\n' + '='.repeat(50) + '\n');
  
  debugAnalyzeHabits();
  
  Logger.log('\n🏁 ALL DEBUG TESTS COMPLETED');
}