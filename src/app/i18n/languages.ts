export type LanguageCode = 'th' | 'en';

export interface Language {
  code: LanguageCode;
  name: string;
  isDefault: boolean;
  status: 1 | 0;
}

export const languages: Language[] = [
  {
    code: 'th',
    name: 'ภาษาไทย',
    isDefault: true,
    status: 1
  },
  {
    code: 'en',
    name: 'English',
    isDefault: false,
    status: 1
  }
]; 