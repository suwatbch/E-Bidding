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
import { useAuth } from './AuthContext'; // เพิ่ม import AuthContext
import { userService } from '../services/userService'; // เพิ่ม import userService

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
  // Force update mechanism removed - now using localStorage priority

  // เพิ่ม useAuth เพื่อดึงข้อมูล user
  const {
    user,
    isAuthenticated,
    updateUser,
    isLoading: authLoading,
  } = useAuth();

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
      console.error('Error loading language data:', error);
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
        console.error('Failed to load cached data:', cacheError);
      }
      return []; // return empty array if all fails
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันสำหรับตั้งค่าภาษาตามลำดับความสำคัญ
  const determineLanguage = (loadedLanguages: Language[]) => {
    // Debug logs removed for production

    // 1. ถ้า user login แล้วและมี language_code ให้ใช้ภาษาจาก user profile (สำคัญที่สุด)
    if (isAuthenticated && user?.language_code) {
      // ตรวจสอบว่าภาษาของ user มีอยู่ในรายการภาษาที่เปิดใช้งานหรือไม่
      const userLanguage = loadedLanguages.find(
        (lang) => lang.language_code === user.language_code && lang.status === 1
      );
      if (userLanguage) {
        // Using user language (highest priority)
        setCurrentLanguage(user.language_code);
        // อัพเดท localStorage ให้ตรงกับ user profile
        localStorage.setItem('selectedLanguage', user.language_code);
        return;
      } else {
        console.log('⚠️ User language not valid, checking alternatives...');
      }
    }

    // 2. ถ้าไม่มี user หรือภาษาของ user ไม่ valid ให้ใช้ localStorage (เฉพาะเมื่อไม่ login)
    if (!isAuthenticated) {
      const savedLanguage = localStorage.getItem('selectedLanguage');
      if (savedLanguage) {
        // ตรวจสอบว่าภาษาที่บันทึกไว้ยังใช้งานได้หรือไม่
        const savedLanguageValid = loadedLanguages.find(
          (lang) => lang.language_code === savedLanguage && lang.status === 1
        );
        if (savedLanguageValid) {
          setCurrentLanguage(savedLanguage);
          return;
        } else {
          localStorage.removeItem('selectedLanguage');
        }
      }
    }

    // 3. ถ้าไม่มี localStorage หรือไม่ valid ให้หาภาษาเริ่มต้นจากฐานข้อมูล
    const defaultLanguage = loadedLanguages.find(
      (lang) => lang.is_default && lang.status === 1
    );
    if (defaultLanguage) {
      setCurrentLanguage(defaultLanguage.language_code);
      localStorage.setItem('selectedLanguage', defaultLanguage.language_code);
      return;
    }

    // 4. ถ้าไม่มีภาษาเริ่มต้น ให้หาภาษาไทยก่อน
    const thaiLanguage = loadedLanguages.find(
      (lang) => lang.language_code === 'th' && lang.status === 1
    );
    if (thaiLanguage) {
      setCurrentLanguage('th');
      localStorage.setItem('selectedLanguage', 'th');
      return;
    }

    // 5. ถ้าไม่มีภาษาไทย ให้ใช้ภาษาแรกที่เปิดใช้งาน
    const firstActiveLanguage = loadedLanguages.find(
      (lang) => lang.status === 1
    );
    if (firstActiveLanguage) {
      setCurrentLanguage(firstActiveLanguage.language_code);
      localStorage.setItem(
        'selectedLanguage',
        firstActiveLanguage.language_code
      );
      return;
    }

    // 6. fallback สุดท้าย
    setCurrentLanguage('th');
    localStorage.setItem('selectedLanguage', 'th');
  };

  // ฟังก์ชันสำหรับอัพเดทภาษาใน backend
  const updateUserLanguageInBackend = async (languageCode: string) => {
    if (!isAuthenticated || !user?.user_id) {
      return;
    }

    try {
      const response = await userService.updateUserLanguage(
        user.user_id,
        languageCode
      );

      if (response.success && response.message === null) {
        // อัพเดท user context ด้วย
        updateUser({ language_code: languageCode });

        // Force update localStorage/sessionStorage ด้วย
        if (typeof window !== 'undefined') {
          const storage = localStorage;
          const sessionData = storage.getItem('auth_session');
          if (sessionData) {
            try {
              const session = JSON.parse(sessionData);
              if (session.user) {
                session.user.language_code = languageCode;
                storage.setItem('auth_session', JSON.stringify(session));
              }
            } catch (error) {
              console.error('Error updating session storage:', error);
            }
          }

          // อัพเดท user data ใน localStorage ด้วย
          const userData = storage.getItem('auth_user');
          if (userData) {
            try {
              const user = JSON.parse(userData);
              user.language_code = languageCode;
              storage.setItem('auth_user', JSON.stringify(user));
            } catch (error) {
              console.error('Error updating user data:', error);
            }
          }

          // Trigger a custom event เพื่อแจ้งให้ AuthContext รู้ว่ามีการเปลี่ยนแปลง
          window.dispatchEvent(
            new CustomEvent('languageChanged', {
              detail: { languageCode, userId: user?.user_id },
            })
          );
        }
      } else {
        console.error('Failed to update user language:', response.message);
      }
    } catch (error) {
      console.error('Error updating user language in backend:', error);
    }
  };

  // useEffect สำหรับการโหลดข้อมูลครั้งแรก
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsHydrated(true);

      // โหลดข้อมูลภาษาก่อน
      loadLanguageData().then((loadedLanguages) => {
        determineLanguage(loadedLanguages);
      });
    }
  }, []);

  // useEffect สำหรับการอัพเดทภาษาเมื่อ user login/logout
  useEffect(() => {
    // รอให้ AuthContext โหลดเสร็จก่อน
    if (authLoading) {
      return;
    }

    if (isHydrated && languages.length > 0) {
      determineLanguage(languages);
    }
  }, [
    isAuthenticated,
    user?.language_code,
    isHydrated,
    authLoading,
    user?.updated_dt,
  ]);

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

  // ฟังก์ชันเปลี่ยนภาษา (เมื่อผู้ใช้เลือกเอง)
  const changeLanguage = async (languageCode: string) => {
    // อัพเดทภาษาใน UI ทันที
    setCurrentLanguage(languageCode);

    // บันทึกลง localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLanguage', languageCode);
    }

    // ถ้า user login แล้ว ให้อัพเดทใน backend ด้วย
    if (isAuthenticated && user?.user_id) {
      await updateUserLanguageInBackend(languageCode);
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
