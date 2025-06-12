'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  languageService,
  Language,
  LanguageText,
} from '../services/languageService';

// Type สำหรับ Context
interface LanguageContextType {
  // ข้อมูลภาษา
  languages: Language[];
  languageTexts: LanguageText[];

  // ภาษาปัจจุบัน
  currentLanguage: string;
  setCurrentLanguage: (language: string) => void;

  // สถานะการโหลด
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;

  // ฟังก์ชันสำหรับแปลข้อความ
  t: (key: string) => string;

  // ฟังก์ชันสำหรับรีเฟรชข้อมูล
  refreshData: () => Promise<void>;
}

// สร้าง Context
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Hook สำหรับใช้งาน Context
export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error(
      'useLanguageContext must be used within a LanguageProvider'
    );
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [languageTexts, setLanguageTexts] = useState<LanguageText[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<string>('th');
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ฟังก์ชันโหลดข้อมูลภาษา
  const loadLanguageData = async () => {
    try {
      setError(null);

      // ตรวจสอบว่ามีข้อมูลใน cache หรือไม่
      const cachedData = languageService.getCurrentLanguageData();

      // ถ้ามี cache ให้ใช้ก่อน และไม่ต้องแสดง loading
      if (
        cachedData.languages.length > 0 &&
        cachedData.languageTexts.length > 0
      ) {
        setLanguages(cachedData.languages);
        setLanguageTexts(cachedData.languageTexts);
        setIsLoading(false); // ปิด loading ทันทีเมื่อมี cache
        console.log('✅ Using cached language data - No loading screen');

        // โหลด API ใหม่ในพื้นหลัง (ไม่แสดง loading)
        try {
          const data = await languageService.refreshLanguageData();
          setLanguages(data.languages);
          setLanguageTexts(data.languageTexts);
          console.log('✅ Background API update completed');
        } catch (apiError) {
          console.warn('⚠️ Background API update failed, using cache');
        }
        return;
      }

      // ถ้าไม่มี cache ให้แสดง loading และโหลดจาก API
      console.log('📡 No cache found - Loading from API with loading screen');
      setIsLoading(true);

      const data = await languageService.refreshLanguageData();
      setLanguages(data.languages);
      setLanguageTexts(data.languageTexts);

      console.log('✅ Language data loaded from API:', {
        languages: data.languages.length,
        texts: data.languageTexts.length,
      });
    } catch (error) {
      console.error('❌ Error loading language data:', error);
      setError('Failed to load language data');

      // หากเกิดข้อผิดพลาด ให้ลองใช้ cached data
      try {
        const cachedData = languageService.getCurrentLanguageData();
        if (
          cachedData.languages.length > 0 ||
          cachedData.languageTexts.length > 0
        ) {
          setLanguages(cachedData.languages);
          setLanguageTexts(cachedData.languageTexts);
          console.log('✅ Using cached data after error');
        }
      } catch (cacheError) {
        console.error('❌ Failed to load cached data:', cacheError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsHydrated(true);

      // โหลดภาษาที่ผู้ใช้เลือกไว้จาก localStorage
      const savedLanguage = localStorage.getItem('selectedLanguage');
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }

      // โหลดข้อมูลภาษา
      loadLanguageData();
    }
  }, []);

  // ฟังก์ชันแปลข้อความ
  const t = (key: string): string => {
    // ถ้ายังไม่ hydrated ให้แสดง key
    if (!isHydrated) {
      return key;
    }

    // ถ้ากำลังโหลดและไม่มีข้อมูลเลย ให้แสดง key
    if (isLoading && languageTexts.length === 0) {
      return key;
    }

    try {
      return languageService.getText(key, currentLanguage);
    } catch (error) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  };

  // ฟังก์ชันเปลี่ยนภาษา
  const changeLanguage = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLanguage', languageCode);
    }
  };

  // ฟังก์ชัน refresh ข้อมูล
  const refreshData = async () => {
    await loadLanguageData();
  };

  // แสดงหน้า loading เฉพาะเมื่อ:
  // 1. ยังไม่ hydrated หรือ
  // 2. กำลังโหลดและไม่มีข้อมูลเลย (ไม่มี cache)
  if (!isHydrated || (isLoading && languageTexts.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  const value: LanguageContextType = {
    languages,
    languageTexts,
    currentLanguage,
    setCurrentLanguage: changeLanguage,
    isLoading,
    error,
    isHydrated,
    t,
    refreshData,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Export context for direct access (optional)
export { LanguageContext };
