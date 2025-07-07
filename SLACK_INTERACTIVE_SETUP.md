# Hướng dẫn thiết lập Slack Interactive Features

## 🎯 Tổng quan
Tính năng này cho phép tương tác hai chiều giữa Slack và Google Sheets:
- **Từ Google Sheets → Slack**: Gửi báo cáo với buttons tương tác
- **Từ Slack → Google Sheets**: Click button để đánh dấu hoàn thành thói quen

## 📋 Các bước thiết lập

### Bước 1: Deploy Web App trong Google Apps Script

1. **Mở Google Apps Script Editor:**
   - Truy cập script.google.com
   - Mở project Habit Tracker

2. **Deploy Web App:**
   - Click "Deploy" → "New deployment"
   - Type: "Web app"
   - Description: "Habit Tracker Slack Integration"
   - Execute as: "Me"
   - Who has access: "Anyone" (cần thiết cho Slack)
   - Click "Deploy"
   - **Copy Web App URL** (dạng: `https://script.google.com/macros/s/ABC.../exec`)

## 🔧 Khắc phục các lỗi thường gặp

### 1. Lỗi "Không tìm thấy hàm tập lệnh: doGet"

**Nguyên nhân:** Google Apps Script yêu cầu hàm `doGet()` cho Web App.

**Giải pháp:** Hàm `doGet()` đã được thêm vào code.

**Cách kiểm tra:**
1. Deploy Web App với quyền "Anyone"
2. Mở URL trong browser → Thấy trang xác nhận
3. Copy URL để paste vào Slack App

### 2. Lỗi "Operation timed out. Apps need to respond within 3 seconds"

**Nguyên nhân:** Slack yêu cầu phản hồi trong 3 giây, nhưng xử lý Google Sheets quá chậm.

**Giải pháp đã triển khai:**
- ✅ Hàm `handleCompleteHabitFromSlackFast()` tối ưu tốc độ
- ✅ Chỉ đọc 2 rows thay vì toàn bộ sheet
- ✅ Cập nhật trực tiếp 1 cell
- ✅ Global CONFIG để tránh lỗi reference
- ✅ Monitoring thời gian xử lý

**Cách test:**
```javascript
function testSlackSpeed() {
  const startTime = new Date().getTime();
  const result = handleCompleteHabitFromSlackFast(
    'complete_habit_Đọc sách_2025-01-07', 
    'U1234567890'
  );
  const processingTime = new Date().getTime() - startTime;
  Logger.log(`⏱️ Processing time: ${processingTime}ms`); // Mục tiêu: < 2000ms
}
```

### Bước 2: Cấu hình Slack App với Interactivity

1. **Tạo Slack App** (nếu chưa có):
   - Vào [api.slack.com](https://api.slack.com/apps)
   - "Create New App" → "From scratch"
   - Đặt tên app và chọn workspace

2. **Cấu hình OAuth & Permissions** (QUAN TRỌNG):
   - Vào "Features" → "OAuth & Permissions"
   
   **Bot Token Scopes** (bắt buộc):
   - ✅ `chat:write` - Gửi tin nhắn
   - ✅ `chat:write.public` - Gửi tin nhắn vào channel public
   - ✅ `channels:read` - Đọc thông tin channel
   - ✅ `users:read` - Đọc thông tin user
   
   **Redirect URLs** (quan trọng):
   - ✅ Thêm: `https://script.google.com`
   - ✅ Thêm: `https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercallback`
   
   **Install App:**
   - "Install to Workspace" → "Allow"
   - **Copy Bot User OAuth Token** (bắt đầu bằng `xoxb-`)

3. **Cấu hình Interactivity & Shortcuts**:
   - Vào "Features" → "Interactivity & Shortcuts"
   - Bật "Interactivity": **ON**
   - **Request URL**: Paste Web App URL từ bước 1
   - ⚠️ **Lưu ý**: URL phải có dạng `https://script.google.com/macros/s/ABC.../exec`
   - "Save Changes"

4. **Cấu hình Incoming Webhooks** (cho tin nhắn hàng ngày):
   - Vào "Features" → "Incoming Webhooks"
   - Bật "Activate Incoming Webhooks": **ON**
   - "Add New Webhook to Workspace"
   - Chọn channel để nhận tin nhắn
   - **Copy Webhook URL**

### Bước 3: Test tính năng Interactive

1. **Test trong Google Apps Script:**
```javascript
// Chạy function này để test
testSlackInteraction()
```

2. **Test thực tế:**
   - Chạy `sendDailyHabitReport()` để gửi báo cáo có buttons
   - Trong Slack, click button "✅ Hoàn thành" bên cạnh thói quen
   - Kiểm tra Google Sheets xem có cập nhật không

## 🎨 Giao diện Interactive Message

### Cấu trúc message:
```
🎉 Habit Tracker Report

📅 Ngày: Thứ hai, ngày 7 tháng 1 năm 2025
📊 Tiến độ: 2/5 thói quen (40%)

Tiến độ hoàn thành:
████░░░░░░ 40%

🎯 Đã hoàn thành (2):
✅ Đọc sách (🔥 7 ngày)
✅ Tập thể dục (🔥 3 ngày)

⏰ Chưa thực hiện (3):
⏳ Thiền                    [✅ Hoàn thành]
⏳ Viết nhật ký             [✅ Hoàn thành]
⏳ Học tiếng Anh            [✅ Hoàn thành]

💪 Keep building great habits! Ngày mai là cơ hội mới để cải thiện!
```

### Khi click button:
- Button sẽ gửi request đến Google Apps Script
- Script cập nhật Google Sheets
- Slack hiển thị thông báo xác nhận
- Ví dụ: `🎉 Đã hoàn thành "Thiền"! 🔥 Streak: 3 ngày`

## ⚙️ Cấu hình nâng cao

### Tùy chỉnh button style
Trong hàm `buildSlackMessage`, sửa:
```javascript
accessory: {
  type: 'button',
  text: {
    type: 'plain_text',
    text: '✅ Hoàn thành', // Thay đổi text
    emoji: true
  },
  style: 'primary' // primary (xanh) | danger (đỏ) | default (xám)
}
```

### Thêm confirmation dialog
```javascript
accessory: {
  type: 'button',
  // ... other properties
  confirm: {
    title: {
      type: 'plain_text',
      text: 'Xác nhận'
    },
    text: {
      type: 'mrkdwn',
      text: 'Bạn có chắc muốn đánh dấu hoàn thành thói quen này?'
    },
    confirm: {
      type: 'plain_text',
      text: 'Có'
    },
    deny: {
      type: 'plain_text',
      text: 'Không'
    }
  }
}
```

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **"URL verification failed"**
   - Kiểm tra Web App URL chính xác
   - Đảm bảo Web App có quyền "Anyone"
   - Thử deploy lại Web App

2. **"Button không hoạt động"**
   - Kiểm tra Interactivity đã bật
   - Xem Logs trong Google Apps Script
   - Kiểm tra Request URL trong Slack App

3. **"Không cập nhật Google Sheets"**
   - Kiểm tra tên thói quen khớp với header
   - Xem function `handleCompleteHabitFromSlack` trong Logs
   - Kiểm tra quyền truy cập Google Sheets

### Debug steps:

1. **Kiểm tra Logs:**
```javascript
// Trong Google Apps Script
Logger.log('Debug info');
// Xem Executions tab để theo dõi
```

2. **Test manual:**
```javascript
// Test function riêng lẻ
testSlackInteraction();
handleCompleteHabitFromSlack('complete_habit_Thiền_2025-01-07', 'U123');
```

3. **Kiểm tra Slack payload:**
   - Trong `doPost` function, log toàn bộ payload
   - Xem cấu trúc data từ Slack

## 🚀 Tính năng mở rộng

### 1. Slash Commands
Thêm slash command `/habit` để:
- Xem báo cáo nhanh: `/habit status`
- Đánh dấu hoàn thành: `/habit complete Đọc sách`
- Xem streak: `/habit streak`

### 2. Scheduled Reminders
- Nhắc nhở vào cuối ngày nếu còn thói quen chưa hoàn thành
- Thông báo milestone (streak 7, 30, 100 ngày)

### 3. Team Features
- Chia sẻ progress với team
- Leaderboard thói quen
- Challenges và competitions

### 4. Analytics Dashboard
- Button "📊 Xem báo cáo" để mở Google Sheets
- Charts và insights trực tiếp trong Slack

## 🔒 Bảo mật

### Best Practices:
- **Web App URL** chỉ chia sẻ với Slack
- **Validate** tất cả input từ Slack
- **Log** các actions để audit
- **Rate limiting** nếu cần thiết

### Monitoring:
- Theo dõi Executions trong Google Apps Script
- Set up alerts cho errors
- Regular backup Google Sheets data

---

✅ **Hoàn tất!** Giờ bạn có thể tương tác trực tiếp với Google Sheets từ Slack một cách seamless!