// Language Service สำหรับจัดการข้อมูลภาษาจาก API
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Types สำหรับภาษา
export interface Language {
  language_code: string;
  language_name: string;
  flag: string | null;
  is_default: boolean;
  status: number;
}

// Types สำหรับข้อความภาษา
export interface LanguageText {
  text_id: number;
  text_key: string;
  language_code: string;
  text_value: string;
}

// ข้อมูลภาษาเริ่มต้น
const DEFAULT_LANGUAGES: Language[] = [
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
];

// ข้อความภาษาเริ่มต้น
const DEFAULT_LANGUAGE_TEXTS: LanguageText[] = [
  // ข้อความพื้นฐานสำหรับระบบ
  {
    text_id: 1,
    text_key: 'login_title',
    language_code: 'th',
    text_value: 'เข้าสู่ระบบ',
  },
  {
    text_id: 2,
    text_key: 'login_title',
    language_code: 'en',
    text_value: 'Login',
  },
  {
    text_id: 3,
    text_key: 'logout',
    language_code: 'th',
    text_value: 'ออกจากระบบ',
  },
  { text_id: 4, text_key: 'logout', language_code: 'en', text_value: 'Logout' },
  {
    text_id: 5,
    text_key: 'forget_title',
    language_code: 'th',
    text_value: 'ลืมรหัสผ่าน',
  },
  {
    text_id: 6,
    text_key: 'forget_title',
    language_code: 'en',
    text_value: 'Forgot Password',
  },
  {
    text_id: 7,
    text_key: 'username',
    language_code: 'th',
    text_value: 'ชื่อผู้ใช้',
  },
  {
    text_id: 8,
    text_key: 'username',
    language_code: 'en',
    text_value: 'Username',
  },
  {
    text_id: 9,
    text_key: 'password',
    language_code: 'th',
    text_value: 'รหัสผ่าน',
  },
  {
    text_id: 10,
    text_key: 'password',
    language_code: 'en',
    text_value: 'Password',
  },
  { text_id: 11, text_key: 'submit', language_code: 'th', text_value: 'ส่ง' },
  {
    text_id: 12,
    text_key: 'submit',
    language_code: 'en',
    text_value: 'Submit',
  },
  {
    text_id: 13,
    text_key: 'cancel',
    language_code: 'th',
    text_value: 'ยกเลิก',
  },
  {
    text_id: 14,
    text_key: 'cancel',
    language_code: 'en',
    text_value: 'Cancel',
  },
];

// ฟังก์ชันสำหรับอ่าน token จาก cookie และ localStorage
const getAuthTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null;

  // 1. ลองอ่านจาก cookie ก่อน (สำหรับ middleware compatibility)
  const getCookieToken = (): string | null => {
    const allCookies = document.cookie.split('; ');
    const authTokenCookie = allCookies.find((row) =>
      row.startsWith('auth_token=')
    );
    return authTokenCookie?.split('=')[1] || null;
  };

  let token = getCookieToken();
  if (token) return token;

  // 2. ถ้าไม่มี cookie ลองหาใน localStorage (สำหรับ remember me)
  token = localStorage.getItem('auth_token');
  if (token) return token;

  // 3. ถ้าไม่มีใน localStorage ลองหาใน sessionStorage
  token = sessionStorage.getItem('auth_token');
  if (token) return token;

  // 4. ถ้ายังไม่มี ลองหาใน session object
  const rememberMe = localStorage.getItem('auth_remember_me') === 'true';
  const storage = rememberMe ? localStorage : sessionStorage;
  const sessionData = storage.getItem('auth_session');

  if (sessionData) {
    try {
      const session = JSON.parse(sessionData);
      token = session.token;
    } catch (error) {
      console.error('Error parsing session data:', error);
    }
  }

  return token || null;
};

// ฟังก์ชันสำหรับสร้าง headers
const getHeaders = (includeAuth: boolean = true) => {
  const headers: any = {
    'Content-Type': 'application/json',
  };

  // เพิ่ม Authorization header เฉพาะ API ที่ต้องการ authentication
  if (includeAuth) {
    const token = getAuthTokenFromStorage();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`⚠️ No auth token found - API call may fail`);
    }
  }

  return headers;
};

export class LanguageService {
  private static instance: LanguageService;
  private isLoading = false;
  private lastUpdateTime = 0;

  // เก็บข้อมูลใน Service Class แทนการใช้ไฟล์ model
  private languages: Language[] = [];
  private languageTexts: LanguageText[] = [];

  private constructor() {
    // โหลดข้อมูลจาก localStorage หากมี
    this.loadFromStorage();

    // ถ้าไม่มีข้อมูลใน localStorage ให้ใช้ข้อมูลเริ่มต้น
    if (this.languages.length === 0 || this.languageTexts.length === 0) {
      this.useDefaultData();
    }
  }

  public static getInstance(): LanguageService {
    if (!LanguageService.instance) {
      LanguageService.instance = new LanguageService();
    }
    return LanguageService.instance;
  }

  // เก็บข้อมูลลง localStorage เป็น backup
  private saveToStorage(
    languages: Language[],
    languageTexts: LanguageText[]
  ): void {
    try {
      localStorage.setItem('cached_languages', JSON.stringify(languages));
      localStorage.setItem(
        'cached_language_texts',
        JSON.stringify(languageTexts)
      );
      localStorage.setItem('language_cache_time', Date.now().toString());
      console.log('💾 Saved to localStorage cache');
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error);
    }
  }

  // โหลดข้อมูลจาก localStorage
  private loadFromStorage(): void {
    try {
      const cachedLanguages = localStorage.getItem('cached_languages');
      const cachedTexts = localStorage.getItem('cached_language_texts');

      if (cachedLanguages && cachedTexts) {
        this.languages = JSON.parse(cachedLanguages);
        this.languageTexts = JSON.parse(cachedTexts);
        console.log('✅ Loaded from localStorage cache:', {
          languages: this.languages.length,
          texts: this.languageTexts.length,
        });
      }
    } catch (error) {
      console.error('❌ Failed to load from localStorage:', error);
      this.languages = [];
      this.languageTexts = [];
    }
  }

  // ใช้ข้อมูลเริ่มต้นแทนการโหลดจาก temp files
  private useDefaultData(): void {
    try {
      console.log('🔄 Using default language data...');

      this.languages = [...DEFAULT_LANGUAGES];
      this.languageTexts = [...DEFAULT_LANGUAGE_TEXTS];

      console.log('✅ Loaded default data:', {
        languages: this.languages.length,
        texts: this.languageTexts.length,
      });
    } catch (error) {
      console.error('❌ Failed to use default data:', error);
      this.languages = DEFAULT_LANGUAGES;
      this.languageTexts = DEFAULT_LANGUAGE_TEXTS;
    }
  }

  // โหลดข้อมูลภาษาจาก API (ไม่ต้อง token)
  async loadLanguagesFromAPI(): Promise<Language[]> {
    try {
      const response = await axios.get(`${API_URL}/api/languages`, {
        headers: getHeaders(false), // ไม่ต้อง token
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error loading languages from API:', error);
      throw error;
    }
  }

  // โหลดข้อมูลข้อความภาษาจาก API (ไม่ต้อง token)
  async loadLanguageTextsFromAPI(): Promise<LanguageText[]> {
    try {
      const response = await axios.get(`${API_URL}/api/languages/texts/all`, {
        headers: getHeaders(false), // ไม่ต้อง token
      });

      // แปลงข้อมูลจาก API format เป็น LanguageText format
      const apiData = response.data.data || [];
      const languageTexts: LanguageText[] = apiData.map((item: any) => ({
        text_id: item.id,
        text_key: item.keyname,
        language_code: item.language_code,
        text_value: item.text,
      }));

      return languageTexts;
    } catch (error) {
      console.error('Error loading language texts from API:', error);
      throw error;
    }
  }

  // โหลดข้อมูลทั้งหมด
  async refreshLanguageData(): Promise<{
    languages: Language[];
    languageTexts: LanguageText[];
  }> {
    if (this.isLoading) {
      return {
        languages: this.languages,
        languageTexts: this.languageTexts,
      };
    }

    try {
      this.isLoading = true;

      // พยายามโหลดจาก API ก่อน
      const [languages, languageTexts] = await Promise.all([
        this.loadLanguagesFromAPI(),
        this.loadLanguageTextsFromAPI(),
      ]);

      // เก็บข้อมูลใน Service Class
      this.languages = languages;
      this.languageTexts = languageTexts;

      // บันทึกลง localStorage เป็น backup
      this.saveToStorage(languages, languageTexts);

      this.lastUpdateTime = Date.now();

      console.log('✅ Successfully loaded from API:', {
        languages: this.languages.length,
        texts: this.languageTexts.length,
      });

      return {
        languages: this.languages,
        languageTexts: this.languageTexts,
      };
    } catch (error) {
      console.error('❌ Failed to load from API, using fallback...', error);

      // ถ้า API ไม่สำเร็จ → ใช้ข้อมูลที่มีอยู่ใน memory/localStorage
      if (this.languages.length > 0 || this.languageTexts.length > 0) {
        console.log('✅ Using cached data from memory/localStorage');
        return {
          languages: this.languages,
          languageTexts: this.languageTexts,
        };
      }

      // ถ้าไม่มีข้อมูลเลย → ใช้ข้อมูลเริ่มต้น
      console.log('⚠️ No cached data, using default data');
      this.useDefaultData();

      return {
        languages: this.languages,
        languageTexts: this.languageTexts,
      };
    } finally {
      this.isLoading = false;
    }
  }

  // รับข้อมูลปัจจุบัน
  getCurrentLanguageData(): {
    languages: Language[];
    languageTexts: LanguageText[];
  } {
    return {
      languages: [...this.languages],
      languageTexts: [...this.languageTexts],
    };
  }

  // ฟังก์ชันสำหรับหาข้อความตาม key
  getText(textKey: string, languageCode: string = 'th'): string {
    const textEntry = this.languageTexts.find(
      (item) => item.text_key === textKey && item.language_code === languageCode
    );

    if (textEntry) {
      return textEntry.text_value;
    }

    // Fallback ไปภาษาไทย
    if (languageCode !== 'th') {
      const fallbackEntry = this.languageTexts.find(
        (item) => item.text_key === textKey && item.language_code === 'th'
      );

      if (fallbackEntry) {
        return fallbackEntry.text_value;
      }
    }

    return `[${textKey}]`;
  }

  // ฟังก์ชันสำหรับ force update ข้อมูล
  async forceRefresh(): Promise<void> {
    this.lastUpdateTime = 0; // Reset timer
    await this.refreshLanguageData();
  }

  // อัปเดตข้อมูลภาษา (ต้อง token)
  async updateLanguage(
    languageCode: string,
    data: Partial<Language>
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(
        `${API_URL}/api/languages/${languageCode}`,
        data,
        {
          headers: getHeaders(true), // ต้อง token
        }
      );

      if (response.data.success) {
        // รีเฟรชข้อมูลหลังจากอัปเดต
        await this.refreshLanguageData();
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating language:', error);
      console.error('❌ Error response:', error.response?.data);
      return {
        success: false,
        message:
          error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล',
      };
    }
  }

  // เปลี่ยนสถานะภาษา (เปิด/ปิดใช้งาน) (ต้อง token)
  async toggleLanguageStatus(
    languageCode: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // หาข้อมูลภาษาปัจจุบัน
      const currentLanguage = this.languages.find(
        (lang) => lang.language_code === languageCode
      );
      if (!currentLanguage) {
        return {
          success: false,
          message: 'ไม่พบข้อมูลภาษาที่ต้องการ',
        };
      }

      // สลับสถานะ
      const newStatus = currentLanguage.status === 1 ? 0 : 1;

      return await this.updateLanguage(languageCode, {
        language_name: currentLanguage.language_name,
        flag: currentLanguage.flag,
        is_default: currentLanguage.is_default,
        status: newStatus,
      });
    } catch (error: any) {
      console.error('Error toggling language status:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ',
      };
    }
  }

  // ลบภาษา (soft delete) (ต้อง token)
  async deleteLanguage(
    languageCode: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(
        `${API_URL}/api/languages/${languageCode}`,
        {
          headers: getHeaders(true), // ต้อง token
        }
      );

      if (response.data.success) {
        // รีเฟรชข้อมูลหลังจากลบสำเร็จ
        await this.refreshLanguageData();
        return {
          success: true,
          message: 'ลบภาษาเรียบร้อยแล้ว',
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'เกิดข้อผิดพลาดในการลบภาษา',
        };
      }
    } catch (error: any) {
      console.error('Error deleting language:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ API',
      };
    }
  }

  // ===== Language Text Functions =====

  // อัปเดตข้อความภาษา (ต้อง token)
  async updateLanguageText(
    textId: number,
    data: Partial<LanguageText>
  ): Promise<{ success: boolean; message: string }> {
    try {
      // แปลงข้อมูลเป็นรูปแบบที่ API ต้องการ
      const apiData = {
        keyname: data.text_key,
        language_code: data.language_code,
        text: data.text_value,
      };

      const response = await axios.post(
        `${API_URL}/api/languages/texts/${textId}`,
        apiData,
        {
          headers: getHeaders(true), // ต้อง token
        }
      );

      if (response.data.success) {
        // รีเฟรชข้อมูลหลังจากอัปเดต
        await this.refreshLanguageData();
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating language text:', error);
      return {
        success: false,
        message:
          error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อความ',
      };
    }
  }

  // ลบข้อความภาษา (ต้อง token)
  async deleteLanguageText(
    textId: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(
        `${API_URL}/api/languages/texts/${textId}`,
        {
          headers: getHeaders(true), // ต้อง token
        }
      );

      if (response.data.success) {
        // รีเฟรชข้อมูลหลังจากลบสำเร็จ
        await this.refreshLanguageData();
        return {
          success: true,
          message: 'ลบข้อความเรียบร้อยแล้ว',
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'เกิดข้อผิดพลาดในการลบข้อความ',
        };
      }
    } catch (error: any) {
      console.error('Error deleting language text:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ API',
      };
    }
  }

  // สร้างข้อความภาษาใหม่ (ต้อง token)
  async createLanguageText(
    data: Omit<LanguageText, 'text_id'>
  ): Promise<{ success: boolean; message: string }> {
    try {
      // แปลงข้อมูลเป็นรูปแบบที่ API ต้องการ
      const apiData = {
        keyname: data.text_key,
        language_code: data.language_code,
        text: data.text_value,
      };

      const response = await axios.post(
        `${API_URL}/api/languages/texts`,
        apiData,
        {
          headers: getHeaders(true), // ต้อง token
        }
      );

      if (response.data.success) {
        // รีเฟรชข้อมูลหลังจากสร้างสำเร็จ
        await this.refreshLanguageData();
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating language text:', error);
      return {
        success: false,
        message:
          error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างข้อความ',
      };
    }
  }

  // ===== Utility Functions =====

  // จัดกลุ่มข้อความตามภาษา
  getGroupedTexts(): Record<string, Record<string, string>> {
    const grouped: Record<string, Record<string, string>> = {};

    this.languageTexts.forEach((item) => {
      if (!grouped[item.language_code]) {
        grouped[item.language_code] = {};
      }
      grouped[item.language_code][item.text_key] = item.text_value;
    });

    return grouped;
  }

  // หาข้อความตาม key และ language_code
  findLanguageText(
    textKey: string,
    languageCode: string
  ): LanguageText | undefined {
    return this.languageTexts.find(
      (item) => item.text_key === textKey && item.language_code === languageCode
    );
  }

  // เคลียร์ cache
  clearCache(): void {
    this.languages = [...DEFAULT_LANGUAGES];
    this.languageTexts = [...DEFAULT_LANGUAGE_TEXTS];
    localStorage.removeItem('cached_languages');
    localStorage.removeItem('cached_language_texts');
    localStorage.removeItem('language_cache_time');
    console.log('🗑️ Language cache cleared, using default data');
  }

  // ตรวจสอบว่า cache หมดอายุหรือไม่
  isCacheExpired(maxAgeMs: number = 30 * 60 * 1000): boolean {
    // 30 นาที
    const cacheTime = localStorage.getItem('language_cache_time');
    if (!cacheTime) return true;

    const age = Date.now() - parseInt(cacheTime);
    return age > maxAgeMs;
  }
}

// Export singleton instance
export const languageService = LanguageService.getInstance();
