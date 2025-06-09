'use client';

import { useState, useEffect } from 'react';
import { languages, LanguageCode } from '../model/dataLanguageTemp';
import { groupedTranslations } from '../model/dataLanguageTextTemp';

const LANGUAGE_KEY = 'selectedLanguage';

export function useLanguage() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('th');
  const [isLoading, setIsLoading] = useState(true);

  // อ่านค่าภาษาจาก localStorage เมื่อ component mount
  useEffect(() => {
    const storedLang = localStorage.getItem(LANGUAGE_KEY) as LanguageCode;
    if (
      storedLang &&
      languages.some((lang) => lang.language_code === storedLang)
    ) {
      setCurrentLang(storedLang);
    }
    setIsLoading(false);
  }, []);

  // ฟังก์ชันเปลี่ยนภาษา
  const changeLanguage = (lang: LanguageCode) => {
    setCurrentLang(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
    // เพิ่ม force update ให้ component ที่ใช้ hook นี้
    window.dispatchEvent(new Event('languageChange'));
  };

  // ฟังก์ชันแปลข้อความ
  const translate = (key: string): string => {
    return groupedTranslations[key]?.[currentLang] || key;
  };

  // เพิ่ม event listener สำหรับการเปลี่ยนภาษา
  useEffect(() => {
    const handleLanguageChange = () => {
      const savedLang = localStorage.getItem(LANGUAGE_KEY) as LanguageCode;
      if (savedLang && ['th', 'en', 'zh'].includes(savedLang)) {
        setCurrentLang(savedLang);
      }
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);

  return {
    currentLang,
    languages,
    translate,
    changeLanguage,
    isLoading,
  };
}
