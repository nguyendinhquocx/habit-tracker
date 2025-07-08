# Hướng dẫn thiết lập Slack Integration cho Habit Tracker

## Tổng quan
Tính năng này cho phép gửi báo cáo thói quen hàng ngày qua Slack channel, sử dụng Slack Block Kit để tạo giao diện đẹp và dễ đọc.

## Các bước thiết lập

### Bước 1: Tạo Slack App và Webhook

1. **Truy cập Slack API:**
   - Đi tới https://api.slack.com/apps
   - Đăng nhập với tài khoản Slack của bạn

2. **Tạo App mới:**
   - Click "Create New App"
   - Chọn "From scratch"
   - Đặt tên app: "Habit Tracker Bot"
   - Chọn workspace muốn cài đặt

3. **Kích hoạt Incoming Webhooks:**
   - Trong app settings, chọn "Incoming Webhooks"
   - Bật "Activate Incoming Webhooks"
   - Click "Add New Webhook to Workspace"
   - Chọn channel muốn nhận báo cáo (ví dụ: #habit-tracker)
   - Copy Webhook URL được tạo

### Bước 2: Cấu hình trong Google Apps Script

1. **Mở file habittracker.js**

2. **Cập nhật CONFIG object:**
```javascript
const CONFIG = {
  // ... các cấu hình khác
  
  // Slack Settings
  slackWebhookUrl: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK', // Thay bằng URL thực
  slackChannel: '#habit-tracker', // Channel muốn gửi
  enableSlack: true // Bật/tắt tính năng Slack
};
```

3. **Thay thế Webhook URL:**
   - Thay `'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'` bằng URL thực từ Bước 1
   - Ví dụ: `'https://hooks.slack.com/services/T1234567890/B1234567890/abcdefghijklmnopqrstuvwx'`

### Bước 3: Test tính năng

1. **Chạy hàm test:**
   - Trong Google Apps Script Editor
   - Chọn function `testSlackIntegration`
   - Click "Run"
   - Kiểm tra Logs để xem kết quả

2. **Kiểm tra Slack channel:**
   - Vào channel đã cấu hình
   - Xem có nhận được message test không

## Giao diện Slack Message

Message sẽ bao gồm:
- **Header:** Tiêu đề (Perfect Day nếu hoàn thành tất cả)
- **Thông tin ngày và tiến độ**
- **Progress bar trực quan**
- **Danh sách thói quen đã hoàn thành** (với streak)
- **Danh sách thói quen chưa thực hiện**
- **Thông điệp động viên**

## Tùy chỉnh

### Thay đổi channel
```javascript
slackChannel: '#your-channel-name'
```

### Tắt tính năng Slack tạm thời
```javascript
enableSlack: false
```

### Tùy chỉnh bot name và icon
Trong hàm `sendSlackReport`, sửa:
```javascript
const payload = {
  channel: config.slackChannel,
  username: 'Your Bot Name', // Thay đổi tên bot
  icon_emoji: ':your_emoji:', // Thay đổi emoji
  blocks: slackMessage
};
```

## Troubleshooting

### Lỗi thường gặp:

1. **"Invalid webhook URL"**
   - Kiểm tra lại URL webhook
   - Đảm bảo không có khoảng trắng thừa

2. **"Channel not found"**
   - Kiểm tra tên channel (bắt đầu bằng #)
   - Đảm bảo bot có quyền truy cập channel

3. **"Message too long"**
   - Giảm số lượng thói quen
   - Rút gọn tên thói quen

### Debug:
```javascript
// Chạy để xem logs chi tiết
testSlackIntegration();
```

## Tính năng nâng cao

### Gửi báo cáo theo múi giờ
Message sẽ tự động gửi theo lịch trigger đã thiết lập (3 lần/ngày).

### Tương tác với Slack
Có thể mở rộng để:
- Thêm buttons để mark habit complete
- Slash commands để xem báo cáo
- Reminder notifications

## Bảo mật

- **Không chia sẻ Webhook URL** với người khác
- **Webhook URL có quyền gửi message** vào workspace
- **Revoke và tạo lại** nếu bị lộ URL

---

**Hoàn tất!** Giờ bạn sẽ nhận được báo cáo thói quen đẹp mắt trên Slack mỗi ngày.