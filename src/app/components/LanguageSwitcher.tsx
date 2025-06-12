'use client';

import { useState } from 'react';
import { NavLanguageIcon, NavArrowDownIcon } from './ui/Icons';
import { useLanguageContext } from '@/app/contexts/LanguageContext';
import Dropdown from './ui/Dropdown';

interface LanguageSwitcherProps {
  variant?: 'login' | 'navbar';
}

export default function LanguageSwitcher({
  variant = 'login',
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage, languages, setCurrentLanguage } =
    useLanguageContext();

  const buttonStyles = {
    login:
      'group flex items-center gap-1.5 px-2 py-1.5 text-gray-700 hover:text-blue-600 text-sm transition-all duration-300',
    navbar:
      'group flex items-center gap-1 px-1.5 py-2 rounded-xl text-sm transition-all duration-300 md:text-white md:hover:bg-white/10 text-gray-700 hover:bg-blue-50/50 w-full md:w-auto',
  };

  // กรองเฉพาะภาษาที่เปิดใช้งาน
  const activeLanguages = languages.filter((lang) => lang.status === 1);

  // หาภาษาปัจจุบัน
  const currentLang = activeLanguages.find(
    (lang) => lang.language_code === currentLanguage
  );

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      variant={variant === 'navbar' ? 'navbar' : 'mobile'}
      trigger={
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={buttonStyles[variant]}
        >
          <div className="flex items-center gap-1">
            <div
              className={`transform group-hover:scale-110 transition duration-300 ${
                variant === 'navbar' ? 'md:text-white text-gray-700' : ''
              }`}
            >
              <NavLanguageIcon className="w-5 h-5" />
            </div>
            <span
              className={`transform group-hover:scale-105 transition duration-300 ${
                variant === 'navbar' ? 'md:text-white text-gray-700' : ''
              }`}
            >
              {currentLang?.language_name || currentLanguage}
            </span>
            <div
              className={`transform group-hover:scale-110 transition duration-300 ${
                variant === 'navbar' ? 'md:text-white text-gray-700' : ''
              }`}
            >
              <NavArrowDownIcon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>
        </button>
      }
    >
      {activeLanguages.map((lang) => (
        <button
          key={lang.language_code}
          onClick={() => {
            setCurrentLanguage(lang.language_code);
            setIsOpen(false);
          }}
          className={`group flex items-center w-full px-4 py-2.5 text-sm transition-all duration-300 ${
            variant === 'navbar'
              ? 'md:hover:bg-blue-50/50 hover:bg-blue-50/50'
              : 'hover:bg-blue-50/50'
          }`}
        >
          <span
            className={`transform group-hover:scale-105 transition duration-300 ${
              currentLanguage === lang.language_code
                ? 'text-blue-700 font-medium'
                : 'text-gray-700 group-hover:text-blue-600'
            }`}
          >
            <span className="inline-block w-6">{lang.flag}</span>
            {lang.language_name}
          </span>
        </button>
      ))}
    </Dropdown>
  );
}
