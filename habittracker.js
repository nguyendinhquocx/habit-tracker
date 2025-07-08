/**
 * HABIT TRACKER - Daily Email Report System (FIXED VERSION)
 * 
 * FIXED: Đọc đúng cấu trúc ngày từ C9 (tháng/năm) + hàng 15 (số ngày)
 * 
 * @version 1.1
 * @author Nguyen Dinh Quoc
 * @updated 2025-07-07
 */

// Global CONFIG để sử dụng trong Slack integration
const CONFIG = {
  // Cấu hình Sheet
  spreadsheetId: '1TrFiuWnxOqh7UjxRRIEaF6DFRRutdNdO-OxBRGC9Oho',
  sheetName: 'habit',
  
  // Vùng dữ liệu
  dataRange: 'C14:AI31',
  monthYearCell: 'C9',    // Ô chứa tháng/năm (VD: "07/2025")
  dayOfWeekRow: 14,       // Hàng chứa thứ  
  dateRow: 15,            // Hàng chứa số ngày (1, 2, 3, 4...)
  habitNameCol: 'C',      // Cột tên thói quen
  dataStartCol: 'E',      // Cột bắt đầu dữ liệu checkbox
  
  // Email settings
  emailTo: 'quoc.nguyen3@hoanmy.com', // Thay email của bạn
  
  // Slack settings
  slackWebhookUrl: 'https://hooks.slack.com/services/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', // CẦN CẬP NHẬT: Thay bằng Slack webhook URL hợp lệ của bạn
  slackChannel: '#habit', // Kênh Slack
  enableSlack: true, // Tạm tắt Slack cho đến khi có webhook URL hợp lệ
  
  // Minimal design - no external icons
  
  // Debug mode
  debugMode: true // Bật để debug
};

function sendDailyHabitReport() {
  // Sử dụng global CONFIG

  try {
    // Mở spreadsheet
    const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
    const sheet = ss.getSheetByName(CONFIG.sheetName);
    
    if (!sheet) {
      Logger.log(`Sheet '${CONFIG.sheetName}' không tồn tại`);
      return;
    }

    const today = new Date();
    const todayDay = today.getDate(); // Lấy số ngày hiện tại (7 nếu hôm nay là 7/7/2025)
    
    // FIXED: Đọc tháng/năm từ ô C9
    const monthYearCell = sheet.getRange(CONFIG.monthYearCell).getValue();
    if (CONFIG.debugMode) {
      Logger.log(`🔍 Tháng/năm từ ô C9: ${monthYearCell}`);
      Logger.log(`🔍 Ngày hôm nay cần tìm: ${todayDay}`);
    }
    
    // Định dạng ngày chi tiết
    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const dayOfWeek = dayNames[today.getDay()];
    const detailedDate = `${dayOfWeek}, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

    // Lấy toàn bộ dữ liệu
    const dataRange = sheet.getRange(CONFIG.dataRange);
    const values = dataRange.getValues();
    
    // FIXED: Tìm cột có số ngày = ngày hôm nay
    const dateRow = values[CONFIG.dateRow - 14]; // Row 15 trong sheet = index 1 trong array
    let todayColIndex = -1;
    
    for (let col = 0; col < dateRow.length; col++) {
      const cellValue = dateRow[col];
      // So sánh với số ngày hôm nay
      if (cellValue == todayDay) {
        todayColIndex = col;
        if (CONFIG.debugMode) {
          Logger.log(`Tìm thấy ngày ${todayDay} ở cột index: ${col}`);
        }
        break;
      }
    }
    
    if (todayColIndex === -1) {
      Logger.log(`Không tìm thấy cột cho ngày: ${todayDay}`);
      Logger.log(`Dữ liệu hàng ngày: ${dateRow}`);
      return;
    }

    // Phân tích thói quen
    const habits = analyzeHabits(values, todayColIndex, CONFIG);
    const completedHabits = habits.filter(h => h.completed);
    const pendingHabits = habits.filter(h => !h.completed);
    
    // Kiểm tra perfect day
    const isPerfectDay = pendingHabits.length === 0 && completedHabits.length > 0;
    
    // Tính tỷ lệ hoàn thành
    const completionRate = habits.length > 0 ? (completedHabits.length / habits.length) * 100 : 0;
    
    // Subject email
    const subject = `Habit Report ${todayDay}/${today.getMonth() + 1}/${today.getFullYear()}${isPerfectDay ? ' - Perfect Day' : ''}`;

    // Chọn icons và màu sắc
    const colors = isPerfectDay ? {
      border: '#22c55e',
      headerTitle: '#22c55e',
      headerSubtitle: '#16a34a',
      dateText: '#16a34a',
      sectionTitle: '#22c55e',
      footerText: '#16a34a'
    } : {
      border: '#000000',
      headerTitle: '#1a1a1a',
      headerSubtitle: '#8e8e93',
      dateText: '#495057',
      sectionTitle: '#1a1a1a',
      pendingTitle: '#dc3545',
      footerText: '#8e8e93'
    };

    // No external icons - using simple text indicators

    // Xây dựng HTML sections
    const completedSection = buildHabitSection(completedHabits, 'Đã hoàn thành', colors.sectionTitle);
     const pendingSection = buildHabitSection(pendingHabits, 'Chưa thực hiện', isPerfectDay ? colors.sectionTitle : colors.pendingTitle);
    
    // Progress bar
    const progressBar = buildProgressBar(completionRate, isPerfectDay);
    
    // GitHub-style contribution visualization
    const contributionGrid = buildContributionGrid(sheet, habits, CONFIG, colors, isPerfectDay);

    // HTML Email Template
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Habit Report ${todayDay}/${today.getMonth() + 1}/${today.getFullYear()}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        
        <!-- Main Container -->
        <div style="max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid ${colors.border}; border-radius: 12px;">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 48px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 300; color: ${colors.headerTitle}; letter-spacing: -0.5px;">
              Habit Tracker${isPerfectDay ? ' - Perfect Day' : ''}
            </h1>
            <p style="margin: 8px 0 0; font-size: 16px; font-weight: 400; color: ${colors.headerSubtitle};">
              Báo cáo thói quen cá nhân
            </p>
          </div>

          <!-- Date -->
          <div style="margin-bottom: 32px;">
            <span style="font-size: 14px; font-weight: 500; color: ${colors.dateText};">
              ${detailedDate}
            </span>
          </div>

          <!-- Progress Overview -->
          <div style="margin-bottom: 32px; background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 12px; padding: 24px;">
            <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: ${colors.sectionTitle}; text-align: center;">
              Tổng quan tiến độ
            </h3>
            ${progressBar}
            <div style="text-align: center; margin-top: 16px;">
              <span style="font-size: 18px; font-weight: 600; color: ${colors.sectionTitle};">
                ${completedHabits.length}/${habits.length} thói quen
              </span>
              <span style="font-size: 14px; color: ${colors.headerSubtitle}; margin-left: 8px;">
                (${Math.round(completionRate)}%)
              </span>
            </div>
          </div>

          <!-- GitHub-style Contribution Grid -->
          ${contributionGrid}

          <!-- Completed Habits -->
          ${completedSection}

          <!-- Pending Habits -->
          ${pendingSection}

          <!-- Daily Motivation -->
          ${buildMotivationSection(isPerfectDay, completionRate, colors)}

          <!-- Footer -->
          <div style="text-align: center; padding-top: 32px; border-top: 1px solid #f5f5f5;">
            <p style="margin: 0 0 6px; font-size: 12px; color: ${colors.footerText};">
              Keep building great habits!
            </p>
            <p style="margin: 0; font-size: 12px; font-weight: 500; color: ${colors.footerText};">
              ${isPerfectDay ? 'Perfect Day Achievement Unlocked!' : 'Tomorrow is a new opportunity'}
            </p>
          </div>

          <!-- Disclaimer -->
          <div style="margin-top: 40px; text-align: center;">
          </div>

        </div>
        
      </body>
      </html>
    `;

    // Gửi email
    sendEmailWithRetry({
      to: CONFIG.emailTo,
      subject: subject,
      htmlBody: htmlBody
    });

    // Gửi Slack (nếu được bật)
    if (CONFIG.enableSlack && CONFIG.slackWebhookUrl) {
      try {
        sendSlackReport({
          habits: habits,
          completedHabits: completedHabits,
          pendingHabits: pendingHabits,
          completionRate: completionRate,
          isPerfectDay: isPerfectDay,
          detailedDate: detailedDate,
          config: CONFIG
        });
        Logger.log(`Slack habit report đã được gửi thành công`);
      } catch (error) {
        Logger.log(`Lỗi khi gửi Slack: ${error.message}`);
      }
    } else if (CONFIG.enableSlack && !CONFIG.slackWebhookUrl) {
      Logger.log(`Slack được bật nhưng chưa có webhook URL`);
    }

    Logger.log(`Email habit report đã được gửi thành công`);
    Logger.log(`Tổng kết: ${completedHabits.length}/${habits.length} thói quen hoàn thành (${Math.round(completionRate)}%)`);

  } catch (error) {
    Logger.log(`Lỗi khi gửi email habit report: ${error.message}`);
    Logger.log(`Stack trace: ${error.stack}`);
  }
}

/**
 * FIXED: Phân tích thói quen từ dữ liệu sheet 
 */
function analyzeHabits(values, todayColIndex, CONFIG) {
  const habits = [];
  
  try {
    // Bắt đầu từ row 16 (index 2) vì row 14-15 là header
    for (let row = 2; row < values.length; row++) {
      const habitName = values[row][0]; // Cột C = index 0 trong range C14:AI31
      if (!habitName || habitName.toString().trim() === '') continue;
      
      const todayStatus = values[row][todayColIndex];
      
      // FIXED: Kiểm tra nhiều định dạng checkbox
      const isCompleted = todayStatus === true || 
                         todayStatus === 'TRUE' || 
                         todayStatus === '✓' || 
                         todayStatus === 'x' || 
                         todayStatus === 'X' ||
                         todayStatus === 1;
      
      // Tính streak (chuỗi ngày liên tiếp)
      const streak = calculateHabitStreak(values[row], todayColIndex);
      
      habits.push({
        name: habitName.toString().trim(),
        completed: isCompleted,
        streak: streak,
        todayStatus: todayStatus
      });
      
      if (CONFIG.debugMode) {
        Logger.log(`🔍 Habit: ${habitName} | Status: ${todayStatus} | Completed: ${isCompleted} | Streak: ${streak}`);
      }
    }
  } catch (error) {
    Logger.log(`Lỗi khi phân tích habits: ${error.message}`);
  }
  
  return habits;
}

/**
 * FIXED: Tính streak (chuỗi ngày liên tiếp) cho thói quen
 */
function calculateHabitStreak(habitRow, todayColIndex) {
  let streak = 0;
  
  try {
    // Đếm ngược từ hôm nay về trước
    for (let col = todayColIndex; col >= 0; col--) {
      const cellValue = habitRow[col];
      const isCompleted = cellValue === true || 
                         cellValue === 'TRUE' || 
                         cellValue === '✓' || 
                         cellValue === 'x' || 
                         cellValue === 'X' ||
                         cellValue === 1;
      
      if (isCompleted) {
        streak++;
      } else {
        break; // Dừng khi gặp ngày không hoàn thành
      }
    }
  } catch (error) {
    Logger.log(`Lỗi khi tính streak: ${error.message}`);
  }
  
  return streak;
}

/**
 * Xây dựng section cho danh sách thói quen
 */
function buildHabitSection(habits, title, titleColor) {
  if (habits.length === 0) {
    const emptyMessage = title.includes('Đã hoàn thành') ? 
      'Chưa có thói quen nào được hoàn thành hôm nay' : 
      'Tuyệt vời! Tất cả thói quen đã hoàn thành';
    
    return `
      <div style="margin-bottom: 32px; background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden;">
        <div style="padding: 20px 24px 16px; border-bottom: 1px solid #f5f5f5;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 500; color: ${titleColor};">
            ${title}
          </h2>
        </div>
        <div style="padding: 24px; text-align: center; color: #8e8e93; font-style: italic;">
          ${emptyMessage}
        </div>
      </div>
    `;
  }

  // Sắp xếp theo streak giảm dần
  habits.sort((a, b) => b.streak - a.streak);

  const habitItems = habits.map(habit => {
    const streakDisplay = habit.streak > 0 ? 
      `<span style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
        ${habit.streak} ngày
      </span>` : '';

    return `
      <div style="padding: 16px 0; border-bottom: 1px solid #f5f5f5; display: flex; justify-content: space-between; align-items: center;">
        <span style="flex: 1; font-size: 15px; font-weight: 400; color: #1a1a1a;">
          ${habit.name}
        </span>
        ${streakDisplay}
      </div>
    `;
  }).join('');

  return `
    <div style="margin-bottom: 32px; background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden;">
      <div style="padding: 20px 24px 16px; border-bottom: 1px solid #f5f5f5;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 500; color: ${titleColor};">
            ${title}
          </h2>
          <span style="background: #f3f4f6; color: #374151; padding: 6px 12px; border-radius: 12px; font-weight: 600; font-size: 13px;">
            ${habits.length}
          </span>
        </div>
      </div>
      <div style="padding: 0 24px 8px;">
        ${habitItems}
      </div>
    </div>
  `;
}

/**
 * Build GitHub-style contribution grid
 */
function buildContributionGrid(sheet, habits, CONFIG, colors, isPerfectDay) {
  try {
    const today = new Date();
    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 90); // Show last 90 days
    
    // Get all data from sheet
     const dataRange = sheet.getRange(CONFIG.dataRange);
     const allData = dataRange.getValues();
     
     // Find date row
     const dateRowIndex = CONFIG.dateRow - 14; // Row 15 in sheet = index 1 in array
    const dateRow = allData[dateRowIndex];
    
    // Build grid data
    const gridData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const currentDay = currentDate.getDate();
      
      // Find column for this date
      let dateColIndex = -1;
      for (let col = 0; col < dateRow.length; col++) {
        const cellValue = dateRow[col];
        if (cellValue == currentDay) {
          dateColIndex = col;
          break;
        }
      }
      
      let completionCount = 0;
      if (dateColIndex >= 0) {
        // Count completed habits for this date
        for (let row = 2; row < allData.length; row++) {
          const habitName = allData[row][0];
          if (!habitName || habitName.toString().trim() === '') continue;
          
          const cellValue = allData[row][dateColIndex];
          const isCompleted = cellValue === true || 
                             cellValue === 'TRUE' || 
                             cellValue === '✓' || 
                             cellValue === 'x' || 
                             cellValue === 'X' ||
                             cellValue === 1;
          
          if (isCompleted) {
            completionCount++;
          }
        }
      }
      
      const completionRate = habits.length > 0 ? (completionCount / habits.length) : 0;
      gridData.push({
        date: new Date(currentDate),
        completionRate: completionRate,
        completionCount: completionCount,
        totalHabits: habits.length
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Build HTML grid
    let gridHtml = `
      <div style="margin-bottom: 32px; background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 12px; padding: 24px;">
        <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: ${colors.sectionTitle}; text-align: center;">
          Lịch sử thói quen (90 ngày gần nhất)
        </h3>
        <div style="display: flex; flex-wrap: wrap; gap: 2px; justify-content: center; max-width: 600px; margin: 0 auto;">
    `;
    
    gridData.forEach(day => {
      const intensity = getContributionIntensity(day.completionRate);
      const color = getContributionColor(intensity, isPerfectDay && day.date.toDateString() === today.toDateString());
      const tooltip = `${day.date.getDate()}/${day.date.getMonth() + 1}: ${day.completionCount}/${day.totalHabits} thói quen`;
      
      gridHtml += `
        <div style="
          width: 12px; 
          height: 12px; 
          background-color: ${color}; 
          border-radius: 2px;
          border: 1px solid #e1e4e8;
          title: '${tooltip}';
        "></div>
      `;
    });
    
    gridHtml += `
        </div>
        <div style="display: flex; justify-content: center; align-items: center; margin-top: 16px; font-size: 12px; color: ${colors.headerSubtitle};">
          <span style="margin-right: 8px;">Ít</span>
          <div style="display: flex; gap: 2px;">
            <div style="width: 10px; height: 10px; background-color: #ebedf0; border-radius: 2px;"></div>
            <div style="width: 10px; height: 10px; background-color: #c6e48b; border-radius: 2px;"></div>
            <div style="width: 10px; height: 10px; background-color: #7bc96f; border-radius: 2px;"></div>
            <div style="width: 10px; height: 10px; background-color: #239a3b; border-radius: 2px;"></div>
            <div style="width: 10px; height: 10px; background-color: #196127; border-radius: 2px;"></div>
          </div>
          <span style="margin-left: 8px;">Nhiều</span>
        </div>
      </div>
    `;
    
    return gridHtml;
    
  } catch (error) {
    Logger.log(`Error building contribution grid: ${error.message}`);
    return '';
  }
}

/**
 * Get contribution intensity level (0-4)
 */
function getContributionIntensity(completionRate) {
  if (completionRate === 0) return 0;
  if (completionRate <= 0.25) return 1;
  if (completionRate <= 0.5) return 2;
  if (completionRate <= 0.75) return 3;
  return 4;
}

/**
 * Get contribution color based on intensity
 */
function getContributionColor(intensity, isToday = false) {
  const colors = {
    0: '#ebedf0',  // No activity
    1: '#c6e48b',  // Low activity
    2: '#7bc96f',  // Medium-low activity
    3: '#239a3b',  // Medium-high activity
    4: '#196127'   // High activity
  };
  
  // Highlight today with a special border or slightly different shade
  if (isToday && intensity > 0) {
    return colors[intensity];
  }
  
  return colors[intensity] || colors[0];
}

/**
 * Xây dựng progress bar
 */
function buildProgressBar(percentage, isPerfectDay) {
  const barColor = isPerfectDay ? '#22c55e' : 
                   percentage >= 80 ? '#84cc16' :
                   percentage >= 60 ? '#eab308' : '#ef4444';
  
  return `
    <div style="background-color: #f3f4f6; border-radius: 8px; overflow: hidden; height: 8px;">
      <div style="background-color: ${barColor}; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
    </div>
  `;
}

/**
 * Section động viên
 */
function buildMotivationSection(isPerfectDay, completionRate, colors) {
  let message;
  
  if (isPerfectDay) {
    message = "Xuất sắc! Bạn đã hoàn thành tất cả thói quen hôm nay. Hãy tiếp tục duy trì!";
  } else if (completionRate >= 80) {
    message = "Rất tốt! Bạn đã hoàn thành hầu hết các thói quen. Hãy cố gắng thêm một chút!";
  } else if (completionRate >= 50) {
    message = "Không sao, ngày mai là cơ hội mới. Hãy tập trung vào những thói quen còn lại!";
  } else {
    message = "Đừng nản lòng! Mỗi ngày là một khởi đầu mới. Hãy bắt đầu từ những thói quen nhỏ!";
  }

  return `
    <div style="margin-bottom: 32px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center;">
      <p style="margin: 0; font-size: 16px; color: ${colors.sectionTitle}; line-height: 1.5; font-weight: 500;">
        ${message}
      </p>
    </div>
  `;
}

/**
 * Gửi email với retry mechanism
 */
function sendEmailWithRetry(emailConfig, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      MailApp.sendEmail(emailConfig);
      Logger.log(`Email sent successfully on attempt ${i + 1}`);
      return true;
    } catch (error) {
      Logger.log(`Email attempt ${i + 1} failed: ${error.message}`);
      if (i === maxRetries - 1) throw error;
      Utilities.sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
  return false;
}

/**
 * Tạo trigger tự động gửi báo cáo hàng ngày lúc 8:00 sáng
 */
function createDailyTrigger() {
  try {
    // Xóa trigger cũ nếu có
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'sendDailyHabitReport') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // Tạo trigger mới
    ScriptApp.newTrigger('sendDailyHabitReport')
      .timeBased()
      .everyDays(1)
      .atHour(8)
      .create();
    
    Logger.log('Đã tạo trigger gửi báo cáo hàng ngày lúc 8:00 sáng');
    
  } catch (error) {
    Logger.log(`Lỗi tạo trigger: ${error.message}`);
  }
}

/**
 * Tạo nhiều trigger tự động gửi báo cáo trong ngày
 * Sáng 7:00, Trưa 11:30, Tối 19:00
 */
function createMultipleDailyTriggers() {
  try {
    // Xóa tất cả trigger cũ
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'sendDailyHabitReport') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // Tạo trigger sáng 7:00
    ScriptApp.newTrigger('sendDailyHabitReport')
      .timeBased()
      .everyDays(1)
      .atHour(7)
      .create();
    
    // Tạo trigger trưa 11:30
    ScriptApp.newTrigger('sendDailyHabitReport')
      .timeBased()
      .everyDays(1)
      .atHour(11)
      .nearMinute(30)
      .create();
    
    // Tạo trigger tối 19:00
    ScriptApp.newTrigger('sendDailyHabitReport')
      .timeBased()
      .everyDays(1)
      .atHour(21)
      .create();
    
    Logger.log('Đã tạo 3 trigger gửi báo cáo:');
    Logger.log('   - Sáng 7:00');
    Logger.log('   - Trưa 11:30');
    Logger.log('   - Tối 19:00');
    
  } catch (error) {
    Logger.log(`Lỗi tạo trigger: ${error.message}`);
  }
}

/**
 * Xóa tất cả trigger tự động
 */
function deleteAllTriggers() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    let deletedCount = 0;
    
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'sendDailyHabitReport') {
        ScriptApp.deleteTrigger(trigger);
        deletedCount++;
      }
    });
    
    Logger.log(`Đã xóa ${deletedCount} trigger`);
    
  } catch (error) {
    Logger.log(`Lỗi xóa trigger: ${error.message}`);
  }
}

/**
 * Kiểm tra danh sách trigger hiện tại
 */
function listCurrentTriggers() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    const habitTriggers = triggers.filter(trigger => 
      trigger.getHandlerFunction() === 'sendDailyHabitReport'
    );
    
    Logger.log(`Có ${habitTriggers.length} trigger đang hoạt động:`);
    
    habitTriggers.forEach((trigger, index) => {
      const eventType = trigger.getEventType();
      if (eventType === ScriptApp.EventType.CLOCK) {
        // Không thể lấy thông tin chi tiết về thời gian từ trigger object
        Logger.log(`   ${index + 1}. Trigger ID: ${trigger.getUniqueId()}`);
      }
    });
    
  } catch (error) {
    Logger.log(`Lỗi kiểm tra trigger: ${error.message}`);
  }
}

/**
 * Test function for new contribution grid feature
 */
function testContributionGrid() {
   try {
     Logger.log('Testing Contribution Grid Feature...');
     
     // Define CONFIG locally (same as in sendDailyHabitReport)
     const CONFIG = {
       spreadsheetId: '1TrFiuWnxOqh7UjxRRIEaF6DFRRutdNdO-OxBRGC9Oho',
       sheetName: 'habit',
       dataRange: 'C14:AI31',
       monthYearCell: 'C9',
       dayOfWeekRow: 14,
       dateRow: 15,
       habitNameCol: 'C',
       dataStartCol: 'E',
       debugMode: true
     };
     
     // Open spreadsheet
     const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
     const sheet = ss.getSheetByName(CONFIG.sheetName);
     if (!sheet) {
       throw new Error(`Sheet "${CONFIG.sheetName}" not found`);
     }
     
     Logger.log('Sheet opened successfully');
     
     // Get today's column index
     const today = new Date();
     const todayDay = today.getDate();
     
     const dataRange = sheet.getRange(CONFIG.dataRange);
     const values = dataRange.getValues();
     const dateRow = values[CONFIG.dateRow - 14]; // Row 15 in sheet = index 1 in array
     
     let todayColIndex = -1;
     for (let col = 0; col < dateRow.length; col++) {
       if (dateRow[col] == todayDay) {
         todayColIndex = col;
         break;
       }
     }
     
     if (todayColIndex === -1) {
       Logger.log(`Today's column not found for day ${todayDay}, using first column for test`);
       todayColIndex = 0;
     }
     
     // Get habits using existing analyzeHabits function
     const habits = analyzeHabits(values, todayColIndex, CONFIG);
     Logger.log(`Found ${habits.length} habits`);
     
     // Test contribution grid
     const colors = {
       sectionTitle: '#1a1a1a',
       headerSubtitle: '#666666'
     };
     
     const contributionGrid = buildContributionGrid(
       sheet, 
       habits, 
       CONFIG, 
       colors, 
       false // isPerfectDay
     );
     
     Logger.log('Contribution grid generated successfully');
     Logger.log(`📏 Grid HTML length: ${contributionGrid.length} characters`);
     
     // Test complete - call main function
     Logger.log('Running full daily report...');
     sendDailyHabitReport();
     
   } catch (error) {
     Logger.log(`Test failed: ${error.message}`);
     Logger.log(`Stack trace: ${error.stack}`);
   }
 }

/**
 * ENHANCED: Test function với debug chi tiết
 */
function testHabitTracker() {
  Logger.log('TESTING HABIT TRACKER - Enhanced Debug Mode');
  
  // Test đọc cấu trúc sheet
  const CONFIG = {
    spreadsheetId: '1TrFiuWnxOqh7UjxRRIEaF6DFRRutdNdO-OxBRGC9Oho',
    sheetName: 'habit',
    dataRange: 'C14:AI31',
    monthYearCell: 'C9',
    debugMode: true
  };
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
    const sheet = ss.getSheetByName(CONFIG.sheetName);
    
    // Test đọc tháng/năm
    const monthYear = sheet.getRange(CONFIG.monthYearCell).getValue();
    Logger.log(`Tháng/năm từ C9: ${monthYear}`);
    
    // Test đọc hàng ngày
    const dataRange = sheet.getRange(CONFIG.dataRange);
    const values = dataRange.getValues();
    const dateRow = values[1]; // Row 15 = index 1
    Logger.log(`Hàng ngày (row 15): ${dateRow.slice(0, 10)}`); // Hiển thị 10 cột đầu
    
    // Ngày hôm nay
    const today = new Date();
    const todayDay = today.getDate();
    Logger.log(`Đang tìm ngày: ${todayDay}`);
    
    // Test tìm cột
    for (let col = 0; col < Math.min(dateRow.length, 15); col++) {
      const cellValue = dateRow[col];
      Logger.log(`Cột ${col}: ${cellValue} (Type: ${typeof cellValue})`);
      if (cellValue == todayDay) {
        Logger.log(`FOUND! Ngày ${todayDay} ở cột ${col}`);
      }
    }
    
  } catch (error) {
    Logger.log(`Debug error: ${error.message}`);
  }
  
  // Chạy hàm chính
  sendDailyHabitReport();
}

/**
 * Debug cấu trúc sheet
 */
function debugSheetStructure() {
  const CONFIG = {
    spreadsheetId: '1TrFiuWnxOqh7UjxRRIEaF6DFRRutdNdO-OxBRGC9Oho',
    sheetName: 'habit'
  };
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
    const sheet = ss.getSheetByName(CONFIG.sheetName);
    
    Logger.log('🔍 =================');
    Logger.log('SHEET STRUCTURE DEBUG');
    Logger.log('🔍 =================');
    
    // C9 - Tháng/năm
    const monthYear = sheet.getRange('C9').getValue();
    Logger.log(`C9 (Tháng/năm): "${monthYear}" | Type: ${typeof monthYear}`);
    
    // Hàng 14 - Thứ
    const dayOfWeekRow = sheet.getRange('C14:AI14').getValues()[0];
    Logger.log(`Row 14 (Thứ): [${dayOfWeekRow.slice(0, 10).join(', ')}...]`);
    
    // Hàng 15 - Ngày
    const dateRow = sheet.getRange('C15:AI15').getValues()[0];
    Logger.log(`Row 15 (Ngày): [${dateRow.slice(0, 10).join(', ')}...]`);
    
    // Hàng 16 - Thói quen đầu tiên
    const firstHabitRow = sheet.getRange('C16:AI16').getValues()[0];
    const habitName = firstHabitRow[0];
    Logger.log(`Thói quen đầu tiên: "${habitName}"`);
    Logger.log(`Data row 16: [${firstHabitRow.slice(0, 10).join(', ')}...]`);
    
    // Ngày hôm nay
    const today = new Date();
    Logger.log(`Hôm nay: ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`);
    
  } catch (error) {
    Logger.log(`Debug error: ${error.message}`);
  }
}

/**
 * Xử lý HTTP GET requests cho Web App
 * @param {Object} e - Event object chứa parameters
 * @return {HtmlOutput} HTML response
 */
function doGet(e) {
  // Trả về trang HTML đơn giản cho Web App
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Habit Tracker</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 48px 24px;
            background: #ffffff;
            color: #000000;
          }
          .header {
            text-align: center;
            margin-bottom: 48px;
          }
          .status {
            background: #f8f9fa;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid #e9ecef;
          }
          .success {
            color: #28a745;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Habit Tracker</h1>
          <p>Google Apps Script Web App đã được triển khai thành công</p>
        </div>
        <div class="status">
          <p class="success">Web App đang hoạt động bình thường</p>
          <p>Slack Interactive URL đã sẵn sàng để nhận webhook từ Slack</p>
        </div>
      </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(html)
    .setTitle('Habit Tracker')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Gửi báo cáo thói quen qua Slack với interactive buttons
 */
function sendSlackReport(data) {
  try {
    const { habits, completedHabits, pendingHabits, completionRate, isPerfectDay, detailedDate, config } = data;
    
    // Tạo message cho Slack với interactive elements
    const slackMessage = buildSlackMessage({
      habits,
      completedHabits,
      pendingHabits,
      completionRate,
      isPerfectDay,
      detailedDate
    });
    
    // Gửi qua Slack Webhook
    const payload = {
      channel: config.slackChannel,
      username: 'Habit Tracker Bot',
      // Removed icon_emoji for clean appearance
      blocks: slackMessage
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(config.slackWebhookUrl, options);
    
    if (response.getResponseCode() === 200) {
      Logger.log('Slack message sent successfully');
    } else {
      Logger.log(`Slack error: ${response.getResponseCode()} - ${response.getContentText()}`);
    }
    
  } catch (error) {
    Logger.log(`Lỗi khi gửi Slack: ${error.message}`);
  }
}

/**
 * Xây dựng Slack message với Slack Block Kit
 */
function buildSlackMessage(data) {
  const { habits, completedHabits, pendingHabits, completionRate, isPerfectDay, detailedDate } = data;
  
  const blocks = [];
  
  // Header
  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: `Habit Tracker Report${isPerfectDay ? ' - Perfect Day' : ''}`,
      emoji: false
    }
  });
  
  // Date và tổng quan
  blocks.push({
    type: 'section',
    fields: [
      {
        type: 'mrkdwn',
        text: `*Ngày:*\n${detailedDate}`
      },
      {
        type: 'mrkdwn',
        text: `*Tiến độ:*\n${completedHabits.length}/${habits.length} thói quen (${Math.round(completionRate)}%)`
      }
    ]
  });
  
  // Progress bar
  const progressBar = buildSlackProgressBar(completionRate);
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*Tiến độ hoàn thành:*\n${progressBar}`
    }
  });
  
  // Divider
  blocks.push({ type: 'divider' });
  
  // Completed habits
  if (completedHabits.length > 0) {
    const completedText = completedHabits.map(habit => {
      const streakText = habit.streak > 0 ? ` (${habit.streak} ngày)` : '';
      return `${habit.name}${streakText}`;
    }).join('\n');
    
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Đã hoàn thành (${completedHabits.length}):*\n${completedText}`
      }
    });
  }
  
  // Pending habits với interactive buttons
  if (pendingHabits.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Chưa thực hiện (${pendingHabits.length}):*`
      }
    });
    
    // Thêm buttons cho từng habit chưa hoàn thành
    pendingHabits.forEach((habit, index) => {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${habit.name}`
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Hoàn thành',
            emoji: false
          },
          value: `complete_habit_${habit.name}_${new Date().toISOString().split('T')[0]}`,
          action_id: `complete_habit_${index}`,
          // Removed style to use default (no color)
        }
      });
    });
  }
  
  // Divider
  blocks.push({ type: 'divider' });
  
  // Motivation message
  const motivationText = isPerfectDay 
      ? '*Perfect Day Achievement Unlocked!* Tuyệt vời! Bạn đã hoàn thành tất cả thói quen hôm nay!'
      : '*Keep building great habits!* Ngày mai là cơ hội mới để cải thiện!';
  
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: motivationText
    }
  });
  
  return blocks;
}

/**
 * Tạo progress bar cho Slack
 */
function buildSlackProgressBar(percentage) {
  const totalBars = 10;
  const filledBars = Math.round((percentage / 100) * totalBars);
  const emptyBars = totalBars - filledBars;
  
  const filled = '█'.repeat(filledBars);
  const empty = '░'.repeat(emptyBars);
  
  return `${filled}${empty} ${Math.round(percentage)}%`;
}

/**
 * Xử lý Slack interactions (button clicks)
 * Hàm này cần được deploy như Web App để nhận POST requests từ Slack
 * FIXED: Tối ưu để tránh timeout 3 giây - trả về response ngay lập tức
 */
function doPost(e) {
  const startTime = new Date().getTime();
  
  try {
    Logger.log('📨 Received Slack interaction');
    
    // Kiểm tra nếu là slash command
    if (e.parameter.command) {
      return handleSlashCommand(e);
    }
    
    // Parse Slack payload nhanh cho interactive buttons
    let payload;
    try {
      const payloadString = e.parameter.payload || e.postData.contents;
      payload = JSON.parse(payloadString);
    } catch (parseError) {
      Logger.log(`Error parsing payload: ${parseError.message}`);
      return ContentService
        .createTextOutput(JSON.stringify({ 
          response_type: 'ephemeral',
          text: 'Lỗi xử lý dữ liệu' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Xử lý block actions
    if (payload.type === 'block_actions') {
      const action = payload.actions[0];
      const actionId = action.action_id;
      const value = action.value;
      
      Logger.log(`🔄 Processing action: ${actionId}, value: ${value}`);
      
      // Xử lý complete habit action với timeout protection
      if (actionId.startsWith('complete_habit_')) {
        try {
          // Xử lý siêu nhanh - chỉ cập nhật cell, không tính toán phức tạp
          const result = handleCompleteHabitUltraFast(value);
          
          const processingTime = new Date().getTime() - startTime;
          Logger.log(`Ultra fast processing time: ${processingTime}ms`);
          
          // Tạo response với blocks để hiển thị đẹp hơn
          const responseBlocks = [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: result.message
              }
            }
          ];
          
          // Thêm progress update nếu có thông tin streak
          if (result.streak && result.habitName) {
            const progressText = result.streak === 1 ? 
              'Bạn vừa bắt đầu hành trình xây dựng thói quen mới!' :
              `Bạn đã duy trì thói quen "${result.habitName}" được ${result.streak} ngày liên tiếp!`;
              
            responseBlocks.push({
              type: 'context',
              elements: [
                {
                   type: 'mrkdwn',
                   text: progressText
                 }
              ]
            });
            
            // Thêm thông báo khuyến khích hoàn thành các thói quen còn lại
            const encouragementMessages = [
              'Tiếp tục phấn đấu! Hãy hoàn thành các thói quen còn lại trong ngày!',
              'Động lực đang cao! Đừng dừng lại, tiếp tục với các mục tiêu khác!',
              'Tuyệt vời! Hãy duy trì đà này và chinh phục thêm các thói quen khác!',
              'Bạn đang làm rất tốt! Hãy hoàn thành tất cả để có một ngày hoàn hảo!'
            ];
            
            const randomEncouragement = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
            
            responseBlocks.push({
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: randomEncouragement
              }
            });
          }
          
          // Trả về response với blocks
          return ContentService
            .createTextOutput(JSON.stringify({
              response_type: 'in_channel',
              blocks: responseBlocks,
              replace_original: false
            }))
            .setMimeType(ContentService.MimeType.JSON);
            
        } catch (habitError) {
          Logger.log(`Error completing habit: ${habitError.message}`);
          return ContentService
            .createTextOutput(JSON.stringify({
              response_type: 'ephemeral',
              blocks: [
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `*Có lỗi xảy ra khi hoàn thành thói quen*\n${habitError.message}`
                  }
                },
                {
                  type: 'context',
                  elements: [
                    {
                      type: 'mrkdwn',
                      text: 'Vui lòng thử lại sau hoặc kiểm tra lại tên thói quen.'
                    }
                  ]
                }
              ]
            }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    
    // URL verification cho Slack App setup
    if (payload.type === 'url_verification') {
      return ContentService
        .createTextOutput(payload.challenge)
        .setMimeType(ContentService.MimeType.TEXT);
    }
    
    // Default response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        response_type: 'ephemeral',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Yêu cầu đã được xử lý thành công'
            }
          }
        ]
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    const processingTime = new Date().getTime() - startTime;
    Logger.log(`Error processing Slack interaction: ${error.message} (${processingTime}ms)`);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        response_type: 'ephemeral',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Có lỗi xảy ra khi xử lý yêu cầu*\nVui lòng thử lại sau.'
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Thời gian xử lý: ${processingTime}ms`
              }
            ]
          }
        ]
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Xử lý việc đánh dấu hoàn thành thói quen từ Slack (phiên bản siêu nhanh)
 * Tối ưu tối đa để tránh timeout 3 giây - chỉ cập nhật cell, không tính toán phức tạp
 */
function handleCompleteHabitUltraFast(value) {
  try {
    Logger.log(`Ultra fast processing: ${value}`);
    
    // Parse value: complete_habit_{habitName}_{date}
    const parts = value.split('_');
    if (parts.length < 4) {
      return { success: false, message: 'Format value không hợp lệ' };
    }
    
    const habitName = parts.slice(2, -1).join('_');
    Logger.log(`Habit: ${habitName}`);
    
    // Mở sheet trực tiếp
    const sheet = SpreadsheetApp.openById(CONFIG.spreadsheetId).getSheetByName(CONFIG.sheetName);
    
    // Lấy ngày hiện tại
    const today = new Date();
    const todayDay = today.getDate();
    
    // Lấy chỉ date row (row 15) để tìm cột ngày
    const dateRowRange = sheet.getRange('E15:AI15'); // Từ cột E đến AI
    const dateRowValues = dateRowRange.getValues()[0];
    
    // Tìm cột cho ngày hôm nay
    let todayColIndex = -1;
    for (let i = 0; i < dateRowValues.length; i++) {
      if (dateRowValues[i] == todayDay) {
        todayColIndex = i + 4; // +4 vì cột E là index 4 (A=0, B=1, C=2, D=3, E=4)
        Logger.log(`Found today ${todayDay} at column index: ${todayColIndex} (column ${String.fromCharCode(65 + todayColIndex)})`);
        break;
      }
    }
    
    if (todayColIndex === -1) {
      Logger.log(`Available dates in row 15: ${dateRowValues}`);
      return { success: false, message: `Không tìm thấy cột cho ngày ${todayDay}` };
    }
    
    // Lấy danh sách tên habits từ cột C (từ row 16 trở đi)
    const habitNamesRange = sheet.getRange('C16:C31'); // Giả sử tối đa 16 habits
    const habitNames = habitNamesRange.getValues().flat();
    
    // Tìm row index cho habit
    let habitRowIndex = -1;
    for (let i = 0; i < habitNames.length; i++) {
      if (habitNames[i] && habitNames[i].toString().toLowerCase().trim() === habitName.toLowerCase().trim()) {
        habitRowIndex = i + 16; // +16 vì bắt đầu từ row 16
        break;
      }
    }
    
    if (habitRowIndex === -1) {
      return { success: false, message: `Không tìm thấy thói quen: ${habitName}` };
    }
    
    // Tính toán cell address và cập nhật
    const targetCol = String.fromCharCode(65 + todayColIndex); // A=65, B=66, C=67...
    const cellAddress = `${targetCol}${habitRowIndex}`;
    
    // Cập nhật cell trực tiếp với giá trị TRUE
    sheet.getRange(cellAddress).setValue(true);
    
    Logger.log(`Updated ${cellAddress} = TRUE`);
    
    // Tính streak đơn giản cho feedback
    const habitRow = sheet.getRange(`C${habitRowIndex}:AI${habitRowIndex}`).getValues()[0];
    let streak = 0;
    for (let col = todayColIndex; col >= 0; col--) {
      const cellValue = habitRow[col];
      const isCompleted = cellValue === true || cellValue === 'TRUE' || cellValue === '✓' || cellValue === 'x' || cellValue === 'X' || cellValue === 1;
      if (isCompleted) {
        streak++;
      } else {
        break;
      }
    }
    
    // Tạo message động lực dựa trên streak
    let motivationMessage = '';
    
    if (streak === 1) {
      motivationMessage = 'Khởi đầu tuyệt vời!';
    } else if (streak <= 3) {
      motivationMessage = 'Đang xây dựng thói quen!';
    } else if (streak <= 7) {
      motivationMessage = 'Streak tuyệt vời!';
    } else if (streak <= 21) {
      motivationMessage = 'Thói quen đang hình thành!';
    } else {
      motivationMessage = 'Thói quen đã ăn sâu!';
    }
    
    return {
      success: true,
      message: `Đã hoàn thành "${habitName}"!\n${motivationMessage} Streak: ${streak} ngày`,
      streak: streak,
      habitName: habitName
    };
    
  } catch (error) {
    Logger.log(`Ultra fast error: ${error.message}`);
    return { success: false, message: `Lỗi: ${error.message}` };
  }
}

/**
 * Xử lý việc đánh dấu hoàn thành thói quen từ Slack (phiên bản nhanh)
 * Tối ưu để tránh timeout 3 giây
 */
function handleCompleteHabitFromSlackFast(value, userId) {
  try {
    Logger.log(`Fast processing habit completion: ${value}`);
    
    // Parse value: complete_habit_{habitName}_{date}
    const parts = value.split('_');
    const habitName = parts.slice(2, -1).join('_');
    const date = parts[parts.length - 1];
    
    Logger.log(`Completing habit: ${habitName}`);
    
    // Mở Google Sheet với timeout protection
    const sheet = SpreadsheetApp.openById(CONFIG.spreadsheetId).getSheetByName(CONFIG.sheetName);
    
    // FIXED: Sử dụng cấu trúc đúng như trong sendDailyHabitReport
    // Lấy dữ liệu từ C14:AI31 (toàn bộ vùng dữ liệu)
    const dataRange = sheet.getRange(CONFIG.dataRange); // C14:AI31
    const values = dataRange.getValues();
    
    // Row 15 trong sheet = index 1 trong array (vì bắt đầu từ C14)
    const dateRow = values[CONFIG.dateRow - 14]; // Row 15 - 14 = index 1
    
    // Tìm column cho ngày hôm nay
    const today = new Date();
    const todayDay = today.getDate();
    
    let todayColIndex = -1;
    for (let col = 0; col < dateRow.length; col++) {
      if (dateRow[col] == todayDay) {
        todayColIndex = col;
        Logger.log(`Found today ${todayDay} at data column index: ${todayColIndex}`);
        break;
      }
    }
    
    if (todayColIndex === -1) {
      Logger.log(`Available dates in date row: ${dateRow}`);
      return { success: false, message: `Không tìm thấy cột cho ngày ${todayDay}` };
    }
    
    // Tìm habit row (bắt đầu từ row 16 = index 2 trong array)
    let habitRowIndex = -1;
    for (let row = 2; row < values.length; row++) {
      const habitNameInSheet = values[row][0]; // Cột C = index 0 trong range C14:AI31
      if (habitNameInSheet && habitNameInSheet.toString().toLowerCase().trim() === habitName.toLowerCase().trim()) {
        habitRowIndex = row + 14; // +14 vì array bắt đầu từ row 14
        Logger.log(`Found habit "${habitName}" at row: ${habitRowIndex}`);
        break;
      }
    }
    
    if (habitRowIndex === -1) {
      return { success: false, message: `Không tìm thấy thói quen: ${habitName}` };
    }
    
    // Tính toán cell address: cột bắt đầu từ E (index 4) + todayColIndex
    const targetColIndex = 4 + todayColIndex; // E=4, F=5, G=6...
    const targetCol = String.fromCharCode(65 + targetColIndex); // A=65, B=66, C=67...
    
    // Cập nhật cell trực tiếp
     const cellAddress = `${targetCol}${habitRowIndex}`;
     const targetCell = sheet.getRange(cellAddress);
     targetCell.setValue(true);
     
     Logger.log(`Updated cell ${cellAddress} = TRUE for habit "${habitName}" on day ${todayDay}`);
    
    return {
      success: true,
      message: `Đã hoàn thành "${habitName}"!`
    };
    
  } catch (error) {
    Logger.log(`Error in fast habit completion: ${error.message}`);
    return { success: false, message: `Lỗi: ${error.message}` };
  }
}

/**
 * Xử lý việc đánh dấu hoàn thành thói quen từ Slack (phiên bản đầy đủ)
 * Sử dụng cho testing và các trường hợp cần tính toán streak
 */
function handleCompleteHabitFromSlack(value, userId) {
  try {
    // Parse value: complete_habit_{habitName}_{date}
    const parts = value.split('_');
    const habitName = parts.slice(2, -1).join('_'); // Lấy tên habit (có thể có underscore)
    const date = parts[parts.length - 1];
    
    Logger.log(`Completing habit: ${habitName} for date: ${date}`);
    
    // Mở Google Sheet
    const sheet = SpreadsheetApp.openById(CONFIG.spreadsheetId).getSheetByName(CONFIG.sheetName);
    const data = sheet.getDataRange().getValues();
    
    // Tìm header row và habit column
    const headers = data[0];
    const habitColumnIndex = headers.findIndex(header => header.toString().toLowerCase() === habitName.toLowerCase());
    
    if (habitColumnIndex === -1) {
      return { success: false, message: `Không tìm thấy thói quen: ${habitName}` };
    }
    
    // Tìm row cho ngày hiện tại
    const today = new Date();
    const todayString = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    let targetRowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      const rowDate = data[i][0];
      if (rowDate && Utilities.formatDate(new Date(rowDate), Session.getScriptTimeZone(), 'yyyy-MM-dd') === todayString) {
        targetRowIndex = i;
        break;
      }
    }
    
    // Nếu không tìm thấy row cho hôm nay, tạo mới
    if (targetRowIndex === -1) {
      const newRow = new Array(headers.length).fill('');
      newRow[0] = today; // Date column
      sheet.appendRow(newRow);
      targetRowIndex = sheet.getLastRow() - 1;
    }
    
    // Cập nhật cell với giá trị 1 (completed)
    const cellRange = sheet.getRange(targetRowIndex + 1, habitColumnIndex + 1);
    cellRange.setValue(1);
    
    // Tính toán streak mới
    const streak = calculateHabitStreak(data, habitColumnIndex, targetRowIndex);
    
    Logger.log(`Habit completed: ${habitName}, streak: ${streak}`);
    
    return {
      success: true,
      message: `Đã hoàn thành "${habitName}"!${streak > 1 ? ` Streak: ${streak} ngày` : ''}`
    };
    
  } catch (error) {
    Logger.log(`Error completing habit from Slack: ${error.message}`);
    return { success: false, message: `Lỗi: ${error.message}` };
  }
}

/**
  * Tạo response message cho Slack sau khi hoàn thành thói quen
  */
 function buildSlackResponseMessage(result, userId) {
   if (!result.success) {
     return { blocks: [] };
   }
   
   try {
     // Lấy dữ liệu mới nhất sau khi cập nhật
     const today = new Date();
     const data = analyzeHabits(today);
     
     const blocks = [];
     
     // Header với celebration
     blocks.push({
       type: 'section',
       text: {
         type: 'mrkdwn',
         text: `*Habit Updated!*\n${result.message}`
       }
     });
     
     // Updated progress
     const progressBar = buildSlackProgressBar(data.completionRate);
     blocks.push({
       type: 'section',
       text: {
         type: 'mrkdwn',
         text: `*Tiến độ mới:* ${data.completedHabits.length}/${data.habits.length} thói quen\n${progressBar}`
       }
     });
     
     // Perfect day achievement
     if (data.isPerfectDay) {
       blocks.push({
         type: 'section',
         text: {
           type: 'mrkdwn',
           text: '*PERFECT DAY ACHIEVED!*\nBạn đã hoàn thành tất cả thói quen hôm nay!'
         }
       });
     }
     
     return { blocks };
     
   } catch (error) {
     Logger.log(`Error building response message: ${error.message}`);
     return { blocks: [] };
   }
 }
 
 /**
  * Test function để kiểm tra Slack integration
  */
function testSlackIntegration() {
  Logger.log('Testing Slack Integration...');
  
  // Mock data for testing
  const testData = {
    habits: [
      { name: 'Đọc sách', completed: true, streak: 5 },
      { name: 'Tập thể dục', completed: true, streak: 3 },
      { name: 'Thiền', completed: false, streak: 0 }
    ],
    completedHabits: [
      { name: 'Đọc sách', completed: true, streak: 5 },
      { name: 'Tập thể dục', completed: true, streak: 3 }
    ],
    pendingHabits: [
      { name: 'Thiền', completed: false, streak: 0 }
    ],
    completionRate: 66.7,
    isPerfectDay: false,
    detailedDate: 'Thứ hai, ngày 7 tháng 1 năm 2025',
    config: {
      slackWebhookUrl: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
      slackChannel: '#habit-tracker'
    }
  };
  
  sendSlackReport(testData);
  Logger.log('Slack test completed');
}

/**
 * Test function để kiểm tra Slack interaction handling
 */
function testSlackInteraction() {
  Logger.log('Testing Slack Interaction...');
  
  // Mock Slack interaction payload
  const mockPayload = {
    type: 'block_actions',
    actions: [{
      action_id: 'complete_habit_0',
      value: 'complete_habit_Thiền_2025-01-07'
    }],
    user: {
      id: 'U1234567890'
    }
  };
  
  const result = handleCompleteHabitFromSlack(mockPayload.actions[0].value, mockPayload.user.id);
   Logger.log(`Test result: ${JSON.stringify(result)}`);
 }
 
 /**
  * Test function để kiểm tra hiệu suất Ultra Fast function
  */
 function testUltraFastPerformance() {
   Logger.log('Testing Ultra Fast Performance...');
   
   const testValues = [
     'complete_habit_Đọc sách_2025-01-07',
     'complete_habit_Tập thể dục_2025-01-07',
     'complete_habit_Thiền_2025-01-07'
   ];
   
   testValues.forEach(value => {
     const startTime = new Date().getTime();
     
     try {
       const result = handleCompleteHabitUltraFast(value);
       const processingTime = new Date().getTime() - startTime;
       
       Logger.log(`${value}: ${result.success ? 'SUCCESS' : 'FAILED'} (${processingTime}ms)`);
       Logger.log(`   Message: ${result.message}`);
       
       if (processingTime > 2000) {
         Logger.log(`WARNING: Processing time ${processingTime}ms > 2000ms`);
       }
       
     } catch (error) {
       const processingTime = new Date().getTime() - startTime;
       Logger.log(`${value}: Error after ${processingTime}ms - ${error.message}`);
     }
   });
   
   Logger.log('Ultra Fast Performance test completed');
 }
 
 /**
  * Test logic tính toán cột ngày để đảm bảo tick đúng ngày
  */
 function testDateColumnLogic() {
   Logger.log('Testing Date Column Logic...');
   
   try {
     const sheet = SpreadsheetApp.openById(CONFIG.spreadsheetId).getSheetByName(CONFIG.sheetName);
     const today = new Date();
     const todayDay = today.getDate();
     
     Logger.log(`Today is: ${today.toDateString()} (day ${todayDay})`);
     
     // Test với range E15:AI15 (như trong handleCompleteHabitUltraFast)
     const dateRowRange = sheet.getRange('E15:AI15');
     const dateRowValues = dateRowRange.getValues()[0];
     
     Logger.log('Date values in E15:AI15:', dateRowValues);
     
     let foundIndex = -1;
     for (let i = 0; i < dateRowValues.length; i++) {
       if (dateRowValues[i] == todayDay) {
         foundIndex = i;
         const colIndex = i + 4; // E=4
         const colLetter = String.fromCharCode(65 + colIndex);
         Logger.log(`Found today (${todayDay}) at:`);
         Logger.log(`   - Array index: ${i}`);
         Logger.log(`   - Column index: ${colIndex}`);
         Logger.log(`   - Column letter: ${colLetter}`);
         Logger.log(`   - Expected cell for habit in row 16: ${colLetter}16`);
         break;
       }
     }
     
     if (foundIndex === -1) {
       Logger.log(`Today (${todayDay}) not found in date row!`);
       Logger.log('Available dates:', dateRowValues.filter(d => d !== ''));
     } else {
       // Kiểm tra giá trị thực tế trong sheet
       const actualTodayCol = String.fromCharCode(65 + foundIndex + 4);
       const actualValue = sheet.getRange(`${actualTodayCol}15`).getValue();
       Logger.log(`🔍 Actual value in ${actualTodayCol}15: ${actualValue}`);
       
       // Test với habit đầu tiên
       const firstHabitRange = sheet.getRange('C16');
       const firstHabitName = firstHabitRange.getValue();
       if (firstHabitName) {
         Logger.log(`Testing with first habit: "${firstHabitName}"`);
         const testCellAddress = `${actualTodayCol}16`;
         Logger.log(`Would update cell: ${testCellAddress}`);
       }
     }
     
   } catch (error) {
     Logger.log(`💥 Error testing date column logic: ${error.message}`);
   }
 }

 /**
  * Utility function để lấy Web App URL cho Slack configuration
  */
 function getWebAppUrl() {
   const webAppUrl = ScriptApp.getService().getUrl();
   Logger.log(`Web App URL: ${webAppUrl}`);
   Logger.log('Copy URL này và paste vào Slack App Interactivity settings');
   return webAppUrl;
 }

/**
 * Xử lý Slash Commands từ Slack
 */
function handleSlashCommand(e) {
  try {
    const command = e.parameter.command;
    const text = e.parameter.text || '';
    const userId = e.parameter.user_id;
    const userName = e.parameter.user_name;
    
    Logger.log(`Slash command received: ${command} with text: ${text} from user: ${userName}`);
    
    switch (command) {
      case '/habit-report':
        return handleHabitReportCommand(text, userId, userName);
      
      case '/habit-status':
        return handleHabitStatusCommand(text, userId, userName);
        
      case '/habit-help':
        return handleHabitHelpCommand();
        
      default:
        return ContentService
          .createTextOutput(JSON.stringify({
            response_type: 'ephemeral',
            text: `Command không được hỗ trợ: ${command}`
          }))
          .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    Logger.log(`Error handling slash command: ${error.message}`);
    return ContentService
      .createTextOutput(JSON.stringify({
        response_type: 'ephemeral',
        text: 'Có lỗi xảy ra khi xử lý command'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Xử lý command /habit-report - Gửi báo cáo habit
 */
function handleHabitReportCommand(text, userId, userName) {
  try {
    // Gửi response ngay lập tức
    const immediateResponse = {
      response_type: 'in_channel',
      text: `${userName} đã yêu cầu báo cáo habit. Đang xử lý...`
    };
    
    // Chạy sendDailyHabitReport trong background
    setTimeout(() => {
      try {
        sendDailyHabitReport();
        
        // Gửi follow-up message
        const followUpMessage = {
          channel: CONFIG.slackChannel,
          text: `Báo cáo habit đã được gửi thành công bởi ${userName}!`,
          username: 'Habit Tracker Bot'
        };
        
        UrlFetchApp.fetch(CONFIG.slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          payload: JSON.stringify(followUpMessage)
        });
        
      } catch (error) {
        Logger.log(`Error in background habit report: ${error.message}`);
        
        // Gửi error message
        const errorMessage = {
          channel: CONFIG.slackChannel,
          text: `Lỗi khi gửi báo cáo habit: ${error.message}`,
          username: 'Habit Tracker Bot'
        };
        
        UrlFetchApp.fetch(CONFIG.slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          payload: JSON.stringify(errorMessage)
        });
      }
    }, 100);
    
    return ContentService
      .createTextOutput(JSON.stringify(immediateResponse))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log(`Error in handleHabitReportCommand: ${error.message}`);
    return ContentService
      .createTextOutput(JSON.stringify({
        response_type: 'ephemeral',
        text: `Lỗi khi xử lý báo cáo: ${error.message}`
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Xử lý command /habit-status - Hiển thị trạng thái habit hiện tại
 */
function handleHabitStatusCommand(text, userId, userName) {
  try {
    const today = new Date();
    const todayDay = today.getDate();
    
    // Mở spreadsheet
    const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
    const sheet = ss.getSheetByName(CONFIG.sheetName);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          response_type: 'ephemeral',
          text: 'Không thể truy cập Google Sheet'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Lấy dữ liệu và phân tích
    const dataRange = sheet.getRange(CONFIG.dataRange);
    const values = dataRange.getValues();
    
    // Tìm cột ngày hôm nay
    const dateRow = values[CONFIG.dateRow - 14];
    let todayColIndex = -1;
    
    for (let col = 0; col < dateRow.length; col++) {
      if (dateRow[col] == todayDay) {
        todayColIndex = col;
        break;
      }
    }
    
    if (todayColIndex === -1) {
      return ContentService
        .createTextOutput(JSON.stringify({
          response_type: 'ephemeral',
          text: `Không tìm thấy dữ liệu cho ngày ${todayDay}`
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const habits = analyzeHabits(values, todayColIndex, CONFIG);
    const completedHabits = habits.filter(h => h.completed);
    const pendingHabits = habits.filter(h => !h.completed);
    const completionRate = habits.length > 0 ? (completedHabits.length / habits.length) * 100 : 0;
    
    // Tạo response message
    let statusText = `*Trạng thái habit hôm nay (${todayDay}/${today.getMonth() + 1})*\n\n`;
    statusText += `📊 Tiến độ: ${completedHabits.length}/${habits.length} (${Math.round(completionRate)}%)\n`;
    statusText += buildSlackProgressBar(completionRate) + '\n\n';
    
    if (completedHabits.length > 0) {
      statusText += `✅ *Đã hoàn thành (${completedHabits.length}):*\n`;
      completedHabits.forEach(habit => {
        const streakText = habit.streak > 0 ? ` (${habit.streak} ngày)` : '';
        statusText += `• ${habit.name}${streakText}\n`;
      });
      statusText += '\n';
    }
    
    if (pendingHabits.length > 0) {
      statusText += `⏳ *Chưa thực hiện (${pendingHabits.length}):*\n`;
      pendingHabits.forEach(habit => {
        statusText += `• ${habit.name}\n`;
      });
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        response_type: 'ephemeral',
        text: statusText
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log(`Error in handleHabitStatusCommand: ${error.message}`);
    return ContentService
      .createTextOutput(JSON.stringify({
        response_type: 'ephemeral',
        text: `Lỗi khi lấy trạng thái: ${error.message}`
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Xử lý command /habit-help - Hiển thị hướng dẫn
 */
function handleHabitHelpCommand() {
  const helpText = `*🎯 Habit Tracker Commands*\n\n` +
    `• \`/habit-report\` - Gửi báo cáo habit hôm nay\n` +
    `• \`/habit-status\` - Xem trạng thái habit hiện tại\n` +
    `• \`/habit-help\` - Hiển thị hướng dẫn này\n\n` +
    `*💡 Cách sử dụng:*\n` +
    `1. Sử dụng \`/habit-report\` để gửi báo cáo với các nút tương tác\n` +
    `2. Nhấn nút "Hoàn thành" để đánh dấu habit đã làm\n` +
    `3. Sử dụng \`/habit-status\` để kiểm tra tiến độ nhanh\n\n` +
    `*🔧 Cài đặt:*\n` +
    `Web App URL: \`${ScriptApp.getService().getUrl()}\``;
  
  return ContentService
    .createTextOutput(JSON.stringify({
      response_type: 'ephemeral',
      text: helpText
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
 
 /**
  * Comprehensive test cho toàn bộ Slack integration workflow
  */
 function testCompleteSlackWorkflow() {
   Logger.log('Testing Complete Slack Workflow...');
   
   try {
     // 1. Test gửi báo cáo với buttons
     Logger.log('📤 Step 1: Testing Slack report with buttons...');
     testSlackIntegration();
     
     // 2. Test xử lý button interaction
     Logger.log('🔄 Step 2: Testing button interaction...');
     testSlackInteraction();
     
     // 3. Test response message building
     Logger.log('💬 Step 3: Testing response message...');
     const mockResult = {
       success: true,
       message: 'Đã hoàn thành "Test Habit"! Streak: 5 ngày'
     };
     const responseMessage = buildSlackResponseMessage(mockResult, 'U1234567890');
     Logger.log(`Response message: ${JSON.stringify(responseMessage)}`);
     
     // 4. Hiển thị Web App URL
     Logger.log('Step 4: Getting Web App URL...');
     getWebAppUrl();
     
     Logger.log('Complete Slack workflow test finished!');
  Logger.log('Next steps:');
     Logger.log('   1. Deploy Web App với quyền "Anyone"');
     Logger.log('   2. Copy Web App URL vào Slack App Interactivity settings');
     Logger.log('   3. Test thực tế bằng cách gửi báo cáo và click buttons');
     
   } catch (error) {
     Logger.log(`Workflow test error: ${error.message}`);
   }
 }
 
 /**
  * Quick setup function để kiểm tra tất cả requirements
  */
 /**
 * Test slash commands
 */
function testSlashCommands() {
  Logger.log('🧪 Testing Slash Commands...');
  
  // Test /habit-report command
  const mockReportEvent = {
    parameter: {
      command: '/habit-report',
      text: '',
      user_id: 'U1234567890',
      user_name: 'test_user'
    }
  };
  
  Logger.log('Testing /habit-report command...');
  const reportResult = handleSlashCommand(mockReportEvent);
  Logger.log(`Report command result: ${reportResult.getContent()}`);
  
  // Test /habit-status command
  const mockStatusEvent = {
    parameter: {
      command: '/habit-status',
      text: '',
      user_id: 'U1234567890',
      user_name: 'test_user'
    }
  };
  
  Logger.log('Testing /habit-status command...');
  const statusResult = handleSlashCommand(mockStatusEvent);
  Logger.log(`Status command result: ${statusResult.getContent()}`);
  
  // Test /habit-help command
  const mockHelpEvent = {
    parameter: {
      command: '/habit-help',
      text: '',
      user_id: 'U1234567890',
      user_name: 'test_user'
    }
  };
  
  Logger.log('Testing /habit-help command...');
  const helpResult = handleSlashCommand(mockHelpEvent);
  Logger.log(`Help command result: ${helpResult.getContent()}`);
}

/**
 * Hiển thị hướng dẫn setup Slack App với Slash Commands
 */
function showSlackSetupGuide() {
  const webAppUrl = ScriptApp.getService().getUrl();
  
  Logger.log('📋 SLACK APP SETUP GUIDE');
  Logger.log('========================');
  Logger.log('');
  Logger.log('🔗 Web App URL (cần thiết cho cả Interactive và Slash Commands):');
  Logger.log(webAppUrl);
  Logger.log('');
  Logger.log('📝 CÁC BƯỚC THIẾT LẬP:');
  Logger.log('');
  Logger.log('1. TẠO SLACK APP:');
  Logger.log('   - Truy cập: https://api.slack.com/apps');
  Logger.log('   - Tạo "New App" > "From scratch"');
  Logger.log('   - Chọn workspace của bạn');
  Logger.log('');
  Logger.log('2. CẤU HÌNH INCOMING WEBHOOKS:');
  Logger.log('   - Vào "Incoming Webhooks" > Enable');
  Logger.log('   - "Add New Webhook to Workspace"');
  Logger.log('   - Chọn channel (ví dụ: #habit)');
  Logger.log('   - Copy Webhook URL và cập nhật CONFIG.slackWebhookUrl');
  Logger.log('');
  Logger.log('3. CẤU HÌNH INTERACTIVITY:');
  Logger.log('   - Vào "Interactivity & Shortcuts" > Enable');
  Logger.log('   - Request URL: ' + webAppUrl);
  Logger.log('');
  Logger.log('4. CẤU HÌNH SLASH COMMANDS:');
  Logger.log('   - Vào "Slash Commands" > "Create New Command"');
  Logger.log('   - Tạo các commands sau:');
  Logger.log('');
  Logger.log('   Command: /habit-report');
  Logger.log('   Request URL: ' + webAppUrl);
  Logger.log('   Short Description: Gửi báo cáo habit hôm nay');
  Logger.log('   Usage Hint: (không cần tham số)');
  Logger.log('');
  Logger.log('   Command: /habit-status');
  Logger.log('   Request URL: ' + webAppUrl);
  Logger.log('   Short Description: Xem trạng thái habit hiện tại');
  Logger.log('   Usage Hint: (không cần tham số)');
  Logger.log('');
  Logger.log('   Command: /habit-help');
  Logger.log('   Request URL: ' + webAppUrl);
  Logger.log('   Short Description: Hiển thị hướng dẫn sử dụng');
  Logger.log('   Usage Hint: (không cần tham số)');
  Logger.log('');
  Logger.log('5. CẤU HÌNH PERMISSIONS:');
  Logger.log('   - Vào "OAuth & Permissions"');
  Logger.log('   - Thêm Bot Token Scopes:');
  Logger.log('     • chat:write');
  Logger.log('     • commands');
  Logger.log('     • incoming-webhook');
  Logger.log('');
  Logger.log('6. CÀI ĐẶT APP:');
  Logger.log('   - "Install App to Workspace"');
  Logger.log('   - Authorize các permissions');
  Logger.log('');
  Logger.log('7. KIỂM TRA:');
  Logger.log('   - Chạy testSlashCommands() để test');
  Logger.log('   - Thử /habit-help trong Slack');
  Logger.log('');
  Logger.log('💡 LƯU Ý:');
  Logger.log('   - Mỗi khi deploy lại Apps Script, URL có thể thay đổi');
  Logger.log('   - Cần cập nhật lại Request URL trong Slack App settings');
  Logger.log('   - Đảm bảo CONFIG.slackWebhookUrl và CONFIG.slackChannel đã đúng');
}

function checkSlackSetupRequirements() {
   Logger.log('🔍 Checking Slack Setup Requirements...');
   
   const requirements = [];
   
   // Check CONFIG
   if (!CONFIG.slackWebhookUrl || CONFIG.slackWebhookUrl.includes('YOUR/SLACK/WEBHOOK')) {
     requirements.push('MISSING: Cần cập nhật slackWebhookUrl trong CONFIG');
   } else {
     requirements.push('OK: Slack Webhook URL configured');
   }
   
   if (!CONFIG.slackChannel) {
     requirements.push('MISSING: Cần cập nhật slackChannel trong CONFIG');
   } else {
     requirements.push('OK: Slack Channel configured');
   }
   
   if (!CONFIG.enableSlack) {
     requirements.push('WARNING: enableSlack = false (tính năng đang tắt)');
   } else {
     requirements.push('OK: Slack enabled');
   }
   
   // Check Google Sheets access
   try {
     const sheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
     requirements.push('OK: Google Sheets access OK');
   } catch (error) {
     requirements.push('ERROR: Không thể truy cập Google Sheets');
   }
   
   // Display results
   requirements.forEach(req => Logger.log(req));
   
   const allGood = requirements.every(req => req.startsWith('OK:'));
   if (allGood) {
     Logger.log('Tất cả requirements đã sẵn sàng!');
     Logger.log('Có thể proceed với Slack integration');
   } else {
     Logger.log('Cần hoàn thành các requirements trên trước khi tiếp tục');
   }
   
   return allGood;
 }