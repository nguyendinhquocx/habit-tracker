# Slack Slash Commands Setup Guide

## Tổng quan

Hướng dẫn này sẽ giúp bạn thiết lập Slack App với Slash Commands để tương tác với Habit Tracker thông qua Slack.

## Các Slash Commands có sẵn

- `/habit-report` - Gửi báo cáo habit hôm nay với interactive buttons
- `/habit-status` - Xem trạng thái habit hiện tại (chỉ hiển thị cho bạn)
- `/habit-help` - Hiển thị hướng dẫn sử dụng

## Cách hoạt động

1. **Interactive Buttons**: Khi nhấn nút "Hoàn thành" trên Slack, nó sẽ tự động tick vào Google Sheet
2. **Slash Commands**: Cho phép bạn gọi các chức năng của Habit Tracker trực tiếp từ Slack
3. **Real-time Updates**: Sau khi tick habit, bạn có thể dùng `/habit-report` để gửi báo cáo mới

## Các bước thiết lập

### Bước 1: Lấy Web App URL

1. Mở Google Apps Script
2. Chạy function `showSlackSetupGuide()` hoặc `getWebAppUrl()`
3. Copy URL hiển thị trong logs

### Bước 2: Tạo Slack App

1. Truy cập [Slack API](https://api.slack.com/apps)
2. Click "Create New App" > "From scratch"
3. Đặt tên app (ví dụ: "Habit Tracker")
4. Chọn workspace của bạn

### Bước 3: Cấu hình Incoming Webhooks

1. Trong Slack App settings, vào "Incoming Webhooks"
2. Toggle "Activate Incoming Webhooks" = ON
3. Click "Add New Webhook to Workspace"
4. Chọn channel muốn gửi thông báo (ví dụ: #habit)
5. Copy Webhook URL
6. Cập nhật `CONFIG.slackWebhookUrl` trong code

### Bước 4: Cấu hình Interactivity

1. Vào "Interactivity & Shortcuts"
2. Toggle "Interactivity" = ON
3. Paste Web App URL vào "Request URL"
4. Click "Save Changes"

### Bước 5: Tạo Slash Commands

Tạo 3 slash commands sau:

#### Command 1: /habit-report
- **Command**: `/habit-report`
- **Request URL**: [Web App URL từ bước 1]
- **Short Description**: `Gửi báo cáo habit hôm nay`
- **Usage Hint**: (để trống)

#### Command 2: /habit-status
- **Command**: `/habit-status`
- **Request URL**: [Web App URL từ bước 1]
- **Short Description**: `Xem trạng thái habit hiện tại`
- **Usage Hint**: (để trống)

#### Command 3: /habit-help
- **Command**: `/habit-help`
- **Request URL**: [Web App URL từ bước 1]
- **Short Description**: `Hiển thị hướng dẫn sử dụng`
- **Usage Hint**: (để trống)

### Bước 6: Cấu hình Permissions

1. Vào "OAuth & Permissions"
2. Trong "Scopes" > "Bot Token Scopes", thêm:
   - `chat:write`
   - `commands`
   - `incoming-webhook`

### Bước 7: Cài đặt App

1. Click "Install App to Workspace"
2. Review và authorize các permissions
3. App sẽ được thêm vào workspace

## Kiểm tra setup

### Trong Google Apps Script:
```javascript
// Chạy function này để test
testSlashCommands();

// Hoặc kiểm tra setup requirements
checkSlackSetupRequirements();
```

### Trong Slack:
1. Thử command `/habit-help` để xem hướng dẫn
2. Thử `/habit-status` để xem trạng thái hiện tại
3. Thử `/habit-report` để gửi báo cáo với interactive buttons

## Workflow sử dụng

1. **Gửi báo cáo**: `/habit-report`
2. **Tick habits**: Nhấn nút "Hoàn thành" trên message
3. **Gửi báo cáo mới**: `/habit-report` (để xem cập nhật)
4. **Kiểm tra nhanh**: `/habit-status`

## Troubleshooting

### Lỗi thường gặp:

1. **"Command không được hỗ trợ"**
   - Kiểm tra tên command đã đúng chưa
   - Đảm bảo đã tạo slash command trong Slack App

2. **"Có lỗi xảy ra khi xử lý command"**
   - Kiểm tra Web App URL đã đúng chưa
   - Xem logs trong Google Apps Script

3. **Buttons không hoạt động**
   - Kiểm tra Interactivity settings
   - Đảm bảo Request URL đúng

4. **Không nhận được thông báo**
   - Kiểm tra `CONFIG.slackWebhookUrl`
   - Kiểm tra `CONFIG.slackChannel`
   - Đảm bảo `CONFIG.enableSlack = true`

### Debug:

```javascript
// Kiểm tra config
Logger.log(CONFIG.slackWebhookUrl);
Logger.log(CONFIG.slackChannel);
Logger.log(CONFIG.enableSlack);

// Test webhook
testSlackIntegration();

// Test slash commands
testSlashCommands();
```

## Lưu ý quan trọng

1. **URL thay đổi**: Mỗi khi deploy lại Apps Script, Web App URL có thể thay đổi. Cần cập nhật lại trong Slack App settings.

2. **Permissions**: Đảm bảo Slack App có đủ permissions để gửi messages và nhận commands.

3. **Channel**: Bot cần được invite vào channel trước khi có thể gửi messages.

4. **Rate Limits**: Slack có giới hạn số lượng requests. Tránh spam commands.

## Tính năng nâng cao

Có thể mở rộng thêm:
- `/habit-add [tên habit]` - Thêm habit mới
- `/habit-streak [tên habit]` - Xem streak của habit cụ thể
- `/habit-stats` - Thống kê tổng quan
- Scheduled reports tự động

---

**Chúc bạn thành công với việc xây dựng thói quen tốt! 🎯**