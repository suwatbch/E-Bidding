'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Container from '@/app/components/ui/Container';
import {
  AucCategoryIcon,
  AucStartTimeIcon,
  AucEndTimeIcon,
  AucOfferIcon,
} from '@/app/components/ui/Icons';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { th } from 'date-fns/locale';
import { dataAuction_Type } from '@/app/model/dataAuction_Type';
import { statusConfig, currencyConfig } from '@/app/model/dataConfig';
import { dataAuction, Auction } from '@/app/model/dataAuction';

registerLocale('th', th);

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  label: string;
  placeholder?: string;
}

export default function AuctionFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auctionId = searchParams.get('id');
  const isEdit = auctionId !== '0' && !!auctionId;

  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<Auction>({
    auction_id: 0,
    name: '',
    auction_type_id: 1,
    start_dt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    end_dt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    reserve_price: 0,
    currency: 1,
    status: 1,
    is_deleted: 0,
    remark: '',
    created_dt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    updated_dt: new Date().toISOString().slice(0, 19).replace('T', ' '),
  });

  useEffect(() => {
    setMounted(true);
    if (isEdit && auctionId && auctionId !== '0') {
      // โหลดข้อมูลตลาดที่ต้องการแก้ไข
      loadAuctionData(parseInt(auctionId));
    }
  }, [isEdit, auctionId]);

  const loadAuctionData = async (id: number) => {
    try {
      setIsLoading(true);
      // ดึงข้อมูลจาก dataAuction ตาม auction_id
      const auction = dataAuction.find((a) => a.auction_id === id);

      if (auction) {
        setFormData({
          ...auction,
          // อัพเดท updated_dt เมื่อแก้ไข
          updated_dt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        });
      } else {
        alert('ไม่พบข้อมูลตลาดที่ต้องการแก้ไข');
        router.push('/auctions');
      }
    } catch (error) {
      console.error('Error loading auction data:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Auction, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // อัพเดท updated_dt ทุกครั้งที่มีการเปลี่ยนแปลง
      updated_dt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    }));
  };

  const handleDateChange = (
    field: 'start_dt' | 'end_dt',
    date: Date | null
  ) => {
    if (date) {
      const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
      handleInputChange(field, formattedDate);
    }
  };

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
        updated_dt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };

      if (!isEdit) {
        // สำหรับเพิ่มใหม่ ให้สร้าง auction_id ใหม่
        const maxId = Math.max(...dataAuction.map((a) => a.auction_id), 0);
        saveData.auction_id = maxId + 1;
        saveData.created_dt = new Date()
          .toISOString()
          .slice(0, 19)
          .replace('T', ' ');
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
    const date = new Date(dateStr);
    return date
      .toLocaleString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3');
  };

  const CustomDateInput: React.FC<CustomInputProps> = ({
    value,
    onClick,
    label,
    placeholder,
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        <div className="flex items-center gap-2 mb-1.5">
          <AucStartTimeIcon className="w-4 h-4 text-gray-500" />
          {label} <span className="text-red-500">*</span>
        </div>
      </label>
      <div
        className="relative w-full h-[42px] rounded-lg border border-gray-300 pl-3 pr-3 text-sm cursor-pointer bg-white flex items-center justify-between hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20"
        onClick={onClick}
        style={{ minHeight: '42px', maxHeight: '42px' }}
      >
        <span className="flex-1 text-left text-gray-900">
          {value || placeholder}
        </span>
        <div className="flex items-center justify-center">
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
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  if (isLoading && isEdit) {
    return (
      <Container className="py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                  ชื่อตลาด <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="กรอกชื่อตลาด"
                  required
                />
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
                  สถานะ <span className="text-red-500">*</span>
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
                {mounted ? (
                  <DatePicker
                    selected={new Date(formData.start_dt)}
                    onChange={(date) => handleDateChange('start_dt', date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="เวลา"
                    dateFormat="dd-MM-yyyy HH:mm"
                    locale="th"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={15}
                    customInput={
                      <CustomDateInput
                        label="วันเวลาเริ่มต้น"
                        placeholder="เลือกวันเวลาเริ่มต้น"
                      />
                    }
                    popperPlacement="bottom-start"
                    popperClassName="calendar-popper"
                    calendarClassName="shadow-lg"
                    dayClassName={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const checkDate = new Date(date);
                      checkDate.setHours(0, 0, 0, 0);

                      if (checkDate.getTime() === today.getTime()) {
                        return 'bg-blue-500 text-white rounded-full';
                      }
                      return 'text-gray-700 hover:bg-blue-50 rounded-full';
                    }}
                    minDate={new Date()}
                  />
                ) : (
                  <CustomDateInput
                    label="วันเวลาเริ่มต้น"
                    value={formatDateTime(formData.start_dt)}
                  />
                )}
              </div>

              {/* วันที่สิ้นสุด */}
              <div className="relative w-full">
                {mounted ? (
                  <DatePicker
                    selected={new Date(formData.end_dt)}
                    onChange={(date) => handleDateChange('end_dt', date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="เวลา"
                    dateFormat="dd-MM-yyyy HH:mm"
                    locale="th"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={15}
                    customInput={
                      <CustomDateInput
                        label="วันเวลาสิ้นสุด"
                        placeholder="เลือกวันเวลาสิ้นสุด"
                      />
                    }
                    popperPlacement="bottom-start"
                    popperClassName="calendar-popper"
                    calendarClassName="shadow-lg"
                    dayClassName={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const checkDate = new Date(date);
                      checkDate.setHours(0, 0, 0, 0);

                      if (checkDate.getTime() === today.getTime()) {
                        return 'bg-blue-500 text-white rounded-full';
                      }
                      return 'text-gray-700 hover:bg-blue-50 rounded-full';
                    }}
                    minDate={new Date(formData.start_dt)}
                  />
                ) : (
                  <CustomDateInput
                    label="วันเวลาสิ้นสุด"
                    value={formatDateTime(formData.end_dt)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AucOfferIcon className="w-5 h-5 text-blue-600" />
              ราคาและเงินตรา
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ราคาประกัน */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ราคาประกัน <span className="text-red-500">*</span>
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
                  หน่วยเงิน <span className="text-red-500">*</span>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              หมายเหตุ
            </h2>

            <textarea
              value={formData.remark || ''}
              onChange={(e) => handleInputChange('remark', e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="กรอกหมายเหตุเพิ่มเติม"
            />
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
