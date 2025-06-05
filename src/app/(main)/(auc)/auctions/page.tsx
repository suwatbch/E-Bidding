'use client';

import { useState, FC, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/AucTable';
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
} from '@/app/components/ui/Icons';
import Container from '@/app/components/ui/Container';
import { dataAuction, Auction } from '@/app/model/dataAuction';
import { dataAuction_Type } from '@/app/model/dataAuction_Type';
import { dataAuction_Participant } from '@/app/model/dataAuction_Participant';
import { statusConfig, getStatusById } from '@/app/model/dataConfig';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { th } from 'date-fns/locale';
import Pagination from '@/app/components/ui/Pagination';
import EmptyState from '@/app/components/ui/EmptyState';
import LoadingState from '@/app/components/ui/LoadingState';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';
import Link from 'next/link';

registerLocale('th', th);

interface AuctionItem {
  no: number;
  title: string;
  category: string;
  startTime: string;
  endTime: string;
  bidCount: number;
  status: number;
}

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  label: string;
  icon: FC<{ className?: string }>;
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useLocalStorage('auctionPerPage', 5);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
  const filteredAuctions = dataAuction.filter((a) => a.is_deleted === 0);

  // สร้างข้อมูลสำหรับแสดงผล
  const auctionTable = filteredAuctions.map((auction, idx) => {
    const auctionType = dataAuction_Type.find(
      (t) => t.auction_type_id === auction.auction_type_id
    );
    const participantCount = dataAuction_Participant.filter(
      (p) => p.auction_id === auction.auction_id
    ).length;

    // แปลงสถานะเป็นรูปแบบที่ใช้กับ UI เดิม
    let uiStatus: AuctionItem['status'] = 2;
    switch (auction.status) {
      case 1:
        uiStatus = 1;
        break;
      case 2:
        uiStatus = 2;
        break;
      case 3:
        uiStatus = 3;
        break;
      case 4:
        uiStatus = 4;
        break;
      case 5:
        uiStatus = 5;
        break;
      case 6:
        uiStatus = 6;
        break;
    }

    // Note: currency and remark fields are available in auction object but not displayed in UI
    // auction.currency - currency ID (1=THB, 2=USD, etc.)
    // auction.remark - additional notes/remarks

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
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    // ตรวจสอบหมวดหมู่
    const matchesCategory =
      selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;

    // ตรวจสอบสถานะ - แปลง selectedStatus เป็น number เพื่อเปรียบเทียบ
    const matchesStatus =
      selectedStatus === 'all' || item.status === parseInt(selectedStatus);

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

  // Pagination handlers
  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  // Mount and Loading effect - รวมเป็นอันเดียวเหมือนหน้า Company
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // จำลองการโหลดข้อมูลจริง
        setAuctions(dataAuction.filter((a) => a.is_deleted === 0));
      } catch (error) {
        console.error('Error loading auctions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    setMounted(true);
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // ใช้ statusConfig แทน getStatusInfo function เดิม
  const getStatusDisplay = (statusId: number) => {
    const statusInfo = getStatusById(statusId);
    if (!statusInfo) {
      return {
        text: 'ไม่ทราบสถานะ',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
      };
    }

    // แปลง statusConfig เป็น format ที่ UI ต้องการ
    switch (statusId) {
      case 1:
        return {
          text: statusInfo.description,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
        };
      case 2:
        return {
          text: statusInfo.description,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
        };
      case 3:
        return {
          text: statusInfo.description,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        };
      case 4:
        return {
          text: statusInfo.description,
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-50',
        };
      case 5:
        return {
          text: statusInfo.description,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 6:
        return {
          text: statusInfo.description,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        };
      default:
        return {
          text: statusInfo.description,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
    }
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              ตัวกรองการค้นหา
            </h3>
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-blue-700 flex items-center gap-1 transition-colors duration-200"
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
              <span className="text-sm font-medium">รีเซ็ตตัวกรอง</span>
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
                  {Object.values(statusConfig).map((status) => (
                    <option key={status.id} value={status.id.toString()}>
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

            {/* วันที่เริ่มต้น */}
            <div className="relative w-full">
              {mounted ? (
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => date && setStartDate(date)}
                  dateFormat="dd/MM/yyyy"
                  locale="th"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={15}
                  customInput={
                    <CustomInput
                      label="วันที่เริ่มต้น"
                      icon={AucStartTimeIcon}
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
                />
              ) : (
                <CustomInput
                  label="วันที่เริ่มต้น"
                  icon={AucStartTimeIcon}
                  value={startDate.toLocaleDateString('en-GB')}
                />
              )}
            </div>

            {/* วันที่สิ้นสุด */}
            <div className="relative">
              {mounted ? (
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
              ) : (
                <CustomInput
                  label="วันที่สิ้นสุด"
                  icon={AucEndTimeIcon}
                  value={endDate.toLocaleDateString('en-GB')}
                />
              )}
            </div>
          </div>

          {/* Search Bar and Action Buttons */}
          <div className="mt-6 flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ค้นหาตามชื่อตลาดหรือหมวดหมู่..."
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

        <div className="flex justify-between items-center m-4">
          <div className="flex"></div>
          <Link
            href="/auctionform?id=0"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            เพิ่มตลาด
          </Link>
        </div>

        {/* Table Info Section */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredItems.length}
          perPage={perPage}
          onPageChange={setCurrentPage}
          onPerPageChange={handlePerPageChange}
          mounted={mounted}
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-semibold">รายการตลาดประมูล</h2>
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
                {Object.values(statusConfig).map((status) => {
                  const isSelected = selectedStatus === status.id.toString();
                  let buttonClass = '';
                  let IconComponent = null;

                  // กำหนดสีและไอคอนตาม status
                  switch (status.id) {
                    case 1:
                      buttonClass = isSelected
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 text-amber-600 hover:bg-amber-100';
                      IconComponent = AucOpenIcon;
                      break;
                    case 2:
                      buttonClass = isSelected
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100';
                      IconComponent = AucPendingIcon;
                      break;
                    case 3:
                      buttonClass = isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100';
                      IconComponent = AucBiddingIcon;
                      break;
                    case 4:
                      buttonClass = isSelected
                        ? 'bg-cyan-600 text-white'
                        : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100';
                      IconComponent = AucEndingSoonIcon;
                      break;
                    case 5:
                      buttonClass = isSelected
                        ? 'bg-green-600 text-white'
                        : 'bg-green-50 text-green-600 hover:bg-green-100';
                      IconComponent = AucEndedIcon;
                      break;
                    case 6:
                      buttonClass = isSelected
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-600 hover:bg-red-100';
                      IconComponent = AucCancelledIcon;
                      break;
                    default:
                      buttonClass = isSelected
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100';
                  }

                  return (
                    <button
                      key={status.id}
                      onClick={() => setSelectedStatus(status.id.toString())}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${buttonClass}`}
                    >
                      {IconComponent && <IconComponent className="w-4 h-4" />}
                      {status.description}
                    </button>
                  );
                })}
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
                <TableHead className="min-w-[100px]">
                  <div className="flex items-center gap-2">
                    <AucBiddingIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ชื่อตลาด
                  </div>
                </TableHead>
                <TableHead className="w-[15%]">
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
                    เข้าร่วม
                  </div>
                </TableHead>
                <TableHead className="w-[8%] text-center">
                  <div className="flex items-center justify-center gap-2">
                    <AucOfferIcon className="w-5 h-5 text-gray-500" />
                    สถานะ
                  </div>
                </TableHead>
                <TableHead className="w-[8%] text-center">
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                    จัดการ
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <LoadingState colSpan={8} />
              ) : currentItems.length === 0 ? (
                <EmptyState
                  title="ไม่พบข้อมูล"
                  description="ไม่พบข้อมูลที่ตรงกับการค้นหา"
                  colSpan={8}
                />
              ) : (
                currentItems.map((item, index) => {
                  const statusInfo = getStatusDisplay(item.status);
                  return (
                    <TableRow
                      key={item.no}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                    >
                      <TableCell className="font-medium text-center">
                        {(startIndex + index + 1).toLocaleString('th-TH')}
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
                          <AucUserIcon />
                          {item.bidCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                        >
                          {(() => {
                            switch (item.status) {
                              case 1:
                                return <AucOpenIcon className="w-4 h-4" />;
                              case 2:
                                return <AucPendingIcon className="w-4 h-4" />;
                              case 3:
                                return <AucBiddingIcon className="w-4 h-4" />;
                              case 4:
                                return (
                                  <AucEndingSoonIcon className="w-4 h-4" />
                                );
                              case 5:
                                return <AucEndedIcon className="w-4 h-4" />;
                              case 6:
                                return <AucCancelledIcon className="w-4 h-4" />;
                              default:
                                return null;
                            }
                          })()}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/auctionform?id=${
                              filteredAuctions[item.no]?.auction_id || ''
                            }`}
                            className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                            title="แก้ไข"
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
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                              />
                            </svg>
                          </Link>
                          <button
                            onClick={() => {
                              const auctionName =
                                filteredAuctions[item.no]?.name || 'ตลาดนี้';
                              if (
                                confirm(
                                  `คุณต้องการลบ "${auctionName}" หรือไม่?`
                                )
                              ) {
                                // จำลองการลบข้อมูล
                                console.log(
                                  'Delete auction:',
                                  filteredAuctions[item.no]?.auction_id
                                );
                                alert('ลบข้อมูลเรียบร้อยแล้ว');
                                // ในการใช้งานจริงจะเรียก API เพื่อลบข้อมูล
                              }
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบ"
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
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
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
