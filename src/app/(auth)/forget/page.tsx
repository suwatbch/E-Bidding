'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  authService,
  type OTPRequest,
  type ResetPasswordRequest,
} from '@/app/services/authService';
import {
  LogoIcon,
  FormEmailIcon,
  FormLockIcon,
  FormKeyIcon,
  ButtonSendIcon,
  LinkBackIcon,
} from '@/app/components/ui/Icons';
import { useLanguageContext } from '@/app/contexts/LanguageContext';
import CircuitBackground from '@/app/components/CircuitBackground';

// Eye icons for password visibility toggle (same as login page)
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

export default function ForgetPasswordPage() {
  const router = useRouter();
  const { t } = useLanguageContext();
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otp, setOtp] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Create refs for input fields
  const usernameRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  // OTP Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    } else if (otpCountdown === 0 && otpRequested) {
      setOtpRequested(false);
    }
    return () => clearInterval(timer);
  }, [otpCountdown, otpRequested]);

  // Format countdown time (MM:SS)
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ตรวจสอบข้อมูลทั้งหมด
    if (!username.trim()) {
      alert('กรุณากรอกชื่อผู้ใช้');
      return;
    }

    if (!newPassword.trim()) {
      alert('กรุณากรอกรหัสผ่านใหม่');
      return;
    }

    if (newPassword.length < 6) {
      alert('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (!confirmPassword.trim()) {
      alert('กรุณายืนยันรหัสผ่าน');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (!otp.trim()) {
      alert('กรุณากรอกรหัส OTP');
      return;
    }

    if (otp.length !== 6) {
      alert('รหัส OTP ต้องมี 6 หลัก');
      return;
    }

    setIsResetting(true);
    try {
      const response = await authService.resetPassword({
        username,
        otp,
        newPassword,
      });

      if (response.success) {
        alert(t('forget_success_message'));
        router.push('/login');
      } else {
        alert(response.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsResetting(false);
    }
  };

  // Handle OTP input to allow only numbers and max 6 digits
  const handleOTPInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) {
      setOtp(value);
      e.target.value = value;
    }
  };

  // Handle OTP request
  const handleRequestOTP = async () => {
    // ตรวจสอบข้อมูลที่จำเป็นก่อนขอ OTP
    if (!isFormValid()) {
      if (!username.trim()) {
        usernameRef.current?.focus();
        return;
      }
      if (!newPassword.trim()) {
        newPasswordRef.current?.focus();
        return;
      }
      if (newPassword.length < 6) {
        newPasswordRef.current?.focus();
        return;
      }
      if (!confirmPassword.trim()) {
        confirmPasswordRef.current?.focus();
        return;
      }
      if (newPassword !== confirmPassword) {
        confirmPasswordRef.current?.focus();
        return;
      }
    }

    setIsRequestingOTP(true);
    try {
      const response = await authService.requestOTP({
        username,
      });

      if (response.success) {
        setOtpRequested(true);
        setOtpCountdown(300); // 5 minutes = 300 seconds
      } else {
        alert(response.message || t('otp_request_error'));
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
      alert(t('otp_request_error'));
    } finally {
      setIsRequestingOTP(false);
    }
  };

  // ตรวจสอบว่าข้อมูลครบหรือไม่
  const isFormValid = () => {
    return (
      username.trim() &&
      newPassword.trim() &&
      newPassword.length >= 6 &&
      confirmPassword.trim() &&
      newPassword === confirmPassword
    );
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
                {t('forget_title')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {t('forget_subtitle')}
              </p>
            </div>

            {/* Forget Password Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('username_label')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FormEmailIcon />
                    </div>
                    <input
                      ref={usernameRef}
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        placeholder:text-gray-400 text-gray-900"
                      placeholder={t('username_placeholder')}
                      required
                    />
                  </div>
                </div>

                {/* New Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('forget_new_password_label')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FormLockIcon />
                    </div>
                    <input
                      ref={newPasswordRef}
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`block w-full pl-10 pr-12 py-2 border rounded-lg
                        focus:outline-none focus:ring-2 focus:border-transparent
                        placeholder:text-gray-400 text-gray-900 ${
                          newPassword.length >= 6
                            ? 'border-green-500 focus:ring-green-500'
                            : 'border-gray-300 focus:ring-red-400'
                        }`}
                      placeholder={t('forget_new_password_placeholder')}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 text-right">
                    {t('forget_new_password_hint')}
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('confirm_password_label')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FormLockIcon />
                    </div>
                    <input
                      ref={confirmPasswordRef}
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`block w-full pl-10 pr-12 py-2 border rounded-lg
                        focus:outline-none focus:ring-2 focus:border-transparent
                        placeholder:text-gray-400 text-gray-900 ${
                          confirmPassword.length > 0 &&
                          newPassword === confirmPassword &&
                          newPassword.length >= 6
                            ? 'border-green-500 focus:ring-green-500'
                            : 'border-gray-300 focus:ring-red-400'
                        }`}
                      placeholder={t('confirm_password_placeholder')}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 text-right">
                    {t('confirm_password_hint')}
                  </p>
                </div>

                {/* OTP Request Button */}
                <div>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleRequestOTP}
                      disabled={
                        isRequestingOTP || (otpRequested && otpCountdown > 0)
                      }
                      className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg focus:outline-none focus:ring-2 
                        focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 shadow-md
                        hover:scale-[1.02] active:scale-[0.98] ${
                          isRequestingOTP || (otpRequested && otpCountdown > 0)
                            ? 'bg-gray-400 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600'
                        }`}
                    >
                      {isRequestingOTP ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {t('requesting_otp')}
                        </>
                      ) : otpRequested && otpCountdown > 0 ? (
                        <>
                          {t('otp_countdown_prefix')}{' '}
                          {formatCountdown(otpCountdown)}
                        </>
                      ) : (
                        <>{t('request_otp_button')}</>
                      )}
                    </button>
                  </div>
                  {otpRequested && otpCountdown > 0 && (
                    <div className="mt-2 text-center">
                      <p className="text-sm text-green-600">
                        {t('otp_sent_message')}
                      </p>
                    </div>
                  )}
                </div>

                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('forget_otp_label')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FormKeyIcon />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={handleOTPInput}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        placeholder:text-gray-400 text-gray-900 tracking-[0.5em] text-center font-mono"
                      placeholder={t('forget_otp_placeholder')}
                      required
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500 text-right">
                    {t('forget_otp_hint')}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isResetting}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 shadow-md
                  hover:scale-[1.02] active:scale-[0.98] ${
                    isResetting
                      ? 'bg-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600'
                  }`}
              >
                {isResetting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('resetting_password')}
                  </>
                ) : (
                  <>
                    <ButtonSendIcon />
                    {t('forget_button')}
                  </>
                )}
              </button>

              {/* Back to Login Link */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-blue-600 hover:underline gap-1"
                >
                  <LinkBackIcon />
                  <span>{t('back_to_login')}</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
