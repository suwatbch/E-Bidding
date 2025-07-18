// Language Service สำหรับจัดการข้อมูลภาษาจาก API
import axios, { AxiosResponse } from 'axios';

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface Language {
  language_code: string;
  language_name: string;
  flag: string | null;
  is_default: boolean;
  status: number;
}

export interface LanguageText {
  text_id: number;
  text_key: string;
  language_code: string;
  text_value: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ฟังก์ชันสำหรับอ่าน token จาก cookie และ localStorage
const getAuthTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    // 1. ลองดึงจาก cookie ก่อน (เพื่อความเร็วและความแม่นยำ)
    const allCookies = document.cookie.split('; ');
    const authTokenCookie = allCookies.find((row) =>
      row.startsWith('auth_token=')
    );
    const cookieToken = authTokenCookie?.split('=')[1];

    if (cookieToken) {
      return cookieToken;
    }

    // 2. Fallback: ดึงจาก localStorage
    const localToken = localStorage.getItem('auth_token');
    if (localToken) return localToken;

    // 3. Fallback: ดึงจาก sessionStorage
    const sessionToken = sessionStorage.getItem('auth_token');
    if (sessionToken) return sessionToken;

    // 4. Fallback: ดึงจาก session object
    const rememberMe = localStorage.getItem('auth_remember_me') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    const sessionData = storage.getItem('auth_session');

    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        return session.token || null;
      } catch (error) {
        console.error('Error parsing session data:', error);
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// ฟังก์ชันสำหรับสร้าง headers
const getHeaders = (requireAuth = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = getAuthTokenFromStorage();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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

    // ถ้าไม่มีข้อมูลใน localStorage ให้เริ่มต้นเป็น array ว่าง
    if (this.languages.length === 0) {
      this.languages = [];
    }
    if (this.languageTexts.length === 0) {
      this.languageTexts = [];
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
    // ตรวจสอบว่าอยู่ในฝั่ง client หรือไม่
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('cachedLanguages', JSON.stringify(languages));
      localStorage.setItem(
        'cachedLanguageTexts',
        JSON.stringify(languageTexts)
      );
      localStorage.setItem('lastLanguageUpdate', Date.now().toString());
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error);
    }
  }

  // โหลดข้อมูลจาก localStorage
  private loadFromStorage(): void {
    // ตรวจสอบว่าอยู่ในฝั่ง client หรือไม่
    if (typeof window === 'undefined') {
      this.languages = [];
      this.languageTexts = [];
      return;
    }

    try {
      const cachedLanguages = localStorage.getItem('cachedLanguages');
      const cachedTexts = localStorage.getItem('cachedLanguageTexts');
      const lastUpdate = localStorage.getItem('lastLanguageUpdate');

      if (cachedLanguages && cachedTexts) {
        this.languages = JSON.parse(cachedLanguages);
        this.languageTexts = JSON.parse(cachedTexts);
        this.lastUpdateTime = lastUpdate ? parseInt(lastUpdate) : 0;
      } else {
        this.languages = [];
        this.languageTexts = [];
      }
    } catch (error) {
      console.error('❌ Failed to load from localStorage:', error);
      this.languages = [];
      this.languageTexts = [];
    }
  }

  // โหลดข้อมูลภาษาจาก API (ไม่ต้อง token)
  async loadLanguagesFromAPI(): Promise<Language[]> {
    try {
      const response = await axios.get(`${API_URL}/api/language`, {
        headers: getHeaders(false), // ไม่ต้อง token
        timeout: 10000, // 10 วินาที timeout
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error loading languages from API:', error);
      // Return empty array แทนการ throw error เพื่อไม่ให้ระบบค้าง
      return [];
    }
  }

  // โหลดข้อมูลข้อความภาษาจาก API (ไม่ต้อง token)
  async loadLanguageTextsFromAPI(): Promise<LanguageText[]> {
    try {
      const response = await axios.get(`${API_URL}/api/language/texts/all`, {
        headers: getHeaders(false), // ไม่ต้อง token
        timeout: 10000, // 10 วินาที timeout
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
      // Return empty array แทนการ throw error เพื่อไม่ให้ระบบค้าง
      return [];
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

      return {
        languages: this.languages,
        languageTexts: this.languageTexts,
      };
    } catch (error) {
      console.error('❌ Failed to load from API, using fallback...', error);

      // ถ้า API ไม่สำเร็จ → ใช้ข้อมูลที่มีอยู่ใน memory/localStorage
      if (this.languages.length > 0 || this.languageTexts.length > 0) {
        return {
          languages: this.languages,
          languageTexts: this.languageTexts,
        };
      }

      // ถ้าไม่มีข้อมูลเลย → ส่งกลับ array ว่าง
      return {
        languages: [],
        languageTexts: [],
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

  /**
   * อัปเดตข้อมูลภาษา
   */
  async updateLanguage(
    languageCode: string,
    data: Partial<Language>
  ): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await axios.post(
        `${API_URL}/api/language/update/${languageCode}`,
        data,
        {
          headers: getHeaders(true), // ต้อง token
        }
      );
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      if (status >= 500) {
        console.error('Server Error in updateLanguage:', error);
      }
      return {
        success: false,
        message: error.response?.data?.message,
      };
    }
  }

  /**
   * เปลี่ยนสถานะภาษา (เปิด/ปิดใช้งาน)
   */
  async toggleLanguageStatus(languageCode: string): Promise<ApiResponse> {
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
      const status = error.response?.status;
      if (status >= 500) {
        console.error('Server Error in toggleLanguageStatus:', error);
      }
      return {
        success: false,
        message: error.response?.data?.message,
      };
    }
  }

  /**
   * ลบภาษา (soft delete)
   */
  async deleteLanguage(languageCode: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await axios.post(
        `${API_URL}/api/language/delete/${languageCode}`,
        {},
        {
          headers: getHeaders(true),
        }
      );
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      if (status >= 500) {
        console.error('Server Error in deleteLanguage:', error);
      }
      return {
        success: false,
        message: error.response?.data?.message,
      };
    }
  }

  // ===== Language Text Functions =====

  /**
   * อัปเดตข้อความภาษา
   */
  async updateLanguageText(
    textId: number,
    data: Partial<LanguageText>
  ): Promise<ApiResponse> {
    try {
      const apiData = {
        keyname: data.text_key,
        language_code: data.language_code,
        text: data.text_value,
      };

      const response: AxiosResponse<ApiResponse> = await axios.post(
        `${API_URL}/api/language/texts/update/${textId}`,
        apiData,
        { headers: getHeaders(true) }
      );
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      if (status >= 500) {
        console.error('Server Error in updateLanguageText:', error);
      }
      return {
        success: false,
        message: error.response?.data?.message,
      };
    }
  }

  /**
   * ลบข้อความภาษา
   */
  async deleteLanguageText(textId: number): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await axios.post(
        `${API_URL}/api/language/texts/delete/${textId}`,
        {},
        {
          headers: getHeaders(true), // ต้อง token
        }
      );
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      if (status >= 500) {
        console.error('Server Error in deleteLanguageText:', error);
      }
      return {
        success: false,
        message: error.response?.data?.message,
      };
    }
  }

  /**
   * สร้างข้อความภาษาใหม่
   */
  async createLanguageText(
    data: Omit<LanguageText, 'text_id'>
  ): Promise<ApiResponse> {
    try {
      // แปลงข้อมูลเป็นรูปแบบที่ API ต้องการ
      const apiData = {
        keyname: data.text_key,
        language_code: data.language_code,
        text: data.text_value,
      };

      const response: AxiosResponse<ApiResponse> = await axios.post(
        `${API_URL}/api/language/texts`,
        apiData,
        {
          headers: getHeaders(true),
        }
      );
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      if (status >= 500) {
        console.error('Server Error in createLanguageText:', error);
      }
      return {
        success: false,
        message: error.response?.data?.message,
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
    // ตรวจสอบว่าอยู่ในฝั่ง client หรือไม่
    if (typeof window === 'undefined') {
      this.languages = [];
      this.languageTexts = [];
      return;
    }

    // ลบข้อมูลใน localStorage
    localStorage.removeItem('cachedLanguages');
    localStorage.removeItem('cachedLanguageTexts');
    localStorage.removeItem('lastLanguageUpdate');

    // รีเซ็ตข้อมูลให้เป็น array เปล่า
    this.languages = [];
    this.languageTexts = [];
    this.lastUpdateTime = 0;
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
