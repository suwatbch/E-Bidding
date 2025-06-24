'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/AucTable';
import {
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
import { statusConfig, getStatusById } from '@/app/model/config';
import {
  auctionsService,
  Auction,
  AuctionType,
  AuctionParticipant,
} from '@/app/services/auctionsService';
import ThaiDatePicker from '@/app/components/ui/DatePicker';
import Pagination from '@/app/components/ui/Pagination';
import EmptyState from '@/app/components/ui/EmptyState';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';
import {
  formatDateForDisplay,
  safeParseDate,
  createSecureUrl,
  formatAuctionId,
} from '@/app/utils/globalFunction';
import Link from 'next/link';

interface AuctionItem {
  no: number;
  title: string;
  category: string;
  startTime: string;
  endTime: string;
  bidCount: number;
  status: number;
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [auctionTypes, setAuctionTypes] = useState<AuctionType[]>([]);
  const [auctionParticipants, setAuctionParticipants] = useState<
    AuctionParticipant[]
  >([]);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDateTime = (dateTimeStr: string) => {
    return formatDateForDisplay(safeParseDate(dateTimeStr), true);
  };

  // สร้างข้อมูลสำหรับแสดงผล
  const auctionTable = (auctions || []).map((auction, idx) => {
    const auctionType = auctionTypes?.find(
      (t) => t.auction_type_id === auction.auction_type_id
    );
    const participantCount =
      auctionParticipants?.filter((p) => p.auction_id === auction.auction_id)
        .length || 0;

    // แปลงสถานะเป็นรูปแบบที่ใช้กับ UI เดิม
    let uiStatus: AuctionItem['status'] = auction.status;

    // Note: currency and remark fields are available in auction object but not displayed in UI
    // auction.currency - currency ID (1=THB, 2=USD, etc.)
    // auction.remark - additional notes/remarks

    return {
      no: idx,
      auction_id: auction.auction_id, // เพิ่มฟิลด์นี้เพื่อให้ง่ายต่อการเข้าถึง
      title: `${auction.name} [${formatAuctionId(auction.auction_id)}]`,
      category: auctionType?.name || '-',
      startTime: auction.start_dt,
      endTime: auction.end_dt,
      bidCount: participantCount,
      status: uiStatus,
    } as AuctionItem & { auction_id: number };
  });

  // ดึงรายการประเภทจาก auctionTypes
  const categories = [
    'ทั้งหมด',
    ...(auctionTypes || [])
      .filter((type) => type.status === 1) // เลือกเฉพาะที่ status เป็น 1 (active)
      .map((type) => type.name),
  ];

  // กรองข้อมูลตามเงื่อนไข
  const filteredItems = (auctionTable || []).filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    // ตรวจสอบประเภท - ทำงานทันที
    const matchesCategory =
      selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;

    // ตรวจสอบสถานะ - ทำงานทันที
    const matchesStatus =
      selectedStatus === 'all' || item.status === parseInt(selectedStatus);

    // กรองตามช่วงวันที่ - ใช้เฉพาะเมื่อกดค้นหา
    let matchesDate = true;
    if (isFiltering) {
      const itemDate = safeParseDate(item.startTime);
      const filterStartDate = safeParseDate(startDate.toISOString());
      const filterEndDate = safeParseDate(endDate.toISOString());
      matchesDate = itemDate >= filterStartDate && itemDate <= filterEndDate;
    }

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
  // โหลดข้อมูลจากฐานข้อมูล
  const loadAuctions = async () => {
    try {
      const [auctionsResult, typesResult, participantsResult] =
        await Promise.all([
          auctionsService.getAllAuctions(),
          auctionsService.getAuctionTypes(),
          auctionsService.getAuctionParticipants(),
        ]);

      if (auctionsResult.success && auctionsResult.message === null) {
        setAuctions(auctionsResult.data || []);
      } else {
        alert(auctionsResult.message);
        setAuctions([]);
      }

      if (typesResult.success && typesResult.message === null) {
        setAuctionTypes(typesResult.data || []);
      } else {
        alert(typesResult.message);
        setAuctionTypes([]);
      }

      if (participantsResult.success && participantsResult.message === null) {
        setAuctionParticipants(participantsResult.data || []);
      } else {
        alert(participantsResult.message);
        setAuctionParticipants([]);
      }
    } catch (error: any) {
      console.error('Error loading auctions:', error);
      alert(error);
      // ตั้งค่า default เป็น array เปล่าเมื่อเกิดข้อผิดพลาด
      setAuctions([]);
      setAuctionTypes([]);
      setAuctionParticipants([]);
    } finally {
      setMounted(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจว่าต้องการลบตลาดนี้?')) return;

    try {
      const result = await auctionsService.deleteAuction(id);

      if (result.success && result.message === null) {
        await loadAuctions();
        alert('ลบข้อมูลตลาดเรียบร้อยแล้ว');
      } else {
        alert(result.message);
      }
    } catch (error: any) {
      console.error('Error deleting auction:', error);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  useEffect(() => {
    loadAuctions();
  }, []);

  // Reset current page เมื่อมีการเปลี่ยน filter
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedStatus, searchQuery, isFiltering]);

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

  return (
    <Container>
      <div className="py-8">
        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              ตัวกรองการค้นหา
            </h3>
            <button
              onClick={handleReset}
              className="text-sm font-medium text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors duration-200"
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
            {/* ประเภท */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2 mb-1.5">
                  <AucCategoryIcon className="w-4 h-4 text-gray-500" />
                  ประเภท
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
              <ThaiDatePicker
                selected={startDate}
                onChange={(date) => date && setStartDate(date)}
                label="วันที่เริ่มต้น"
                placeholder="เลือกวันที่เริ่มต้น"
              />
            </div>

            {/* วันที่สิ้นสุด */}
            <div className="relative">
              <ThaiDatePicker
                selected={endDate}
                onChange={(date) => date && setEndDate(date)}
                label="วันที่สิ้นสุด"
                placeholder="เลือกวันที่สิ้นสุด"
              />
            </div>
          </div>

          {/* Search Bar and Action Buttons */}
          <div className="mt-6 flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ค้นหาตามชื่อตลาดหรือประเภท..."
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
            href={createSecureUrl('/auctionform?id=', 0)}
            prefetch={false}
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
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">รายการตลาดประมูล</h2>
              </div>
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

          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[5%] min-w-[50px] max-w-[80px] text-center">
                  <div className="flex items-center justify-center gap-2">
                    ลำดับ
                  </div>
                </TableHead>
                <TableHead className="w-[25%] min-w-[200px] max-w-[400px]">
                  <div className="flex items-center gap-2">
                    <AucBiddingIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ชื่อตลาด
                  </div>
                </TableHead>
                <TableHead className="w-[12%] min-w-[100px] max-w-[150px]">
                  <div className="flex items-center gap-2">
                    <AucCategoryIcon className="w-5 h-5 text-gray-500" />
                    ประเภท
                  </div>
                </TableHead>
                <TableHead className="w-[15%] min-w-[120px] max-w-[180px] text-center">
                  <div className="flex items-center justify-center gap-2">
                    <AucStartTimeIcon className="w-5 h-5 text-gray-500" />
                    เวลาเปิด
                  </div>
                </TableHead>
                <TableHead className="w-[15%] min-w-[120px] max-w-[180px] text-center">
                  <div className="flex items-center justify-center gap-2">
                    <AucEndTimeIcon className="w-5 h-5 text-gray-500" />
                    เวลาปิด
                  </div>
                </TableHead>
                <TableHead className="w-[10%] min-w-[80px] max-w-[100px] text-center">
                  <div className="flex items-center justify-center gap-2">
                    <AucUserIcon className="w-5 h-5 text-gray-500" />
                    เข้าร่วม
                  </div>
                </TableHead>
                <TableHead className="w-[10%] min-w-[80px] max-w-[120px] text-center">
                  <div className="flex items-center justify-center gap-2">
                    <AucOfferIcon className="w-5 h-5 text-gray-500" />
                    สถานะ
                  </div>
                </TableHead>
                <TableHead className="w-[10%] min-w-[90px] max-w-[130px] text-center">
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
              {currentItems.length === 0 ? (
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
                        <div className="w-full overflow-hidden">
                          <Link
                            href={`/auction/${(item as any).auction_id || ''}`}
                            prefetch={false}
                            className="text-sm font-medium cursor-pointer text-blue-500 transition-colors block w-full"
                            title={item.title}
                          >
                            <div className="font-medium text-blue-700 truncate w-full">
                              {(auctions || []).find(
                                (a) => a.auction_id === (item as any).auction_id
                              )?.name || 'ไม่พบชื่อตลาด'}
                            </div>
                            <div className="text-xs text-gray-400 mt-1 truncate w-full">
                              {`[${formatAuctionId(
                                (item as any).auction_id
                              )}] `}
                              {(() => {
                                const auction = (auctions || []).find(
                                  (a) =>
                                    a.auction_id === (item as any).auction_id
                                );
                                return auction?.remark
                                  ? auction.remark
                                  : `ราคาประกัน: ${formatPrice(
                                      auction?.reserve_price || 0
                                    )}`;
                              })()}
                            </div>
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full overflow-hidden">
                          <div
                            className="text-sm truncate w-full cursor-pointer"
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
                          <AucUserIcon className="w-4 h-4" />
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
                            href={createSecureUrl(
                              '/auctionform?id=',
                              (item as any).auction_id || 0
                            )}
                            prefetch={false}
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
                          {/* แสดงปุ่มลบเฉพาะสถานะ 1, 2, และ 6 เท่านั้น */}
                          {[1, 2, 6].includes(item.status) && (
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `คุณต้องการลบตลาด "${item.title}" หรือไม่?`
                                  )
                                ) {
                                  handleDelete((item as any).auction_id);
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
                          )}
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
