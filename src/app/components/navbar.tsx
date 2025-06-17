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
  NavHomeIcon,
  NavLanguageManageIcon,
} from '@/app/components/ui/Icons';
import {
  connectSocket,
  disconnectSocket,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from '@/app/services/socketService';
import { useLanguageContext } from '@/app/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import Dropdown from './ui/Dropdown';
import Container from './ui/Container';
import { User } from '@/app/services/userService';
import { useAuth } from '@/app/contexts/AuthContext';
import { authService } from '@/app/services/authService';

interface FormData {
  username: string;
  password: string;
  language_code: string;
  fullname: string;
  tax_id: string;
  address: string;
  email: string;
  phone: string;
  type: 'admin' | 'user';
  status: boolean;
  is_locked: boolean;
  is_profile: boolean;
  image?: string;
}

const initialForm: FormData = {
  username: '',
  password: '',
  language_code: 'th',
  fullname: '',
  tax_id: '',
  address: '',
  email: '',
  phone: '',
  type: 'user',
  status: true,
  is_locked: false,
  is_profile: true,
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDataOpen, setIsDataOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialForm);

  // เพิ่ม state สำหรับเก็บข้อมูลจาก localStorage
  const [localUserData, setLocalUserData] = useState<{
    fullname?: string;
    email?: string;
    image?: string;
  }>({});

  // สร้าง ref สำหรับเมนูโปรไฟล์, เมนูข้อมูล และเมนูมือถือ
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const dataDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { currentLanguage, languages, t } = useLanguageContext();

  const { logout, user, isLoading: isAuthLoading } = useAuth();

  // เพิ่ม useEffect สำหรับโหลดข้อมูลจาก localStorage
  useEffect(() => {
    const loadUserDataFromStorage = () => {
      try {
        let userData = {
          fullname: '',
          email: '',
          image: '',
        };

        // 1. ลองดึงข้อมูลจาก AuthContext ก่อน (ใหม่)
        if (user && user.fullname) {
          userData = {
            fullname: user.fullname || '',
            email: user.email || '',
            image: user.image || '',
          };
          setLocalUserData(userData);
          return true;
        }

        // 2. ถ้าไม่มีใน AuthContext ดึงจาก localStorage
        const authUser = localStorage.getItem('auth_user');
        if (authUser) {
          const authUserData = JSON.parse(authUser);
          userData = {
            fullname: authUserData.fullname || '',
            email: authUserData.email || '',
            image: authUserData.image || '',
          };
          setLocalUserData(userData);
          return userData.fullname !== '';
        }

        // 3. ลองดึงจาก session storage
        const sessionUser = sessionStorage.getItem('auth_user');
        if (sessionUser) {
          const sessionUserData = JSON.parse(sessionUser);
          userData = {
            fullname: sessionUserData.fullname || '',
            email: sessionUserData.email || '',
            image: sessionUserData.image || '',
          };
          setLocalUserData(userData);
          return userData.fullname !== '';
        }

        setLocalUserData(userData);
        return false;
      } catch (error) {
        console.error('Error loading user data from storage:', error);
        setLocalUserData({});
        return false;
      }
    };

    // ฟัง localStorage changes จากหน้าอื่น (same origin)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_user' && e.newValue) {
        loadUserDataFromStorage();
      }
    };

    // ฟัง manual localStorage changes ในหน้าเดียวกัน
    const handleCustomStorageChange = () => {
      loadUserDataFromStorage();
    };

    // เพิ่ม event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleCustomStorageChange);

    // Enhanced loading mechanism
    let retryCount = 0;
    const maxRetries = 10;
    let pollingInterval: NodeJS.Timeout | null = null;

    const tryLoadData = () => {
      const hasData = loadUserDataFromStorage();

      if (hasData) {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
        }
        return true;
      }

      retryCount++;

      if (retryCount >= maxRetries) {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
        }
        return false;
      }

      return false;
    };

    // โหลดข้อมูลครั้งแรกทันที
    if (!tryLoadData()) {
      // ถ้าไม่ได้ข้อมูล ใช้ polling ทุก 200ms
      pollingInterval = setInterval(() => {
        tryLoadData();
      }, 200);
    }

    // Fallback: เช็คอีกครั้งหลัง 2 วินาที
    const fallbackTimeout = setTimeout(() => {
      if (retryCount > 0 && !localUserData.fullname) {
        tryLoadData();
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        'localStorageChange',
        handleCustomStorageChange
      );
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      clearTimeout(fallbackTimeout);
    };
  }, [user]); // เพิ่ม dependency user

  // เพิ่ม useEffect เพื่อรอการเปลี่ยนแปลงของ user จาก AuthContext
  useEffect(() => {
    if (user && user.fullname && !localUserData.fullname) {
      setLocalUserData({
        fullname: user.fullname || '',
        email: user.email || '',
        image: user.image || '',
      });
    }
  }, [user, localUserData.fullname]);

  useEffect(() => {
    // เชื่อมต่อ socket เมื่อโหลด Navbar
    connectSocket();

    // รับการแจ้งเตือนใหม่
    const handleNewNotification = (data: { name: string }) => {
      setNotificationCount((prev) => prev + 1);
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
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      // ปิดเมนูข้อมูลถ้าคลิกข้างนอก
      if (
        dataDropdownRef.current &&
        !dataDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDataOpen(false);
      }
      // ปิดเมนูมือถือถ้าคลิกข้างนอก
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
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
    {
      name: t('auctions'),
      href: '/auctions',
      icon: <NavAuctionIcon />,
    },
    {
      name: t('my_auctions'),
      href: '/my-auctions',
      icon: <NavMyAuctionIcon />,
    },
    {
      name: t('notifications'),
      href: '/notifications',
      icon: <NavNotificationIcon />,
    },
  ];

  const handleLogout = async () => {
    setIsProfileOpen(false); // ปิดเมนูดรอปดาวน์

    try {
      // เรียก logout API
      await authService.logout();

      // เรียก logout function จาก AuthContext
      logout();

      // Redirect ไปหน้า login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);

      // ถึงแม้จะ error ใน API ก็ให้ logout ท้องถิ่นแล้ว redirect
      logout();
      router.push('/login');
    }
  };

  const isActivePage = (path: string) => pathname === path;

  const handleEditProfile = () => {
    setIsProfileOpen(false);
    if (user) {
      const newFormData = {
        username: user.username,
        password: '',
        language_code: user.language_code || 'th',
        fullname: user.fullname || '',
        tax_id: user.tax_id || '',
        address: user.address || '',
        email: user.email || '',
        phone: user.phone || '',
        type: (user.type as 'admin' | 'user') || 'user',
        status: user.status === 1,
        is_locked: user.is_locked || false,
        is_profile: true,
        image: user.image || undefined,
      };
      setFormData(newFormData);
      setIsModalOpen(true);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (user) {
      const updatedProfile: User = {
        ...user,
        username: formData.username,
        email: formData.email,
        fullname: formData.fullname,
        tax_id: formData.tax_id || undefined,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        type: formData.type,
        status: formData.status ? 1 : 0, // แปลง boolean เป็น 0 | 1
        is_locked: formData.is_locked,
        language_code: formData.language_code,
        updated_dt: new Date().toISOString(),
        created_dt: user.created_dt || new Date().toISOString(), // ใส่ created_dt
        image: formData.image || undefined,
        login_count: user.login_count || 0,
      };

      setIsModalOpen(false);
      setFormData(initialForm);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialForm);
  };

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

        {/* Glowing Lines */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

        <Container>
          {/* Glowing Line */}
          <div className="absolute -bottom-px left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

          <div className="flex h-16 justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href="/auctions"
                className="group flex items-center gap-3 transition-all duration-300 hover:scale-105"
              >
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
            <div className="hidden md:flex md:items-center md:space-x-0.5">
              <Link
                href="/auctions"
                className={`group flex items-center gap-1 px-1.5 py-2 rounded-xl text-sm transition-all duration-300 ${
                  isActivePage('/auctions')
                    ? 'text-blue-800 bg-white font-medium shadow-md transform -translate-y-0.5'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <div className="transform group-hover:scale-110 transition duration-300">
                  <NavHomeIcon className="w-5 h-5" />
                </div>
                <span className="transform group-hover:scale-105">
                  {t('auctions')}
                </span>
              </Link>
              <Link
                href="/my-auctions"
                className={`group flex items-center gap-1 px-1.5 py-2 rounded-xl text-sm transition-all duration-300 ${
                  isActivePage('/my-auctions')
                    ? 'text-blue-800 bg-white font-medium shadow-md transform -translate-y-0.5'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <div className="transform group-hover:scale-110 transition duration-300">
                  <NavMyAuctionIcon />
                </div>
                <span className="transform group-hover:scale-105">
                  {t('my_auctions')}
                </span>
              </Link>

              {/* Language Switcher */}
              <LanguageSwitcher variant="navbar" />

              {/* Data Management Dropdown */}
              <Dropdown
                isOpen={isDataOpen}
                onClose={() => setIsDataOpen(false)}
                variant="navbar"
                trigger={
                  <button
                    onClick={() => setIsDataOpen(!isDataOpen)}
                    className={`group flex items-center gap-1 px-1.5 py-2 rounded-xl text-sm transition-all duration-300 ${
                      isActivePage('/company') || isActivePage('/user')
                        ? 'text-blue-800 bg-white font-medium shadow-md transform -translate-y-0.5'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="transform group-hover:scale-110 transition duration-300">
                      <NavDataIcon />
                    </div>
                    <span className="transform group-hover:scale-105">
                      {t('data_management')}
                    </span>
                    <div className="transform group-hover:scale-110 transition duration-300">
                      <NavArrowDownIcon
                        className={`transition-transform duration-200 ${
                          isDataOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                }
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsDataOpen(false);
                      router.push('/company');
                    }}
                    className="group flex items-center w-full px-4 py-2.5 text-sm transition-all duration-300 hover:bg-blue-50/50"
                  >
                    <div className="transform group-hover:scale-110 transition duration-300 mr-2">
                      <NavCompanyIcon
                        className={
                          isActivePage('/company')
                            ? 'text-blue-700'
                            : 'text-gray-700 group-hover:text-blue-600'
                        }
                      />
                    </div>
                    <span
                      className={`transform group-hover:scale-105 ${
                        isActivePage('/company')
                          ? 'text-blue-700 font-medium'
                          : 'text-gray-700 group-hover:text-blue-600'
                      }`}
                    >
                      {t('company_info')}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setIsDataOpen(false);
                      router.push('/user');
                    }}
                    className="group flex items-center w-full px-4 py-2.5 text-sm transition-all duration-300 hover:bg-blue-50/50"
                  >
                    <div className="transform group-hover:scale-110 transition duration-300 mr-2">
                      <NavUserIcon
                        className={
                          isActivePage('/user')
                            ? 'text-blue-700'
                            : 'text-gray-700 group-hover:text-blue-600'
                        }
                      />
                    </div>
                    <span
                      className={`transform group-hover:scale-105 ${
                        isActivePage('/user')
                          ? 'text-blue-700 font-medium'
                          : 'text-gray-700 group-hover:text-blue-600'
                      }`}
                    >
                      {t('user_info')}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setIsDataOpen(false);
                      router.push('/language');
                    }}
                    className="group flex items-center w-full px-4 py-2.5 text-sm transition-all duration-300 hover:bg-blue-50/50"
                  >
                    <div className="transform group-hover:scale-110 transition duration-300 mr-2">
                      <NavLanguageManageIcon
                        className={
                          isActivePage('/language')
                            ? 'text-blue-700'
                            : 'text-gray-700 group-hover:text-blue-600'
                        }
                      />
                    </div>
                    <span
                      className={`transform group-hover:scale-105 ${
                        isActivePage('/language')
                          ? 'text-blue-700 font-medium'
                          : 'text-gray-700 group-hover:text-blue-600'
                      }`}
                    >
                      {t('language_info')}
                    </span>
                  </button>
                </div>
              </Dropdown>

              {/* <Link 
                href="/alerts" 
                className={`group flex items-center gap-1 px-1.5 py-2 rounded-xl text-sm transition-all duration-300 ${
                  isActivePage('/alerts') 
                    ? 'text-blue-800 bg-white font-medium shadow-md transform -translate-y-0.5' 
                    : 'text-white hover:bg-white/10'
                } relative`}
                onClick={() => setNotificationCount(0)}
              >
                <div className="transform group-hover:scale-110 transition duration-300">
                  <NavNotificationIcon />
                </div>
                <span className="transform group-hover:scale-105">{t('notifications')}</span>
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </Link> */}

              {/* Profile Dropdown */}
              <Dropdown
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                variant="navbar"
                trigger={
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="group flex items-center gap-1 px-1.5 py-2 rounded-xl text-sm transition-all duration-300 text-white hover:bg-white/10"
                  >
                    <div className="transform group-hover:scale-110 transition duration-300">
                      {localUserData.image ? (
                        <img
                          src={localUserData.image}
                          alt={localUserData.fullname || 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 26 26"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      {isAuthLoading ||
                      (!localUserData.fullname && !localUserData.email) ? (
                        <>
                          <div className="h-4 w-[140px] bg-white/20 rounded animate-pulse"></div>
                          <div className="h-3 w-[100px] bg-white/20 rounded animate-pulse mt-1"></div>
                        </>
                      ) : (
                        <>
                          <span
                            className="text-left text-sm text-white truncate w-[140px] transform group-hover:scale-105 transition duration-300"
                            title={localUserData.fullname || 'กำลังโหลด...'}
                          >
                            {localUserData.fullname || 'กำลังโหลด...'}
                          </span>
                          <span
                            className="text-left text-xs text-white/80 truncate w-[140px] transform group-hover:scale-105 transition duration-300"
                            title={localUserData.email || 'กำลังโหลด...'}
                          >
                            {localUserData.email || 'กำลังโหลด...'}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="transform group-hover:scale-110 transition duration-300">
                      <NavArrowDownIcon
                        className={`text-white transition-transform duration-200 ${
                          isProfileOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                }
              >
                <div className="py-1">
                  <button
                    onClick={handleEditProfile}
                    className="group flex items-center w-full px-4 py-2.5 text-sm transition-all duration-300 hover:bg-blue-50/50"
                  >
                    <div className="transform group-hover:scale-110 transition duration-300 mr-2">
                      <NavEditIcon className="text-gray-700 group-hover:text-blue-600" />
                    </div>
                    <span className="transform group-hover:scale-105 text-gray-700 group-hover:text-blue-600">
                      {t('edit_profile')}
                    </span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="group flex items-center w-full px-4 py-2.5 text-sm transition-all duration-300 hover:bg-red-50/50"
                  >
                    <div className="transform group-hover:scale-110 transition duration-300 mr-2">
                      <NavLogoutIcon className="text-red-600" />
                    </div>
                    <span className="transform group-hover:scale-105 text-red-600">
                      {t('logout')}
                    </span>
                  </button>
                </div>
              </Dropdown>
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
            <div
              className="md:hidden pb-8 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg mt-4 mb-4 border border-white/20"
              ref={mobileMenuRef}
            >
              <div className="flex flex-col p-2 space-y-1">
                <Link
                  href="/auctions"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg ${
                    isActivePage('/auctions')
                      ? 'text-blue-700 bg-blue-50/80 font-medium'
                      : 'text-gray-700 hover:bg-blue-50/50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <NavHomeIcon className="w-5 h-5" />
                  {t('auctions')}
                </Link>
                <Link
                  href="/my-auctions"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg ${
                    isActivePage('/my-auctions')
                      ? 'text-blue-700 bg-blue-50/80 font-medium'
                      : 'text-gray-700 hover:bg-blue-50/50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <NavMyAuctionIcon className="w-5 h-5" />
                  {t('my_auctions')}
                </Link>
                <Link
                  href="/alerts"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg ${
                    isActivePage('/alerts')
                      ? 'text-blue-700 bg-blue-50/80 font-medium'
                      : 'text-gray-700 hover:bg-blue-50/50'
                  } relative`}
                  onClick={() => {
                    setIsOpen(false);
                    setNotificationCount(0);
                  }}
                >
                  <NavNotificationIcon className="w-5 h-5" />
                  {t('notifications')}
                  {notificationCount > 0 && (
                    <span className="absolute top-2 left-7 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
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
                    className={`flex items-center w-full px-4 py-2.5 rounded-lg ${
                      isActivePage('/company')
                        ? 'text-blue-700 bg-blue-50/80 font-medium'
                        : 'text-gray-700 hover:bg-blue-50/50'
                    }`}
                  >
                    <NavCompanyIcon className="w-5 h-5 mr-2" />
                    {t('company_info')}
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push('/user');
                    }}
                    className={`flex items-center w-full px-4 py-2.5 rounded-lg ${
                      isActivePage('/user')
                        ? 'text-blue-700 bg-blue-50/80 font-medium'
                        : 'text-gray-700 hover:bg-blue-50/50'
                    }`}
                  >
                    <NavUserIcon className="w-5 h-5 mr-2" />
                    {t('user_info')}
                  </button>
                </div>

                {/* Language Selector Mobile */}
                <div className="border-t border-gray-100 pt-2">
                  <LanguageSwitcher variant="navbar" />
                </div>

                <div className="border-t border-gray-100 pt-2">
                  <button
                    className={`flex items-center w-full px-4 py-2.5 rounded-lg ${
                      isActivePage('/profile')
                        ? 'text-blue-700 bg-blue-50/80 font-medium'
                        : 'text-gray-700 hover:bg-blue-50/50'
                    }`}
                  >
                    <NavEditIcon className="w-5 h-5 mr-2" />
                    {t('edit_profile')}
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-red-600 hover:bg-red-50/80 rounded-lg mt-1"
                  >
                    <NavLogoutIcon className="w-5 h-5 mr-2" />
                    {t('logout')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Container>
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
