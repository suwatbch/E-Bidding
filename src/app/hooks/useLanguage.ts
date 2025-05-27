import { useState, useEffect } from 'react';
import { LanguageCode, languages } from '../i18n/languages';
import { translations } from '../i18n/translations';

export const useLanguage = () => {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('th');

  useEffect(() => {
    // ในอนาคตอาจจะโหลดค่าจาก localStorage หรือ API
    const defaultLang = languages.find(lang => lang.isDefault)?.code || 'th';
    setCurrentLang(defaultLang);
  }, []);

  const translate = (key: string): string => {
    return translations[currentLang][key] || key;
  };

  const changeLanguage = (lang: LanguageCode) => {
    setCurrentLang(lang);
    // ในอนาคตอาจจะบันทึกค่าลง localStorage หรือ API
  };

  return {
    currentLang,
    languages,
    translate,
    changeLanguage
  };
}; 