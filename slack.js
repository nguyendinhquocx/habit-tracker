/**
 * HABIT TRACKER - Slack Integration Module
 * 
 * Slack messaging, slash commands, and interactive components
 * 
 * @version 2.0
 * @author Nguyen Dinh Quoc
 * @updated 2025-01-20
 */

/**
 * Send Slack report
 * @param {Object} reportData - Report data
 * @param {Object} config - Configuration object
 * @returns {boolean} Success status
 */
function sendSlackReport(reportData, config) {
  if (!config.enableSlack || !config.slackWebhookUrl) {
    Logger.log('⚠️ Slack is disabled or webhook URL not configured');
    return false;
  }

  try {
    const slackMessage = buildSlackMessage(reportData, config);
    
    const response = UrlFetchApp.fetch(config.slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(slackMessage)
    });
    
    if (response.getResponseCode() === 200) {
      Logger.log('✅ Slack report sent successfully');
      return true;
    } else {
      Logger.log(`❌ Slack API error: ${response.getResponseCode()} - ${response.getContentText()}`);
      return false;
    }
    
  } catch (error) {
    Logger.log(`❌ Error sending Slack report: ${error.message}`);
    return false;
  }
}

/**
 * Build Slack message using Block Kit
 * @param {Object} reportData - Report data
 * @param {Object} config - Configuration object
 * @returns {Object} Slack message object
 */
function buildSlackMessage(reportData, config) {
  const {
    habits,
    completedHabits,
    pendingHabits,
    completionRate,
    isPerfectDay,
    today
  } = reportData;

  const dateText = DateUtils.formatDate(today, 'detailed');
  const progressBar = ProgressUtils.buildSlackProgressBar(completionRate);
  
  const blocks = [
    // Header
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": `Habit Tracker${isPerfectDay ? ' - Perfect Day!' : ''}`
      }
    },
    
    // Date and progress
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*${dateText}*\n\n*Tiến độ:* ${completedHabits.length}/${habits.length} thói quen (${Math.round(completionRate)}%)\n\`${progressBar}\``
      }
    },
    
    {
      "type": "divider"
    }
  ];

  // Completed habits section
  if (completedHabits.length > 0) {
    const completedText = completedHabits.map(habit => {
      const streakText = habit.streak > 0 ? ` _(${habit.streak} ngày)_` : '';
      return `${habit.name}${streakText}`;
    }).join('\n');

    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*Đã hoàn thành (${completedHabits.length}):*\n${completedText}`
      }
    });
  }

  // Pending habits with action buttons
  if (pendingHabits.length > 0) {
    const pendingText = pendingHabits.map(habit => `${habit.name}`).join('\n');
    
    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*Chưa thực hiện (${pendingHabits.length}):*\n${pendingText}`
      }
    });

    // Add action buttons for pending habits (limit to 5 for UI)
    const habitsToShow = pendingHabits.slice(0, 5);
    if (habitsToShow.length > 0) {
      const elements = habitsToShow.map(habit => ({
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": `Hoàn thành ${StringUtils.truncate(habit.name, 20)}`
        },
        "value": habit.name,
        "action_id": `complete_habit_${habit.name.replace(/\s+/g, '_').toLowerCase()}`
      }));

      blocks.push({
        "type": "actions",
        "elements": elements
      });
    }
  }

  // Motivation message
  const motivationMessage = getMotivationMessage(isPerfectDay, completionRate);
  if (motivationMessage) {
    blocks.push(
      {
        "type": "divider"
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": motivationMessage
        }
      }
    );
  }

  // English learning section
  const englishSentences = getRandomEnglishSentences(10); // Fewer sentences for Slack
  if (englishSentences && englishSentences.length > 0) {
    const englishText = buildEnglishLearningText(englishSentences);
    if (englishText) {
      blocks.push(
        {
          "type": "divider"
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": englishText
          }
        }
      );
    }
  }

  return {
    channel: config.slackChannel,
    blocks: blocks,
    unfurl_links: false,
    unfurl_media: false
  };
}

/**
 * Get motivation message based on completion rate
 * Uses daily lessons from Google Sheet or fallback to default messages
 * @param {boolean} isPerfectDay - Whether it's a perfect day
 * @param {number} completionRate - Completion percentage
 * @returns {string} Motivation message
 */
function getMotivationMessage(isPerfectDay, completionRate) {
  try {
    // Try to get daily lessons from Google Sheet
    const lessons = getRandomLessons(4); // Get 2 lessons for Slack
    
    if (lessons && lessons.length > 0) {
      let motivationText = "*Bài học hôm nay:*\n";
      lessons.forEach((lesson, index) => {
        motivationText += `• ${lesson.baiHoc}\n`;
      });
      return motivationText.trim();
    }
  } catch (error) {
    Logger.log(`⚠️ Could not load daily lessons for Slack: ${error.message}`);
  }
  
  // Fallback to default motivation messages
  if (isPerfectDay) {
    return "*Tuyệt vời!* Bạn đã hoàn thành tất cả thói quen hôm nay. Hãy tiếp tục duy trì!";
  } else if (completionRate >= 80) {
    return "*Rất tốt!* Bạn đã hoàn thành hầu hết các thói quen. Hãy cố gắng hoàn thiện những thói quen còn lại!";
  } else if (completionRate >= 50) {
    return "*Không tệ!* Bạn đã hoàn thành hơn một nửa. Hãy tiếp tục phấn đấu!";
  } else if (completionRate > 0) {
    return "*Khởi đầu tốt!* Mỗi bước nhỏ đều có ý nghĩa. Hãy tiếp tục!";
  } else {
    return "*Hôm nay chưa bắt đầu?* Không sao, hãy bắt đầu ngay bây giờ!";
  }
}

/**
 * Handle Slack slash commands
 * @param {Object} event - Slack event object
 * @param {Object} config - Configuration object
 * @returns {Object} Slack response
 */
function handleSlashCommand(event, config) {
  const { command, text, user_name } = event;
  
  try {
    switch (command) {
      case '/habit-report':
        return handleHabitReportCommand(config);
      case '/habit-status':
        return handleHabitStatusCommand(config);
      case '/habit-help':
        return handleHabitHelpCommand();
      default:
        return {
          response_type: 'ephemeral',
          text: `Unknown command: ${command}`
        };
    }
  } catch (error) {
    Logger.log(`Error handling slash command: ${error.message}`);
    return {
      response_type: 'ephemeral',
      text: 'Đã xảy ra lỗi khi xử lý lệnh. Vui lòng thử lại sau.'
    };
  }
}

/**
 * Handle /habit-report command
 * @param {Object} config - Configuration object
 * @returns {Object} Slack response
 */
function handleHabitReportCommand(config) {
  try {
    const reportData = generateQuickHabitReport(config);
    const slackReport = buildSlackHabitReport(reportData);
    
    return {
      response_type: 'in_channel',
      ...slackReport
    };
  } catch (error) {
    Logger.log(`Error generating habit report: ${error.message}`);
    return {
      response_type: 'ephemeral',
      text: 'Không thể tạo báo cáo thói quen. Vui lòng kiểm tra cấu hình.'
    };
  }
}

/**
 * Handle /habit-status command
 * @param {Object} config - Configuration object
 * @returns {Object} Slack response
 */
function handleHabitStatusCommand(config) {
  try {
    const reportData = generateQuickHabitReport(config);
    const { habits, completedHabits, completionRate } = reportData;
    
    const statusText = `*Trạng thái thói quen hôm nay:*\n` +
      `• Hoàn thành: ${completedHabits.length}/${habits.length} thói quen\n` +
      `• Tiến độ: ${Math.round(completionRate)}%\n` +
      `• Thanh tiến trình: \`${ProgressUtils.buildSlackProgressBar(completionRate)}\``;
    
    return {
      response_type: 'ephemeral',
      text: statusText
    };
  } catch (error) {
    Logger.log(`Error getting habit status: ${error.message}`);
    return {
      response_type: 'ephemeral',
      text: 'Không thể lấy trạng thái thói quen. Vui lòng kiểm tra cấu hình.'
    };
  }
}

/**
 * Handle /habit-help command
 * @returns {Object} Slack response
 */
function handleHabitHelpCommand() {
  const helpText = `*Hướng dẫn sử dụng Habit Tracker:*\n\n` +
    `*Lệnh có sẵn:*\n` +
    `• \`/habit-report\` - Xem báo cáo thói quen với nút tương tác\n` +
    `• \`/habit-status\` - Xem trạng thái nhanh\n` +
    `• \`/habit-help\` - Hiển thị hướng dẫn này\n\n` +
    `*Tính năng:*\n` +
    `• Báo cáo tự động hàng ngày\n` +
    `• Đánh dấu hoàn thành thói quen bằng nút\n` +
    `• Theo dõi streak (chuỗi ngày liên tiếp)\n` +
    `• Thông báo động lực\n\n` +
    `*Cần hỗ trợ?* Liên hệ admin để cấu hình thêm.`;
  
  return {
    response_type: 'ephemeral',
    text: helpText
  };
}

/**
 * Handle Slack button interactions
 * @param {Object} payload - Slack interaction payload
 * @param {Object} config - Configuration object
 * @returns {Object} Slack response
 */
function handleSlackInteraction(payload, config) {
  try {
    const { actions, user } = payload;
    
    if (actions && actions.length > 0) {
      const action = actions[0];
      
      if (action.action_id.startsWith('complete_habit_')) {
        return handleCompleteHabitFromSlack(action.value, user, config);
      }
    }
    
    return {
      response_type: 'ephemeral',
      text: 'Hành động không được hỗ trợ.'
    };
  } catch (error) {
    Logger.log(`Error handling Slack interaction: ${error.message}`);
    return {
      response_type: 'ephemeral',
      text: 'Đã xảy ra lỗi khi xử lý tương tác.'
    };
  }
}

/**
 * Handle completing habit from Slack
 * @param {string} habitName - Name of the habit
 * @param {Object} user - Slack user object
 * @param {Object} config - Configuration object
 * @returns {Object} Slack response
 */
function handleCompleteHabitFromSlack(habitName, user, config) {
  try {
    const result = ErrorUtils.safeExecute(() => {
      return handleCompleteHabitUltraFast(habitName, config);
    }, 'Complete habit from Slack', { success: false, message: 'Lỗi không xác định' });
    
    if (result.success) {
      const streakText = result.streak > 0 ? ` (Streak: ${result.streak} ngày!)` : '';
      const encouragementMessages = [
        'Tuyệt vời!',
        'Làm tốt lắm!',
        'Xuất sắc!',
        'Tiếp tục như vậy!',
        'Thật tuyệt!'
      ];
      
      const randomEncouragement = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
      
      return {
          response_type: 'in_channel',
          text: `${randomEncouragement} <@${user.id}> đã hoàn thành "*${habitName}*"${streakText}`
        };
    } else {
      return {
          response_type: 'ephemeral',
          text: `Không thể hoàn thành "${habitName}": ${result.message}`
        };
    }
  } catch (error) {
    Logger.log(`Error completing habit from Slack: ${error.message}`);
    return {
      response_type: 'ephemeral',
      text: 'Đã xảy ra lỗi khi hoàn thành thói quen.'
    };
  }
}

/**
 * Generate quick habit report for Slack
 * @param {Object} config - Configuration object
 * @returns {Object} Report data
 */
function generateQuickHabitReport(config) {
  const ss = SpreadsheetApp.openById(config.spreadsheetId);
  const sheet = ss.getSheetByName(config.sheetName);
  
  if (!sheet) {
    throw new Error(`Sheet '${config.sheetName}' not found`);
  }

  // FIXED: Use the updated findTodayColumn function for consistency
  const todayColIndex = findTodayColumn(sheet, config);
  
  if (todayColIndex === -1) {
    const today = new Date();
    const todayDay = today.getDate();
    throw new Error(`Column for day ${todayDay} not found`);
  }

  // Get data range
  const dataRange = sheet.getRange(config.dataRange);
  const values = dataRange.getValues();

  // Analyze habits
  const habits = analyzeHabits(values, todayColIndex, config);
  const completedHabits = habits.filter(h => h.completed);
  const pendingHabits = habits.filter(h => !h.completed);
  const completionRate = habits.length > 0 ? (completedHabits.length / habits.length) * 100 : 0;
  const isPerfectDay = pendingHabits.length === 0 && completedHabits.length > 0;
  
  const today = new Date();
  
  return {
    habits,
    completedHabits,
    pendingHabits,
    completionRate,
    isPerfectDay,
    today,
    todayDay: today.getDate()
  };
}

/**
 * Build Slack habit report with interactive buttons
 * @param {Object} reportData - Report data
 * @returns {Object} Slack message object
 */
function buildSlackHabitReport(reportData) {
  const {
    habits,
    completedHabits,
    pendingHabits,
    completionRate,
    isPerfectDay,
    today
  } = reportData;

  const dateText = DateUtils.formatDate(today, 'short');
  const progressBar = ProgressUtils.buildSlackProgressBar(completionRate);
  
  const blocks = [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": `Báo cáo thói quen - ${dateText}`
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*Tiến độ:* ${completedHabits.length}/${habits.length} (${Math.round(completionRate)}%)\n\`${progressBar}\``
      }
    }
  ];

  if (completedHabits.length > 0) {
    const completedText = completedHabits.map(habit => {
      const streakText = habit.streak > 0 ? ` _(${habit.streak}d)_` : '';
      return `${habit.name}${streakText}`;
    }).join('\n');

    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*Đã hoàn thành:*\n${completedText}`
      }
    });
  }

  if (pendingHabits.length > 0) {
    const pendingText = pendingHabits.map(habit => `${habit.name}`).join('\n');
    
    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*Chưa thực hiện:*\n${pendingText}`
      }
    });

    // Add action buttons
    const habitsToShow = pendingHabits.slice(0, 5);
    if (habitsToShow.length > 0) {
      const elements = habitsToShow.map(habit => ({
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": `Hoàn thành ${StringUtils.truncate(habit.name, 20)}`
        },
        "value": habit.name,
        "action_id": `complete_habit_${habit.name.replace(/\s+/g, '_').toLowerCase()}`
      }));

      blocks.push({
        "type": "actions",
        "elements": elements
      });
    }
  }

  return { blocks };
}

/**
 * Test Slack integration
 * @param {Object} config - Configuration object
 */
function testSlackIntegration(config) {
  Logger.log('=== TESTING SLACK INTEGRATION ===');
  
  if (!config.enableSlack) {
    Logger.log('⚠️ Slack is disabled in configuration');
    return false;
  }
  
  if (!config.slackWebhookUrl) {
    Logger.log('❌ Slack webhook URL not configured');
    return false;
  }
  
  // Test with mock data
  const mockData = {
    habits: [
      { name: 'Test Habit 1', completed: true, streak: 3 },
      { name: 'Test Habit 2', completed: false, streak: 0 }
    ],
    today: new Date()
  };
  
  mockData.completedHabits = mockData.habits.filter(h => h.completed);
  mockData.pendingHabits = mockData.habits.filter(h => !h.completed);
  mockData.completionRate = (mockData.completedHabits.length / mockData.habits.length) * 100;
  mockData.isPerfectDay = false;
  
  const success = sendSlackReport(mockData, config);
  
  if (success) {
    Logger.log('✅ Slack test message sent successfully');
  } else {
    Logger.log('❌ Slack test failed');
  }
  
  return success;
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sendSlackReport,
    buildSlackMessage,
    handleSlashCommand,
    handleSlackInteraction,
    handleCompleteHabitFromSlack,
    generateQuickHabitReport,
    buildSlackHabitReport,
    testSlackIntegration
  };
}