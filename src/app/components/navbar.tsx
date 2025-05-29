'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  NavAuctionIcon,
  NavMyAuctionIcon,
  NavNotificationIcon,
  NavProfileIcon,
  NavArrowDownIcon,
  NavEditIcon,
  NavLogoutIcon,
  NavMenuIcon,
  NavCloseIcon,
  NavLogoIcon,
  NavDataIcon,
  NavCompanyIcon,
  NavUserIcon,
} from '@/app/components/ui/icons';
import { 
  connectSocket, 
  disconnectSocket,
  subscribeToNotifications,
  unsubscribeFromNotifications
} from '@/app/services/socket';
import { useLanguage } from '@/app/hooks/useLanguage';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDataOpen, setIsDataOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // สร้าง ref สำหรับเมนูโปรไฟล์, เมนูข้อมูล และเมนูมือถือ
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const dataDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { currentLang, languages, translate, changeLanguage } = useLanguage();

  useEffect(() => {
    // เชื่อมต่อ socket เมื่อโหลด Navbar
    connectSocket();

    // รับการแจ้งเตือนใหม่
    const handleNewNotification = (data: { name: string }) => {
      setNotificationCount(prev => prev + 1);
    };

    // สมัครรับการแจ้งเตือน
    subscribeToNotifications(handleNewNotification);

    // cleanup เมื่อ unmount
    return () => {
      unsubscribeFromNotifications(handleNewNotification);
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    // ฟังก์ชันจัดการคลิกนอกพื้นที่
    const handleClickOutside = (event: MouseEvent) => {
      // ปิดเมนูโปรไฟล์ถ้าคลิกข้างนอก
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      // ปิดเมนูข้อมูลถ้าคลิกข้างนอก
      if (dataDropdownRef.current && !dataDropdownRef.current.contains(event.target as Node)) {
        setIsDataOpen(false);
      }
      // ปิดเมนูมือถือถ้าคลิกข้างนอก
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // เพิ่ม event listener
    document.addEventListener('mousedown', handleClickOutside);

    // cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation = [
    { name: translate('auctions'), href: '/auctions', icon: <NavAuctionIcon /> },
    { name: translate('my_auctions'), href: '/my-auctions', icon: <NavMyAuctionIcon /> },
    { name: translate('notifications'), href: '/notifications', icon: <NavNotificationIcon /> },
  ];

  const handleLogout = () => {
    setIsProfileOpen(false); // ปิดเมนูดรอปดาวน์
    router.push('/login');
  };

  const isActivePage = (path: string) => pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100/40 shadow-sm z-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/auctions" className="flex items-center gap-2">
                <div className="w-7 h-7 flex items-center justify-center">
                  <NavLogoIcon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-base font-semibold text-blue-600">
                  E-Bidding
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-1">
              <Link 
                href="/auctions" 
                className={`flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-sm ${
                  isActivePage('/auctions') 
                    ? 'text-blue-600 bg-blue-50 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <NavAuctionIcon />
                {translate('auctions')}
              </Link>
              <Link 
                href="/my-auctions" 
                className={`flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-sm ${
                  isActivePage('/my-auctions') 
                    ? 'text-blue-600 bg-blue-50 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <NavMyAuctionIcon />
                {translate('my_auctions')}
              </Link>
              <Link 
                href="/alerts" 
                className={`flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-sm ${
                  isActivePage('/alerts') 
                    ? 'text-blue-600 bg-blue-50 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                } relative`}
                onClick={() => setNotificationCount(0)}
              >
                <NavNotificationIcon />
                {translate('notifications')}
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Link>

              {/* Data Management Dropdown */}
              <div className="relative" ref={dataDropdownRef}>
                <button
                  onClick={() => setIsDataOpen(!isDataOpen)}
                  className={`flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-sm ${
                    isActivePage('/company') || isActivePage('/user')
                      ? 'text-blue-600 bg-blue-50 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <NavDataIcon />
                  {translate('data_management')}
                  <NavArrowDownIcon className={`transform transition-transform duration-200 ${isDataOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDataOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100/50">
                    <button
                      onClick={() => {
                        setIsDataOpen(false);
                        router.push('/company');
                      }}
                      className={`flex items-center w-full px-3 py-1.5 text-sm ${
                        isActivePage('/company')
                          ? 'text-blue-600 bg-blue-50 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <NavCompanyIcon className="mr-1" />
                      {translate('company_info')}
                    </button>
                    <button
                      onClick={() => {
                        setIsDataOpen(false);
                        router.push('/user');
                      }}
                      className={`flex items-center w-full px-3 py-1.5 text-sm ${
                        isActivePage('/user')
                          ? 'text-blue-600 bg-blue-50 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <NavUserIcon className="mr-1" />
                      {translate('user_info')}
                    </button>
                  </div>
                )}
              </div>

              {/* Language Selector */}
              <LanguageSwitcher variant="navbar" />

              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-sm ${
                    isActivePage('/profile')
                      ? 'text-blue-600 bg-blue-50 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <NavProfileIcon />
                  {translate('profile')}
                  <NavArrowDownIcon className={`transform transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-100/50 overflow-hidden">
                    <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-50/50 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">สมชาย ใจดี</p>
                      <p className="text-xs text-gray-500">somchai@example.com</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push('/profile');
                      }}
                      className="flex items-center w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <NavEditIcon className="mr-1" />
                      {translate('edit_profile')}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <NavLogoutIcon className="mr-1" />
                      {translate('logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {isOpen ? (
                  <NavCloseIcon />
                ) : (
                  <NavMenuIcon />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden pb-4 bg-white rounded-xl shadow-lg mt-2 border border-gray-100/50" ref={mobileMenuRef}>
              <div className="flex flex-col p-2 space-y-1">
                <Link 
                  href="/auctions" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isActivePage('/auctions') 
                      ? 'text-blue-600 bg-blue-50 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <NavAuctionIcon />
                  {translate('auctions')}
                </Link>
                <Link 
                  href="/my-auctions" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isActivePage('/my-auctions') 
                      ? 'text-blue-600 bg-blue-50 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <NavMyAuctionIcon />
                  {translate('my_auctions')}
                </Link>
                <Link 
                  href="/alerts" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isActivePage('/alerts') 
                      ? 'text-blue-600 bg-blue-50 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  } relative`}
                  onClick={() => {
                    setIsOpen(false);
                    setNotificationCount(0);
                  }}
                >
                  <NavNotificationIcon />
                  {translate('notifications')}
                  {notificationCount > 0 && (
                    <span className="absolute top-2 left-7 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Link>

                {/* Data Management Mobile */}
                <div className="border-t border-gray-100 pt-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push('/company');
                    }}
                    className={`flex items-center w-full px-4 py-2 rounded-lg ${
                      isActivePage('/company')
                        ? 'text-blue-600 bg-blue-50 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <NavCompanyIcon className="mr-2" />
                    {translate('company_info')}
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push('/user');
                    }}
                    className={`flex items-center w-full px-4 py-2 rounded-lg ${
                      isActivePage('/user')
                        ? 'text-blue-600 bg-blue-50 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <NavUserIcon className="mr-2" />
                    {translate('user_info')}
                  </button>
                </div>

                {/* Language Selector Mobile */}
                <div className="border-t border-gray-100 pt-2">
                  <LanguageSwitcher variant="navbar" />
                </div>

                <div className="border-t border-gray-100 pt-2">
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      router.push('/profile');
                    }} 
                    className={`flex items-center w-full px-4 py-2 rounded-lg ${
                      isActivePage('/profile')
                        ? 'text-blue-600 bg-blue-50 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <NavEditIcon />
                    {translate('edit_profile')}
                  </button>
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }} 
                    className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg mt-1"
                  >
                    <NavLogoutIcon />
                    {translate('logout')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
