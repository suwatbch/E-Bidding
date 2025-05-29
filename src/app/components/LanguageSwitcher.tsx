'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/app/hooks/useLanguage';
import { NavArrowDownIcon } from '@/app/components/ui/icons';

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'login';
}

export default function LanguageSwitcher({ variant = 'login' }: LanguageSwitcherProps) {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { currentLang, languages, changeLanguage, isLoading } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // สไตล์สำหรับ login page
  const loginStyles = {
    container: "absolute top-8 right-8",
    button: "flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-all duration-200",
    dropdown: "absolute right-0 mt-1 w-24 py-1 bg-white rounded-lg shadow-lg border border-gray-100",
    option: (isSelected: boolean) => `block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 
      ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-700'}`
  };

  // สไตล์สำหรับ navbar
  const navbarStyles = {
    container: "relative",
    button: "flex items-center gap-2 text-gray-700 hover:text-blue-600",
    dropdown: "absolute right-0 mt-2 w-24 py-1 bg-white rounded-lg shadow-lg border border-gray-100",
    option: (isSelected: boolean) => `block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 
      ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-700'}`
  };

  const styles = variant === 'navbar' ? navbarStyles : loginStyles;

  if (isLoading) {
    return <div className={styles.container}><div className={styles.button}>&nbsp;</div></div>;
  }

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        onClick={() => setIsLangOpen(!isLangOpen)}
        className={styles.button}
      >
        <span>{currentLang.toUpperCase()}</span>
        <NavArrowDownIcon className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
      </button>

      {isLangOpen && (
        <div className={styles.dropdown}>
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsLangOpen(false);
              }}
              className={styles.option(currentLang === lang.code)}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 