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

        // โหลด API ใหม่ในพื้นหลัง (ไม่แสดง loading)
        try {
          const data = await languageService.refreshLanguageData();
          setLanguages(data.languages);
          setLanguageTexts(data.languageTexts);
          return data.languages; // return ข้อมูลล่าสุด
        } catch (apiError) {
          console.warn('⚠️ Background API update failed, using cache');
          return cachedData.languages; // return cache data
        }
      }

      // ถ้าไม่มี cache ให้แสดง loading และโหลดจาก API
      setIsLoading(true);

      const data = await languageService.refreshLanguageData();
      setLanguages(data.languages);
      setLanguageTexts(data.languageTexts);
      return data.languages; // return ข้อมูลที่โหลดมา
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
          return cachedData.languages;
        }
      } catch (cacheError) {
        console.error('❌ Failed to load cached data:', cacheError);
      }
      return []; // return empty array if all fails
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsHydrated(true);

      // โหลดข้อมูลภาษาก่อน
      loadLanguageData().then((loadedLanguages) => {
        // หลังจากโหลดข้อมูลแล้ว จึงตรวจสอบภาษาที่จะใช้
        const savedLanguage = localStorage.getItem('selectedLanguage');

        if (savedLanguage) {
          // ถ้ามี localStorage ใช้ภาษาที่บันทึกไว้
          setCurrentLanguage(savedLanguage);
        } else {
          // ถ้าไม่มี localStorage ให้หาภาษาเริ่มต้นจากฐานข้อมูล
          const defaultLanguage = loadedLanguages.find(
            (lang) => lang.is_default && lang.status === 1
          );
          if (defaultLanguage) {
            setCurrentLanguage(defaultLanguage.language_code);
          } else {
            // ถ้าไม่มีภาษาเริ่มต้น ให้ใช้ภาษาแรกที่เปิดใช้งาน
            const firstActiveLanguage = loadedLanguages.find(
              (lang) => lang.status === 1
            );
            if (firstActiveLanguage) {
              setCurrentLanguage(firstActiveLanguage.language_code);
            } else {
              // fallback สุดท้าย
              setCurrentLanguage('th');
            }
          }
        }
      });
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
