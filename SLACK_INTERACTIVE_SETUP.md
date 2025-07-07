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

### ⚠️ Khắc phục lỗi "Không tìm thấy hàm tập lệnh: doGet"

Nếu gặp lỗi này khi deploy:
- **Nguyên nhân**: Google Apps Script yêu cầu hàm `doGet()` để xử lý HTTP GET requests
- **Giải pháp**: Hàm `doGet()` đã được thêm vào code, deploy lại Web App
- **Kiểm tra**: Truy cập Web App URL để xem trang xác nhận hoạt động

### Bước 2: Cấu hình Slack App với Interactivity

1. **Truy cập Slack API:**
   - Đi tới https://api.slack.com/apps
   - Chọn app "Habit Tracker Bot" đã tạo trước đó

2. **Kích hoạt Interactivity:**
   - Trong app settings, chọn "Interactivity & Shortcuts"
   - Bật "Interactivity"
   - **Request URL**: Paste Web App URL từ Bước 1
   - Click "Save Changes"

3. **Cấu hình OAuth & Permissions:**
   - Chọn "OAuth & Permissions"
   - Thêm Bot Token Scopes:
     - `chat:write`
     - `commands`
     - `incoming-webhook`
   - Click "Reinstall App" nếu cần

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