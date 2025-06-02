export type LanguageCode = 'th' | 'en' | 'zh';

export interface Language {
  code: LanguageCode;
  name: string;
  isDefault: boolean;
  status: 1 | 0;
}

export const languages: Language[] = [
  {
    code: 'th',
    name: 'ไทย',
    isDefault: true,
    status: 1
  },
  {
    code: 'en',
    name: 'English',
    isDefault: false,
    status: 1
  },
  {
    code: 'zh',
    name: '中文',
    isDefault: false,
    status: 1
  }
]; 