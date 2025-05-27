import { useState, useEffect } from 'react';
import { LanguageCode, languages } from '../i18n/languages';
import { translations } from '../i18n/translations';

const LANGUAGE_KEY = 'e-bidding-language';

export const useLanguage = () => {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('th');

  useEffect(() => {
    // โหลดค่าภาษาจาก localStorage ถ้าไม่มีให้ใช้ค่า default
    const savedLang = localStorage.getItem(LANGUAGE_KEY) as LanguageCode;
    const defaultLang = languages.find(lang => lang.isDefault)?.code || 'th';
    
    // ตรวจสอบว่าภาษาที่บันทึกไว้ยังใช้งานได้อยู่หรือไม่
    const isValidLang = languages.some(lang => lang.code === savedLang && lang.status === 1);
    
    setCurrentLang(isValidLang ? savedLang : defaultLang);
  }, []);

  const translate = (key: string): string => {
    return translations[currentLang][key] || key;
  };

  const changeLanguage = (lang: LanguageCode) => {
    setCurrentLang(lang);
    // บันทึกค่าภาษาลง localStorage
    localStorage.setItem(LANGUAGE_KEY, lang);
  };

  return {
    currentLang,
    languages,
    translate,
    changeLanguage
  };
}; 