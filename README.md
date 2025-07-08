# Habit Tracker - Google Apps Script

## Tính năng mới được cập nhật

### GitHub-style Contribution Visualization
Ứng dụng đã được nâng cấp với tính năng trực quan hóa lịch sử thói quen giống như GitHub contribution graph:

- **Lưới màu 90 ngày**: Hiển thị lịch sử hoàn thành thói quen trong 90 ngày gần nhất
- **Màu sắc theo cường độ**: 
  - Xám (#ebedf0): Không hoạt động
  - Xanh nhạt (#c6e48b): Hoạt động thấp (≤25%)
  - Xanh vừa (#7bc96f): Hoạt động trung bình thấp (≤50%)
  - Xanh đậm (#239a3b): Hoạt động trung bình cao (≤75%)
  - Xanh rất đậm (#196127): Hoạt động cao (>75%)

### Icon sao được cập nhật
- Thay đổi icon sao streak từ design cũ sang design mới tinh tế hơn
- URL icon: `https://cdn-icons-png.flaticon.com/128/18245/18245248.png`

## Cách sử dụng

### 1. Cấu hình Google Sheet
```javascript
const CONFIG = {
  SPREADSHEET_ID: 'your-spreadsheet-id',
  SHEET_NAME: 'habit',
  DATA_RANGE: 'C14:AI31',
  MONTH_YEAR_CELL: 'C9',
  DATE_ROW: 15,
  HABIT_NAME_COL: 1,
  HABIT_DATA_COL: 3
};
```

### 2. Thiết lập Email
```javascript
const EMAIL_CONFIG = {
  recipient: 'your-email@gmail.com',
  subject: 'Báo cáo thói quen hàng ngày'
};
```

### 3. Chạy ứng dụng

#### Gửi báo cáo thủ công:
```javascript
sendDailyHabitReport();
```

#### Test tính năng mới:
```javascript
testContributionGrid();
```

#### Tạo trigger tự động:

**Trigger đơn (8:00 sáng):**
```javascript
createDailyTrigger(); // Gửi báo cáo lúc 8:00 sáng hàng ngày
```

**Trigger nhiều lần trong ngày (7:00, 11:30, 19:00):**
```javascript
createMultipleDailyTriggers(); // Gửi báo cáo 3 lần/ngày
```

**Quản lý trigger:**
```javascript
listCurrentTriggers();  // Kiểm tra trigger đang hoạt động
deleteAllTriggers();    // Xóa tất cả trigger
```

## Cấu trúc Google Sheet

```
     A        B        C    D    E    F    G    ...
9              Tháng/Năm: 12/2024
14
15                     1    2    3    4    5    ...
16  Đọc sách           ✓    ✓         ✓    ✓
17  Tập thể dục        ✓         ✓    ✓    
18  Uống nước          ✓    ✓    ✓    ✓    ✓
19  Thiền              ✓              ✓    
```

## Thiết kế Email

Email báo cáo bao gồm:

1. **Header**: Ngày hiện tại và lời chào
2. **Tổng quan tiến độ**: Progress bar và tỷ lệ hoàn thành
3. **Lịch sử thói quen**: GitHub-style contribution grid
4. **Thói quen đã hoàn thành**: Danh sách với streak
5. **Thói quen chưa thực hiện**: Danh sách cần cải thiện
6. **Thông điệp động lực**: Khuyến khích dựa trên hiệu suất

## Các hàm chính

### Core Functions
- `sendDailyHabitReport()`: Gửi báo cáo hàng ngày
- `analyzeHabits(sheet, CONFIG)`: Phân tích dữ liệu thói quen
- `buildContributionGrid()`: Tạo GitHub-style visualization

### Helper Functions
- `calculateHabitStreak()`: Tính chuỗi ngày liên tiếp
- `buildProgressBar()`: Tạo thanh tiến độ
- `buildMotivationSection()`: Tạo thông điệp động lực
- `getContributionIntensity()`: Tính cường độ hoạt động
- `getContributionColor()`: Xác định màu sắc grid

### Test Functions
- `testContributionGrid()`: Test tính năng visualization mới
- `testHabitTracker()`: Test tổng thể ứng dụng
- `debugSheetStructure()`: Debug cấu trúc sheet

## Tính năng nổi bật

### Đã có
- Phân tích thói quen thông minh
- Tính toán streak (chuỗi ngày liên tiếp)
- Perfect Day detection
- Email responsive design
- Trigger tự động
- Error handling & retry mechanism
- GitHub-style contribution visualization
- Icon sao được cập nhật

### Có thể mở rộng
- Web App interface
- Báo cáo tuần/tháng
- Đặt mục tiêu cá nhân
- Thông báo thông minh
- Analytics nâng cao
- Tính năng xã hội

## Triển khai

1. **Tạo Google Apps Script project**
2. **Copy code vào editor**
3. **Cấu hình CONFIG và EMAIL_CONFIG**
4. **Tạo Google Sheet theo cấu trúc**
5. **Test với `testContributionGrid()`**
6. **Thiết lập trigger với `createDailyTrigger()`**

## Ghi chú kỹ thuật

- **Hiệu suất**: Sử dụng batch operations cho Google Sheets
- **Bảo mật**: Không hard-code sensitive data
- **Tương thích**: Responsive email design
- **Mở rộng**: Modular architecture
- **Debug**: Comprehensive logging system

---

*Được thiết kế theo triết lý "Less, but better" - Tối giản nhưng hiệu quả*