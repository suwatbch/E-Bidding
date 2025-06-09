// ฟังก์ชันทดสอบระบบภาษาใหม่
import { languageService } from '../services/languageService';
import { dataLanguage, updateLanguageData } from '../model/language';
import {
  dataLanguageText,
  updateLanguageTextData,
} from '../model/language_text';

// ฟังก์ชันทดสอบการโหลดข้อมูล
export const testLanguageSystem = async () => {
  console.log('🧪 Testing Language System...');

  try {
    // 1. ทดสอบการโหลดข้อมูลจาก service
    console.log('1. Testing language service...');
    const result = await languageService.refreshLanguageData();

    console.log('Languages loaded:', result.languages.length);
    console.log('Language texts loaded:', result.languageTexts.length);

    // 2. ทดสอบการอ่านข้อมูลจากไฟล์
    console.log('\n2. Testing data from files...');
    console.log('dataLanguage:', dataLanguage.length, 'items');
    console.log('dataLanguageText:', dataLanguageText.length, 'items');

    // 3. ทดสอบการหาข้อความ
    console.log('\n3. Testing getText function...');
    const appTitle = languageService.getText('app_title', 'th');
    const appTitleEn = languageService.getText('app_title', 'en');

    console.log('app_title (th):', appTitle);
    console.log('app_title (en):', appTitleEn);

    // 4. แสดงข้อมูลภาษาที่รองรับ
    console.log('\n4. Supported languages:');
    dataLanguage.forEach((lang) => {
      console.log(
        `- ${lang.language_code}: ${lang.language_name} ${lang.flag}`
      );
    });

    // 5. แสดงตัวอย่างข้อความ
    console.log('\n5. Sample texts:');
    const sampleKeys = ['app_title', 'app_subtitle', 'login_title'];
    sampleKeys.forEach((key) => {
      const th = languageService.getText(key, 'th');
      const en = languageService.getText(key, 'en');
      console.log(`${key}:`);
      console.log(`  TH: ${th}`);
      console.log(`  EN: ${en}`);
    });

    console.log('\n✅ Language system test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Language system test failed:', error);
    return false;
  }
};

// ฟังก์ชันสำหรับจำลองการอัพเดทข้อมูลจากแอดมิน
export const simulateAdminUpdate = async () => {
  console.log('🔄 Simulating admin update...');

  // จำลองข้อมูลใหม่จากแอดมิน
  const newLanguages = [
    {
      language_code: 'th',
      language_name: 'ไทย (Updated)',
      flag: '🇹🇭',
      is_default: true,
      status: 1 as 0 | 1,
    },
    {
      language_code: 'en',
      language_name: 'English (Updated)',
      flag: '🇬🇧',
      is_default: false,
      status: 1 as 0 | 1,
    },
  ];

  const newTexts = [
    {
      text_id: 1,
      text_key: 'app_title',
      language_code: 'th',
      text_value: 'ระบบประมูลอิเล็กทรอนิกส์ (อัพเดท)',
    },
    {
      text_id: 2,
      text_key: 'app_title',
      language_code: 'en',
      text_value: 'E-Bidding System (Updated)',
    },
    {
      text_id: 3,
      text_key: 'admin_message',
      language_code: 'th',
      text_value: 'ข้อความจากแอดมิน',
    },
    {
      text_id: 4,
      text_key: 'admin_message',
      language_code: 'en',
      text_value: 'Message from Admin',
    },
  ];

  // อัพเดทข้อมูลในไฟล์
  updateLanguageData(newLanguages);
  updateLanguageTextData(newTexts);

  console.log('✅ Simulated admin update completed');
  console.log(
    'New app_title (th):',
    languageService.getText('app_title', 'th')
  );
  console.log(
    'New app_title (en):',
    languageService.getText('app_title', 'en')
  );
  console.log(
    'New admin_message (th):',
    languageService.getText('admin_message', 'th')
  );
};

// ฟังก์ชันรีเซ็ตข้อมูลกลับเป็นต้นฉบับ
export const resetToOriginal = async () => {
  console.log('🔄 Resetting to original data...');
  await languageService.forceRefresh();
  console.log('✅ Reset completed');
};
