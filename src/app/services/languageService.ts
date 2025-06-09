// Language Service สำหรับจัดการข้อมูลภาษาจาก API
import axios from 'axios';
import { Language, dataLanguage, updateLanguageData } from '../model/language';
import {
  LanguageText,
  dataLanguageText,
  updateLanguageTextData,
} from '../model/language_text';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

  // บันทึกข้อมูลลงใน memory (ไม่สามารถเขียนไฟล์ใน browser ได้)
  private async saveToMemory(
    languages: Language[],
    languageTexts: LanguageText[]
  ): Promise<void> {
    try {
      // ข้อมูลจะถูกเก็บใน dataLanguage และ dataLanguageText อยู่แล้ว
    } catch (error) {
      console.error('❌ Failed to save to memory:', error);
    }
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

  // โหลดข้อมูลภาษาจาก API
  async loadLanguagesFromAPI(): Promise<Language[]> {
    try {
      const response = await axios.get(`${API_URL}/api/languages`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Error loading languages from API:', error);
      throw error;
    }
  }

  // โหลดข้อมูลข้อความภาษาจาก API
  async loadLanguageTextsFromAPI(): Promise<LanguageText[]> {
    try {
      const response = await axios.get(`${API_URL}/api/languages/texts/all`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data.data || [];
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
}

// Export singleton instance
export const languageService = LanguageService.getInstance();
