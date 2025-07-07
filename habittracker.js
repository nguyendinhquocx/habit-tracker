/**
 * HABIT TRACKER - Daily Email Report System (FIXED VERSION)
 * 
 * FIXED: Đọc đúng cấu trúc ngày từ C9 (tháng/năm) + hàng 15 (số ngày)
 * 
 * @version 1.1
 * @author Nguyen Dinh Quoc
 * @updated 2025-07-07
 */

function sendDailyHabitReport() {
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
    
    // Icons (minimal design)
    completedIcon: 'https://cdn-icons-png.flaticon.com/128/7046/7046053.png',
    pendingIcon: 'https://cdn-icons-png.flaticon.com/128/17694/17694317.png',
    streakIcon: 'https://cdn-icons-png.flaticon.com/128/18245/18245248.png', // Updated star icon
    calendarIcon: 'https://cdn-icons-png.flaticon.com/128/3239/3239948.png',
    
    // Perfect day icons (green when all completed)
    completedIconPerfect: 'https://cdn-icons-png.flaticon.com/128/10995/10995390.png',
    pendingIconPerfect: 'https://cdn-icons-png.flaticon.com/128/17694/17694222.png',
    celebrationIcon: 'https://cdn-icons-png.flaticon.com/128/9422/9422222.png',
    
    // Debug mode
    debugMode: true // Bật để debug
  };

  try {
    // Mở spreadsheet
    const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
    const sheet = ss.getSheetByName(CONFIG.sheetName);
    
    if (!sheet) {
      Logger.log(`❌ Sheet '${CONFIG.sheetName}' không tồn tại`);
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
          Logger.log(`🎯 Tìm thấy ngày ${todayDay} ở cột index: ${col}`);
        }
        break;
      }
    }
    
    if (todayColIndex === -1) {
      Logger.log(`❌ Không tìm thấy cột cho ngày: ${todayDay}`);
      Logger.log(`📋 Dữ liệu hàng ngày: ${dateRow}`);
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
    const subject = `Habit Report ${todayDay}/${today.getMonth() + 1}/${today.getFullYear()} ${isPerfectDay ? '🎉' : ''}`;

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

    const calendarIcon = CONFIG.calendarIcon;
    const completedIcon = isPerfectDay ? CONFIG.completedIconPerfect : CONFIG.completedIcon;
    const pendingIcon = isPerfectDay ? CONFIG.pendingIconPerfect : CONFIG.pendingIcon;

    // Xây dựng HTML sections
    const completedSection = buildHabitSection(completedHabits, 'Đã hoàn thành', completedIcon, colors.sectionTitle, CONFIG);
    const pendingSection = buildHabitSection(pendingHabits, 'Chưa thực hiện', pendingIcon, isPerfectDay ? colors.sectionTitle : colors.pendingTitle, CONFIG);
    
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
              Habit Tracker ${isPerfectDay ? '🎉' : ''}
            </h1>
            <p style="margin: 8px 0 0; font-size: 16px; font-weight: 400; color: ${colors.headerSubtitle};">
              Báo cáo thói quen cá nhân
            </p>
          </div>

          <!-- Date -->
          <div style="margin-bottom: 32px;">
            <span style="font-size: 14px; font-weight: 500; color: ${colors.dateText};">
              <img src="${calendarIcon}" width="16" height="16" style="vertical-align: middle; margin-right: 8px;" alt="Calendar">
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
              Keep building great habits! 💪
            </p>
            <p style="margin: 0; font-size: 12px; font-weight: 500; color: ${colors.footerText};">
              ${isPerfectDay ? 'Perfect Day Achievement Unlocked! 🏆' : 'Tomorrow is a new opportunity'}
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

    Logger.log(`✅ Email habit report đã được gửi thành công`);
    Logger.log(`📊 Tổng kết: ${completedHabits.length}/${habits.length} thói quen hoàn thành (${Math.round(completionRate)}%)`);

  } catch (error) {
    Logger.log(`❌ Lỗi khi gửi email habit report: ${error.message}`);
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
    Logger.log(`❌ Lỗi khi phân tích habits: ${error.message}`);
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
    Logger.log(`❌ Lỗi khi tính streak: ${error.message}`);
  }
  
  return streak;
}

/**
 * Xây dựng section cho danh sách thói quen
 */
function buildHabitSection(habits, title, icon, titleColor, CONFIG) {
  if (habits.length === 0) {
    const emptyMessage = title.includes('Đã hoàn thành') ? 
      'Chưa có thói quen nào được hoàn thành hôm nay' : 
      `Tuyệt vời! Tất cả thói quen đã hoàn thành <img src="${CONFIG.celebrationIcon}" width="20" height="20" style="margin-left: 8px;" alt="Celebration">`;
    
    return `
      <div style="margin-bottom: 32px; background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden;">
        <div style="padding: 20px 24px 16px; border-bottom: 1px solid #f5f5f5;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 500; color: ${titleColor}; display: flex; align-items: center;">
            <img src="${icon}" width="20" height="20" style="margin-right: 12px;" alt="${title}">
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
        <img src="${CONFIG.streakIcon}" width="12" height="12" style="margin-right: 4px; filter: brightness(0) invert(1);" alt="Streak">
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
          <h2 style="margin: 0; font-size: 18px; font-weight: 500; color: ${titleColor}; display: flex; align-items: center;">
            <img src="${icon}" width="20" height="20" style="margin-right: 12px;" alt="${title}">
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
     const dataRange = sheet.getRange(CONFIG.DATA_RANGE);
     const allData = dataRange.getValues();
     
     // Find date row
     const dateRowIndex = CONFIG.DATE_ROW - 14; // Row 15 in sheet = index 14 in array
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
    Logger.log(`❌ Error building contribution grid: ${error.message}`);
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
  let message, emoji;
  
  if (isPerfectDay) {
    message = "Xuất sắc! Bạn đã hoàn thành tất cả thói quen hôm nay. Hãy tiếp tục duy trì!";
    emoji = "🏆";
  } else if (completionRate >= 80) {
    message = "Rất tốt! Bạn đã hoàn thành hầu hết các thói quen. Hãy cố gắng thêm một chút!";
    emoji = "💪";
  } else if (completionRate >= 50) {
    message = "Không sao, ngày mai là cơ hội mới. Hãy tập trung vào những thói quen còn lại!";
    emoji = "🌱";
  } else {
    message = "Đừng nản lòng! Mỗi ngày là một khởi đầu mới. Hãy bắt đầu từ những thói quen nhỏ!";
    emoji = "⭐";
  }

  return `
    <div style="margin-bottom: 32px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center;">
      <div style="font-size: 32px; margin-bottom: 12px;">${emoji}</div>
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
      Logger.log(`✅ Email sent successfully on attempt ${i + 1}`);
      return true;
    } catch (error) {
      Logger.log(`❌ Email attempt ${i + 1} failed: ${error.message}`);
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
    
    Logger.log('✅ Đã tạo trigger gửi báo cáo hàng ngày lúc 8:00 sáng');
    
  } catch (error) {
    Logger.log(`❌ Lỗi tạo trigger: ${error.message}`);
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
    
    Logger.log('✅ Đã tạo 3 trigger gửi báo cáo:');
    Logger.log('   - Sáng 7:00');
    Logger.log('   - Trưa 11:30');
    Logger.log('   - Tối 19:00');
    
  } catch (error) {
    Logger.log(`❌ Lỗi tạo trigger: ${error.message}`);
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
    
    Logger.log(`✅ Đã xóa ${deletedCount} trigger`);
    
  } catch (error) {
    Logger.log(`❌ Lỗi xóa trigger: ${error.message}`);
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
    
    Logger.log(`📋 Có ${habitTriggers.length} trigger đang hoạt động:`);
    
    habitTriggers.forEach((trigger, index) => {
      const eventType = trigger.getEventType();
      if (eventType === ScriptApp.EventType.CLOCK) {
        // Không thể lấy thông tin chi tiết về thời gian từ trigger object
        Logger.log(`   ${index + 1}. Trigger ID: ${trigger.getUniqueId()}`);
      }
    });
    
  } catch (error) {
    Logger.log(`❌ Lỗi kiểm tra trigger: ${error.message}`);
  }
}

/**
 * Test function for new contribution grid feature
 */
function testContributionGrid() {
   try {
     Logger.log('🧪 Testing Contribution Grid Feature...');
     
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
     
     Logger.log('✅ Sheet opened successfully');
     
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
       Logger.log(`⚠️ Today's column not found for day ${todayDay}, using first column for test`);
       todayColIndex = 0;
     }
     
     // Get habits using existing analyzeHabits function
     const habits = analyzeHabits(values, todayColIndex, CONFIG);
     Logger.log(`📊 Found ${habits.length} habits`);
     
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
     
     Logger.log('✅ Contribution grid generated successfully');
     Logger.log(`📏 Grid HTML length: ${contributionGrid.length} characters`);
     
     // Test complete - call main function
     Logger.log('🚀 Running full daily report...');
     sendDailyHabitReport();
     
   } catch (error) {
     Logger.log(`❌ Test failed: ${error.message}`);
     Logger.log(`📍 Stack trace: ${error.stack}`);
   }
 }

/**
 * ENHANCED: Test function với debug chi tiết
 */
function testHabitTracker() {
  Logger.log('🧪 TESTING HABIT TRACKER - Enhanced Debug Mode');
  
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
    Logger.log(`📅 Tháng/năm từ C9: ${monthYear}`);
    
    // Test đọc hàng ngày
    const dataRange = sheet.getRange(CONFIG.dataRange);
    const values = dataRange.getValues();
    const dateRow = values[1]; // Row 15 = index 1
    Logger.log(`📋 Hàng ngày (row 15): ${dateRow.slice(0, 10)}`); // Hiển thị 10 cột đầu
    
    // Ngày hôm nay
    const today = new Date();
    const todayDay = today.getDate();
    Logger.log(`🎯 Đang tìm ngày: ${todayDay}`);
    
    // Test tìm cột
    for (let col = 0; col < Math.min(dateRow.length, 15); col++) {
      const cellValue = dateRow[col];
      Logger.log(`📍 Cột ${col}: ${cellValue} (Type: ${typeof cellValue})`);
      if (cellValue == todayDay) {
        Logger.log(`✅ FOUND! Ngày ${todayDay} ở cột ${col}`);
      }
    }
    
  } catch (error) {
    Logger.log(`❌ Debug error: ${error.message}`);
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
    Logger.log('📊 SHEET STRUCTURE DEBUG');
    Logger.log('🔍 =================');
    
    // C9 - Tháng/năm
    const monthYear = sheet.getRange('C9').getValue();
    Logger.log(`📅 C9 (Tháng/năm): "${monthYear}" | Type: ${typeof monthYear}`);
    
    // Hàng 14 - Thứ
    const dayOfWeekRow = sheet.getRange('C14:AI14').getValues()[0];
    Logger.log(`📋 Row 14 (Thứ): [${dayOfWeekRow.slice(0, 10).join(', ')}...]`);
    
    // Hàng 15 - Ngày
    const dateRow = sheet.getRange('C15:AI15').getValues()[0];
    Logger.log(`📋 Row 15 (Ngày): [${dateRow.slice(0, 10).join(', ')}...]`);
    
    // Hàng 16 - Thói quen đầu tiên
    const firstHabitRow = sheet.getRange('C16:AI16').getValues()[0];
    const habitName = firstHabitRow[0];
    Logger.log(`🎯 Thói quen đầu tiên: "${habitName}"`);
    Logger.log(`📊 Data row 16: [${firstHabitRow.slice(0, 10).join(', ')}...]`);
    
    // Ngày hôm nay
    const today = new Date();
    Logger.log(`🗓️ Hôm nay: ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`);
    
  } catch (error) {
    Logger.log(`❌ Debug error: ${error.message}`);
  }
}