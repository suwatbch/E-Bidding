'use client';

import { useState, useRef, useEffect } from 'react';
import { NavArrowDownIcon, NavLanguageIcon } from './ui/icons';
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
      button: "flex items-center gap-0.5 px-2 py-1.5 text-gray-700 hover:text-blue-600 text-sm",
      dropdown: "absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100/50",
      item: "flex items-center w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
    },
    navbar: {
      button: "flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-gray-700 hover:bg-gray-50 text-sm",
      dropdown: "absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100/50",
      item: "flex items-center w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
    }
  };

  const currentStyle = styles[variant];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={currentStyle.button}
      >
        <NavLanguageIcon />
        {languages.find(lang => lang.code === currentLang)?.name || currentLang}
        <NavArrowDownIcon className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
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