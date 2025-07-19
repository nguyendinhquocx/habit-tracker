# Slack Integration Troubleshooting Guide

## Vấn đề: Slack không tương tác được với Google Sheet

### Nguyên nhân có thể:

1. **Google Apps Script chưa được deploy as Web App**
2. **Slack App chưa được cấu hình đúng**
3. **URL webhook không đúng hoặc đã hết hạn**
4. **Thiếu permissions trong Slack App**
5. **Cấu hình trong code chưa đúng**

## Các bước kiểm tra và khắc phục:

### Bước 1: Kiểm tra Google Apps Script Deployment

#### 1.1 Kiểm tra Web App URL
```javascript
// Chạy function này trong Google Apps Script
function getWebAppUrl() {
  const webAppUrl = ScriptApp.getService().getUrl();
  Logger.log(`Web App URL: ${webAppUrl}`);
  return webAppUrl;
}
```

#### 1.2 Deploy as Web App (nếu chưa có)
1. Trong Google Apps Script Editor
2. Click **"Deploy"** > **"New deployment"**
3. Chọn type: **"Web app"**
4. Execute as: **"Me"**
5. Who has access: **"Anyone"**
6. Click **"Deploy"**
7. Copy URL được tạo

#### 1.3 Kiểm tra doPost function
```javascript
// Đảm bảo có function doPost trong code
function doPost(e) {
  // Function này xử lý requests từ Slack
  // Phải có trong habittracker.js hoặc main.js
}
```

### Bước 2: Kiểm tra Slack App Configuration

#### 2.1 Truy cập Slack App Settings
1. Đi tới https://api.slack.com/apps
2. Chọn app "Habit Tracker" (hoặc tên app của bạn)

#### 2.2 Kiểm tra Incoming Webhooks
1. Vào **"Incoming Webhooks"**
2. Đảm bảo **"Activate Incoming Webhooks" = ON**
3. Kiểm tra có webhook URL không
4. Copy webhook URL mới nếu cần

#### 2.3 Kiểm tra Interactivity & Shortcuts
1. Vào **"Interactivity & Shortcuts"**
2. Đảm bảo **"Interactivity" = ON**
3. **Request URL** phải là Web App URL từ Bước 1
4. Click **"Save Changes"**

#### 2.4 Kiểm tra Slash Commands
1. Vào **"Slash Commands"**
2. Đảm bảo có các commands:
   - `/habit-report`
   - `/habit-status`
   - `/habit-help`
3. **Request URL** của mỗi command phải là Web App URL

#### 2.5 Kiểm tra OAuth & Permissions
1. Vào **"OAuth & Permissions"**
2. Trong **"Bot Token Scopes"**, đảm bảo có:
   - `chat:write`
   - `commands`
   - `incoming-webhook`

### Bước 3: Kiểm tra Configuration trong Code

#### 3.1 Chạy debug functions
```javascript
// Trong Google Apps Script, chạy các functions này:

// 1. Kiểm tra config hiện tại
debugConfig();

// 2. Enable Slack nếu chưa
enableSlack();

// 3. Set webhook URL mới
setSlackWebhook('YOUR_WEBHOOK_URL_HERE');

// 4. Test webhook
testSlackWebhook();

// 5. Test full integration
testSlackWithDebug();
```

#### 3.2 Cập nhật Webhook URL
```javascript
// Nếu webhook URL đã thay đổi
setSlackWebhook('https://hooks.slack.com/services/T.../B.../...');
```

### Bước 4: Test Integration

#### 4.1 Test từ Google Apps Script
```javascript
// Chạy function này để test toàn bộ
testSlackWithDebug();
```

#### 4.2 Test từ Slack
1. Trong Slack channel, gõ: `/habit-help`
2. Nếu thành công, thử: `/habit-report`
3. Nhấn button "Hoàn thành" trên message
4. Kiểm tra Google Sheet có được cập nhật không

### Bước 5: Kiểm tra Logs

#### 5.1 Google Apps Script Logs
1. Trong Google Apps Script Editor
2. Click **"Executions"** để xem logs
3. Tìm errors liên quan đến Slack requests

#### 5.2 Slack App Logs
1. Trong Slack App settings
2. Vào **"Event Subscriptions"** hoặc **"Slash Commands"**
3. Kiểm tra request logs

## Các lỗi thường gặp:

### 1. "URL verification failed"
- **Nguyên nhân**: Web App URL không đúng hoặc doPost function không hoạt động
- **Khắc phục**: Deploy lại Web App, cập nhật URL trong Slack App

### 2. "Invalid webhook URL"
- **Nguyên nhân**: Webhook URL đã hết hạn hoặc không đúng format
- **Khắc phục**: Tạo webhook mới trong Slack App, cập nhật trong code

### 3. "Buttons không hoạt động"
- **Nguyên nhân**: Interactivity chưa được bật hoặc Request URL sai
- **Khắc phục**: Bật Interactivity, cập nhật Request URL

### 4. "Command not found"
- **Nguyên nhân**: Slash commands chưa được tạo hoặc Request URL sai
- **Khắc phục**: Tạo slash commands, cập nhật Request URL

### 5. "Permission denied"
- **Nguyên nhân**: Thiếu bot token scopes
- **Khắc phục**: Thêm scopes cần thiết, reinstall app

## Quick Fix Checklist:

- [ ] Google Apps Script đã deploy as Web App
- [ ] Web App URL đã cập nhật trong Slack App
- [ ] Incoming Webhooks đã bật
- [ ] Interactivity đã bật với đúng Request URL
- [ ] Slash Commands đã tạo với đúng Request URL
- [ ] Bot Token Scopes đầy đủ
- [ ] Webhook URL trong code đã đúng
- [ ] enableSlack = true trong config
- [ ] Test functions chạy thành công

## Liên hệ hỗ trợ:

Nếu vẫn gặp vấn đề, hãy:
1. Chạy `debugConfig()` và gửi logs
2. Chạy `testSlackWithDebug()` và gửi kết quả
3. Kiểm tra Slack App settings và gửi screenshots

---

**Lưu ý**: Mỗi khi deploy lại Google Apps Script, Web App URL có thể thay đổi. Luôn cập nhật URL mới trong Slack App settings.