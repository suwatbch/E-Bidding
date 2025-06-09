// ไฟล์สำหรับเก็บข้อมูลข้อความภาษาที่โหลดจาก API
export interface LanguageText {
  text_id: number; // INT AUTO_INCREMENT PRIMARY KEY
  text_key: string; // VARCHAR(100) NOT NULL
  language_code: string; // VARCHAR(5) FOREIGN KEY
  text_value: string; // TEXT NOT NULL
}

// ข้อมูลข้อความภาษาจะถูกอัพเดทโดย API
export let dataLanguageText: LanguageText[] = [];

// ฟังก์ชันสำหรับอัพเดทข้อมูลข้อความภาษา
export const updateLanguageTextData = (newData: LanguageText[]) => {
  dataLanguageText.length = 0; // Clear existing data
  dataLanguageText.push(...newData);
};

// ฟังก์ชันสำหรับแปลงข้อมูลจาก temp format เป็น API format
export const convertTempToApiFormat = (tempData: any[]) => {
  return tempData.map((item, index) => ({
    text_id: item.id || index + 1,
    text_key: item.keyname,
    language_code: item.language_code,
    text_value: item.text,
  }));
};

// ฟังก์ชันสำหรับรีเซ็ตข้อมูลเป็นค่าเริ่มต้น (จาก temp data)
export const resetToDefaultLanguageTextData = async () => {
  try {
    // โหลดข้อมูลจาก temp file
    const { languageTexts } = await import('./language_text_Temp');
    const convertedData = convertTempToApiFormat(languageTexts);
    updateLanguageTextData(convertedData);
  } catch (error) {
    console.error('Error loading default language text data:', error);
    // ถ้าโหลดไม่ได้ให้ใส่ข้อมูลพื้นฐาน
    const basicData: LanguageText[] = [
      {
        text_id: 1,
        text_key: 'app_title',
        language_code: 'th',
        text_value: 'ระบบประมูลอิเล็กทรอนิกส์',
      },
      {
        text_id: 2,
        text_key: 'app_title',
        language_code: 'en',
        text_value: 'E-Bidding System',
      },
      {
        text_id: 3,
        text_key: 'app_subtitle',
        language_code: 'th',
        text_value: 'ระบบประมูลออนไลน์ที่ทันสมัยและน่าเชื่อถือ',
      },
      {
        text_id: 4,
        text_key: 'app_subtitle',
        language_code: 'en',
        text_value: 'Modern and reliable online bidding system',
      },
    ];
    updateLanguageTextData(basicData);
  }
};

// เรียกฟังก์ชันเริ่มต้น
resetToDefaultLanguageTextData();
