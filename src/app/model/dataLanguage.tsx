export type LanguageCode = 'th' | 'en' | 'zh';

export interface Language {
  code: LanguageCode;
  name: string;
  flag: string;
  isDefault: boolean;
  status: 1 | 0;
}

export const languages: Language[] = [
  {
    code: 'th',
    name: 'ไทย',
    flag: '🇹🇭',
    isDefault: true,
    status: 1
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    isDefault: false,
    status: 1
  },
  {
    code: 'zh',
    name: '中文',
    flag: '🇨🇳',
    isDefault: false,
    status: 1
  }
]; 