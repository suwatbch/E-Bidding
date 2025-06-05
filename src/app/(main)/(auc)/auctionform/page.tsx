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
import { statusConfig } from '@/app/model/dataConfig';

registerLocale('th', th);

interface AuctionFormData {
  name: string;
  auction_type_id: number;
  start_dt: Date;
  end_dt: Date;
  reserve_price: number;
  status: number;
  description?: string;
  starting_price?: number;
  terms_conditions?: string;
}

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
  const isEdit = !!auctionId;

  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<AuctionFormData>({
    name: '',
    auction_type_id: 1,
    start_dt: new Date(),
    end_dt: new Date(),
    reserve_price: 0,
    status: 1,
    description: '',
    starting_price: 0,
    terms_conditions: '',
  });

  useEffect(() => {
    setMounted(true);
    if (isEdit && auctionId) {
      // โหลดข้อมูลตลาดที่ต้องการแก้ไข
      loadAuctionData(parseInt(auctionId));
    }
  }, [isEdit, auctionId]);

  const loadAuctionData = async (id: number) => {
    try {
      setIsLoading(true);
      // จำลองการโหลดข้อมูลจาก API
      // ในที่นี้จะใช้ข้อมูลจาก dataAuction
      const { dataAuction } = await import('@/app/model/dataAuction');
      const auction = dataAuction.find((a) => a.auction_id === id);

      if (auction) {
        setFormData({
          name: auction.name,
          auction_type_id: auction.auction_type_id,
          start_dt: new Date(auction.start_dt),
          end_dt: new Date(auction.end_dt),
          reserve_price: auction.reserve_price,
          status: auction.status,
          description: '',
          starting_price: auction.reserve_price,
          terms_conditions: '',
        });
      }
    } catch (error) {
      console.error('Error loading auction data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof AuctionFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

      if (formData.end_dt <= formData.start_dt) {
        alert('วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น');
        return;
      }

      // จำลองการบันทึกข้อมูล
      console.log(isEdit ? 'Updating auction:' : 'Creating auction:', formData);

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

  const CustomDateInput: React.FC<CustomInputProps> = ({
    value,
    onClick,
    label,
    placeholder,
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <div
        className="relative w-full h-[42px] rounded-lg border border-gray-300 pl-3 pr-3 text-sm cursor-pointer bg-white flex items-center justify-between hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20"
        onClick={onClick}
      >
        <span className="flex-1 text-left text-gray-900">
          {value || placeholder}
        </span>
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
                  ? 'แก้ไขข้อมูลตลาดประมูล'
                  : 'กรอกข้อมูลเพื่อสร้างตลาดประมูลใหม่'}
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
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
                <select
                  value={formData.auction_type_id}
                  onChange={(e) =>
                    handleInputChange(
                      'auction_type_id',
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              </div>

              {/* สถานะ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สถานะ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    handleInputChange('status', parseInt(e.target.value))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {Object.values(statusConfig).map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* คำอธิบาย */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คำอธิบาย
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="กรอกคำอธิบายตลาด"
                />
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
              <div>
                {mounted ? (
                  <DatePicker
                    selected={formData.start_dt}
                    onChange={(date: Date | null) =>
                      date && handleInputChange('start_dt', date)
                    }
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    locale="th"
                    customInput={
                      <CustomDateInput
                        label="วันเวลาเริ่มต้น"
                        placeholder="เลือกวันเวลาเริ่มต้น"
                      />
                    }
                    minDate={new Date()}
                  />
                ) : (
                  <CustomDateInput
                    label="วันเวลาเริ่มต้น"
                    value={formData.start_dt.toLocaleString('th-TH')}
                  />
                )}
              </div>

              {/* วันที่สิ้นสุด */}
              <div>
                {mounted ? (
                  <DatePicker
                    selected={formData.end_dt}
                    onChange={(date: Date | null) =>
                      date && handleInputChange('end_dt', date)
                    }
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    locale="th"
                    customInput={
                      <CustomDateInput
                        label="วันเวลาสิ้นสุด"
                        placeholder="เลือกวันเวลาสิ้นสุด"
                      />
                    }
                    minDate={formData.start_dt}
                  />
                ) : (
                  <CustomDateInput
                    label="วันเวลาสิ้นสุด"
                    value={formData.end_dt.toLocaleString('th-TH')}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AucOfferIcon className="w-5 h-5 text-blue-600" />
              ราคา
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ราคาเริ่มต้น */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ราคาเริ่มต้น (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formatPrice(formData.starting_price?.toString() || '')}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    handleInputChange('starting_price', parseInt(value) || 0);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  required
                />
              </div>

              {/* ราคาขั้นต่ำ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ราคาขั้นต่ำ (บาท)
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
                />
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              เงื่อนไขและข้อกำหนด
            </h2>

            <textarea
              value={formData.terms_conditions || ''}
              onChange={(e) =>
                handleInputChange('terms_conditions', e.target.value)
              }
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="กรอกเงื่อนไขและข้อกำหนดของตลาด"
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
