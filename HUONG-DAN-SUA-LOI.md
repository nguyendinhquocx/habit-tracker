# Hướng dẫn Sửa lỗi Habit Tracker

## Vấn đề đã được khắc phục

**Vấn đề ban đầu:** Mặc dù đã đánh dấu tick vào ô trên Google Sheet, nhưng ứng dụng vẫn hiển thị tất cả các mục là "Chưa thực hiện".

**Nguyên nhân:** Có sự không nhất quán trong cách xử lý chỉ mục cột giữa:
- Cấu hình định nghĩa `DATA_RANGE: 'C14:AI31'` (bắt đầu từ cột C)
- Nhưng logic đọc dữ liệu lại tính toán sai chỉ mục cột

## 🔧 Các Sửa Lỗi Đã Áp Dụng

### 1. **Sửa lỗi chỉ mục cột trong hàm `analyzeHabits`** (habits.js)
- **Vấn đề**: Hàm `findTodayColumn` trả về index relative to column C, nhưng `analyzeHabits` lại cộng thêm `dataStartIndex`, gây ra việc đọc sai cột
- **Giải pháp**: 
  - Loại bỏ việc cộng thêm `dataStartIndex` vào `todayColIndex`
  - Điều chỉnh `todayDataIndex` cho các hàm `calculateStreak` và `calculateHabitStats`
  - Cập nhật debug logs để hiển thị đúng thông tin index
- **Thay đổi**: 
  ```javascript
  // TRƯỚC (SAI)
  const todayValueIndex = dataStartIndex + todayColIndex;
  
  // SAU (ĐÚNG)
  const todayValueIndex = todayColIndex;
  const todayDataIndex = todayColIndex - dataStartIndex;
  ```

### 2. Cập nhật hàm `findTodayColumn` (habits.js)
- ✅ Đọc date row từ đúng phạm vi `C${dateRow}:AI${dateRow}`
- ✅ Trả về chỉ mục đúng relative to cột C
- ✅ Thêm debug logging

### 3. Cập nhật hàm `generateQuickHabitReport` (slack.js)
- ✅ Sử dụng hàm `findTodayColumn` đã được sửa để đảm bảo nhất quán
- ✅ Loại bỏ logic tìm cột trùng lặp

### 4. Tạo các file debug và test
- ✅ `debug-sheet-reading.js` - Debug chi tiết việc đọc sheet
- ✅ `fix-habit-reading.js` - Các phiên bản đã sửa của functions
- ✅ `test-fixes.js` - Test tổng thể các sửa lỗi

## 🧪 Cách Kiểm Tra Các Sửa Lỗi

### 1. Chạy hàm test trong Google Apps Script Editor:
```javascript
// Test nhanh (khuyến nghị)
testIndexFix();

// Hoặc test tổng thể
quicktest();

// Hoặc test cụ thể vấn đề người dùng
testUserIssue(getConfig());
```

### 2. Test Slack webhook:
```javascript
// Test nhanh webhook
testSlackQuick();

// Test chi tiết webhook
diagnoseSlackWebhook();
```

### 3. Chạy test tổng thể
```javascript
// Trong Google Apps Script Editor
testAllFixes();
```

### 4. Chạy test nhanh cho vấn đề cụ thể
```javascript
// Kiểm tra vấn đề người dùng báo cáo
quickTest();
```

### 5. Chạy test từng phần
```javascript
// Test riêng từng function
testUserIssue();           // Test vấn đề cụ thể
testFindTodayColumn();      // Test tìm cột ngày
testAnalyzeHabits();       // Test phân tích habits
testEmailFix();            // Test email
testHabitFix();            // Test habit analysis
testConfigFix();           // Test configuration
```

## 🔧 Lỗi Slack Webhook (404 Error)

### Vấn đề:
Lỗi "Request failed for `https://hooks.slack.com` returned code 404. Truncated server response: no_service" xảy ra khi:
- Slack webhook URL đã bị vô hiệu hóa
- URL webhook không đúng hoặc đã thay đổi
- Slack workspace có thay đổi cài đặt

### Giải pháp:

#### 1. Kiểm tra webhook hiện tại:
```javascript
diagnoseSlackWebhook()  // Chạy trong Google Apps Script
```

#### 2. Tạo webhook mới trong Slack:
1. Vào Slack workspace của bạn
2. Đi tới **Apps** → **Incoming Webhooks**
3. Tạo webhook mới cho channel mong muốn
4. Copy URL webhook mới

#### 3. Cập nhật URL webhook:
```javascript
// Cách 1: Sử dụng hàm helper
setSlackWebhook('https://hooks.slack.com/services/YOUR/NEW/WEBHOOK');

// Cách 2: Cập nhật trực tiếp trong config
setConfig('SLACK_WEBHOOK_URL', 'https://hooks.slack.com/services/YOUR/NEW/WEBHOOK');

// Cách 3: Sử dụng hàm cập nhật nhanh (đã tạo sẵn)
quickUpdateAndTest();  // Cập nhật và test luôn
```

#### 4. Cập nhật PropertiesService và kiểm tra:

**Cách 1: Sử dụng file run-webhook-update.js (Khuyến nghị)**
1. Mở file `run-webhook-update.js`
2. Copy toàn bộ code
3. Paste vào Google Apps Script Editor
4. Chạy hàm `runWebhookUpdate()`

**Cách 2: Chạy manual trong Apps Script Console**
```javascript
// Kiểm tra cấu hình hiện tại
checkCurrentConfig();

// Cập nhật webhook mới
runWebhookUpdate();

// Test webhook
testNewWebhook();
```

#### 5. Test webhook mới:
```javascript
testSlackWebhookOnly()  // Test đơn giản
testSlackQuick()        // Test với diagnostic
```

### Lưu ý:
- Webhook URL phải bắt đầu bằng `https://hooks.slack.com/services/`
- Mỗi webhook chỉ hoạt động với một channel cụ thể
- Nếu workspace thay đổi, cần tạo webhook mới

## Cách sử dụng sau khi sửa lỗi

### 1. Kiểm tra cấu hình
```javascript
const config = getAppConfig();
console.log(config);
```

### 2. Bật debug mode để theo dõi
```javascript
const config = getAppConfig();
config.debugMode = true;
setConfig(config);
```

### 3. Tạo báo cáo thử nghiệm
```javascript
// Tạo báo cáo hàng ngày
const report = generateDailyReport(getAppConfig());
console.log(report);

// Gửi báo cáo qua email
sendDailyHabitReport();
```

## Cấu trúc dữ liệu Google Sheet

### Dải dữ liệu: C14:AI31
- **Cột C:** Tên habits
- **Cột D:** (Có thể để trống hoặc ghi chú)
- **Cột E-AI:** Dữ liệu hoàn thành theo ngày (1-31)
- **Hàng 13:** Hàng ngày (1, 2, 3, ..., 31)
- **Hàng 14-31:** Dữ liệu habits

### Giá trị hợp lệ cho ô hoàn thành:
- ✅ `true`, `TRUE`, `1`, `x`, `X`, `✓`, `yes`, `YES`
- ❌ `false`, `FALSE`, `0`, ``, `no`, `NO`

## Troubleshooting

### Nếu vẫn gặp vấn đề:

1. **Kiểm tra cấu hình:**
   ```javascript
   validateConfig();
   ```

2. **Kiểm tra dữ liệu sheet:**
   ```javascript
   debugSheetReading();
   ```

3. **Kiểm tra logic hoàn thành:**
   ```javascript
   debugHabitCompletedLogic();
   ```

4. **Reset cấu hình nếu cần:**
   ```javascript
   setupConfig(); // Thiết lập lại từ đầu
   ```

### Lỗi thường gặp:

1. **"Column for day X not found"**
   - Kiểm tra hàng ngày (row 13) có đúng format không
   - Đảm bảo ngày hiện tại có trong sheet

2. **"Sheet not found"**
   - Kiểm tra `SPREADSHEET_ID` và `SHEET_NAME` trong config

3. **"No habits found"**
   - Kiểm tra cột C có tên habits không
   - Đảm bảo `DATA_RANGE` đúng

## Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề sau khi áp dụng các sửa lỗi, vui lòng:
1. Chạy `quickTest()` và gửi kết quả log
2. Kiểm tra cấu trúc Google Sheet theo hướng dẫn
3. Đảm bảo đã cập nhật tất cả các file đã sửa

---

**Phiên bản:** 2.1  
**Ngày cập nhật:** 2025-01-20  
**Trạng thái:** Đã sửa lỗi chính