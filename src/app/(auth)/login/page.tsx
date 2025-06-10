'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService, type LoginRequest } from '@/app/services/authService';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  LogoIcon,
  FormEmailIcon,
  FormLockIcon,
  ButtonLoginIcon,
} from '@/app/components/ui/Icons';
import { useLanguage } from '@/app/hooks/useLanguage';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import CircuitBackground from '@/app/components/CircuitBackground';

// Constants for localStorage keys
const REMEMBER_ME_KEY = 'e_bidding_remember_me';
const SAVED_CREDENTIALS_KEY = 'e_bidding_saved_credentials';

// Eye icons for password visibility toggle
const EyeIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
    />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { translate } = useLanguage();
  const { login, clearSession } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({
    text: '',
    type: 'success' as 'success' | 'error',
  });
  const [returnUrl, setReturnUrl] = useState('/auctions');

  // Load saved credentials on component mount
  useEffect(() => {
    // ลบ session และ token ที่มีอยู่
    clearSession();

    // ลบ token จาก cookies
    document.cookie =
      'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict';

    // ดึง returnUrl จาก URL parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrlParam = urlParams.get('returnUrl');
      if (returnUrlParam) {
        setReturnUrl(returnUrlParam);
      }

      // Load saved credentials if "Remember Me" was previously checked
      const isRemembered = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
      if (isRemembered) {
        const savedCredentials = localStorage.getItem(SAVED_CREDENTIALS_KEY);
        if (savedCredentials) {
          try {
            const { username, password } = JSON.parse(savedCredentials);
            setFormData((prev) => ({
              ...prev,
              username: username || '',
              password: password || '',
              rememberMe: true,
            }));
          } catch (error) {
            console.error('Error loading saved credentials:', error);
            // Clear invalid data
            localStorage.removeItem(SAVED_CREDENTIALS_KEY);
            localStorage.removeItem(REMEMBER_ME_KEY);
          }
        }
      }
    }
  }, [clearSession]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login({
        username: formData.username,
        password: formData.password,
        remember_me: formData.rememberMe,
      } as LoginRequest);

      if (response.success) {
        // Handle Remember Me functionality
        if (formData.rememberMe) {
          // Save credentials to localStorage
          localStorage.setItem(REMEMBER_ME_KEY, 'true');
          localStorage.setItem(
            SAVED_CREDENTIALS_KEY,
            JSON.stringify({
              username: formData.username,
              password: formData.password,
            })
          );
        } else {
          // Clear saved credentials
          localStorage.removeItem(REMEMBER_ME_KEY);
          localStorage.removeItem(SAVED_CREDENTIALS_KEY);
        }

        // Show success message
        setMessage({
          text: response.message || translate('login_success'),
          type: 'success',
        });

        // Store user data if available
        if (response.data) {
          login(response.data, response.data.token, formData.rememberMe);

          // Redirect หลัง login สำเร็จ
          setTimeout(() => {
            window.location.href = returnUrl;
          }, 500);
        }
      } else {
        // API returned error response (400, etc.) - แสดง error message แบบ alert
        alert(response.message || translate('login_error'));
      }
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle network errors or other unexpected errors
      if (error.response) {
        // Server responded with error status
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          translate('login_error_server');
        alert(errorMessage);
      } else if (error.request) {
        // Network error
        alert(translate('login_error_network'));
      } else {
        // Other error
        alert(translate('login_error_unknown'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <CircuitBackground />

      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden mx-auto">
          {/* Language Switcher */}
          <div className="absolute top-4 right-4 z-10">
            <LanguageSwitcher />
          </div>

          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_theme(colors.blue.200/30%),_transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_theme(colors.blue.100/30%),_transparent_70%)]"></div>
          </div>

          {/* Content */}
          <div className="relative p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                  <LogoIcon />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {translate('login_title')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {translate('login_subtitle')}
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('username_label')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FormEmailIcon />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        placeholder:text-gray-400 text-gray-900 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder={translate('username_placeholder')}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('password_label')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FormLockIcon />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        placeholder:text-gray-400 text-gray-900 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder={translate('password_placeholder')}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 disabled:cursor-not-allowed"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-me"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
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
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 
                  text-white rounded-lg hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 shadow-md
                  hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed 
                  disabled:hover:scale-100 disabled:hover:from-blue-600 disabled:hover:to-blue-500"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {translate('login_loading')}
                  </>
                ) : (
                  <>
                    <ButtonLoginIcon />
                    {translate('login_button')}
                  </>
                )}
              </button>

              {/* Company Info & Registration */}
              <div className="mt-8 flex flex-col items-center space-y-2 text-center">
                <div className="text-sm text-gray-500 font-medium">
                  BIC CORPORATION CO.,LTD.
                </div>
                <div className="text-xs text-gray-400">
                  {translate('no_account')}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
