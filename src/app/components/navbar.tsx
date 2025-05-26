'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import HomeIcon from '@mui/icons-material/Home';
import GavelIcon from '@mui/icons-material/Gavel';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Home from '@mui/icons-material/Home';
import Gavel from '@mui/icons-material/Gavel';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Notifications from '@mui/icons-material/Notifications';
import Edit from '@mui/icons-material/Edit';
import Logout from '@mui/icons-material/Logout';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Menu from '@mui/icons-material/Menu';
import Close from '@mui/icons-material/Close';
import LocalOffer from '@mui/icons-material/LocalOffer';
import { 
  connectSocket, 
  disconnectSocket,
  subscribeToNotifications,
  unsubscribeFromNotifications
} from '@/app/services/socket';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // สร้าง ref สำหรับเมนูโปรไฟล์และเมนูมือถือ
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();

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
    { name: 'หน้าแรก', href: '/home', icon: <HomeIcon className="w-5 h-5" /> },
    { name: 'รายการประมูล', href: '/auctions', icon: <GavelIcon className="w-5 h-5" /> },
    { name: 'ประมูลของฉัน', href: '/my-auctions', icon: <GavelIcon className="w-5 h-5" /> },
    { name: 'แจ้งเตือน', href: '/notifications', icon: <NotificationsIcon className="w-5 h-5" /> },
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
              <Link href="/home" className="flex items-center gap-2">
                <Gavel className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-semibold text-gray-900">E-Bidding</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              <Link 
                href="/home" 
                className={`flex items-center ${isActivePage('/home') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
              >
                <Home className="h-5 w-5 mr-1" />
                หน้าแรก
              </Link>
              <Link 
                href="/auctions" 
                className={`flex items-center ${isActivePage('/auctions') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
              >
                <Gavel className="h-5 w-5 mr-1" />
                รายการประมูล
              </Link>
              <Link 
                href="/my-auctions" 
                className={`flex items-center ${isActivePage('/my-auctions') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
              >
                <LocalOffer className="h-5 w-5 mr-1" />
                ประมูลของฉัน
              </Link>
              <Link 
                href="/alerts" 
                className={`flex items-center ${isActivePage('/alerts') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} relative`}
                onClick={() => setNotificationCount(0)}
              >
                <Notifications className="h-5 w-5 mr-1" />
                แจ้งเตือน
                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center text-gray-700 hover:text-blue-600"
                >
                  <AccountCircle className="h-5 w-5 mr-1" />
                  โปรไฟล์
                  <KeyboardArrowDown className={`h-5 w-5 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-1 z-10">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">สมชาย ใจดี</p>
                      <p className="text-xs text-gray-500">somchai@example.com</p>
                    </div>
                    <button
                      onClick={() => router.push('/profile')}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-blue-50"
                    >
                      <Edit className="h-5 w-5 mr-2" />
                      แก้ไขโปรไฟล์
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      <Logout className="h-5 w-5 mr-2" />
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isOpen ? (
                  <Close className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden pb-4" ref={mobileMenuRef}>
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/home" 
                  className={`flex items-center ${isActivePage('/home') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Home className="h-5 w-5 mr-2" />
                  หน้าแรก
                </Link>
                <Link 
                  href="/auctions" 
                  className={`flex items-center ${isActivePage('/auctions') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Gavel className="h-5 w-5 mr-2" />
                  รายการประมูล
                </Link>
                <Link 
                  href="/my-auctions" 
                  className={`flex items-center ${isActivePage('/my-auctions') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <LocalOffer className="h-5 w-5 mr-2" />
                  ประมูลของฉัน
                </Link>
                <Link 
                  href="/alerts" 
                  className={`flex items-center ${isActivePage('/alerts') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} relative`}
                  onClick={() => {
                    setIsOpen(false);
                    setNotificationCount(0);
                  }}
                >
                  <Notifications className="h-5 w-5 mr-2" />
                  แจ้งเตือน
                  {notificationCount > 0 && (
                    <span className="absolute top-0 left-5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Link>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/profile');
                  }} 
                  className="flex items-center text-gray-700 hover:text-blue-600"
                >
                  <Edit className="h-5 w-5 mr-2" />
                  แก้ไขโปรไฟล์
                </button>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }} 
                  className="flex items-center text-red-600 hover:text-red-700"
                >
                  <Logout className="h-5 w-5 mr-2" />
                  ออกจากระบบ
                </button>
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
