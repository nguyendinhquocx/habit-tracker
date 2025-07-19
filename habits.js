/**
 * HABIT TRACKER - Habits Analysis Module
 * 
 * Core habit tracking logic and data analysis
 * 
 * @version 2.0
 * @author Nguyen Dinh Quoc
 * @updated 2025-01-20
 */

/**
 * Analyze habits from sheet data
 * @param {Array} values - Sheet values array
 * @param {number} todayColIndex - Column index for today
 * @param {Object} config - Configuration object
 * @returns {Array} Array of habit objects
 */
function analyzeHabits(values, todayColIndex, config) {
  const habits = [];
  
  try {
    // Start from row after date row (skip header rows)
    const startRow = config.dateRow - 14 + 1; // Adjust for array indexing
    
    for (let row = startRow; row < values.length; row++) {
      const rowData = values[row];
      
      // Get habit name from column C (index 0 in our data range)
      const habitName = rowData[0];
      
      // Skip empty rows
      if (!habitName || habitName.toString().trim() === '') {
        continue;
      }
      
      // Get today's completion status
      const todayValue = rowData[todayColIndex];
      const completed = isHabitCompleted(todayValue);
      
      // Calculate streak
      const streak = calculateStreak(rowData, todayColIndex, completed);
      
      // Get habit statistics
      const stats = calculateHabitStats(rowData, todayColIndex);
      
      habits.push({
        name: habitName.toString().trim(),
        completed: completed,
        streak: streak,
        todayValue: todayValue,
        stats: stats,
        rowIndex: row + 14 // Convert back to sheet row number
      });
    }
    
    if (config.debugMode) {
      Logger.log(`Analyzed ${habits.length} habits`);
      habits.forEach(habit => {
        Logger.log(`  ${habit.completed ? '[DONE]' : '[PENDING]'} ${habit.name} (streak: ${habit.streak})`);
      });
    }
    
  } catch (error) {
    Logger.log(`Error analyzing habits: ${error.message}`);
  }
  
  return habits;
}

/**
 * Check if a habit is completed based on cell value
 * @param {any} value - Cell value
 * @returns {boolean} True if habit is completed
 */
function isHabitCompleted(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  
  // Handle boolean values
  if (typeof value === 'boolean') {
    return value;
  }
  
  // Handle string values
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim();
    return lowerValue === 'true' || lowerValue === 'yes' || lowerValue === 'x' || lowerValue === '✓';
  }
  
  // Handle numeric values (1 = completed, 0 = not completed)
  if (typeof value === 'number') {
    return value > 0;
  }
  
  // Default to false for unknown types
  return false;
}

/**
 * Calculate habit streak
 * @param {Array} rowData - Row data array
 * @param {number} todayColIndex - Today's column index
 * @param {boolean} todayCompleted - Whether today is completed
 * @returns {number} Streak count
 */
function calculateStreak(rowData, todayColIndex, todayCompleted) {
  let streak = 0;
  
  try {
    // If today is not completed, streak is 0
    if (!todayCompleted) {
      return 0;
    }
    
    // Count backwards from today
    for (let col = todayColIndex; col >= 0; col--) {
      const value = rowData[col];
      
      if (isHabitCompleted(value)) {
        streak++;
      } else {
        break; // Streak broken
      }
    }
    
  } catch (error) {
    Logger.log(`Error calculating streak: ${error.message}`);
  }
  
  return streak;
}

/**
 * Calculate habit statistics
 * @param {Array} rowData - Row data array
 * @param {number} todayColIndex - Today's column index
 * @returns {Object} Statistics object
 */
function calculateHabitStats(rowData, todayColIndex) {
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
      const value = rowData[col];
      
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
      const value = rowData[col];
      
      if (isHabitCompleted(value)) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    stats.longestStreak = maxStreak;
    stats.currentStreak = calculateStreak(rowData, todayColIndex, isHabitCompleted(rowData[todayColIndex]));
    
  } catch (error) {
    Logger.log(`Error calculating habit stats: ${error.message}`);
  }
  
  return stats;
}

/**
 * Mark habit as completed
 * @param {string} habitName - Name of the habit
 * @param {Object} config - Configuration object
 * @returns {Object} Result object with success status and details
 */
function markHabitCompleted(habitName, config) {
  try {
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    const sheet = ss.getSheetByName(config.sheetName);
    
    if (!sheet) {
      return {
        success: false,
        message: `Sheet '${config.sheetName}' not found`,
        habitName: habitName
      };
    }

    const today = new Date();
    const todayDay = today.getDate();
    
    // Get data range
    const dataRange = sheet.getRange(config.dataRange);
    const values = dataRange.getValues();
    
    // Find today's column
    const dateRow = values[config.dateRow - 14];
    let todayColIndex = -1;
    
    for (let col = 0; col < dateRow.length; col++) {
      if (dateRow[col] == todayDay) {
        todayColIndex = col;
        break;
      }
    }
    
    if (todayColIndex === -1) {
      return {
        success: false,
        message: `Column for day ${todayDay} not found`,
        habitName: habitName
      };
    }
    
    // Find habit row
    const startRow = config.dateRow - 14 + 1;
    let habitRowIndex = -1;
    
    for (let row = startRow; row < values.length; row++) {
      const rowHabitName = values[row][0];
      if (rowHabitName && rowHabitName.toString().trim().toLowerCase() === habitName.toLowerCase()) {
        habitRowIndex = row;
        break;
      }
    }
    
    if (habitRowIndex === -1) {
      return {
        success: false,
        message: `Habit '${habitName}' not found`,
        habitName: habitName
      };
    }
    
    // Calculate cell position in sheet
    const sheetRow = habitRowIndex + 14; // Convert back to sheet coordinates
    const sheetCol = todayColIndex + 3; // Adjust for column C start (1-indexed: A=1, B=2, C=3)
    
    // Mark as completed
    const cell = sheet.getRange(sheetRow, sheetCol);
    cell.setValue(true);
    
    // Calculate new streak
    const updatedRowData = values[habitRowIndex];
    updatedRowData[todayColIndex] = true; // Update our local data
    const newStreak = calculateStreak(updatedRowData, todayColIndex, true);
    
    if (config.debugMode) {
      Logger.log(`Marked '${habitName}' as completed at row ${sheetRow}, col ${sheetCol}`);
      Logger.log(`New streak: ${newStreak}`);
    }
    
    return {
      success: true,
      message: `Habit '${habitName}' marked as completed`,
      habitName: habitName,
      streak: newStreak,
      cellPosition: { row: sheetRow, col: sheetCol }
    };
    
  } catch (error) {
    Logger.log(`Error marking habit completed: ${error.message}`);
    return {
      success: false,
      message: `Error: ${error.message}`,
      habitName: habitName
    };
  }
}

/**
 * Ultra-fast habit completion for Slack (optimized for 3-second timeout)
 * @param {string} habitName - Name of the habit
 * @param {Object} config - Configuration object
 * @returns {Object} Result object
 */
function handleCompleteHabitUltraFast(habitName, config) {
  try {
    const startTime = new Date().getTime();
    
    // Open sheet with minimal operations
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    const sheet = ss.getSheetByName(config.sheetName);
    
    if (!sheet) {
      return { success: false, message: 'Sheet not found', habitName };
    }

    const today = new Date();
    const todayDay = today.getDate();
    
    // Read only the necessary ranges
    const dateRowRange = sheet.getRange(`${config.dataStartCol}${config.dateRow}:AI${config.dateRow}`);
    const dateRowValues = dateRowRange.getValues()[0];
    
    // Find today's column quickly
    let todayColIndex = -1;
    for (let col = 0; col < dateRowValues.length; col++) {
      if (dateRowValues[col] == todayDay) {
        todayColIndex = col;
        break;
      }
    }
    
    if (todayColIndex === -1) {
      return { success: false, message: `Day ${todayDay} not found`, habitName };
    }
    
    // Read habit names column
    const habitNamesRange = sheet.getRange(`${config.habitNameCol}16:${config.habitNameCol}31`);
    const habitNames = habitNamesRange.getValues().flat();
    
    // Find habit row quickly
    let habitRowIndex = -1;
    for (let i = 0; i < habitNames.length; i++) {
      if (habitNames[i] && habitNames[i].toString().trim().toLowerCase() === habitName.toLowerCase()) {
        habitRowIndex = i;
        break;
      }
    }
    
    if (habitRowIndex === -1) {
      return { success: false, message: `Habit '${habitName}' not found`, habitName };
    }
    
    // Calculate target cell
    const targetRow = 16 + habitRowIndex; // Start from row 16
    const targetCol = getColumnLetter(5 + todayColIndex); // Start from column E (5)
    
    // Mark as completed
    const targetCell = sheet.getRange(`${targetCol}${targetRow}`);
    targetCell.setValue(true);
    
    // Quick streak calculation (simplified)
    const habitRowRange = sheet.getRange(`${config.dataStartCol}${targetRow}:AI${targetRow}`);
    const habitRowValues = habitRowRange.getValues()[0];
    
    let streak = 0;
    for (let col = todayColIndex; col >= 0; col--) {
      if (isHabitCompleted(habitRowValues[col])) {
        streak++;
      } else {
        break;
      }
    }
    
    const endTime = new Date().getTime();
    const duration = endTime - startTime;
    
    if (config.debugMode) {
      Logger.log(`⚡ Ultra-fast completion: ${duration}ms`);
    }
    
    return {
      success: true,
      message: `Completed in ${duration}ms`,
      habitName: habitName,
      streak: streak
    };
    
  } catch (error) {
    Logger.log(`Ultra-fast error: ${error.message}`);
    return {
      success: false,
      message: error.message,
      habitName: habitName
    };
  }
}

/**
 * Convert column number to letter (1=A, 2=B, etc.)
 * @param {number} columnNumber - Column number (1-indexed)
 * @returns {string} Column letter
 */
function getColumnLetter(columnNumber) {
  let result = '';
  while (columnNumber > 0) {
    columnNumber--;
    result = String.fromCharCode(65 + (columnNumber % 26)) + result;
    columnNumber = Math.floor(columnNumber / 26);
  }
  return result;
}

/**
 * Find today's column index in the sheet
 * @param {Object} sheet - Google Sheet object
 * @param {Object} config - Configuration object
 * @returns {number} Column index (-1 if not found)
 */
function findTodayColumn(sheet, config) {
  try {
    const today = new Date();
    const todayDay = today.getDate();
    
    // Read the date row
    const dateRowRange = sheet.getRange(`${config.dataStartCol}${config.dateRow}:AI${config.dateRow}`);
    const dateRowValues = dateRowRange.getValues()[0];
    
    // Find today's column
    for (let col = 0; col < dateRowValues.length; col++) {
      if (dateRowValues[col] == todayDay) {
        return col;
      }
    }
    
    return -1;
  } catch (error) {
    Logger.log(`Error finding today's column: ${error.message}`);
    return -1;
  }
}

/**
 * Get habit summary statistics
 * @param {Array} habits - Array of habit objects
 * @returns {Object} Summary statistics
 */
function getHabitSummary(habits) {
  const summary = {
    totalHabits: habits.length,
    completedToday: 0,
    pendingToday: 0,
    completionRate: 0,
    averageStreak: 0,
    longestStreak: 0,
    perfectDays: 0
  };
  
  if (habits.length === 0) {
    return summary;
  }
  
  let totalStreak = 0;
  let maxStreak = 0;
  
  habits.forEach(habit => {
    if (habit.completed) {
      summary.completedToday++;
    } else {
      summary.pendingToday++;
    }
    
    totalStreak += habit.streak;
    maxStreak = Math.max(maxStreak, habit.streak);
  });
  
  summary.completionRate = (summary.completedToday / summary.totalHabits) * 100;
  summary.averageStreak = totalStreak / summary.totalHabits;
  summary.longestStreak = maxStreak;
  summary.perfectDays = summary.pendingToday === 0 && summary.completedToday > 0 ? 1 : 0;
  
  return summary;
}

/**
 * Test habit analysis functions
 * @param {Object} config - Configuration object
 */
function testHabitAnalysis(config) {
  Logger.log('=== TESTING HABIT ANALYSIS ===');
  
  try {
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    const sheet = ss.getSheetByName(config.sheetName);
    
    if (!sheet) {
      Logger.log('Sheet not found');
      return false;
    }
    
    // Test finding today's column
    const todayColIndex = findTodayColumn(sheet, config);
    Logger.log(`📅 Today's column index: ${todayColIndex}`);
    
    if (todayColIndex === -1) {
      Logger.log('Could not find today\'s column');
      return false;
    }
    
    // Test habit analysis
    const dataRange = sheet.getRange(config.dataRange);
    const values = dataRange.getValues();
    const habits = analyzeHabits(values, todayColIndex, config);
    
    Logger.log(`Found ${habits.length} habits`);
    
    // Test summary
    const summary = getHabitSummary(habits);
    Logger.log('📈 Summary:', summary);
    
    // Test completion (with first pending habit if any)
    const pendingHabits = habits.filter(h => !h.completed);
    if (pendingHabits.length > 0) {
      const testHabit = pendingHabits[0];
      Logger.log(`🧪 Testing completion of: ${testHabit.name}`);
      
      const result = handleCompleteHabitUltraFast(testHabit.name, config);
      Logger.log('🧪 Completion result:', result);
    }
    
    Logger.log('Habit analysis test completed');
    return true;
    
  } catch (error) {
    Logger.log(`Test failed: ${error.message}`);
    return false;
  }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    analyzeHabits,
    isHabitCompleted,
    calculateStreak,
    calculateHabitStats,
    markHabitCompleted,
    handleCompleteHabitUltraFast,
    findTodayColumn,
    getHabitSummary,
    getColumnLetter,
    testHabitAnalysis
  };
}