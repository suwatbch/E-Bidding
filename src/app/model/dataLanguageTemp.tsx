export type LanguageCode = 'th' | 'en' | 'zh';

export interface Language {
  language_code: string; // VARCHAR(5) PRIMARY KEY
  language_name: string; // VARCHAR(100) NOT NULL
  flag: string | null; // VARCHAR(8) CHARACTER SET utf8mb4
  is_default: boolean; // BOOLEAN DEFAULT FALSE
  status: 0 | 1; // TINYINT(1) DEFAULT 1
}

export const languages: Language[] = [
  {
    language_code: 'th',
    language_name: 'ภาษาไทย',
    flag: '🇹🇭',
    is_default: true,
    status: 1,
  },
  {
    language_code: 'en',
    language_name: 'English',
    flag: '🇬🇧',
    is_default: false,
    status: 1,
  },
  {
    language_code: 'zh',
    language_name: '中文',
    flag: '🇨🇳',
    is_default: false,
    status: 1,
  },
];
