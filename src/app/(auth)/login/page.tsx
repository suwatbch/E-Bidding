'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LogoIcon,
  FormEmailIcon,
  FormLockIcon,
  ButtonLoginIcon
} from '@/app/components/ui/icons';
import { useLanguage } from '@/app/hooks/useLanguage';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { currentLang, languages, translate, changeLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden mx-auto">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_theme(colors.blue.200/30%),_transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_theme(colors.blue.100/30%),_transparent_70%)]"></div>
          </div>

          {/* Content */}
          <div className="relative p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              {/* Language Selector - Absolute positioned */}
              <div className="absolute top-8 right-8">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 
                    rounded-lg text-sm font-medium text-gray-700 transition-all duration-200"
                >
                  <span>{currentLang.toUpperCase()}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isLangOpen && (
                  <div className="absolute right-0 mt-1 w-24 py-1 bg-white rounded-lg shadow-lg border border-gray-100">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50
                          ${currentLang === lang.code ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Centered Logo */}
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                  <LogoIcon />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{translate('login_title')}</h2>
              <p className="mt-2 text-sm text-gray-600">{translate('login_subtitle')}</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{translate('email_label')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FormEmailIcon />
                    </div>
                    <input
                      type="email"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        placeholder:text-gray-400 text-gray-900"
                      placeholder={translate('email_placeholder')}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{translate('password_label')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FormLockIcon />
                    </div>
                    <input
                      type="password"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        placeholder:text-gray-400 text-gray-900"
                      placeholder={translate('password_placeholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-me"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    {translate('remember_me')}
                  </label>
                </div>
                <Link href="/forget" className="text-blue-600 hover:underline">
                  {translate('forgot_password')}
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 
                  text-white rounded-lg hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 shadow-md
                  hover:scale-[1.02] active:scale-[0.98]"
              >
                <ButtonLoginIcon />
                {translate('login_button')}
              </button>

              {/* Register Link */}
              <div className="text-center">
                <span className="text-sm text-gray-600">{translate('no_account')}</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
