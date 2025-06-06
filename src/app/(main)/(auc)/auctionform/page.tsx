'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Container from '@/app/components/ui/Container';
import ThaiDatePicker from '@/app/components/ui/DatePicker';
import {
  AucCategoryIcon,
  AucStartTimeIcon,
  AucEndTimeIcon,
  AucOfferIcon,
} from '@/app/components/ui/Icons';
import { dataAuction_Type } from '@/app/model/dataAuction_Type';
import { statusConfig, currencyConfig } from '@/app/model/dataConfig';
import { dataAuction, Auction } from '@/app/model/dataAuction';
import {
  formatDateForData,
  safeParseDate,
  createDateChangeHandler,
  getCurrentDateTime,
} from '@/app/utils/fungtions';

export default function AuctionFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auctionId = searchParams.get('id');
  const isEdit = auctionId !== '0' && !!auctionId;

  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const [permissionError, setPermissionError] = useState('');
  const [formData, setFormData] = useState<Auction>({
    auction_id: 0,
    name: '',
    auction_type_id: 1,
    start_dt: getCurrentDateTime(),
    end_dt: getCurrentDateTime(),
    reserve_price: 0,
    currency: 1,
    status: 1,
    is_deleted: 0,
    remark: '',
    created_dt: getCurrentDateTime(),
    updated_dt: getCurrentDateTime(),
  });

  // ฟังก์ชันตรวจสอบสิทธิ์การเข้าถึง
  const checkPermission = (auctionData: Auction | undefined) => {
    if (!auctionData) {
      setHasPermission(false);
      setPermissionError('ไม่พบข้อมูลตลาดที่ต้องการแก้ไข');
      return false;
    }

    // ตรวจสอบว่าตลาดถูกลบแล้วหรือไม่
    if (auctionData.is_deleted === 1) {
      setHasPermission(false);
      setPermissionError('ไม่สามารถแก้ไขตลาดที่ถูกลบแล้ว');
      return false;
    }

    // ตรวจสอบสถานะตลาด - ไม่ให้แก้ไขถ้าตลาดสิ้นสุดแล้ว
    if (auctionData.status === 5 || auctionData.status === 6) {
      setHasPermission(false);
      setPermissionError('ไม่สามารถแก้ไขตลาดที่สิ้นสุดหรือยกเลิกแล้ว');
      return false;
    }

    // ตรวจสอบว่าเวลาเริ่มต้นผ่านไปแล้วหรือไม่
    const startDate = new Date(auctionData.start_dt);
    const now = new Date();
    if (startDate <= now && auctionData.status >= 3) {
      setHasPermission(false);
      setPermissionError('ไม่สามารถแก้ไขตลาดที่เริ่มต้นแล้ว');
      return false;
    }

    // TODO: เพิ่มการตรวจสอบสิทธิ์ของ user
    // เช่น ตรวจสอบว่า user เป็นเจ้าของตลาดหรือมี role ที่เหมาะสม
    // const currentUser = getCurrentUser();
    // if (auctionData.created_by !== currentUser.id && !currentUser.isAdmin) {
    //   setHasPermission(false);
    //   setPermissionError('คุณไม่มีสิทธิ์แก้ไขตลาดนี้');
    //   return false;
    // }

    return true;
  };

  // ฟังก์ชันตรวจสอบ ID ที่ส่งมา
  const validateAuctionId = (id: string): number | null => {
    // ตรวจสอบว่าเป็นตัวเลขหรือไม่
    const numericId = parseInt(id);
    if (isNaN(numericId) || numericId < 0) {
      return null;
    }

    // ตรวจสอบว่า ID มีอยู่ในระบบหรือไม่
    const exists = dataAuction.some(
      (auction) => auction.auction_id === numericId
    );
    if (!exists && numericId !== 0) {
      return null;
    }

    return numericId;
  };

  useEffect(() => {
    if (isEdit && auctionId && auctionId !== '0') {
      // ตรวจสอบ ID ที่ส่งมา
      const validatedId = validateAuctionId(auctionId);

      if (validatedId === null) {
        setHasPermission(false);
        setPermissionError('รหัสตลาดไม่ถูกต้องหรือไม่มีอยู่ในระบบ');
        return;
      }

      // โหลดข้อมูลตลาดที่ต้องการแก้ไข
      loadAuctionData(validatedId);
    }
  }, [isEdit, auctionId]);

  const loadAuctionData = async (id: number) => {
    try {
      setIsLoading(true);
      // ดึงข้อมูลจาก dataAuction ตาม auction_id
      const auction = dataAuction.find((a) => a.auction_id === id);

      // ตรวจสอบสิทธิ์การเข้าถึง
      if (!checkPermission(auction)) {
        return;
      }

      if (auction) {
        setFormData({
          ...auction,
          // อัพเดท updated_dt เมื่อแก้ไข
          updated_dt: getCurrentDateTime(),
        });
        setHasPermission(true);
        setPermissionError('');
      }
    } catch (error) {
      console.error('Error loading auction data:', error);
      setHasPermission(false);
      setPermissionError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Auction, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // อัพเดท updated_dt ทุกครั้งที่มีการเปลี่ยนแปลง
      updated_dt: getCurrentDateTime(),
    }));
  };

  // ใช้ utility function สำหรับจัดการการเปลี่ยนแปลงวันที่
  const handleDateChange = createDateChangeHandler(setFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Validation
      if (!formData.name.trim()) {
        alert('กรุณากรอกชื่อตลาด');
        return;
      }

      const startDate = new Date(formData.start_dt);
      const endDate = new Date(formData.end_dt);

      if (endDate <= startDate) {
        alert('วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น');
        return;
      }

      if (formData.reserve_price < 0) {
        alert('ราคาประกันต้องมากกว่าหรือเท่ากับ 0');
        return;
      }

      // เตรียมข้อมูลสำหรับบันทึก
      const saveData = {
        ...formData,
        updated_dt: getCurrentDateTime(),
      };

      if (!isEdit) {
        // สำหรับเพิ่มใหม่ ให้สร้าง auction_id ใหม่
        const maxId = Math.max(...dataAuction.map((a) => a.auction_id), 0);
        saveData.auction_id = maxId + 1;
        saveData.created_dt = getCurrentDateTime();
      }

      // จำลองการบันทึกข้อมูล (ในการใช้งานจริงจะเรียก API)
      console.log(isEdit ? 'Updating auction:' : 'Creating auction:', saveData);

      // จำลอง API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert(
        isEdit ? 'แก้ไขข้อมูลตลาดเรียบร้อยแล้ว' : 'เพิ่มตลาดใหม่เรียบร้อยแล้ว'
      );
      router.push('/auctions');
    } catch (error) {
      console.error('Error saving auction:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/auctions');
  };

  const formatPrice = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return 'วันที่ไม่ถูกต้อง';
      }

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch (error) {
      return 'วันที่ไม่ถูกต้อง';
    }
  };

  // แสดงหน้า Error ถ้าไม่มีสิทธิ์
  if (!hasPermission) {
    return (
      <Container className="py-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 text-red-500 mx-auto"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              ไม่สามารถเข้าถึงได้
            </h1>
            <p className="text-gray-600 mb-6">{permissionError}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/auctions')}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                กลับไปหน้ารายการตลาด
              </button>
              <button
                onClick={() => router.push('/auctionform?id=0')}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                สร้างตลาดใหม่
              </button>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (isLoading && isEdit) {
    return (
      <Container className="py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังตรวจสอบสิทธิ์และโหลดข้อมูล...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-8 h-8 text-blue-600"
                >
                  {isEdit ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {isEdit ? 'แก้ไขข้อมูลตลาด' : 'เพิ่มตลาดใหม่'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEdit
                    ? `แก้ไขข้อมูลตลาดประมูล ID: ${formData.auction_id}`
                    : 'กรอกข้อมูลเพื่อสร้างตลาดประมูลใหม่'}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="text-sm font-medium">ย้อนกลับ</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AucOfferIcon className="w-5 h-5 text-blue-600" />
              ข้อมูลพื้นฐาน
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ชื่อตลาด */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.001 3.001 0 01-.621-1.72c0-.966.459-1.82 1.17-2.36a3.001 3.001 0 012.7 0 2.974 2.974 0 011.17 2.36 3.001 3.001 0 01-.621 1.72m12.96 0a3.001 3.001 0 01-.621-1.72c0-.966.459-1.82 1.17-2.36a3.001 3.001 0 012.7 0 2.974 2.974 0 011.17 2.36 3.001 3.001 0 01-.621 1.72m-2.35 0a3.001 3.001 0 01-1.85-.875A3.001 3.001 0 0114.25 16.5a3.001 3.001 0 01-2.4 1.125c-.84 0-1.59-.327-2.15-.875a3.001 3.001 0 01-2.4 1.125"
                      />
                    </svg>
                    ชื่อตลาด <span className="text-red-500">*</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="กรอกชื่อตลาด"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-gray-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* หมวดหมู่ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <AucCategoryIcon className="w-4 h-4 text-gray-500" />
                    หมวดหมู่ <span className="text-red-500">*</span>
                  </div>
                </label>
                <div className="relative">
                  <select
                    value={formData.auction_type_id}
                    onChange={(e) =>
                      handleInputChange(
                        'auction_type_id',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    required
                  >
                    {dataAuction_Type
                      .filter((type) => type.status === 1)
                      .map((type) => (
                        <option
                          key={type.auction_type_id}
                          value={type.auction_type_id}
                        >
                          {type.name}
                        </option>
                      ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* สถานะ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <AucOfferIcon className="w-4 h-4 text-gray-500" />
                    สถานะ <span className="text-red-500">*</span>
                  </div>
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange('status', parseInt(e.target.value))
                    }
                    className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    required
                  >
                    {Object.values(statusConfig).map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.description}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AucStartTimeIcon className="w-5 h-5 text-blue-600" />
              วันเวลา
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* วันที่เริ่มต้น */}
              <div className="relative w-full">
                <div className="w-full">
                  <ThaiDatePicker
                    selected={safeParseDate(formData.start_dt)}
                    onChange={(date) => handleDateChange('start_dt', date)}
                    label="วันเวลาเริ่มต้น"
                    placeholder="เลือกวันเวลาเริ่มต้น"
                    showTimeSelect={true}
                    timeCaption="เวลา"
                    minDate={new Date()}
                    maxDate={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() + 5)
                      )
                    }
                  />
                </div>
              </div>

              {/* วันที่สิ้นสุด */}
              <div className="relative w-full">
                <div className="w-full">
                  <ThaiDatePicker
                    selected={safeParseDate(formData.end_dt)}
                    onChange={(date) => handleDateChange('end_dt', date)}
                    label="วันเวลาสิ้นสุด"
                    placeholder="เลือกวันเวลาสิ้นสุด"
                    showTimeSelect={true}
                    timeCaption="เวลา"
                    minDate={safeParseDate(formData.start_dt)}
                    maxDate={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() + 5)
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-blue-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 15.75V18a.75.75 0 01-.75.75h-9a.75.75 0 01-.75-.75V9A.75.75 0 016 8.25h2.25M15.75 15.75V12A2.25 2.25 0 0013.5 9.75h-6.75M15.75 15.75L19.5 12M19.5 12l1.5-1.5M19.5 12l1.5 1.5M10.5 9.75L8.25 12M8.25 12L6.75 10.5M8.25 12L6.75 13.5"
                />
              </svg>
              ราคาและเงินตรา
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ราคาประกัน */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    ราคาประกัน <span className="text-red-500">*</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={formatPrice(formData.reserve_price.toString())}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    handleInputChange('reserve_price', parseInt(value) || 0);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  required
                />
              </div>

              {/* หน่วยเงิน */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    หน่วยเงิน <span className="text-red-500">*</span>
                  </div>
                </label>
                <div className="relative">
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      handleInputChange('currency', parseInt(e.target.value))
                    }
                    className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    required
                  >
                    {Object.values(currencyConfig).map((currency) => (
                      <option key={currency.id} value={currency.id}>
                        {currency.code} - {currency.description}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Remark */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              หมายเหตุ
            </h2>

            <div className="relative">
              <textarea
                value={formData.remark || ''}
                onChange={(e) => handleInputChange('remark', e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="กรอกหมายเหตุเพิ่มเติม"
              />
              <div className="absolute top-3 left-0 flex items-start pl-3 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                ย้อนกลับ
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {!isLoading && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    {isEdit ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 3.75a1.125 1.125 0 011.125 1.125v8.252c0 .36-.148.7-.398.938l-5.057 4.786a2.25 2.25 0 01-3.084 0l-5.057-4.786a1.125 1.125 0 01-.398-.938V4.875A1.125 1.125 0 015.625 3.75h10.875z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    )}
                  </svg>
                )}
                {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มตลาด'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Container>
  );
}
