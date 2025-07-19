/**
 * HABIT TRACKER - Email Module
 * 
 * Email report generation and sending functionality
 * 
 * @version 2.0
 * @author Nguyen Dinh Quoc
 * @updated 2025-01-20
 */

/**
 * Build habit section HTML
 * @param {Array} habits - Array of habit objects
 * @param {string} title - Section title
 * @param {string} titleColor - Title color
 * @returns {string} HTML section
 */
function buildHabitSection(habits, title, titleColor) {
  if (habits.length === 0) {
    return `
      <div style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: ${titleColor};">
          ${title}
        </h3>
        <p style="margin: 0; font-size: 14px; color: #8e8e93; font-style: italic;">
          Không có thói quen nào
        </p>
      </div>
    `;
  }

  const habitItems = habits.map(habit => {
    const statusIndicator = habit.completed ? '✓' : '○';
    const statusColor = habit.completed ? '#22c55e' : '#8e8e93';
    const streakText = habit.streak > 0 ? ` (${habit.streak} ngày)` : '';
    
    return `
      <div style="
        display: flex; 
        align-items: center; 
        padding: 12px 16px; 
        margin-bottom: 8px; 
        background-color: #ffffff; 
        border: 1px solid #f0f0f0; 
        border-radius: 8px;
      ">
        <span style="
          font-size: 16px; 
          color: ${statusColor}; 
          margin-right: 12px; 
          font-weight: 600;
        ">${statusIndicator}</span>
        <div style="flex: 1;">
          <span style="font-size: 14px; color: #1a1a1a; font-weight: 500;">
            ${StringUtils.escapeHtml(habit.name)}
          </span>
          ${streakText ? `<span style="font-size: 12px; color: #8e8e93; margin-left: 8px;">${streakText}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="margin-bottom: 32px;">
      <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: ${titleColor};">
        ${title} (${habits.length})
      </h3>
      <div>
        ${habitItems}
      </div>
    </div>
  `;
}

/**
 * Build motivation section
 * @param {boolean} isPerfectDay - Whether it's a perfect day
 * @param {number} completionRate - Completion percentage
 * @param {Object} colors - Color scheme
 * @returns {string} HTML motivation section
 */
function buildMotivationSection(isPerfectDay, completionRate, colors) {
  // Get random lessons from Google Sheet
  const randomLessons = getRandomLessons(4);
  
  // If lessons are available, use them
  if (randomLessons && randomLessons.length > 0) {
    return buildLessonsHTML(randomLessons);
  }
  
  // Fallback to original motivation messages if no lessons available
  let message, emoji;
  
  if (isPerfectDay) {
    message = "Tuyệt vời! Bạn đã hoàn thành tất cả thói quen hôm nay. Hãy tiếp tục duy trì!";
    emoji = "🎉";
  } else if (completionRate >= 80) {
    message = "Rất tốt! Bạn đã hoàn thành hầu hết các thói quen. Hãy cố gắng hoàn thiện những thói quen còn lại!";
    emoji = "💪";
  } else if (completionRate >= 50) {
    message = "Không tệ! Bạn đã hoàn thành hơn một nửa. Hãy tiếp tục phấn đấu!";
    emoji = "👍";
  } else if (completionRate > 0) {
    message = "Khởi đầu tốt! Mỗi bước nhỏ đều có ý nghĩa. Hãy tiếp tục!";
    emoji = "🌱";
  } else {
    message = "Hôm nay chưa bắt đầu? Không sao, ngày mai là một cơ hội mới!";
    emoji = "🌅";
  }

  return `
    <div style="
      margin-bottom: 32px; 
      background-color: #f8f9fa; 
      border-radius: 12px; 
      padding: 24px; 
      text-align: center;
    ">
      <div style="font-size: 24px; margin-bottom: 12px;">${emoji}</div>
      <p style="
        margin: 0; 
        font-size: 14px; 
        color: ${colors.sectionTitle}; 
        line-height: 1.5; 
        font-weight: 500;
      ">
        ${message}
      </p>
    </div>
  `;
}

/**
 * Build email HTML template
 * @param {Object} data - Email data object
 * @returns {string} Complete HTML email
 */
function buildEmailTemplate(data) {
  const {
    subject,
    detailedDate,
    completedHabits,
    pendingHabits,
    habits,
    completionRate,
    isPerfectDay,
    colors
  } = data;

  // Build sections
  const completedSection = buildHabitSection(completedHabits, 'Đã hoàn thành', colors.sectionTitle);
  const pendingSection = buildHabitSection(pendingHabits, 'Chưa thực hiện', isPerfectDay ? colors.sectionTitle : colors.pendingTitle);
  const progressBar = ProgressUtils.buildProgressBar(completionRate, isPerfectDay);
  const motivationSection = buildMotivationSection(isPerfectDay, completionRate, colors);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
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

        <!-- Completed Habits -->
        ${completedSection}

        <!-- Pending Habits -->
        ${pendingSection}

        <!-- Daily Motivation -->
        ${motivationSection}

        <!-- Footer -->
        <div style="text-align: center; padding-top: 32px; border-top: 1px solid #f5f5f5;">
          <p style="margin: 0 0 6px; font-size: 12px; color: ${colors.footerText};">
            Keep building great habits!
          </p>
          <p style="margin: 0; font-size: 11px; color: #c7c7cc;">
            Generated by Habit Tracker v2.0
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}

/**
 * Send email report
 * @param {Object} reportData - Report data
 * @param {Object} config - Configuration object
 * @returns {boolean} Success status
 */
function sendEmailReport(reportData, config) {
  try {
    const {
      habits,
      completedHabits,
      pendingHabits,
      completionRate,
      isPerfectDay,
      todayDay,
      today
    } = reportData;

    // Validate email configuration
    if (!config.emailTo || !ValidationUtils.isValidEmail(config.emailTo)) {
      Logger.log('❌ Invalid email configuration');
      return false;
    }

    // Format date
    const detailedDate = DateUtils.formatDate(today, 'detailed');
    
    // Generate subject
    const subject = `Habit Report ${DateUtils.formatDate(today, 'short')}${isPerfectDay ? ' - Perfect Day' : ''}`;
    
    // Get color scheme
    const colors = ColorUtils.getColorScheme(isPerfectDay);
    
    // Prepare email data
    const emailData = {
      subject,
      detailedDate,
      completedHabits,
      pendingHabits,
      habits,
      completionRate,
      isPerfectDay,
      colors
    };
    
    // Build HTML content
    const htmlBody = buildEmailTemplate(emailData);
    
    // Build plain text version
    const plainTextBody = buildPlainTextEmail(emailData);
    
    // Send email
    MailApp.sendEmail({
      to: config.emailTo,
      subject: subject,
      htmlBody: htmlBody,
      body: plainTextBody
    });
    
    Logger.log(`✅ Email sent successfully to ${config.emailTo}`);
    return true;
    
  } catch (error) {
    Logger.log(`❌ Error sending email: ${error.message}`);
    return false;
  }
}

/**
 * Build plain text email version
 * @param {Object} emailData - Email data
 * @returns {string} Plain text email
 */
function buildPlainTextEmail(emailData) {
  const {
    subject,
    detailedDate,
    completedHabits,
    pendingHabits,
    habits,
    completionRate,
    isPerfectDay
  } = emailData;

  let text = `${subject}\n`;
  text += `${'='.repeat(subject.length)}\n\n`;
  text += `${detailedDate}\n\n`;
  
  // Progress overview
  text += `TỔNG QUAN TIẾN ĐỘ\n`;
  text += `${completedHabits.length}/${habits.length} thói quen (${Math.round(completionRate)}%)\n`;
  text += `${ProgressUtils.buildSlackProgressBar(completionRate)}\n\n`;
  
  // Completed habits
  if (completedHabits.length > 0) {
    text += `ĐÃ HOÀN THÀNH (${completedHabits.length})\n`;
    text += `${'-'.repeat(20)}\n`;
    completedHabits.forEach(habit => {
      const streakText = habit.streak > 0 ? ` (${habit.streak} ngày)` : '';
      text += `✓ ${habit.name}${streakText}\n`;
    });
    text += '\n';
  }
  
  // Pending habits
  if (pendingHabits.length > 0) {
    text += `CHƯA THỰC HIỆN (${pendingHabits.length})\n`;
    text += `${'-'.repeat(20)}\n`;
    pendingHabits.forEach(habit => {
      text += `○ ${habit.name}\n`;
    });
    text += '\n';
  }
  
  // Daily lessons from Google Sheet
  const randomLessons = getRandomLessons(4);
  const lessonsText = buildLessonsText(randomLessons);
  text += lessonsText + '\n';
  
  // Fallback motivation if no lessons available
  if (!randomLessons || randomLessons.length === 0) {
    if (isPerfectDay) {
      text += `🎉 Tuyệt vời! Bạn đã hoàn thành tất cả thói quen hôm nay!\n`;
    } else if (completionRate >= 80) {
      text += `💪 Rất tốt! Hãy cố gắng hoàn thiện những thói quen còn lại!\n`;
    } else if (completionRate >= 50) {
      text += `👍 Không tệ! Hãy tiếp tục phấn đấu!\n`;
    } else {
      text += `🌱 Mỗi bước nhỏ đều có ý nghĩa. Hãy tiếp tục!\n`;
    }
  }
  
  text += '\n---\nGenerated by Habit Tracker v2.0';
  
  return text;
}

/**
 * Test email functionality
 * @param {Object} config - Configuration object
 */
function testEmailReport(config) {
  Logger.log('=== TESTING EMAIL REPORT ===');
  
  // Mock data for testing
  const mockData = {
    habits: [
      { name: 'Đọc sách', completed: true, streak: 5 },
      { name: 'Tập thể dục', completed: true, streak: 3 },
      { name: 'Thiền', completed: false, streak: 0 },
      { name: 'Viết nhật ký', completed: false, streak: 0 }
    ],
    today: new Date(),
    todayDay: new Date().getDate()
  };
  
  mockData.completedHabits = mockData.habits.filter(h => h.completed);
  mockData.pendingHabits = mockData.habits.filter(h => !h.completed);
  mockData.completionRate = (mockData.completedHabits.length / mockData.habits.length) * 100;
  mockData.isPerfectDay = mockData.pendingHabits.length === 0;
  
  const success = sendEmailReport(mockData, config);
  
  if (success) {
    Logger.log('✅ Test email sent successfully');
  } else {
    Logger.log('❌ Test email failed');
  }
  
  return success;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    buildHabitSection,
    buildMotivationSection,
    buildEmailTemplate,
    sendEmailReport,
    buildPlainTextEmail,
    testEmailReport
  };
}