// ไฟล์สำหรับเก็บข้อมูลภาษาที่โหลดจาก API
export interface Language {
  language_code: string; // VARCHAR(5) PRIMARY KEY
  language_name: string; // VARCHAR(100) NOT NULL
  flag: string | null; // VARCHAR(8) CHARACTER SET utf8mb4
  is_default: boolean; // BOOLEAN DEFAULT FALSE
  status: 0 | 1; // TINYINT(1) DEFAULT 1
}

// ข้อมูลภาษาจะถูกอัพเดทโดย API
export let dataLanguage: Language[] = [];

// ฟังก์ชันสำหรับอัพเดทข้อมูลภาษา
export const updateLanguageData = (newData: Language[]) => {
  dataLanguage.length = 0; // Clear existing data
  dataLanguage.push(...newData);
};

// ฟังก์ชันสำหรับรีเซ็ตข้อมูลเป็นค่าเริ่มต้น
export const resetToDefaultLanguageData = () => {
  const defaultData: Language[] = [
    {
      language_code: 'th',
      language_name: 'ไทย',
      flag: '🇹🇭',
      is_default: true,
      status: 1,
    },
    {
      language_code: 'en',
      language_name: 'English',
      flag: '🇬🇧',
      is_default: false,
      status: 1,
    },
    {
      language_code: 'zh',
      language_name: '中文',
      flag: '🇨🇳',
      is_default: false,
      status: 1,
    },
  ];

  updateLanguageData(defaultData);
};

// เรียกฟังก์ชันเริ่มต้น
resetToDefaultLanguageData();
