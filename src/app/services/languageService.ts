// Language Service สำหรับจัดการข้อมูลภาษาจาก API
import axios from 'axios';
import { Language, dataLanguage, updateLanguageData } from '../model/language';
import {
  LanguageText,
  dataLanguageText,
  updateLanguageTextData,
} from '../model/language_text';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

  private constructor() {}

  public static getInstance(): LanguageService {
    if (!LanguageService.instance) {
      LanguageService.instance = new LanguageService();
    }
    return LanguageService.instance;
  }

  // บันทึกข้อมูลใน memory
  private async saveToMemory(
    languages: Language[],
    languageTexts: LanguageText[]
  ): Promise<void> {
    // บันทึกข้อมูลลง temp files หรือ memory cache
    console.log('💾 Saving to memory cache...');
  }

  // โหลดข้อมูลจาก temp files
  private async loadFromTempFiles(): Promise<{
    languages: Language[];
    languageTexts: LanguageText[];
  }> {
    try {
      console.log('🔄 Loading from temp files...');

      // โหลดจาก temp files โดยใช้ dynamic import
      const languageTemp = await import('../model/language_Temp').catch(
        () => null
      );
      const languageTextTemp = await import(
        '../model/language_text_Temp'
      ).catch(() => null);

      if (!languageTemp || !languageTextTemp) {
        throw new Error('Temp files not found');
      }

      // แปลง temp format เป็น API format
      const languages = languageTemp.languages;
      const languageTexts = languageTextTemp.languageTexts.map((item: any) => ({
        text_id: item.id,
        text_key: item.keyname,
        language_code: item.language_code,
        text_value: item.text,
      }));

      console.log('✅ Loaded from temp files:', {
        languages: languages.length,
        texts: languageTexts.length,
      });

      return { languages, languageTexts };
    } catch (error) {
      console.error('❌ Failed to load from temp files:', error);
      throw error;
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
        languages: dataLanguage,
        languageTexts: dataLanguageText,
      };
    }

    try {
      this.isLoading = true;

      // พยายามโหลดจาก API ก่อน
      const [languages, languageTexts] = await Promise.all([
        this.loadLanguagesFromAPI(),
        this.loadLanguageTextsFromAPI(),
      ]);

      // ถ้าโหลดจาก API สำเร็จ → บันทึกลง temp files
      await this.saveToMemory(languages, languageTexts);

      // อัพเดทข้อมูลในไฟล์
      updateLanguageData(languages);
      updateLanguageTextData(languageTexts);

      this.lastUpdateTime = Date.now();

      return {
        languages: dataLanguage,
        languageTexts: dataLanguageText,
      };
    } catch (error) {
      console.error('❌ Failed to load from API, trying temp files...', error);

      try {
        // ถ้า API ไม่สำเร็จ → โหลดจาก temp files
        const tempData = await this.loadFromTempFiles();

        // อัพเดทข้อมูลในไฟล์
        updateLanguageData(tempData.languages);
        updateLanguageTextData(tempData.languageTexts);

        console.log('✅ Successfully loaded from temp files');

        return {
          languages: dataLanguage,
          languageTexts: dataLanguageText,
        };
      } catch (tempError) {
        console.error('❌ Failed to load from temp files too:', tempError);
        throw new Error(
          'Failed to load language data from both API and temp files'
        );
      }
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
      languages: [...dataLanguage],
      languageTexts: [...dataLanguageText],
    };
  }

  // ฟังก์ชันสำหรับหาข้อความตาม key
  getText(textKey: string, languageCode: string = 'th'): string {
    const textEntry = dataLanguageText.find(
      (item) => item.text_key === textKey && item.language_code === languageCode
    );

    if (textEntry) {
      return textEntry.text_value;
    }

    // Fallback ไปภาษาไทย
    if (languageCode !== 'th') {
      const fallbackEntry = dataLanguageText.find(
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
      const currentLanguage = dataLanguage.find(
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
        // รีเฟรชข้อมูลหลังจากลบ
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
        // รีเฟรชข้อมูลหลังจากสร้าง
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

  // จัดกลุ่มข้อความตาม key สำหรับแสดงผลในตาราง
  getGroupedTexts(): Record<string, Record<string, string>> {
    const grouped: Record<string, Record<string, string>> = {};

    dataLanguageText.forEach((item) => {
      if (!grouped[item.text_key]) {
        grouped[item.text_key] = {};
      }
      grouped[item.text_key][item.language_code] = item.text_value;
    });

    return grouped;
  }

  // ค้นหาข้อความตาม text_key และ language_code
  findLanguageText(
    textKey: string,
    languageCode: string
  ): LanguageText | undefined {
    return dataLanguageText.find(
      (item) => item.text_key === textKey && item.language_code === languageCode
    );
  }
}

// Export singleton instance
export const languageService = LanguageService.getInstance();
