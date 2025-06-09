'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LogoIcon,
  FormEmailIcon,
  FormLockIcon,
  FormKeyIcon,
  ButtonSendIcon,
  LinkBackIcon,
} from '@/app/components/ui/Icons';
import { useLanguage } from '@/app/hooks/useLanguage';
import CircuitBackground from '@/app/components/CircuitBackground';

export default function ForgetPasswordPage() {
  const router = useRouter();
  const { translate } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the password reset request
    // For now, we'll just show an alert and redirect
    alert(translate('forget_success_message'));
    router.push('/login');
  };

  // Handle OTP input to allow only numbers and max 6 digits
  const handleOTPInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) {
      e.target.value = value;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <CircuitBackground />

      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
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
                {translate('forget_title')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {translate('forget_subtitle')}
              </p>
            </div>

            {/* Forget Password Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('forget_email_label')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FormEmailIcon />
                    </div>
                    <input
                      type="email"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        placeholder:text-gray-400 text-gray-900"
                      placeholder={translate('forget_email_placeholder')}
                      required
                    />
                  </div>
                </div>

                {/* New Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('forget_new_password_label')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FormLockIcon />
                    </div>
                    <input
                      type="password"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        placeholder:text-gray-400 text-gray-900"
                      placeholder={translate('forget_new_password_placeholder')}
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500 text-right">
                    {translate('forget_new_password_hint')}
                  </p>
                </div>

                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('forget_otp_label')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FormKeyIcon />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      onChange={handleOTPInput}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        placeholder:text-gray-400 text-gray-900 tracking-[0.5em] text-center font-mono"
                      placeholder={translate('forget_otp_placeholder')}
                      required
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500 text-right">
                    {translate('forget_otp_hint')}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 
                  text-white rounded-lg hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 shadow-md
                  hover:scale-[1.02] active:scale-[0.98]"
              >
                <ButtonSendIcon />
                {translate('forget_button')}
              </button>

              {/* Back to Login Link */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-blue-600 hover:underline gap-1"
                >
                  <LinkBackIcon />
                  <span>{translate('back_to_login')}</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
