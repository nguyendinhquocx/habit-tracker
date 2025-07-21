/**
 * English Learning Module
 * Tích hợp học tiếng Anh vào email report
 */

/**
 * Lấy dữ liệu học tiếng Anh từ Google Sheet
 * @returns {Array} Mảng các object {english, vietnamese}
 */
function getEnglishLearningData() {
  try {
    const SHEET_ID = '1yTWfP2PwkBvJ8WYR-d0jeE-OZJaf7snZDdBLI09gXnA';
    const SHEET_NAME = 'hoc tieng anh';
    
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      console.error('Không tìm thấy sheet:', SHEET_NAME);
      return [];
    }
    
    // Lấy tất cả dữ liệu từ cột A và B
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      console.log('Sheet không có dữ liệu');
      return [];
    }
    
    const range = sheet.getRange(2, 1, lastRow - 1, 2); // Bỏ qua hàng tiêu đề
    const values = range.getValues();
    
    // Chuyển đổi thành array of objects và lọc bỏ hàng trống
    const data = values
      .filter(row => row[0] && row[1]) // Lọc bỏ hàng có cột trống
      .map(row => ({
        english: row[0].toString().trim(),
        vietnamese: row[1].toString().trim()
      }));
    
    console.log(`Đã tải ${data.length} câu tiếng Anh`);
    return data;
    
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu học tiếng Anh:', error);
    return [];
  }
}

/**
 * Lấy ngẫu nhiên N câu từ dữ liệu học tiếng Anh
 * @param {number} count - Số câu cần lấy (mặc định 30)
 * @returns {Array} Mảng các câu được chọn ngẫu nhiên
 */
function getRandomEnglishSentences(count = 30) {
  try {
    const allData = getEnglishLearningData();
    
    if (allData.length === 0) {
      console.log('Không có dữ liệu học tiếng Anh');
      return [];
    }
    
    // Nếu số câu yêu cầu lớn hơn tổng số câu có sẵn
    if (count >= allData.length) {
      console.log(`Yêu cầu ${count} câu nhưng chỉ có ${allData.length} câu`);
      return allData;
    }
    
    // Shuffle array và lấy N câu đầu
    const shuffled = [...allData].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
    
  } catch (error) {
    console.error('Lỗi khi lấy câu ngẫu nhiên:', error);
    return [];
  }
}

/**
 * Tạo HTML cho phần học tiếng Anh trong email
 * @param {Array} sentences - Mảng các câu tiếng Anh
 * @returns {string} HTML string
 */
function buildEnglishLearningHTML(sentences) {
  if (!sentences || sentences.length === 0) {
    return '';
  }
  
  let html = `
    <div style="margin: 20px 0; padding: 20px; background-color: white; border-radius: 8px;">
      <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Học tiếng Anh hôm nay</h3>
      <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background-color: #e9ecef;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">English</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Tiếng Việt</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  sentences.forEach((sentence, index) => {
    const rowStyle = index % 2 === 0 ? 'background-color: #ffffff;' : 'background-color: #f8f9fa;';
    html += `
          <tr style="${rowStyle}">
            <td style="padding: 10px 12px; border-bottom: 1px solid #dee2e6; vertical-align: top; line-height: 1.4;">${StringUtils.escapeHtml(sentence.english)}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #dee2e6; vertical-align: top; line-height: 1.4;">${StringUtils.escapeHtml(sentence.vietnamese)}</td>
          </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #6c757d; text-align: center;">
        ${sentences.length} câu được chọn ngẫu nhiên từ ${getEnglishLearningData().length} câu có sẵn
      </p>
    </div>
  `;
  
  return html;
}

/**
 * Tạo text cho phần học tiếng Anh (cho Slack)
 * @param {Array} sentences - Mảng các câu tiếng Anh
 * @returns {string} Text string
 */
function buildEnglishLearningText(sentences) {
  if (!sentences || sentences.length === 0) {
    return '';
  }
  
  let text = `\n*Học tiếng Anh hôm nay:*\n`;
  
  sentences.forEach((sentence, index) => {
    text += `${index + 1}. *EN:* ${sentence.english}\n   *VN:* ${sentence.vietnamese}\n\n`;
  });
  
  text += `_${sentences.length} câu được chọn ngẫu nhiên_\n`;
  
  return text;
}

/**
 * Test function để kiểm tra module
 */
function testEnglishLearning() {
  console.log('=== Test English Learning Module ===');
  
  // Test lấy dữ liệu
  const allData = getEnglishLearningData();
  console.log(`Tổng số câu: ${allData.length}`);
  
  if (allData.length > 0) {
    console.log('Câu đầu tiên:', allData[0]);
  }
  
  // Test lấy câu ngẫu nhiên
  const randomSentences = getRandomEnglishSentences(5);
  console.log(`Số câu ngẫu nhiên: ${randomSentences.length}`);
  
  if (randomSentences.length > 0) {
    console.log('Câu ngẫu nhiên đầu tiên:', randomSentences[0]);
  }
  
  // Test tạo HTML
  const html = buildEnglishLearningHTML(randomSentences);
  console.log('HTML length:', html.length);
  
  // Test tạo text
  const text = buildEnglishLearningText(randomSentences);
  console.log('Text preview:', text.substring(0, 200) + '...');
  
  console.log('=== Test hoàn thành ===');
}

/**
 * Test với dữ liệu mock khi không có quyền truy cập sheet
 */
function testEnglishLearningWithMock() {
  console.log('=== Test với dữ liệu mock ===');
  
  const mockData = [
    { english: "Hello, how are you?", vietnamese: "Xin chào, bạn khỏe không?" },
    { english: "What time is it?", vietnamese: "Mấy giờ rồi?" },
    { english: "I love learning English.", vietnamese: "Tôi thích học tiếng Anh." },
    { english: "Have a nice day!", vietnamese: "Chúc bạn một ngày tốt lành!" },
    { english: "See you later.", vietnamese: "Hẹn gặp lại." }
  ];
  
  const html = buildEnglishLearningHTML(mockData);
  console.log('Mock HTML generated, length:', html.length);
  
  const text = buildEnglishLearningText(mockData);
  console.log('Mock text generated:', text);
  
  console.log('=== Test mock hoàn thành ===');
}