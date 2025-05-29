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
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 backdrop-blur-lg bg-opacity-90 z-50 shadow-lg">
        {/* Left Circuit Pattern */}
        <div className="absolute left-0 top-0 h-full w-64 opacity-10">
          {/* Main vertical lines */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 h-24 w-[2px] bg-white"></div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 h-[2px] w-12 bg-white"></div>
          <div className="absolute left-16 top-1/2 -translate-y-[70%] h-12 w-[2px] bg-white"></div>
          <div className="absolute left-16 top-1/2 -translate-y-[70%] h-[2px] w-10 bg-white"></div>
          
          {/* Additional circuit elements */}
          <div className="absolute left-28 top-1/2 -translate-y-1/2 h-16 w-[2px] bg-white"></div>
          <div className="absolute left-28 top-1/2 -translate-y-1/2 h-[2px] w-8 bg-white"></div>
          <div className="absolute left-36 bottom-4 h-12 w-[2px] bg-white"></div>
          <div className="absolute left-36 bottom-4 h-[2px] w-16 bg-white"></div>
          
          {/* Top circuit elements */}
          <div className="absolute left-8 top-2 h-8 w-[2px] bg-white"></div>
          <div className="absolute left-8 top-2 h-[2px] w-20 bg-white"></div>
          <div className="absolute left-28 top-2 h-6 w-[2px] bg-white"></div>
          <div className="absolute left-28 top-8 h-[2px] w-24 bg-white"></div>
          
          {/* Bottom decorative elements */}
          <div className="absolute left-12 bottom-2 h-[2px] w-16 bg-white"></div>
          <div className="absolute left-28 bottom-2 h-4 w-[2px] bg-white"></div>
          <div className="absolute left-44 bottom-6 h-[2px] w-12 bg-white"></div>
          
          {/* Circuit nodes */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white"></div>
          <div className="absolute left-16 top-1/2 -translate-y-[70%] h-2 w-2 rounded-full bg-white"></div>
          <div className="absolute left-28 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white"></div>
          <div className="absolute left-36 bottom-4 h-2 w-2 rounded-full bg-white"></div>
        </div>
        
        {/* Right Circuit Pattern */}
        <div className="absolute right-0 top-0 h-full w-64 opacity-10">
          {/* Main vertical lines */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-24 w-[2px] bg-white"></div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-[2px] w-12 bg-white"></div>
          <div className="absolute right-16 top-1/2 -translate-y-[30%] h-12 w-[2px] bg-white"></div>
          <div className="absolute right-16 top-1/2 -translate-y-[30%] h-[2px] w-10 bg-white"></div>
          
          {/* Additional circuit elements */}
          <div className="absolute right-28 top-1/2 -translate-y-1/2 h-16 w-[2px] bg-white"></div>
          <div className="absolute right-28 top-1/2 -translate-y-1/2 h-[2px] w-8 bg-white"></div>
          <div className="absolute right-36 top-4 h-12 w-[2px] bg-white"></div>
          <div className="absolute right-36 top-4 h-[2px] w-16 bg-white"></div>
          
          {/* Top circuit elements */}
          <div className="absolute right-8 top-2 h-8 w-[2px] bg-white"></div>
          <div className="absolute right-8 top-2 h-[2px] w-20 bg-white"></div>
          <div className="absolute right-28 top-2 h-6 w-[2px] bg-white"></div>
          <div className="absolute right-28 top-8 h-[2px] w-24 bg-white"></div>
          
          {/* Bottom decorative elements */}
          <div className="absolute right-12 bottom-2 h-[2px] w-16 bg-white"></div>
          <div className="absolute right-28 bottom-2 h-4 w-[2px] bg-white"></div>
          <div className="absolute right-44 bottom-6 h-[2px] w-12 bg-white"></div>
          
          {/* Circuit nodes */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white"></div>
          <div className="absolute right-16 top-1/2 -translate-y-[30%] h-2 w-2 rounded-full bg-white"></div>
          <div className="absolute right-28 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white"></div>
          <div className="absolute right-36 top-4 h-2 w-2 rounded-full bg-white"></div>
        </div>

        {/* Animated Dots - Left */}
        <div className="absolute left-48 top-1/2 -translate-y-1/2 flex space-x-1">
          <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse"></div>
          <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse delay-100"></div>
          <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse delay-200"></div>
        </div>
        
        {/* Animated Dots - Right */}
        <div className="absolute right-48 top-1/2 -translate-y-1/2 flex space-x-1">
          <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse"></div>
          <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse delay-100"></div>
          <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse delay-200"></div>
        </div>

        {/* Glowing Lines */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

        <div className="mx-auto max-w-6xl px-4 relative">
          {/* Glowing Line */}
          <div className="absolute -bottom-px left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

          <div className="flex h-16 justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/auctions" className="group flex items-center gap-3 transition-all duration-300 hover:scale-105">
                <div className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-xl rounded-xl shadow-inner border border-white/5">
                  <div className="text-white transform group-hover:scale-110 transition duration-300">
                    <NavLogoIcon />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white tracking-wide">
                    E-Bidding
                  </span>
                  <span className="text-[10px] text-blue-200 font-medium tracking-wider">
                    BIC CORPORATION CO.,LTD.
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-2">
              <Link 
                href="/auctions" 
                className={`group flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-300 ${
                  isActivePage('/auctions') 
                    ? 'text-blue-800 bg-white font-medium shadow-md transform -translate-y-0.5' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <div className="transform group-hover:scale-110 transition duration-300">
                  <NavAuctionIcon />
                </div>
                <span className="transform group-hover:scale-105">{translate('auctions')}</span>
              </Link>
              <Link 
                href="/my-auctions" 
                className={`group flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-300 ${
                  isActivePage('/my-auctions') 
                    ? 'text-blue-800 bg-white font-medium shadow-md transform -translate-y-0.5' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <div className="transform group-hover:scale-110 transition duration-300">
                  <NavMyAuctionIcon />
                </div>
                <span className="transform group-hover:scale-105">{translate('my_auctions')}</span>
              </Link>
              <Link 
                href="/alerts" 
                className={`group flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-300 ${
                  isActivePage('/alerts') 
                    ? 'text-blue-800 bg-white font-medium shadow-md transform -translate-y-0.5' 
                    : 'text-white hover:bg-white/10'
                } relative`}
                onClick={() => setNotificationCount(0)}
              >
                <div className="transform group-hover:scale-110 transition duration-300">
                  <NavNotificationIcon />
                </div>
                <span className="transform group-hover:scale-105">{translate('notifications')}</span>
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </Link>

              {/* Data Management Dropdown */}
              <div className="relative" ref={dataDropdownRef}>
                <button
                  onClick={() => setIsDataOpen(!isDataOpen)}
                  className={`group flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-300 ${
                    isActivePage('/company') || isActivePage('/user')
                      ? 'text-blue-800 bg-white font-medium shadow-md transform -translate-y-0.5'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <div className="transform group-hover:scale-110 transition duration-300">
                    <NavDataIcon />
                  </div>
                  <span className="transform group-hover:scale-105">{translate('data_management')}</span>
                  <div className="transform group-hover:scale-110 transition duration-300">
                    <NavArrowDownIcon className={`transition-transform duration-200 ${isDataOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isDataOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg py-1.5 border border-white/20 transform transition-all duration-200">
                    <button
                      onClick={() => {
                        setIsDataOpen(false);
                        router.push('/company');
                      }}
                      className="group flex items-center w-full px-4 py-2 text-sm transition-all duration-300"
                    >
                      <div className="transform group-hover:scale-110 transition duration-300 mr-2">
                        <NavCompanyIcon className={isActivePage('/company') ? 'text-blue-700' : 'text-gray-700'} />
                      </div>
                      <span className={`transform group-hover:scale-105 ${
                        isActivePage('/company')
                          ? 'text-blue-700 font-medium'
                          : 'text-gray-700 group-hover:text-blue-600'
                      }`}>{translate('company_info')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsDataOpen(false);
                        router.push('/user');
                      }}
                      className="group flex items-center w-full px-4 py-2 text-sm transition-all duration-300"
                    >
                      <div className="transform group-hover:scale-110 transition duration-300 mr-2">
                        <NavUserIcon className={isActivePage('/user') ? 'text-blue-700' : 'text-gray-700'} />
                      </div>
                      <span className={`transform group-hover:scale-105 ${
                        isActivePage('/user')
                          ? 'text-blue-700 font-medium'
                          : 'text-gray-700 group-hover:text-blue-600'
                      }`}>{translate('user_info')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Language Switcher */}
              <LanguageSwitcher variant="navbar" />

              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`group flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-300 ${
                    isActivePage('/profile')
                      ? 'text-blue-800 bg-white font-medium shadow-md transform -translate-y-0.5'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <div className="transform group-hover:scale-110 transition duration-300">
                    <NavProfileIcon />
                  </div>
                  <span className="transform group-hover:scale-105">{translate('profile')}</span>
                  <div className="transform group-hover:scale-110 transition duration-300">
                    <NavArrowDownIcon className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 overflow-hidden transform transition-all duration-200">
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50/90 via-blue-50/70 to-white/80 border-b border-blue-100/50">
                      <p className="text-sm font-medium text-gray-900">สมชาย ใจดี</p>
                      <p className="text-xs text-gray-500">somchai@example.com</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push('/profile');
                      }}
                      className="group flex items-center w-full px-4 py-2 text-sm transition-all duration-300"
                    >
                      <div className="transform group-hover:scale-110 transition duration-300 mr-2">
                        <NavEditIcon className="text-gray-700 group-hover:text-blue-600" />
                      </div>
                      <span className="transform group-hover:scale-105 text-gray-700 group-hover:text-blue-600">
                        {translate('edit_profile')}
                      </span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="group flex items-center w-full px-4 py-2 text-sm transition-all duration-300"
                    >
                      <div className="transform group-hover:scale-110 transition duration-300 mr-2">
                        <NavLogoutIcon className="text-red-600" />
                      </div>
                      <span className="transform group-hover:scale-105 text-red-600">
                        {translate('logout')}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="group p-2 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
              >
                <div className="transform group-hover:scale-110 transition duration-300">
                  {isOpen ? <NavCloseIcon /> : <NavMenuIcon />}
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden pb-4 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg mt-2 border border-white/20" ref={mobileMenuRef}>
              <div className="flex flex-col p-2 space-y-1">
                <Link 
                  href="/auctions" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isActivePage('/auctions') 
                      ? 'text-blue-700 bg-blue-50/80 font-medium' 
                      : 'text-gray-700 hover:bg-blue-50/50'
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
                      ? 'text-blue-700 bg-blue-50/80 font-medium' 
                      : 'text-gray-700 hover:bg-blue-50/50'
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
                      ? 'text-blue-700 bg-blue-50/80 font-medium' 
                      : 'text-gray-700 hover:bg-blue-50/50'
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
                        ? 'text-blue-700 bg-blue-50/80 font-medium'
                        : 'text-gray-700 hover:bg-blue-50/50'
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
                        ? 'text-blue-700 bg-blue-50/80 font-medium'
                        : 'text-gray-700 hover:bg-blue-50/50'
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
                        ? 'text-blue-700 bg-blue-50/80 font-medium'
                        : 'text-gray-700 hover:bg-blue-50/50'
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
                    className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50/80 rounded-lg mt-1"
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

      {/* Add global styles for animation */}
      <style jsx global>{`
        @keyframes circuit-flow {
          0% {
            opacity: 0.05;
          }
          50% {
            opacity: 0.2;
          }
          100% {
            opacity: 0.05;
          }
        }
        .circuit-animate {
          animation: circuit-flow 4s infinite;
        }
      `}</style>
    </>
  );
}
