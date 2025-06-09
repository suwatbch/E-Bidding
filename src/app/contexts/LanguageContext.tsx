'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Language, dataLanguage } from '../model/language';
import { LanguageText, dataLanguageText } from '../model/language_text';
import { languageService } from '../services/languageService';

// Types
interface LanguageContextType {
  languages: Language[];
  languageTexts: LanguageText[];
  currentLanguage: string;
  isLoading: boolean;
  error: string | null;

  // Methods
  setCurrentLanguage: (languageCode: string) => void;
  getText: (textKey: string, languageCode?: string) => string;
  refreshLanguageData: () => Promise<void>;
}

// Create Context
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Custom Hook
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Provider Props
interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: string;
}

// Language Provider Component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = 'th',
}) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [languageTexts, setLanguageTexts] = useState<LanguageText[]>([]);
  const [currentLanguage, setCurrentLanguageState] =
    useState<string>(defaultLanguage);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // อัพเดทข้อมูลจาก service
  const updateDataFromService = () => {
    setLanguages([...dataLanguage]);
    setLanguageTexts([...dataLanguageText]);
  };

  // โหลดข้อมูลภาษาจาก API ผ่าน Language Service
  const loadLanguageData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 LanguageContext: Loading language data...');

      // ใช้ Language Service โหลดข้อมูล (จะลอง API ก่อน แล้ว fallback ไป temp)
      await languageService.refreshLanguageData();

      // อัพเดทข้อมูลใน state
      updateDataFromService();

      console.log('✅ LanguageContext: Language data loaded successfully');
    } catch (err) {
      console.error('❌ LanguageContext: Error loading language data:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load language data'
      );

      // ยังคงอัพเดทข้อมูลใน state (อาจจะมีข้อมูล fallback)
      updateDataFromService();
    } finally {
      setIsLoading(false);
    }
  };

  // Get text by key and language (ใช้ API format)
  const getText = (textKey: string, languageCode?: string): string => {
    const lang = languageCode || currentLanguage;

    // หาข้อความจาก dataLanguageText (API format)
    const textEntry = languageTexts.find(
      (item) => item.text_key === textKey && item.language_code === lang
    );

    if (textEntry) {
      return textEntry.text_value;
    }

    // Fallback ไปภาษาไทย
    if (lang !== 'th') {
      const fallbackEntry = languageTexts.find(
        (item) => item.text_key === textKey && item.language_code === 'th'
      );

      if (fallbackEntry) {
        return fallbackEntry.text_value;
      }
    }

    // Return key if no text found (for debugging)
    return `[${textKey}]`;
  };

  // Set current language with validation
  const setCurrentLanguage = (languageCode: string) => {
    const languageExists = languages.some(
      (lang) => lang.language_code === languageCode
    );

    if (languageExists) {
      setCurrentLanguageState(languageCode);
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred_language', languageCode);
      }
    } else {
      console.warn(`Language code '${languageCode}' not found`);
    }
  };

  // Refresh language data
  const refreshLanguageData = async () => {
    await loadLanguageData();
  };

  // Load preferred language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('preferred_language');
      if (savedLanguage) {
        setCurrentLanguageState(savedLanguage);
      }
    }
  }, []);

  // Load language data on mount
  useEffect(() => {
    loadLanguageData();
  }, []);

  // Context value
  const contextValue: LanguageContextType = {
    languages,
    languageTexts,
    currentLanguage,
    isLoading,
    error,
    setCurrentLanguage,
    getText,
    refreshLanguageData,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Export context for direct access (optional)
export { LanguageContext };
