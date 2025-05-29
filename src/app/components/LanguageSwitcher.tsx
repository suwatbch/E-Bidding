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
      button: "group flex items-center gap-1.5 px-2 py-1.5 text-gray-700 hover:text-blue-600 text-sm transition-all duration-300",
      dropdown: "absolute right-0 mt-1 w-48 bg-white backdrop-blur-xl rounded-xl shadow-[0_10px_20px_-5px_rgba(0,0,0,0.15)] ring-1 ring-white/30 py-1.5 border border-white/30",
      item: "group flex items-center w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-300"
    },
    navbar: {
      button: "group flex items-center justify-between gap-1.5 px-4 py-2.5 rounded-lg text-sm transition-all duration-300 md:text-white md:hover:bg-white/10 text-gray-700 hover:bg-blue-50/50 w-full md:w-auto",
      dropdown: "md:absolute md:right-0 mt-1 w-full md:w-48 bg-white backdrop-blur-xl rounded-xl shadow-[0_10px_20px_-5px_rgba(0,0,0,0.15)] ring-1 ring-white/30 py-1.5 border border-white/30",
      item: "group flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50/50 transition-all duration-300"
    }
  };

  const currentStyle = styles[variant];

  return (
    <div className="relative w-full md:w-auto" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={currentStyle.button}
      >
        <div className="flex items-center gap-3">
          <div className={`transform group-hover:scale-110 transition duration-300 ${variant === 'navbar' ? 'md:text-white text-gray-700' : ''}`}>
            <NavLanguageIcon className="w-5 h-5" />
          </div>
          <span className={`transform group-hover:scale-105 transition duration-300 ${variant === 'navbar' ? 'md:text-white text-gray-700' : ''}`}>
            {languages.find(lang => lang.code === currentLang)?.name || currentLang}
          </span>
        </div>
        <div className={`transform group-hover:scale-110 transition duration-300 ${variant === 'navbar' ? 'md:text-white text-gray-700' : ''}`}>
          <NavArrowDownIcon className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
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
              className={currentStyle.item}
            >
              <span className={`transform group-hover:scale-105 transition duration-300 ${
                currentLang === lang.code 
                  ? 'text-blue-700 font-medium' 
                  : 'text-gray-700 group-hover:text-blue-600'
              }`}>
                {lang.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 