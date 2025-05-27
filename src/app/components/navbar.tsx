'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  NavHomeIcon,
  NavAuctionIcon,
  NavMyAuctionIcon,
  NavNotificationIcon,
  NavProfileIcon,
  NavArrowDownIcon,
  NavEditIcon,
  NavLogoutIcon,
  NavMenuIcon,
  NavCloseIcon,
  NavLogoIcon
} from '@/app/components/ui/icons';
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
    { name: 'หน้าแรก', href: '/home', icon: <NavHomeIcon /> },
    { name: 'รายการประมูล', href: '/auctions', icon: <NavAuctionIcon /> },
    { name: 'ประมูลของฉัน', href: '/my-auctions', icon: <NavMyAuctionIcon /> },
    { name: 'แจ้งเตือน', href: '/notifications', icon: <NavNotificationIcon /> },
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
                <NavLogoIcon />
                <span className="text-xl font-semibold text-gray-900">E-Bidding</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              <Link 
                href="/home" 
                className={`flex items-center ${isActivePage('/home') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
              >
                <NavHomeIcon />
                หน้าแรก
              </Link>
              <Link 
                href="/auctions" 
                className={`flex items-center ${isActivePage('/auctions') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
              >
                <NavAuctionIcon />
                รายการประมูล
              </Link>
              <Link 
                href="/my-auctions" 
                className={`flex items-center ${isActivePage('/my-auctions') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
              >
                <NavMyAuctionIcon />
                ประมูลของฉัน
              </Link>
              <Link 
                href="/alerts" 
                className={`flex items-center ${isActivePage('/alerts') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'} relative`}
                onClick={() => setNotificationCount(0)}
              >
                <NavNotificationIcon />
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
                  <NavProfileIcon />
                  โปรไฟล์
                  <NavArrowDownIcon />
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
                      <NavEditIcon />
                      แก้ไขโปรไฟล์
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      <NavLogoutIcon />
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
                  <NavCloseIcon />
                ) : (
                  <NavMenuIcon />
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
                  <NavHomeIcon />
                  หน้าแรก
                </Link>
                <Link 
                  href="/auctions" 
                  className={`flex items-center ${isActivePage('/auctions') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <NavAuctionIcon />
                  รายการประมูล
                </Link>
                <Link 
                  href="/my-auctions" 
                  className={`flex items-center ${isActivePage('/my-auctions') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={() => setIsOpen(false)}
                >
                  <NavMyAuctionIcon />
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
                  <NavNotificationIcon />
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
                  <NavEditIcon />
                  แก้ไขโปรไฟล์
                </button>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }} 
                  className="flex items-center text-red-600 hover:text-red-700"
                >
                  <NavLogoutIcon />
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
