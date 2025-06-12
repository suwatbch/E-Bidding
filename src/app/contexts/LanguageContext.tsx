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
  t: (key: string, language?: string) => string;

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

// Provider Component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [languageTexts, setLanguageTexts] = useState<LanguageText[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<string>('th');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // ฟังก์ชันสำหรับโหลดข้อมูลภาษา
  const loadLanguageData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Loading language data...');
      const result = await languageService.refreshLanguageData();

      // อัปเดต state
      setLanguages(result.languages);
      setLanguageTexts(result.languageTexts);

      console.log('✅ Language data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load language data:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการโหลดข้อมูลภาษา'
      );

      // ลองใช้ข้อมูลที่มีใน cache
      const cachedData = languageService.getCurrentLanguageData();
      setLanguages(cachedData.languages);
      setLanguageTexts(cachedData.languageTexts);
    } finally {
      setIsLoading(false);
    }
  };

  // โหลดภาษาที่ผู้ใช้เลือกไว้จาก localStorage
  useEffect(() => {
    // ตั้งค่า hydrated เป็น true หลังจาก component mount
    setIsHydrated(true);

    // โหลดภาษาที่ผู้ใช้เลือกไว้
    if (typeof window !== 'undefined') {
      const storedLanguage = localStorage.getItem('preferred_language');
      if (storedLanguage) {
        setCurrentLanguage(storedLanguage);
      }
    }

    // โหลดข้อมูลภาษา
    loadLanguageData();
  }, []);

  // ฟังก์ชันสำหรับแปลข้อความ
  const t = (key: string, language?: string): string => {
    // ถ้ายังไม่ hydrated ให้ return key เป็น fallback
    if (!isHydrated) {
      return key;
    }

    const targetLanguage = language || currentLanguage;
    const result = languageService.getText(key, targetLanguage);

    // ถ้าไม่เจอข้อความ และยัง loading อยู่ ให้ return key แทน
    if (result === `[${key}]` && isLoading) {
      return key;
    }

    return result;
  };

  // ฟังก์ชันสำหรับรีเฟรชข้อมูล
  const refreshData = async () => {
    await loadLanguageData();
  };

  // ฟังก์ชันสำหรับเปลี่ยนภาษา
  const handleSetCurrentLanguage = (language: string) => {
    setCurrentLanguage(language);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred_language', language);
    }
  };

  const value: LanguageContextType = {
    languages,
    languageTexts,
    currentLanguage,
    setCurrentLanguage: handleSetCurrentLanguage,
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
