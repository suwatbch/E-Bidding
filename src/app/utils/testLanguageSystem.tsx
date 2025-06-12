// Test Language System - ทดสอบระบบภาษาใหม่
import {
  languageService,
  Language,
  LanguageText,
} from '../services/languageService';

export const testLanguageSystem = async () => {
  console.log('🧪 Testing New Language System...');

  try {
    // 1. โหลดข้อมูลจาก API/Cache
    console.log('📥 Loading language data...');
    const result = await languageService.refreshLanguageData();

    console.log('✅ Loaded data:', {
      languages: result.languages.length,
      texts: result.languageTexts.length,
    });

    // 2. ทดสอบการหาข้อความ
    console.log('\n🔤 Testing text retrieval:');
    console.log('Thai:', languageService.getText('welcome', 'th'));
    console.log('English:', languageService.getText('welcome', 'en'));
    console.log(
      'Not found:',
      languageService.getText('non_existent_key', 'th')
    );

    // 3. ทดสอบการ group ข้อความ
    console.log('\n📊 Testing grouped texts:');
    const grouped = languageService.getGroupedTexts();
    Object.keys(grouped).forEach((lang) => {
      console.log(`${lang}:`, Object.keys(grouped[lang]).length, 'texts');
    });

    // 4. ทดสอบการหาข้อความเฉพาะ
    console.log('\n🔍 Testing find text:');
    const foundText = languageService.findLanguageText('welcome', 'th');
    console.log('Found:', foundText);

    // 5. ทดสอบการ cache
    console.log('\n💾 Testing cache:');
    console.log('Cache expired?', languageService.isCacheExpired());

    // 6. ทดสอบข้อมูลปัจจุบัน
    console.log('\n📋 Current data:');
    const currentData = languageService.getCurrentLanguageData();
    console.log(
      'Languages:',
      currentData.languages.map((l) => l.language_code)
    );
    console.log(
      'Text keys sample:',
      currentData.languageTexts.slice(0, 5).map((t) => t.text_key)
    );
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// ฟังก์ชันทดสอบ CRUD operations
export const testLanguageCRUD = async () => {
  console.log('🧪 Testing Language CRUD Operations...');

  try {
    // ทดสอบการสร้างข้อความใหม่
    console.log('➕ Testing create text...');
    const createResult = await languageService.createLanguageText({
      text_key: 'test_key',
      language_code: 'th',
      text_value: 'ข้อความทดสอบ',
    });
    console.log('Create result:', createResult);

    // ทดสอบการอัปเดต (ถ้าสร้างสำเร็จ)
    if (createResult.success) {
      console.log('✏️ Testing update text...');
      // หา text_id ที่เพิ่งสร้าง
      const newText = languageService.findLanguageText('test_key', 'th');
      if (newText) {
        const updateResult = await languageService.updateLanguageText(
          newText.text_id,
          {
            text_value: 'ข้อความทดสอบที่แก้ไขแล้ว',
          }
        );
        console.log('Update result:', updateResult);

        // ทดสอบการลบ
        console.log('🗑️ Testing delete text...');
        const deleteResult = await languageService.deleteLanguageText(
          newText.text_id
        );
        console.log('Delete result:', deleteResult);
      }
    }
  } catch (error) {
    console.error('❌ CRUD Test failed:', error);
  }
};

// ฟังก์ชันแสดงสถิติ
export const showLanguageStats = () => {
  console.log('📊 Language System Statistics:');

  const data = languageService.getCurrentLanguageData();

  console.log(`Languages: ${data.languages.length}`);
  console.log(`Text entries: ${data.languageTexts.length}`);

  // สถิติข้อความแต่ละภาษา
  const textsByLanguage: Record<string, number> = {};
  data.languageTexts.forEach((text) => {
    textsByLanguage[text.language_code] =
      (textsByLanguage[text.language_code] || 0) + 1;
  });

  console.log('Texts by language:');
  Object.entries(textsByLanguage).forEach(([lang, count]) => {
    console.log(`  ${lang}: ${count} texts`);
  });

  // ภาษาที่เปิดใช้งาน
  const activeLanguages = data.languages.filter((lang) => lang.status === 1);
  console.log(
    `Active languages: ${activeLanguages.length}/${data.languages.length}`
  );

  // ภาษาเริ่มต้น
  const defaultLanguage = data.languages.find((lang) => lang.is_default);
  console.log(`Default language: ${defaultLanguage?.language_code || 'None'}`);
};
