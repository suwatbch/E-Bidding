'use client';

import { useState, FC } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import {
  StatusPendingIcon,
  StatusBiddingIcon,
  StatusEndingSoonIcon,
  StatusEndedIcon,
  StatusCancelledIcon,
  UserIcon,
  AucCategoryIcon,
  AucStartTimeIcon,
  AucEndTimeIcon,
  AucUserIcon,
  AucOpenIcon,
  AucPendingIcon,
  AucBiddingIcon,
  AucEndingSoonIcon,
  AucEndedIcon,
  AucCancelledIcon,
  AucOfferIcon,
} from '@/app/components/ui/icons';
import Container from '@/app/components/ui/Container';
import { dataAuction, Auction } from '@/app/model/dataAuction';
import { dataAuction_Type } from '@/app/model/dataAuction_Type';
import { dataAuction_Participant } from '@/app/model/dataAuction_Participant';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { th } from 'date-fns/locale';
import { format } from 'date-fns';

registerLocale('th', th);

interface AuctionItem {
  no: number;
  title: string;
  category: string;
  startTime: string;
  endTime: string;
  bidCount: number;
  status:
    | 'open'
    | 'pending'
    | 'bidding'
    | 'ending_soon'
    | 'ended'
    | 'cancelled';
}

const statusMap: Record<number, string> = {
  1: 'เปิดการประมูล',
  2: 'รอการประมูล',
  3: 'กำลังประมูล',
  4: 'ใกล้สิ้นสุด',
  5: 'สิ้นสุดประมูล',
  6: 'ยกเลิกประมูล',
};

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  label: string;
  icon: FC<{ className?: string }>;
}

export default function AuctionsPage() {
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <StatusPendingIcon />;
      case 'bidding':
        return <StatusBiddingIcon />;
      case 'ending_soon':
        return <StatusEndingSoonIcon />;
      case 'ended':
        return <StatusEndedIcon />;
      case 'cancelled':
        return <StatusCancelledIcon />;
      default:
        return null;
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} วัน ${hours} ชั่วโมง`;
    } else {
      return `${hours} ชั่วโมง ${minutes} นาที`;
    }
  };

  const getStatusInfo = (status: AuctionItem['status']) => {
    switch (status) {
      case 'open':
        return {
          text: 'เปิดประมูล',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
        };
      case 'pending':
        return {
          text: 'รอการประมูล',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
        };
      case 'bidding':
        return {
          text: 'กำลังประมูล',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        };
      case 'ending_soon':
        return {
          text: 'ใกล้สิ้นสุด',
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-50',
        };
      case 'ended':
        return {
          text: 'สิ้นสุดประมูล',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 'cancelled':
        return {
          text: 'ยกเลิกประมูล',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        };
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
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

  const formatAuctionId = (id: number) => {
    const currentYear = new Date().getFullYear();
    // แปลงเลขไอดีให้เป็นสตริงและเติม 0 ข้างหน้าให้ครบ 4 หลัก
    const paddedId = id.toString().padStart(4, '0');
    return `[${currentYear}${paddedId}]`;
  };

  // ดึงข้อมูลตลาดประมูลที่ไม่ถูกลบ
  const auctions = dataAuction.filter((a) => a.is_deleted === 0);

  // สร้างข้อมูลสำหรับแสดงผล
  const auctionTable = auctions.map((auction, idx) => {
    const auctionType = dataAuction_Type.find(
      (t) => t.auction_type_id === auction.auction_type_id
    );
    const participantCount = dataAuction_Participant.filter(
      (p) => p.auction_id === auction.auction_id
    ).length;

    // แปลงสถานะเป็นรูปแบบที่ใช้กับ UI เดิม
    let uiStatus: AuctionItem['status'] = 'pending';
    switch (auction.status) {
      case 1:
        uiStatus = 'open';
        break;
      case 2:
        uiStatus = 'pending';
        break;
      case 3:
        uiStatus = 'bidding';
        break;
      case 4:
        uiStatus = 'ending_soon';
        break;
      case 5:
        uiStatus = 'ended';
        break;
      case 6:
        uiStatus = 'cancelled';
        break;
    }

    return {
      no: idx,
      title: `${auction.name} ${formatAuctionId(auction.auction_id)}`,
      category: auctionType?.name || '-',
      startTime: auction.start_dt,
      endTime: auction.end_dt,
      bidCount: participantCount,
      status: uiStatus,
    } as AuctionItem;
  });

  // ดึงรายการหมวดหมู่จาก dataAuction_Type
  const categories = [
    'ทั้งหมด',
    ...dataAuction_Type
      .filter((type) => type.status === 1) // เลือกเฉพาะที่ status เป็น 1 (active)
      .map((type) => type.name),
  ];

  // กรองข้อมูลตามเงื่อนไข
  const filteredItems = auctionTable.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // ตรวจสอบหมวดหมู่
    const matchesCategory =
      selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;

    // ตรวจสอบสถานะ
    const matchesStatus =
      selectedStatus === 'all' || item.status === selectedStatus;

    // กรองตามช่วงวันที่
    const itemDate = new Date(item.startTime);
    const filterStartDate = new Date(startDate);
    const filterEndDate = new Date(endDate);
    filterEndDate.setHours(23, 59, 59, 999);
    const matchesDate =
      !isFiltering ||
      (itemDate >= filterStartDate && itemDate <= filterEndDate);

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  const handleSearch = () => {
    setIsFiltering(true);
  };

  const handleReset = () => {
    setSelectedCategory('ทั้งหมด');
    setSelectedStatus('all');
    const today = new Date();
    setStartDate(today);
    setEndDate(today);
    setSearchQuery('');
    setIsFiltering(false);
  };

  // Custom input component for the DatePicker
  const CustomInput: FC<CustomInputProps> = ({
    value,
    onClick,
    label,
    icon: Icon,
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        <div className="flex items-center gap-2 mb-1.5">
          <Icon className="w-4 h-4 text-gray-500" />
          {label}
        </div>
      </label>
      <div
        className="relative w-full h-[42px] rounded-lg border border-gray-300 pl-3 pr-3 text-sm cursor-pointer bg-white flex items-center justify-between"
        onClick={onClick}
        style={{ minHeight: '42px', maxHeight: '42px' }}
      >
        <span className="flex-1 text-left">{value}</span>
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

  return (
    <Container className="py-6">
      <div className="py-8">
        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              ตัวกรองการค้นหา
            </h3>
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 transition-transform duration-500 hover:rotate-180"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              รีเซ็ตตัวกรอง
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* หมวดหมู่ */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2 mb-1.5">
                  <AucCategoryIcon className="w-4 h-4 text-gray-500" />
                  หมวดหมู่
                </div>
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
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
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2 mb-1.5">
                  <AucOfferIcon className="w-4 h-4 text-gray-500" />
                  สถานะ
                </div>
              </label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none focus:border-transparent"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="open">เปิดประมูล</option>
                  <option value="pending">รอการประมูล</option>
                  <option value="bidding">กำลังประมูล</option>
                  <option value="ending_soon">ใกล้สิ้นสุด</option>
                  <option value="ended">สิ้นสุดประมูล</option>
                  <option value="cancelled">ยกเลิกประมูล</option>
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

            {/* วันที่เริ่มต้น */}
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => date && setStartDate(date)}
                dateFormat="dd/MM/yyyy"
                locale="th"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={15}
                customInput={
                  <CustomInput label="วันที่เริ่มต้น" icon={AucStartTimeIcon} />
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
              />
            </div>

            {/* วันที่สิ้นสุด */}
            <div className="relative">
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => date && setEndDate(date)}
                dateFormat="dd/MM/yyyy"
                locale="th"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={15}
                customInput={
                  <CustomInput label="วันที่สิ้นสุด" icon={AucEndTimeIcon} />
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
              />
            </div>
          </div>

          {/* Search Bar and Action Buttons */}
          <div className="mt-6 flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ค้นหาตามชื่อรายการ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
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
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
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
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              ค้นหา
            </button>
          </div>
        </div>

        {/* Auction Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-semibold">รายการประมูล</h2>
              <div className="flex items-center gap-2 flex-nowrap overflow-x-auto pb-2 sm:pb-0 -mx-6 sm:mx-0 px-6 sm:px-0">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${
                      selectedStatus === 'all'
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setSelectedStatus('open')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${
                      selectedStatus === 'open'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                    }`}
                >
                  <AucOpenIcon className="w-4 h-4" />
                  เปิดประมูล
                </button>
                <button
                  onClick={() => setSelectedStatus('pending')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${
                      selectedStatus === 'pending'
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                    }`}
                >
                  <AucPendingIcon className="w-4 h-4" />
                  รอการประมูล
                </button>
                <button
                  onClick={() => setSelectedStatus('bidding')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${
                      selectedStatus === 'bidding'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                >
                  <AucBiddingIcon className="w-4 h-4" />
                  กำลังประมูล
                </button>
                <button
                  onClick={() => setSelectedStatus('ending_soon')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${
                      selectedStatus === 'ending_soon'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100'
                    }`}
                >
                  <AucEndingSoonIcon className="w-4 h-4" />
                  ใกล้สิ้นสุด
                </button>
                <button
                  onClick={() => setSelectedStatus('ended')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${
                      selectedStatus === 'ended'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                >
                  <AucEndedIcon className="w-4 h-4" />
                  สิ้นสุดประมูล
                </button>
                <button
                  onClick={() => setSelectedStatus('cancelled')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${
                      selectedStatus === 'cancelled'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                >
                  <AucCancelledIcon className="w-4 h-4" />
                  ยกเลิกประมูล
                </button>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[5%] text-center">
                  <div className="flex items-center justify-center gap-2">
                    ลำดับ
                  </div>
                </TableHead>
                <TableHead className="w-[25%]">
                  <div className="flex items-center gap-2">
                    <AucBiddingIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ชื่อตลาด
                  </div>
                </TableHead>
                <TableHead className="w-[14%]">
                  <div className="flex items-center gap-2">
                    <AucCategoryIcon className="w-5 h-5 text-gray-500" />
                    หมวดหมู่
                  </div>
                </TableHead>
                <TableHead className="w-[16%] text-center">
                  <div className="flex items-center justify-center gap-2">
                    <AucStartTimeIcon className="w-5 h-5 text-gray-500" />
                    เวลาเปิด
                  </div>
                </TableHead>
                <TableHead className="w-[16%] text-center">
                  <div className="flex items-center justify-center gap-2">
                    <AucEndTimeIcon className="w-5 h-5 text-gray-500" />
                    เวลาปิด
                  </div>
                </TableHead>
                <TableHead className="w-[10%] text-center">
                  <div className="flex items-center justify-center gap-2">
                    <AucUserIcon className="w-5 h-5 text-gray-500" />
                    ผู้ประมูล
                  </div>
                </TableHead>
                <TableHead className="w-[17%] text-center">
                  <div className="flex items-center justify-center gap-2">
                    <AucOfferIcon className="w-5 h-5 text-gray-500" />
                    สถานะ
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const statusInfo = getStatusInfo(item.status);
                return (
                  <TableRow
                    key={item.no}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <TableCell className="font-medium text-center">
                      {(item.no + 1).toLocaleString('th-TH')}
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <div
                          className="text-sm font-medium truncate cursor-pointer"
                          title={item.title}
                        >
                          {item.title}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <div
                          className="text-sm truncate cursor-pointer"
                          title={item.category}
                        >
                          {item.category}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {formatDateTime(item.startTime)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatDateTime(item.endTime)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600">
                        <UserIcon />
                        {item.bidCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                      >
                        {statusInfo.text}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Container>
  );
}

// Add this CSS at the end of the file or in your global CSS
const styles = `
.calendar-popper {
  z-index: 9999 !important;
  position: absolute !important;
  top: 0% !important;
  left: 0 !important;
  margin-top: 0px !important;
  width: max-content !important;
}

.react-datepicker-wrapper,
.react-datepicker__input-container {
  display: block !important;
  width: 100% !important;
}

.react-datepicker {
  font-family: 'Kanit', sans-serif !important;
  border: none !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  background-color: white !important;
}

.react-datepicker__header {
  background-color: white !important;
  border-bottom: 1px solid #e5e7eb !important;
  border-top-left-radius: 0.5rem !important;
  border-top-right-radius: 0.5rem !important;
  padding-top: 0.75rem !important;
}

.react-datepicker__current-month {
  font-weight: 600 !important;
  font-size: 1rem !important;
  color: #1f2937 !important;
  padding: 0.25rem 0 !important;
}

.react-datepicker__year-dropdown-container {
  display: inline-block !important;
  margin: 0 0.5rem !important;
}

.react-datepicker__year-dropdown {
  background-color: white !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  max-height: 250px !important;
  overflow-y: auto !important;
  position: absolute !important;
  z-index: 10000 !important;
  width: 120px !important;
  text-align: center !important;
  padding: 0.5rem 0 !important;
  backdrop-filter: blur(8px) !important;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.react-datepicker__year-dropdown::-webkit-scrollbar {
  display: none !important;
}

.react-datepicker__year-option {
  color: #475569 !important;
  cursor: pointer !important;
  padding: 0.5rem 1rem !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  transition: all 0.2s ease-in-out !important;
  margin: 0.125rem 0.5rem !important;
  border-radius: 0.375rem !important;
}

.react-datepicker__year-option:hover {
  background-color: #f1f5f9 !important;
  color: #3b82f6 !important;
  transform: translateX(2px) !important;
}

.react-datepicker__year-option--selected {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3) !important;
}

.react-datepicker__year-read-view {
  border: 1px solid #e2e8f0 !important;
  border-radius: 0.375rem !important;
  padding: 0.375rem 0.75rem !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  cursor: pointer !important;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  color: #475569 !important;
  transition: all 0.2s ease-in-out !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.375rem !important;
  min-width: 60px !important;
  justify-content: center !important;
}

.react-datepicker__year-read-view:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #3b82f6 !important;
  color: #3b82f6 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.15) !important;
}

.react-datepicker__year-read-view--down-arrow {
  border-top: 5px solid currentColor !important;
  border-left: 4px solid transparent !important;
  border-right: 4px solid transparent !important;
  width: 0 !important;
  height: 0 !important;
  margin-left: 0 !important;
  transition: transform 0.2s ease-in-out !important;
}

.react-datepicker__year-read-view:hover .react-datepicker__year-read-view--down-arrow {
  transform: rotate(180deg) !important;
}

.react-datepicker__day-names {
  border-top: 1px solid #f3f4f6 !important;
  padding-top: 0.5rem !important;
  display: flex !important;
  justify-content: space-around !important;
}

.react-datepicker__day-name {
  color: #6b7280 !important;
  font-weight: 500 !important;
  width: 2rem !important;
  margin: 0.2rem !important;
  text-align: center !important;
}

.react-datepicker__month {
  margin: 0 !important;
  padding: 0.5rem !important;
}

.react-datepicker__month-container {
  float: none !important;
  width: 280px !important;
}

.react-datepicker__week {
  display: flex !important;
  justify-content: space-around !important;
}

.react-datepicker__day {
  width: 2rem !important;
  line-height: 2rem !important;
  margin: 0.2rem !important;
  border-radius: 9999px !important;
  transition: all 0.2s !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #1f2937 !important;
}

.react-datepicker__day--outside-month {
  color: #9ca3af !important;
  opacity: 0.6 !important;
}

.react-datepicker__day:hover {
  background-color: #eff6ff !important;
}

.react-datepicker__day--selected {
  background-color: #3b82f6 !important;
  color: white !important;
  font-weight: 600 !important;
}

.react-datepicker__day--keyboard-selected {
  background-color: #93c5fd !important;
  color: white !important;
}

.react-datepicker__navigation {
  top: 0.75rem !important;
}

.react-datepicker__navigation-icon::before {
  border-color: #6b7280 !important;
  border-width: 2px 2px 0 0 !important;
  width: 7px !important;
  height: 7px !important;
}

.react-datepicker__navigation:hover *::before {
  border-color: #3b82f6 !important;
}

.react-datepicker__triangle {
  display: none !important;
}
`;

// Add styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
