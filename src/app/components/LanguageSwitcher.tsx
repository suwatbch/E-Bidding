'use client';

import { useState, useRef, useEffect } from 'react';
import { NavArrowDownIcon } from './ui/icons';
import { useLanguage } from '@/app/hooks/useLanguage';
import { Language } from '@/app/i18n/languages';

interface LanguageSwitcherProps {
  variant?: 'login' | 'navbar';
}

export default function LanguageSwitcher({ variant = 'login' }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentLang, languages, changeLanguage } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const styles = {
    login: {
      button: "flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600",
      dropdown: "absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10",
      item: "flex items-center w-full px-4 py-2 text-gray-700 hover:bg-blue-50"
    },
    navbar: {
      button: "flex items-center gap-2 text-gray-700 hover:text-blue-600",
      dropdown: "absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10",
      item: "flex items-center w-full px-4 py-2 text-gray-700 hover:bg-blue-50"
    }
  };

  const currentStyle = styles[variant];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={currentStyle.button}
      >
        {languages.find(lang => lang.code === currentLang)?.name || currentLang}
        <NavArrowDownIcon />
      </button>

      {isOpen && (
        <div className={currentStyle.dropdown}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`${currentStyle.item} ${currentLang === lang.code ? 'bg-blue-50 text-blue-600' : ''}`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 