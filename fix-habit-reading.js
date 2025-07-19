/**
 * FIX HABIT READING - Khắc phục vấn đề đọc trạng thái habit từ Google Sheet
 * 
 * VẤN ĐỀ PHÁT HIỆN:
 * 1. Config định nghĩa DATA_RANGE: 'C14:AI31' và DATA_START_COL: 'E'
 * 2. Nhưng code analyzeHabits lấy habit name từ rowData[0] (tức cột C)
 * 3. Và lấy dữ liệu completion từ todayColIndex (cũng tính từ cột C)
 * 4. Điều này gây ra sai lệch vì dữ liệu thực tế bắt đầu từ cột E
 * 
 * @version 1.0
 * @author Debug Helper
 * @updated 2025-01-20
 */

/**
 * Hàm analyzeHabits đã được sửa để khắc phục vấn đề
 */
function analyzeHabitsFixed(values, todayColIndex, config) {
  const habits = [];
  
  try {
    // Start from row after date row (skip header rows)
    const startRow = config.dateRow - 14 + 1; // Adjust for array indexing
    
    for (let row = startRow; row < values.length; row++) {
      const rowData = values[row];
      
      // Get habit name from column C (index 0 in our data range C14:AI31)
      const habitName = rowData[0];
      
      // Skip empty rows
      if (!habitName || habitName.toString().trim() === '') {
        continue;
      }
      
      // FIXED: Điều chỉnh todayColIndex để phù hợp với data range
      // Data range C14:AI31 có cột C là habit names, cột D là trống, cột E trở đi là dữ liệu
      // Vậy dữ liệu bắt đầu từ index 2 trong array (C=0, D=1, E=2)
      const dataStartIndex = 2; // Cột E trong range C14:AI31
      const todayValueIndex = dataStartIndex + todayColIndex;
      
      // Get today's completion status
      const todayValue = rowData[todayValueIndex];
      const completed = isHabitCompleted(todayValue);
      
      // Calculate streak với dữ liệu từ cột E trở đi
      const dataOnlyRow = rowData.slice(dataStartIndex);
      const streak = calculateStreakFixed(dataOnlyRow, todayColIndex, completed);
      
      // Get habit statistics
      const stats = calculateHabitStatsFixed(dataOnlyRow, todayColIndex);
      
      habits.push({
        name: habitName.toString().trim(),
        completed: completed,
        streak: streak,
        todayValue: todayValue,
        stats: stats,
        rowIndex: row + 14, // Convert back to sheet row number
        dataStartIndex: dataStartIndex,
        todayValueIndex: todayValueIndex
      });
    }
    
    if (config.debugMode) {
      Logger.log(`✅ Analyzed ${habits.length} habits (FIXED VERSION)`);
      habits.forEach(habit => {
        Logger.log(`  ${habit.completed ? '[DONE]' : '[PENDING]'} ${habit.name} (streak: ${habit.streak})`);
        Logger.log(`    Today's value: "${habit.todayValue}" at index ${habit.todayValueIndex}`);
      });
    }
    
  } catch (error) {
    Logger.log(`Error analyzing habits (FIXED): ${error.message}`);
  }
  
  return habits;
}

/**
 * Calculate habit streak - Fixed version
 */
function calculateStreakFixed(dataOnlyRow, todayColIndex, todayCompleted) {
  let streak = 0;
  
  try {
    // If today is not completed, streak is 0
    if (!todayCompleted) {
      return 0;
    }
    
    // Count backwards from today
    for (let col = todayColIndex; col >= 0; col--) {
      const value = dataOnlyRow[col];
      
      if (isHabitCompleted(value)) {
        streak++;
      } else {
        break; // Streak broken
      }
    }
    
  } catch (error) {
    Logger.log(`Error calculating streak (FIXED): ${error.message}`);
  }
  
  return streak;
}

/**
 * Calculate habit statistics - Fixed version
 */
function calculateHabitStatsFixed(dataOnlyRow, todayColIndex) {
  const stats = {
    totalDays: 0,
    completedDays: 0,
    completionRate: 0,
    longestStreak: 0,
    currentStreak: 0
  };
  
  try {
    // Count total days and completed days up to today
    for (let col = 0; col <= todayColIndex; col++) {
      const value = dataOnlyRow[col];
      
      // Skip empty cells (days that haven't occurred yet)
      if (value !== null && value !== undefined && value !== '') {
        stats.totalDays++;
        
        if (isHabitCompleted(value)) {
          stats.completedDays++;
        }
      }
    }
    
    // Calculate completion rate
    if (stats.totalDays > 0) {
      stats.completionRate = (stats.completedDays / stats.totalDays) * 100;
    }
    
    // Calculate longest streak
    let currentStreak = 0;
    let maxStreak = 0;
    
    for (let col = 0; col <= todayColIndex; col++) {
      const value = dataOnlyRow[col];
      
      if (isHabitCompleted(value)) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    stats.longestStreak = maxStreak;
    stats.currentStreak = calculateStreakFixed(dataOnlyRow, todayColIndex, isHabitCompleted(dataOnlyRow[todayColIndex]));
    
  } catch (error) {
    Logger.log(`Error calculating habit stats (FIXED): ${error.message}`);
  }
  
  return stats;
}

/**
 * Test function để so sánh kết quả cũ và mới
 */
function testFixedVsOriginal() {
  Logger.log('=== TESTING FIXED VS ORIGINAL ===');
  
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
    
    // VẤN ĐỀ: todayColIndex này được tính từ toàn bộ date row (C14:AI14)
    // Nhưng dữ liệu thực tế bắt đầu từ cột E, không phải cột C
    // Vậy cần điều chỉnh todayColIndex cho phù hợp
    
    Logger.log(`📅 Today (${todayDay}) found at column index: ${todayColIndex}`);
    Logger.log(`📅 This corresponds to sheet column: ${String.fromCharCode(67 + todayColIndex)}`);
    
    // Điều chỉnh todayColIndex để phù hợp với dữ liệu bắt đầu từ cột E
    // Cột C = index 0, Cột D = index 1, Cột E = index 2
    // Vậy nếu dữ liệu bắt đầu từ cột E, thì todayColIndex cần trừ đi 2
    const adjustedTodayColIndex = todayColIndex - 2;
    
    Logger.log(`📅 Adjusted today column index for data starting from E: ${adjustedTodayColIndex}`);
    
    if (adjustedTodayColIndex < 0) {
      Logger.log(`❌ Adjusted today column index is negative. Data might not start from column E.`);
      return;
    }
    
    // Test original function
    Logger.log('\n🔴 ORIGINAL RESULTS:');
    const originalHabits = analyzeHabits(values, todayColIndex, config);
    originalHabits.slice(0, 3).forEach(habit => {
      Logger.log(`  ${habit.completed ? '[✅]' : '[❌]'} "${habit.name}" - Value: "${habit.todayValue}"`);
    });
    
    // Test fixed function
    Logger.log('\n🟢 FIXED RESULTS:');
    const fixedHabits = analyzeHabitsFixed(values, adjustedTodayColIndex, config);
    fixedHabits.slice(0, 3).forEach(habit => {
      Logger.log(`  ${habit.completed ? '[✅]' : '[❌]'} "${habit.name}" - Value: "${habit.todayValue}"`);
    });
    
    // So sánh kết quả
    Logger.log('\n📊 COMPARISON:');
    const originalCompleted = originalHabits.filter(h => h.completed).length;
    const fixedCompleted = fixedHabits.filter(h => h.completed).length;
    
    Logger.log(`  Original: ${originalCompleted}/${originalHabits.length} completed`);
    Logger.log(`  Fixed: ${fixedCompleted}/${fixedHabits.length} completed`);
    
    if (fixedCompleted > originalCompleted) {
      Logger.log('  ✅ Fixed version shows more completed habits - this is likely correct!');
    } else if (fixedCompleted < originalCompleted) {
      Logger.log('  ⚠️ Fixed version shows fewer completed habits - need to investigate');
    } else {
      Logger.log('  ➡️ Same results - the issue might be elsewhere');
    }
    
  } catch (error) {
    Logger.log(`❌ Error in testFixedVsOriginal: ${error.message}`);
  }
}

/**
 * Hàm để áp dụng fix vào file chính
 */
function applyFix() {
  Logger.log('=== APPLYING FIX ===');
  Logger.log('⚠️ MANUAL STEP REQUIRED:');
  Logger.log('1. Open habits.js file');
  Logger.log('2. Replace analyzeHabits function with analyzeHabitsFixed');
  Logger.log('3. Replace calculateStreak function with calculateStreakFixed');
  Logger.log('4. Replace calculateHabitStats function with calculateHabitStatsFixed');
  Logger.log('5. Test with testFixedVsOriginal() function');
  Logger.log('');
  Logger.log('Or run testFixedVsOriginal() first to confirm the fix works!');
}