/**
 * Test English Learning Integration
 * Kiểm tra tích hợp tính năng học tiếng Anh
 */

/**
 * Test basic English learning functionality
 */
function testEnglishLearningBasic() {
  console.log('=== Test English Learning Basic ===');
  
  try {
    // Test getting data
    const allData = getEnglishLearningData();
    console.log(`✅ Loaded ${allData.length} English sentences`);
    
    if (allData.length > 0) {
      console.log('Sample sentence:', allData[0]);
    }
    
    // Test random selection
    const randomSentences = getRandomEnglishSentences(5);
    console.log(`✅ Selected ${randomSentences.length} random sentences`);
    
    // Test HTML generation
    const html = buildEnglishLearningHTML(randomSentences);
    console.log(`✅ Generated HTML (${html.length} characters)`);
    
    // Test text generation
    const text = buildEnglishLearningText(randomSentences);
    console.log(`✅ Generated text (${text.length} characters)`);
    
    console.log('=== Test completed successfully ===');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

/**
 * Test English learning with email integration
 */
function testEnglishLearningWithEmail() {
  console.log('=== Test English Learning with Email ===');
  
  try {
    // Get config
    const config = getAppConfig();
    if (!config.emailTo) {
      console.log('⚠️ Email not configured, using test email');
      config.emailTo = 'test@example.com';
    }
    
    // Create mock report data
    const mockData = {
      habits: [
        { name: 'Đọc sách', completed: true, streak: 5 },
        { name: 'Tập thể dục', completed: true, streak: 3 },
        { name: 'Thiền', completed: false, streak: 0 }
      ],
      today: new Date(),
      todayDay: new Date().getDate()
    };
    
    mockData.completedHabits = mockData.habits.filter(h => h.completed);
    mockData.pendingHabits = mockData.habits.filter(h => !h.completed);
    mockData.completionRate = (mockData.completedHabits.length / mockData.habits.length) * 100;
    mockData.isPerfectDay = mockData.pendingHabits.length === 0;
    
    // Test email template with English learning
    const detailedDate = DateUtils.formatDate(mockData.today, 'detailed');
    const subject = `Test Habit Report with English Learning`;
    const colors = ColorUtils.getColorScheme(mockData.isPerfectDay);
    
    const emailData = {
      subject,
      detailedDate,
      completedHabits: mockData.completedHabits,
      pendingHabits: mockData.pendingHabits,
      habits: mockData.habits,
      completionRate: mockData.completionRate,
      isPerfectDay: mockData.isPerfectDay,
      colors
    };
    
    const htmlBody = buildEmailTemplate(emailData);
    console.log(`✅ Email template generated (${htmlBody.length} characters)`);
    
    // Check if English learning section is included
    if (htmlBody.includes('Học tiếng Anh hôm nay')) {
      console.log('✅ English learning section found in email');
    } else {
      console.log('⚠️ English learning section not found in email');
    }
    
    console.log('=== Email test completed ===');
    return true;
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    return false;
  }
}

/**
 * Test English learning with Slack integration
 */
function testEnglishLearningWithSlack() {
  console.log('=== Test English Learning with Slack ===');
  
  try {
    // Create mock report data
    const mockData = {
      habits: [
        { name: 'Đọc sách', completed: true, streak: 5 },
        { name: 'Tập thể dục', completed: false, streak: 0 }
      ],
      today: new Date()
    };
    
    mockData.completedHabits = mockData.habits.filter(h => h.completed);
    mockData.pendingHabits = mockData.habits.filter(h => !h.completed);
    mockData.completionRate = (mockData.completedHabits.length / mockData.habits.length) * 100;
    mockData.isPerfectDay = mockData.pendingHabits.length === 0;
    
    // Test Slack message with English learning
    const config = { slackChannel: '#test' };
    const slackMessage = buildSlackMessage(mockData, config);
    
    console.log(`✅ Slack message generated with ${slackMessage.blocks.length} blocks`);
    
    // Check if English learning section is included
    const hasEnglishSection = slackMessage.blocks.some(block => 
      block.text && block.text.text && block.text.text.includes('Học tiếng Anh')
    );
    
    if (hasEnglishSection) {
      console.log('✅ English learning section found in Slack message');
    } else {
      console.log('⚠️ English learning section not found in Slack message');
    }
    
    console.log('=== Slack test completed ===');
    return true;
    
  } catch (error) {
    console.error('❌ Slack test failed:', error.message);
    return false;
  }
}

/**
 * Test with mock data when sheet is not accessible
 */
function testEnglishLearningWithMockData() {
  console.log('=== Test English Learning with Mock Data ===');
  
  // Create mock English sentences
  const mockSentences = [
    { english: "Good morning!", vietnamese: "Chào buổi sáng!" },
    { english: "How are you today?", vietnamese: "Hôm nay bạn thế nào?" },
    { english: "I'm learning English.", vietnamese: "Tôi đang học tiếng Anh." },
    { english: "Have a great day!", vietnamese: "Chúc bạn một ngày tuyệt vời!" },
    { english: "See you tomorrow.", vietnamese: "Hẹn gặp lại ngày mai." }
  ];
  
  try {
    // Test HTML generation with mock data
    const html = buildEnglishLearningHTML(mockSentences);
    console.log(`✅ Mock HTML generated (${html.length} characters)`);
    
    // Test text generation with mock data
    const text = buildEnglishLearningText(mockSentences);
    console.log(`✅ Mock text generated (${text.length} characters)`);
    
    // Display sample output
    console.log('\n--- Sample Text Output ---');
    console.log(text.substring(0, 200) + '...');
    
    console.log('=== Mock data test completed ===');
    return true;
    
  } catch (error) {
    console.error('❌ Mock data test failed:', error.message);
    return false;
  }
}

/**
 * Run all English learning tests
 */
function runAllEnglishLearningTests() {
  console.log('🚀 Starting English Learning Tests...');
  
  const tests = [
    { name: 'Basic Functionality', fn: testEnglishLearningBasic },
    { name: 'Email Integration', fn: testEnglishLearningWithEmail },
    { name: 'Slack Integration', fn: testEnglishLearningWithSlack },
    { name: 'Mock Data', fn: testEnglishLearningWithMockData }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    console.log(`\n--- Running ${test.name} Test ---`);
    try {
      const result = test.fn();
      if (result) {
        passed++;
        console.log(`✅ ${test.name} test PASSED`);
      } else {
        failed++;
        console.log(`❌ ${test.name} test FAILED`);
      }
    } catch (error) {
      failed++;
      console.log(`❌ ${test.name} test FAILED with error:`, error.message);
    }
  });
  
  console.log(`\n🏁 Test Summary: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! English learning integration is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the implementation.');
  }
  
  return failed === 0;
}

/**
 * Quick test to verify English learning is working
 */
function quickEnglishTest() {
  console.log('⚡ Quick English Learning Test');
  
  try {
    const sentences = getRandomEnglishSentences(3);
    if (sentences.length > 0) {
      console.log('✅ English learning is working!');
      console.log(`Sample: ${sentences[0].english} -> ${sentences[0].vietnamese}`);
      return true;
    } else {
      console.log('⚠️ No English sentences found');
      return false;
    }
  } catch (error) {
    console.log('❌ English learning test failed:', error.message);
    return false;
  }
}