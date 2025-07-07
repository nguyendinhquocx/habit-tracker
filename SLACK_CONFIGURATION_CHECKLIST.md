# ✅ Checklist Cấu hình Slack OAuth & Permissions

## 🎯 Mục tiêu
Đảm bảo Slack App được cấu hình đúng để tránh lỗi timeout và hoạt động mượt mà.

## 📋 Checklist tổng hợp

### 1. ⚙️ **Google Apps Script - Web App**
- [ ] **Deploy Web App thành công**
  - Execute as: **Me**
  - Who has access: **Anyone**
- [ ] **Web App URL hoạt động**
  - Mở URL trong browser → Thấy trang "Habit Tracker - Slack Integration Ready"
  - URL có dạng: `https://script.google.com/macros/s/[SCRIPT_ID]/exec`
- [ ] **Hàm doGet() và doPost() tồn tại**
  - `doGet()` trả về HTML confirmation
  - `doPost()` xử lý Slack interactions

### 2. 🔐 **Slack App - OAuth & Permissions**
- [ ] **Bot Token Scopes (bắt buộc)**
  - [ ] `chat:write` - Gửi tin nhắn
  - [ ] `chat:write.public` - Gửi tin nhắn vào channel public  
  - [ ] `channels:read` - Đọc thông tin channel
  - [ ] `users:read` - Đọc thông tin user

- [ ] **Redirect URLs**
  - [ ] `https://script.google.com`
  - [ ] `https://script.google.com/macros/d/[SCRIPT_ID]/usercallback`

- [ ] **Bot User OAuth Token**
  - [ ] Token bắt đầu bằng `xoxb-`
  - [ ] App đã được install vào workspace
  - [ ] Token được copy và lưu an toàn

### 3. 🔗 **Slack App - Interactivity & Shortcuts**
- [ ] **Interactivity được bật**
  - [ ] Toggle "Interactivity" = **ON**

- [ ] **Request URL chính xác**
  - [ ] URL = Web App URL từ Google Apps Script
  - [ ] Format: `https://script.google.com/macros/s/[SCRIPT_ID]/exec`
  - [ ] URL response status = 200 OK

- [ ] **Options Load URL** (tùy chọn)
  - [ ] Để trống nếu không sử dụng dynamic options

### 4. 📨 **Slack App - Incoming Webhooks**
- [ ] **Incoming Webhooks được bật**
  - [ ] Toggle "Activate Incoming Webhooks" = **ON**

- [ ] **Webhook URL**
  - [ ] Webhook được tạo cho channel cụ thể
  - [ ] URL bắt đầu bằng `https://hooks.slack.com/services/`
  - [ ] Test webhook hoạt động

### 5. 🚀 **Google Apps Script - CONFIG**
- [ ] **CONFIG được cấu hình đúng**
  ```javascript
  const CONFIG = {
    spreadsheetId: 'YOUR_SHEET_ID',
    slackWebhookUrl: 'https://hooks.slack.com/services/...',
    enableSlack: true,
    // ... other configs
  };
  ```

- [ ] **CONFIG ở phạm vi global**
  - [ ] CONFIG không nằm trong hàm `sendDailyHabitReport()`
  - [ ] Tất cả hàm Slack đều truy cập được CONFIG

### 6. ⚡ **Performance & Timeout Fix**
- [ ] **Hàm xử lý nhanh tồn tại**
  - [ ] `handleCompleteHabitFromSlackFast()` được implement
  - [ ] `doPost()` sử dụng fast function

- [ ] **Monitoring thời gian**
  - [ ] Logs hiển thị processing time
  - [ ] Target: < 2000ms (2 giây)

- [ ] **Error handling**
  - [ ] Try-catch blocks trong doPost()
  - [ ] Graceful error responses

## 🧪 **Test Cases**

### Test 1: Web App Accessibility
```bash
# Mở browser và truy cập:
https://script.google.com/macros/s/[YOUR_SCRIPT_ID]/exec

# Kết quả mong đợi:
✅ Trang hiển thị "Habit Tracker - Slack Integration Ready"
❌ Lỗi 404, 403, hoặc "Script function not found"
```

### Test 2: Slack Integration
```javascript
// Chạy trong Apps Script:
function testSlackIntegration() {
  sendDailyHabitReport();
}

// Kết quả mong đợi:
✅ Tin nhắn xuất hiện trong Slack channel
✅ Có nút "Hoàn thành" cho mỗi thói quen
❌ Không có tin nhắn hoặc lỗi webhook
```

### Test 3: Interactive Buttons
```
# Trong Slack:
1. Click nút "Hoàn thành" bất kỳ
2. Quan sát thời gian phản hồi

# Kết quả mong đợi:
✅ Phản hồi trong < 3 giây
✅ Tin nhắn cập nhật "✅ Đã hoàn thành [habit]"
✅ Google Sheet được cập nhật
❌ "Operation timed out" error
```

### Test 4: Performance
```javascript
// Chạy trong Apps Script:
function testSlackSpeed() {
  const startTime = new Date().getTime();
  const result = handleCompleteHabitFromSlackFast(
    'complete_habit_Đọc sách_2025-01-07', 
    'U1234567890'
  );
  const processingTime = new Date().getTime() - startTime;
  Logger.log(`⏱️ Processing time: ${processingTime}ms`);
}

// Kết quả mong đợi:
✅ Processing time < 2000ms
✅ Successful completion result
❌ Timeout hoặc error
```

## 🔍 **Troubleshooting**

### Lỗi "Operation timed out"
- [ ] Kiểm tra `handleCompleteHabitFromSlackFast()` được sử dụng
- [ ] Kiểm tra CONFIG ở global scope
- [ ] Kiểm tra Google Sheets performance
- [ ] Xem logs để tìm bottleneck

### Lỗi "Invalid request"
- [ ] Kiểm tra Request URL trong Slack App
- [ ] Verify Web App deployment
- [ ] Check OAuth permissions

### Không nhận được tin nhắn
- [ ] Kiểm tra Webhook URL
- [ ] Verify channel permissions
- [ ] Check `enableSlack: true` trong CONFIG

### Nút không hoạt động
- [ ] Kiểm tra Interactivity settings
- [ ] Verify Bot Token Scopes
- [ ] Check doPost() function

## 📊 **Monitoring Dashboard**

### Logs cần theo dõi:
```
📨 Received Slack interaction: [interaction_type]
🚀 Fast processing habit completion: [habit_action]
🎯 Completing habit: [habit_name]
✅ Updated cell [cell_address] = [value]
⏱️ Processing time: [time]ms
```

### Metrics quan trọng:
- **Response Time**: < 2000ms
- **Success Rate**: > 99%
- **Error Rate**: < 1%
- **User Satisfaction**: Không có complaint về timeout

## ✅ **Final Verification**

Khi tất cả checklist items được đánh dấu ✅:

1. **Deploy final version** của Google Apps Script
2. **Test end-to-end workflow** một lần nữa
3. **Monitor logs** trong 24h đầu
4. **Collect user feedback** về performance

---

**🎉 Chúc mừng! Slack integration đã sẵn sàng hoạt động mượt mà!**