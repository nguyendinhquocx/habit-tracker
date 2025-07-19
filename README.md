# Habit Tracker v2.0

A comprehensive habit tracking system built with Google Apps Script, featuring modular architecture, email reports, and Slack integration.

## Features

- **Google Sheets Integration**: Track habits directly in Google Sheets
- **Email Reports**: Daily habit reports with beautiful HTML formatting
- **Slack Integration**: Interactive Slack commands and notifications
- **Advanced Analytics**: Streaks, completion rates, and trend analysis
- **Modular Architecture**: Clean, maintainable code structure
- **Performance Optimized**: Fast execution with smart caching
- **Environment Variables**: Secure configuration management
- **Comprehensive Testing**: Built-in test functions

## Architecture

The system is built with a modular architecture for better maintainability:

```
habit-tracker/
├── main.js          # Main application entry point
├── config.js        # Configuration management
├── utils.js         # Utility functions and helpers
├── habits.js        # Habit analysis and tracking logic
├── reports.js       # Report generation and analytics
├── email.js         # Email functionality
├── slack.js         # Slack integration
└── README.md        # This documentation
```

### Module Overview

- **`main.js`**: Core application logic, HTTP handlers, and system initialization
- **`config.js`**: Configuration management with environment variable support
- **`utils.js`**: Utility functions for dates, strings, arrays, validation, and performance
- **`habits.js`**: Habit analysis, streak calculation, and completion tracking
- **`reports.js`**: Daily, weekly, and monthly report generation with insights
- **`email.js`**: Email template building and sending functionality
- **`slack.js`**: Slack integration with slash commands and interactive buttons

## Quick Start

### 1. Setup Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Copy all module files into your project
4. Save the project

### 2. Initialize the System

Run the initialization function:

```javascript
initializeHabitTracker()
```

This will:
- Initialize configuration
- Run interactive setup
- Test all modules
- Provide next steps

### 3. Configure Your Settings

Run the setup function for interactive configuration:

```javascript
setupConfig()
```

Or use quick setup:

```javascript
quickSetup()
```

### 4. Set Up Triggers

Create automatic daily reports:

```javascript
createTriggers()
```

### 5. Deploy as Web App (for Slack)

1. Click "Deploy" > "New deployment"
2. Choose "Web app" as type
3. Set execute as "Me"
4. Set access to "Anyone"
5. Deploy and copy the URL

## Google Sheets Setup

### Sheet Structure

Your Google Sheet should have the following structure:

```
     A    B    C    D    E    F    G    H    ...
1                     1    2    3    4    5    ... (days)
2   
3   
...
15                   [Date row with day numbers]
16        Habit 1     ✓    ✓    ✗    ✓    ✓    ...
17        Habit 2     ✓    ✗    ✓    ✓    ✗    ...
18        Habit 3     ✗    ✓    ✓    ✓    ✓    ...
...
```

### Configuration

- **Date Row**: Row 15 contains day numbers (1, 2, 3, ...)
- **Habit Names**: Column C contains habit names
- **Data Range**: C1:AI31 (covers full month)
- **Completion Values**: Use `TRUE`/`FALSE`, `✓`/`✗`, or `1`/`0`

## Configuration

### Environment Variables

The system supports environment variables through Google Apps Script's PropertiesService:

```javascript
// Set configuration
setConfig('SPREADSHEET_ID', 'your-spreadsheet-id')
setConfig('SHEET_NAME', 'Habits')
setConfig('EMAIL_TO', 'your-email@example.com')
setConfig('SLACK_WEBHOOK_URL', 'your-slack-webhook-url')
setConfig('SLACK_CHANNEL', '#habits')
setConfig('ENABLE_SLACK', 'true')
setConfig('DEBUG_MODE', 'false')
```

### Configuration Options

| Setting | Description | Required | Default |
|---------|-------------|----------|----------|
| `SPREADSHEET_ID` | Google Sheets ID | ✅ | - |
| `SHEET_NAME` | Sheet name | ✅ | 'Habits' |
| `EMAIL_TO` | Email recipient | ✅ | - |
| `SLACK_WEBHOOK_URL` | Slack webhook URL | ❌ | - |
| `SLACK_CHANNEL` | Slack channel | ❌ | '#general' |
| `ENABLE_SLACK` | Enable Slack integration | ❌ | false |
| `DEBUG_MODE` | Enable debug logging | ❌ | false |

## Slack Integration

### Setup Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Create a new app
3. Configure the following features:

#### Incoming Webhooks
- Enable Incoming Webhooks
- Add webhook to your workspace
- Copy the webhook URL

#### Slash Commands
Add these slash commands:

- `/habit-report` - Get daily habit report
- `/habit-status` - Check current status
- `/habit-help` - Show help information

#### Interactive Components
- Enable Interactivity
- Set Request URL to your web app URL

#### Bot Token Scopes
Add these scopes:
- `chat:write`
- `commands`
- `incoming-webhook`

### Slack Commands

- **`/habit-report`**: Get interactive daily report with completion buttons
- **`/habit-status`**: Quick status overview
- **`/habit-help`**: Show available commands and help

### Interactive Features

- ✅ **Complete Habit Buttons**: Click to mark habits as completed
- 📊 **Real-time Updates**: Instant feedback with updated progress
- 🎯 **Smart Notifications**: Motivational messages based on streaks

## Email Reports

### Features

- **Beautiful HTML Templates**: Professional-looking reports
- **Progress Visualization**: Color-coded progress bars
- **Streak Information**: Current and longest streaks
- **Motivational Content**: Dynamic encouragement messages
- **Responsive Design**: Works on desktop and mobile

### Customization

Email templates can be customized in `email.js`:

```javascript
// Modify email template
function buildEmailTemplate(reportData, insights, config) {
  // Customize HTML template here
}
```

## Analytics & Reports

### Daily Reports
- Habit completion status
- Current streaks
- Completion percentage
- Motivational insights

### Weekly Reports
- Week-over-week progress
- Consistency analysis
- Best and worst days
- Trend identification

### Monthly Reports
- Monthly statistics
- Habit performance trends
- Long-term pattern analysis
- Achievement highlights

## Testing

### Available Test Functions

```javascript
// Test individual modules
testHabitAnalysis(config)      // Test habit tracking logic
testReportGeneration(config)   // Test report generation
testEmailReport(config)        // Test email functionality
testSlackIntegration(config)   // Test Slack integration

// Comprehensive testing
runSystemTests()               // Run all tests
showSystemStatus()            // Show system status
```

### Performance Testing

```javascript
// Test ultra-fast habit completion (for Slack)
handleCompleteHabitUltraFast('Habit Name', config)

// Performance monitoring
PerformanceUtils.measureTime(() => {
  // Your code here
})
```

## Maintenance

### Regular Tasks

1. **Monitor Logs**: Check execution logs regularly
2. **Update Triggers**: Refresh triggers if needed
3. **Backup Data**: Regular Google Sheets backups
4. **Test Integration**: Periodic integration testing

### Troubleshooting

#### Common Issues

1. **"Sheet not found"**
   - Check spreadsheet ID and sheet name
   - Verify permissions

2. **"Email sending failed"**
   - Check email address format
   - Verify Gmail quota limits

3. **"Slack integration not working"**
   - Verify webhook URL
   - Check Slack app configuration
   - Ensure web app is deployed correctly

4. **"Triggers not firing"**
   - Check trigger configuration
   - Verify script permissions
   - Look for execution errors

### Debug Mode

Enable debug mode for detailed logging:

```javascript
setConfig('DEBUG_MODE', 'true')
```

## Security

### Best Practices

- **Environment Variables**: Store sensitive data in PropertiesService
- **Access Control**: Limit script and sheet access
- **Regular Updates**: Keep dependencies updated
- **Audit Logs**: Monitor script execution logs

### Data Privacy

- Habit data stays in your Google Sheets
- Email reports sent only to configured recipients
- Slack integration uses your workspace only
- No external data storage or tracking

## Advanced Usage

### Custom Habit Analysis

```javascript
// Custom habit filtering
const completedHabits = habits.filter(h => h.completed)
const longStreaks = habits.filter(h => h.streak >= 7)

// Custom statistics
const customStats = {
  weekendCompletion: calculateWeekendStats(habits),
  morningHabits: filterMorningHabits(habits),
  difficulty: calculateDifficulty(habits)
}
```

### Custom Email Templates

```javascript
// Add custom sections to email
function buildCustomEmailSection(reportData) {
  return `
    <div class="custom-section">
      <h3>🎯 Weekly Goals</h3>
      <p>Your custom content here</p>
    </div>
  `
}
```

### Custom Slack Commands

```javascript
// Add new slash command handler
function handleCustomSlashCommand(params, config) {
  // Your custom logic here
  return buildSlackResponse('Custom response')
}
```

## Changelog

### v2.0.0 (2025-01-20)
- **Modular Architecture**: Split into separate modules
- **Environment Variables**: PropertiesService configuration
- **Performance Improvements**: Optimized for speed
- **Enhanced Testing**: Comprehensive test suite
- **Better Documentation**: Detailed setup guides
- **Security Enhancements**: Secure configuration management
- **Removed GitHub Grid**: Simplified email reports

### v1.0.0
- Initial release with basic functionality
- Google Sheets integration
- Email reports
- Slack integration

## Contributing

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Apps Script team for the platform
- Slack API for integration capabilities
- Community feedback and contributions

## Support

For support and questions:

1. Check the troubleshooting section
2. Review the test functions
3. Enable debug mode for detailed logs
4. Create an issue with detailed information

---

**Happy habit tracking!**