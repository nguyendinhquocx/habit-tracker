/**
 * HABIT TRACKER - Reports Module
 * 
 * Report generation and data analysis
 * 
 * @version 2.0
 * @author Nguyen Dinh Quoc
 * @updated 2025-01-20
 */

/**
 * Generate daily habit report
 * @param {Object} config - Configuration object
 * @returns {Object} Report data object
 */
function generateDailyReport(config) {
  const startTime = new Date().getTime();
  
  try {
    Logger.log('Generating daily habit report...');
    
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    const sheet = ss.getSheetByName(config.sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet '${config.sheetName}' not found`);
    }

    // Get current date info
    const today = new Date();
    const todayDay = today.getDate();
    const monthYear = Utilities.formatDate(today, Session.getScriptTimeZone(), 'MMMM yyyy');
    
    // Get data range
    const dataRange = sheet.getRange(config.dataRange);
    const values = dataRange.getValues();
    
    // Find today's column
    const todayColIndex = findTodayColumn(sheet, config);
    
    if (todayColIndex === -1) {
      throw new Error(`Column for day ${todayDay} not found`);
    }
    
    // Analyze habits
    const habits = analyzeHabits(values, todayColIndex, config);
    const summary = getHabitSummary(habits);
    
    // Generate report data
    const reportData = {
      date: today,
      monthYear: monthYear,
      todayDay: todayDay,
      habits: habits,
      summary: summary,
      generatedAt: new Date(),
      generationTime: new Date().getTime() - startTime
    };
    
    if (config.debugMode) {
      Logger.log(`Report generated in ${reportData.generationTime}ms`);
      Logger.log(`📈 Summary: ${summary.completedToday}/${summary.totalHabits} habits completed`);
    }
    
    return reportData;
    
  } catch (error) {
    Logger.log(`Error generating daily report: ${error.message}`);
    throw error;
  }
}

/**
 * Generate weekly habit report
 * @param {Object} config - Configuration object
 * @returns {Object} Weekly report data
 */
function generateWeeklyReport(config) {
  try {
    Logger.log('Generating weekly habit report...');
    
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    const sheet = ss.getSheetByName(config.sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet '${config.sheetName}' not found`);
    }

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    
    const dataRange = sheet.getRange(config.dataRange);
    const values = dataRange.getValues();
    
    // Get date row to map columns to dates
    const dateRow = values[config.dateRow - 14];
    
    // Find columns for this week
    const weekColumns = [];
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(weekStart);
      checkDate.setDate(weekStart.getDate() + i);
      const dayOfMonth = checkDate.getDate();
      
      const colIndex = dateRow.findIndex(val => val == dayOfMonth);
      if (colIndex !== -1) {
        weekColumns.push({
          date: new Date(checkDate),
          colIndex: colIndex,
          dayName: Utilities.formatDate(checkDate, Session.getScriptTimeZone(), 'EEEE')
        });
      }
    }
    
    // Analyze habits for each day of the week
    const weeklyData = [];
    const habitNames = [];
    
    weekColumns.forEach(dayInfo => {
      const dayHabits = analyzeHabits(values, dayInfo.colIndex, config);
      const daySummary = getHabitSummary(dayHabits);
      
      weeklyData.push({
        date: dayInfo.date,
        dayName: dayInfo.dayName,
        habits: dayHabits,
        summary: daySummary
      });
      
      // Collect unique habit names
      dayHabits.forEach(habit => {
        if (!habitNames.includes(habit.name)) {
          habitNames.push(habit.name);
        }
      });
    });
    
    // Calculate weekly statistics
    const weeklyStats = calculateWeeklyStats(weeklyData, habitNames);
    
    return {
      weekStart: weekStart,
      weekEnd: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
      dailyData: weeklyData,
      habitNames: habitNames,
      weeklyStats: weeklyStats,
      generatedAt: new Date()
    };
    
  } catch (error) {
    Logger.log(`Error generating weekly report: ${error.message}`);
    throw error;
  }
}

/**
 * Calculate weekly statistics
 * @param {Array} weeklyData - Array of daily data
 * @param {Array} habitNames - Array of habit names
 * @returns {Object} Weekly statistics
 */
function calculateWeeklyStats(weeklyData, habitNames) {
  const stats = {
    totalDays: weeklyData.length,
    perfectDays: 0,
    averageCompletion: 0,
    habitStats: {}
  };
  
  let totalCompletionRate = 0;
  
  // Initialize habit stats
  habitNames.forEach(habitName => {
    stats.habitStats[habitName] = {
      completedDays: 0,
      totalDays: 0,
      completionRate: 0,
      longestStreak: 0
    };
  });
  
  // Process each day
  weeklyData.forEach(dayData => {
    totalCompletionRate += dayData.summary.completionRate;
    
    if (dayData.summary.pendingToday === 0 && dayData.summary.completedToday > 0) {
      stats.perfectDays++;
    }
    
    // Update habit-specific stats
    dayData.habits.forEach(habit => {
      const habitStat = stats.habitStats[habit.name];
      if (habitStat) {
        habitStat.totalDays++;
        if (habit.completed) {
          habitStat.completedDays++;
        }
        habitStat.longestStreak = Math.max(habitStat.longestStreak, habit.streak);
      }
    });
  });
  
  // Calculate averages
  stats.averageCompletion = totalCompletionRate / weeklyData.length;
  
  // Calculate habit completion rates
  Object.keys(stats.habitStats).forEach(habitName => {
    const habitStat = stats.habitStats[habitName];
    if (habitStat.totalDays > 0) {
      habitStat.completionRate = (habitStat.completedDays / habitStat.totalDays) * 100;
    }
  });
  
  return stats;
}

/**
 * Generate monthly habit report
 * @param {Object} config - Configuration object
 * @returns {Object} Monthly report data
 */
function generateMonthlyReport(config) {
  try {
    Logger.log('Generating monthly habit report...');
    
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    const sheet = ss.getSheetByName(config.sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet '${config.sheetName}' not found`);
    }

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const dataRange = sheet.getRange(config.dataRange);
    const values = dataRange.getValues();
    
    // Get date row
    const dateRow = values[config.dateRow - 14];
    
    // Find all columns for current month
    const monthColumns = [];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const colIndex = dateRow.findIndex(val => val == day);
      if (colIndex !== -1) {
        monthColumns.push({
          day: day,
          colIndex: colIndex
        });
      }
    }
    
    // Analyze habits for each day of the month
    const monthlyData = [];
    const habitNames = [];
    
    monthColumns.forEach(dayInfo => {
      const dayHabits = analyzeHabits(values, dayInfo.colIndex, config);
      const daySummary = getHabitSummary(dayHabits);
      
      monthlyData.push({
        day: dayInfo.day,
        habits: dayHabits,
        summary: daySummary
      });
      
      // Collect unique habit names
      dayHabits.forEach(habit => {
        if (!habitNames.includes(habit.name)) {
          habitNames.push(habit.name);
        }
      });
    });
    
    // Calculate monthly statistics
    const monthlyStats = calculateMonthlyStats(monthlyData, habitNames);
    
    return {
      month: currentMonth + 1,
      year: currentYear,
      monthName: Utilities.formatDate(today, Session.getScriptTimeZone(), 'MMMM yyyy'),
      dailyData: monthlyData,
      habitNames: habitNames,
      monthlyStats: monthlyStats,
      generatedAt: new Date()
    };
    
  } catch (error) {
    Logger.log(`Error generating monthly report: ${error.message}`);
    throw error;
  }
}

/**
 * Calculate monthly statistics
 * @param {Array} monthlyData - Array of daily data
 * @param {Array} habitNames - Array of habit names
 * @returns {Object} Monthly statistics
 */
function calculateMonthlyStats(monthlyData, habitNames) {
  const stats = {
    totalDays: monthlyData.length,
    perfectDays: 0,
    averageCompletion: 0,
    bestDay: null,
    worstDay: null,
    habitStats: {},
    trends: {}
  };
  
  let totalCompletionRate = 0;
  let bestCompletionRate = -1;
  let worstCompletionRate = 101;
  
  // Initialize habit stats
  habitNames.forEach(habitName => {
    stats.habitStats[habitName] = {
      completedDays: 0,
      totalDays: 0,
      completionRate: 0,
      longestStreak: 0,
      currentStreak: 0,
      bestWeek: 0,
      worstWeek: 0
    };
  });
  
  // Process each day
  monthlyData.forEach(dayData => {
    const dayRate = dayData.summary.completionRate;
    totalCompletionRate += dayRate;
    
    // Track best and worst days
    if (dayRate > bestCompletionRate) {
      bestCompletionRate = dayRate;
      stats.bestDay = dayData.day;
    }
    
    if (dayRate < worstCompletionRate) {
      worstCompletionRate = dayRate;
      stats.worstDay = dayData.day;
    }
    
    if (dayData.summary.pendingToday === 0 && dayData.summary.completedToday > 0) {
      stats.perfectDays++;
    }
    
    // Update habit-specific stats
    dayData.habits.forEach(habit => {
      const habitStat = stats.habitStats[habit.name];
      if (habitStat) {
        habitStat.totalDays++;
        if (habit.completed) {
          habitStat.completedDays++;
        }
        habitStat.longestStreak = Math.max(habitStat.longestStreak, habit.streak);
        habitStat.currentStreak = habit.streak; // Last day's streak
      }
    });
  });
  
  // Calculate averages and completion rates
  stats.averageCompletion = totalCompletionRate / monthlyData.length;
  
  Object.keys(stats.habitStats).forEach(habitName => {
    const habitStat = stats.habitStats[habitName];
    if (habitStat.totalDays > 0) {
      habitStat.completionRate = (habitStat.completedDays / habitStat.totalDays) * 100;
    }
  });
  
  // Calculate trends (simple week-over-week comparison)
  stats.trends = calculateTrends(monthlyData, habitNames);
  
  return stats;
}

/**
 * Calculate habit trends
 * @param {Array} monthlyData - Array of daily data
 * @param {Array} habitNames - Array of habit names
 * @returns {Object} Trend analysis
 */
function calculateTrends(monthlyData, habitNames) {
  const trends = {};
  
  // Group data by weeks
  const weeks = [];
  let currentWeek = [];
  
  monthlyData.forEach((dayData, index) => {
    currentWeek.push(dayData);
    
    // End of week (every 7 days) or end of data
    if (currentWeek.length === 7 || index === monthlyData.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });
  
  // Calculate trends for each habit
  habitNames.forEach(habitName => {
    const weeklyRates = weeks.map(week => {
      const completedDays = week.filter(day => {
        const habit = day.habits.find(h => h.name === habitName);
        return habit && habit.completed;
      }).length;
      
      return (completedDays / week.length) * 100;
    });
    
    // Calculate trend direction
    let trendDirection = 'stable';
    if (weeklyRates.length >= 2) {
      const firstHalf = weeklyRates.slice(0, Math.floor(weeklyRates.length / 2));
      const secondHalf = weeklyRates.slice(Math.floor(weeklyRates.length / 2));
      
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      const difference = secondAvg - firstAvg;
      
      if (difference > 10) {
        trendDirection = 'improving';
      } else if (difference < -10) {
        trendDirection = 'declining';
      }
    }
    
    trends[habitName] = {
      weeklyRates: weeklyRates,
      direction: trendDirection,
      consistency: calculateConsistency(weeklyRates)
    };
  });
  
  return trends;
}

/**
 * Calculate consistency score for a habit
 * @param {Array} weeklyRates - Array of weekly completion rates
 * @returns {number} Consistency score (0-100)
 */
function calculateConsistency(weeklyRates) {
  if (weeklyRates.length < 2) {
    return 100; // Perfect consistency if only one data point
  }
  
  // Calculate standard deviation
  const mean = weeklyRates.reduce((a, b) => a + b, 0) / weeklyRates.length;
  const variance = weeklyRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / weeklyRates.length;
  const stdDev = Math.sqrt(variance);
  
  // Convert to consistency score (lower std dev = higher consistency)
  const consistencyScore = Math.max(0, 100 - (stdDev * 2));
  
  return Math.round(consistencyScore);
}

/**
 * Generate habit insights and recommendations
 * @param {Object} reportData - Report data object
 * @returns {Object} Insights and recommendations
 */
function generateInsights(reportData) {
  const insights = {
    achievements: [],
    concerns: [],
    recommendations: [],
    motivationalMessage: ''
  };
  
  const { summary, habits } = reportData;
  
  // Achievements
  if (summary.completionRate >= 80) {
    insights.achievements.push('Excellent completion rate today!');
  }
  
  if (summary.perfectDays > 0) {
    insights.achievements.push('Perfect day achieved!');
  }
  
  const highStreakHabits = habits.filter(h => h.streak >= 7);
  if (highStreakHabits.length > 0) {
    insights.achievements.push(`${highStreakHabits.length} habit(s) with 7+ day streak!`);
  }
  
  // Concerns
  if (summary.completionRate < 50) {
    insights.concerns.push('Low completion rate today');
  }
  
  const zeroStreakHabits = habits.filter(h => h.streak === 0);
  if (zeroStreakHabits.length > 0) {
    insights.concerns.push(`📉 ${zeroStreakHabits.length} habit(s) need attention`);
  }
  
  // Recommendations
  if (summary.pendingToday > 0) {
    insights.recommendations.push(`${summary.pendingToday} habit(s) still pending - you can do it!`);
  }
  
  if (zeroStreakHabits.length > 0) {
    const easiestHabit = zeroStreakHabits[0]; // Assume first is easiest
    insights.recommendations.push(`Start with "${easiestHabit.name}" to rebuild momentum`);
  }
  
  // Motivational message
  if (summary.completionRate >= 90) {
    insights.motivationalMessage = 'You\'re absolutely crushing it today! Keep up the amazing work!';
  } else if (summary.completionRate >= 70) {
    insights.motivationalMessage = 'Great progress today! You\'re building strong habits!';
  } else if (summary.completionRate >= 50) {
    insights.motivationalMessage = 'Every step counts! You\'re making progress!';
  } else {
    insights.motivationalMessage = 'Tomorrow is a fresh start! You\'ve got this!';
  }
  
  return insights;
}

/**
 * Test report generation functions
 * @param {Object} config - Configuration object
 */
function testReportGeneration(config) {
  Logger.log('=== TESTING REPORT GENERATION ===');
  
  try {
    // Test daily report
    Logger.log('Testing daily report...');
    const dailyReport = generateDailyReport(config);
    Logger.log(`Daily report generated: ${dailyReport.summary.completedToday}/${dailyReport.summary.totalHabits} habits`);
    
    // Test insights
    Logger.log('Testing insights...');
    const insights = generateInsights(dailyReport);
    Logger.log('Insights generated:', insights);
    
    // Test weekly report (if enough data)
    Logger.log('Testing weekly report...');
    const weeklyReport = generateWeeklyReport(config);
    Logger.log(`Weekly report generated: ${weeklyReport.dailyData.length} days`);
    
    // Test monthly report (if enough data)
    Logger.log('Testing monthly report...');
    const monthlyReport = generateMonthlyReport(config);
    Logger.log(`Monthly report generated: ${monthlyReport.dailyData.length} days`);
    
    Logger.log('All report tests completed successfully');
    return true;
    
  } catch (error) {
    Logger.log(`Report test failed: ${error.message}`);
    return false;
  }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateDailyReport,
    generateWeeklyReport,
    generateMonthlyReport,
    calculateWeeklyStats,
    calculateMonthlyStats,
    calculateTrends,
    calculateConsistency,
    generateInsights,
    testReportGeneration
  };
}