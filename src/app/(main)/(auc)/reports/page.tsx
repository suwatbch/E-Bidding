'use client';

import React, { useState, useEffect } from 'react';
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
  AucEndedIcon,
  AucOfferIcon,
  AucBiddingIcon,
  AucMoneyIcon,
  AucTrophyIcon,
  AucApartmentIcon,
  AucAssignmentIcon,
  NavBarChartIcon,
  NavInsightsIcon,
  SearchBarIcon,
  NavArrowDownIcon,
  NavRefreshIcon,
} from '@/app/components/ui/icons';
import Container from '@/app/components/ui/Container';
import { statusConfig, getStatusById } from '@/app/model/config';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  auctionsService,
  Auction,
  AuctionType,
  AuctionParticipant,
  AuctionBid,
} from '@/app/services/auctionsService';
import { companyService, Company } from '@/app/services/companyService';
import ThaiDatePicker from '@/app/components/ui/DatePicker';
import Pagination from '@/app/components/ui/Pagination';
import EmptyState from '@/app/components/ui/EmptyState';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';
import {
  formatDateTime,
  safeParseDate,
  formatAuctionId,
  formatPriceForDisplay,
  getPriceColor,
} from '@/app/utils/globalFunction';

interface AuctionReportItem {
  no: number;
  auction_id: number;
  title: string;
  category: string;
  auctionDate: string;
  participantCount: number;
  reservePrice: number;
  winnerPrice: number;
  saving: number;
  savingPercent: number;
  bidCount: number;
  winnerName: string;
  supplierCount: number;
  selectedWinnerName: string;
  status: number;
}

export default function ReportsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [auctionTypes, setAuctionTypes] = useState<AuctionType[]>([]);
  const [auctionParticipants, setAuctionParticipants] = useState<
    AuctionParticipant[]
  >([]);
  const [auctionBids, setAuctionBids] = useState<{
    [auctionId: number]: AuctionBid[];
  }>({});
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('auth_user');
      const userType = authData ? JSON.parse(authData)?.type : null;

      if (userType === 'user') {
        const todayStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        todayStart.setHours(0, 0, 0, 0);
        return todayStart;
      }
    }

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    return firstDayOfMonth;
  });

  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('auth_user');
      const userType = authData ? JSON.parse(authData)?.type : null;

      if (userType === 'user') {
        const todayEnd = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        todayEnd.setHours(23, 59, 59, 999);
        return todayEnd;
      }
    }

    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    lastDayOfMonth.setHours(23, 59, 59, 999);
    return lastDayOfMonth;
  });

  const [isFiltering, setIsFiltering] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useLocalStorage('reportPerPage', 10);
  const [mounted, setMounted] = useState(false);

  const { user } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num);
  };

  // สร้างข้อมูลรายงานสำหรับแสดงผล (เฉพาะประมูลที่สิ้นสุดแล้ว)
  const reportTable = (auctions || [])
    .filter((auction) => auction.status === 5) // เฉพาะสถานะสิ้นสุดประมูล
    .map((auction, idx) => {
      const auctionType = auctionTypes?.find(
        (t) => t.auction_type_id === auction.auction_type_id
      );
      const participantCount =
        auctionParticipants?.filter((p) => p.auction_id === auction.auction_id)
          .length || 0;

      // ดึงข้อมูล bid สำหรับการประมูลนี้
      const bids = auctionBids[auction.auction_id] || [];
      const bidCount = bids.length;

      // กรองเฉพาะ bid ที่มี status = 'accept' (ใช้โลจิกเดียวกับ BidHistory.tsx)
      const acceptedBids = bids.filter((bid) => bid.status === 'accept');

      // หารายการ bid ล่าสุดของแต่ละบริษัท (ใช้โลจิกเดียวกับ BidHistory.tsx)
      const companyLatestBids = new Map<number, AuctionBid>();
      acceptedBids.forEach((bid) => {
        const companyId = bid.company_id;
        const existing = companyLatestBids.get(companyId);
        if (!existing || new Date(bid.bid_time) > new Date(existing.bid_time)) {
          companyLatestBids.set(companyId, bid);
        }
      });

      // หาราคาต่ำสุดจากรายการล่าสุดของแต่ละบริษัท (ผู้ชนะการประมูล)
      const latestBids = Array.from(companyLatestBids.values());
      const winningBid =
        latestBids.length > 0
          ? latestBids.reduce((min, bid) =>
              bid.bid_amount < min.bid_amount ? bid : min
            )
          : null;

      const winnerPrice = winningBid ? winningBid.bid_amount : 0;

      // หาข้อมูลบริษัทของผู้ชนะจาก company_id ใน bid
      const winnerCompany = winningBid
        ? companies?.find((c) => c.id === winningBid.company_id)
        : null;

      const winnerName = winnerCompany?.name || '-';

      // นับจำนวนซัพพลายเออร์ที่เสนอราคา (รายการล่าสุดของแต่ละบริษัท)
      const supplierCount = latestBids.length;

      // คำนวณ Saving (แสดงทั้งค่าบวกและลบ เหมือน BidHistory)
      const reservePrice = auction.reserve_price || 0;
      const saving =
        reservePrice > 0 && winnerPrice > 0 ? reservePrice - winnerPrice : 0;
      const savingPercent =
        reservePrice > 0 && winnerPrice > 0 ? (saving / reservePrice) * 100 : 0;

      return {
        no: idx + 1,
        auction_id: auction.auction_id,
        title: auction.name,
        category: auctionType?.name || '-',
        auctionDate: auction.start_dt,
        participantCount,
        reservePrice,
        winnerPrice,
        saving,
        savingPercent,
        bidCount,
        winnerName,
        supplierCount,
        selectedWinnerName: winnerName, // ใช้ชื่อบริษัทเดียวกับผู้ชนะประมูล
        status: auction.status,
      } as AuctionReportItem;
    });

  // ดึงรายการประเภทจาก auctionTypes
  const categories = [
    'ทั้งหมด',
    ...(auctionTypes || [])
      .filter((type) => type.status === 1)
      .map((type) => type.name),
  ];

  // กรองข้อมูลตามเงื่อนไข
  const filteredItems = (reportTable || []).filter((item) => {
    const matchesCategory =
      selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;

    // กรองตามช่วงวันที่
    let matchesDate = true;
    if (isFiltering && user?.type === 'admin') {
      const itemDate = safeParseDate(item.auctionDate);
      const filterStartDate = safeParseDate(startDate.toISOString());
      const filterEndDate = safeParseDate(endDate.toISOString());
      matchesDate = itemDate >= filterStartDate && itemDate <= filterEndDate;
    }

    return matchesCategory && matchesDate;
  });

  const handleSearch = () => {
    setIsFiltering(true);
    loadAuctions();
  };

  const handleReset = () => {
    setSelectedCategory('ทั้งหมด');

    if (user?.type === 'admin') {
      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      firstDayOfMonth.setHours(0, 0, 0, 0);
      setStartDate(firstDayOfMonth);

      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );
      lastDayOfMonth.setHours(23, 59, 59, 999);
      setEndDate(lastDayOfMonth);
    }

    setIsFiltering(false);

    setTimeout(() => {
      loadAuctions();
    }, 100);
  };

  // Pagination handlers
  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  // โหลดข้อมูลจากฐานข้อมูล
  const loadAuctions = async () => {
    try {
      let startDateStr, endDateStr;

      if (user?.type === 'admin') {
        startDateStr = startDate.toISOString().slice(0, 19).replace('T', ' ');
        endDateStr = endDate.toISOString().slice(0, 19).replace('T', ' ');
      } else {
        const today = new Date();
        const todayStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0
        );
        const todayEnd = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59
        );

        startDateStr = todayStart.toISOString().slice(0, 19).replace('T', ' ');
        endDateStr = todayEnd.toISOString().slice(0, 19).replace('T', ' ');
      }

      const [auctionsResult, typesResult, participantsResult, companiesResult] =
        await Promise.all([
          auctionsService.getAllAuctions(startDateStr, endDateStr),
          auctionsService.getAuctionTypes(),
          auctionsService.getAuctionParticipants(),
          companyService.getAllCompanies(),
        ]);

      // ดึงข้อมูล bid สำหรับการประมูลที่สิ้นสุดแล้ว (status = 5)
      if (auctionsResult.success && auctionsResult.data) {
        const endedAuctions = auctionsResult.data.filter(
          (auction) => auction.status === 5
        );

        const bidData: { [auctionId: number]: AuctionBid[] } = {};

        await Promise.all(
          endedAuctions.map(async (auction) => {
            try {
              const bidsResult = await auctionsService.getAcceptedBids(
                auction.auction_id
              );
              if (bidsResult.success && bidsResult.data) {
                bidData[auction.auction_id] = bidsResult.data;
              }
            } catch (error) {
              console.error(
                `Error fetching bids for auction ${auction.auction_id}:`,
                error
              );
              bidData[auction.auction_id] = [];
            }
          })
        );

        setAuctionBids(bidData);
      }

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

      if (companiesResult.success && companiesResult.message === null) {
        setCompanies(companiesResult.data || []);
      } else {
        alert(companiesResult.message);
        setCompanies([]);
      }
    } catch (error: any) {
      console.error('Error loading auctions:', error);
      alert(error);
      setAuctions([]);
      setAuctionTypes([]);
      setAuctionParticipants([]);
      setCompanies([]);
    } finally {
      setMounted(true);
    }
  };

  useEffect(() => {
    loadAuctions();
  }, []);

  // อัปเดตวันที่เมื่อ user type เปลี่ยน
  useEffect(() => {
    if (user?.type === 'user') {
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      todayStart.setHours(0, 0, 0, 0);
      setStartDate(todayStart);

      const todayEnd = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      todayEnd.setHours(23, 59, 59, 999);
      setEndDate(todayEnd);
    } else if (user?.type === 'admin') {
      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );
      lastDayOfMonth.setHours(23, 59, 59, 999);

      const currentStart = new Date(startDate);
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      if (currentStart.getTime() === todayStart.getTime()) {
        setStartDate(firstDayOfMonth);
        setEndDate(lastDayOfMonth);
      }
    }
  }, [user?.type]);

  // Reset current page เมื่อมีการเปลี่ยน filter
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, isFiltering]);

  // Calculate totals with proper number validation and debug
  const totalReservePrice = filteredItems.reduce(
    (sum, item) => sum + (Number(item.reservePrice) || 0),
    0
  );
  const totalWinnerPrice = filteredItems.reduce((sum, item) => {
    const winnerPrice = Number(item.winnerPrice) || 0;
    return sum + winnerPrice;
  }, 0);

  // Calculate savings correctly: include negative savings too
  const totalSavings = filteredItems.reduce((sum, item) => {
    const reservePrice = Number(item.reservePrice) || 0;
    const winnerPrice = Number(item.winnerPrice) || 0;
    // คำนวณการประหยัด = ราคาประกัน - ราคาที่ชนะ (รวมทั้งค่าลบด้วย)
    const itemSaving =
      reservePrice > 0 && winnerPrice > 0 ? reservePrice - winnerPrice : 0;
    return sum + itemSaving;
  }, 0);

  const totalSavingsPercent =
    totalReservePrice > 0 ? (totalSavings / totalReservePrice) * 100 : 0;

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  return (
    <>
      <Container>
        <div className="pt-8">
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
                <NavRefreshIcon className="w-4 h-4 transition-transform duration-500 hover:rotate-180" />
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
                    <NavArrowDownIcon className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* วันที่เริ่มต้น */}
              <div className="relative w-full">
                <ThaiDatePicker
                  selected={startDate}
                  onChange={(date) => {
                    if (user?.type === 'admin' && date) {
                      setStartDate(date);
                    }
                  }}
                  label="วันที่เริ่มต้น"
                  placeholder="เลือกวันที่เริ่มต้น"
                  disabled={user?.type !== 'admin'}
                />
              </div>

              {/* วันที่สิ้นสุด */}
              <div className="relative">
                <ThaiDatePicker
                  selected={endDate}
                  onChange={(date) => {
                    if (user?.type === 'admin' && date) {
                      setEndDate(date);
                    }
                  }}
                  label="วันที่สิ้นสุด"
                  placeholder="เลือกวันที่สิ้นสุด"
                  disabled={user?.type !== 'admin'}
                />
              </div>

              {/* ปุ่มค้นหา */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2 mb-1.5 h-5">
                    {/* เว้นพื้นที่เพื่อให้ความสูงเท่ากับ label อื่นๆ */}
                  </div>
                </label>
                <button
                  onClick={handleSearch}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <SearchBarIcon className="w-4 h-4" />
                  ค้นหา
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <div
        className="w-full px-4"
        style={{
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
          width: '100vw',
        }}
      >
        <div className="rounded-lg p-2 mt-4">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-100 p-2 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="currentColor"
                viewBox="0 2 22 22"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-md font-semibold">ราคาประกันรวม:</span>
              <div className="text-md font-semibold text-gray-900">
                {formatPriceForDisplay(totalReservePrice)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">ราคาที่ชนะประมูลรวม:</span>
              <div className="text-lg font-semibold text-green-600">
                {formatPriceForDisplay(totalWinnerPrice)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">ราคาประหยัดรวม:</span>
              <div className="text-lg font-semibold text-blue-600">
                {formatPriceForDisplay(totalSavings)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">อัตราประหยัดรวม:</span>
              <div className="text-lg font-semibold text-orange-600">
                {totalSavingsPercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  รายงานการประมูล
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-600">
                  <AucEndedIcon className="w-4 h-4" />
                  สิ้นสุดประมูล
                </div>
              </div>
            </div>
          </div>

          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[4%] min-w-[50px] text-center">
                  <div className="flex text-xs items-center justify-center">
                    ลำดับ
                  </div>
                </TableHead>
                <TableHead className="w-[12%] min-w-[100px]">
                  <div className="flex text-xs items-center gap-2">
                    <AucAssignmentIcon className="w-4 h-4" />
                    ชื่อตลาด
                  </div>
                </TableHead>
                <TableHead className="w-[12%] min-w-[100px]">
                  <div className="flex text-xs items-center justify-center gap-2">
                    <AucCategoryIcon className="w-4 h-4" />
                    ประเภท
                  </div>
                </TableHead>
                <TableHead className="w-[10%] min-w-[90px] text-center">
                  <div className="flex text-xs items-center justify-center gap-2">
                    <AucStartTimeIcon className="w-4 h-4" />
                    วันที่ประมูล
                  </div>
                </TableHead>
                <TableHead className="w-[10%] min-w-[90px] text-right">
                  <div className="flex text-xs items-center justify-end gap-2">
                    <AucOfferIcon className="w-4 h-4" />
                    ราคาประกัน
                  </div>
                </TableHead>
                <TableHead className="w-[10%] min-w-[90px] text-right">
                  <div className="flex text-xs items-center justify-end gap-2">
                    <AucMoneyIcon className="w-4 h-4" />
                    ราคาที่ชนะ
                  </div>
                </TableHead>
                <TableHead className="w-[10%] min-w-[90px] text-right">
                  <div className="flex text-xs items-center justify-end gap-2">
                    <NavInsightsIcon className="w-4 h-4" />
                    ประหยัด
                  </div>
                </TableHead>
                <TableHead className="w-[8%] min-w-[80px] text-center">
                  <div className="flex text-xs items-center justify-center gap-2">
                    <NavBarChartIcon className="w-4 h-4" />
                    อัตราประหยัด
                  </div>
                </TableHead>
                <TableHead className="w-[8%] min-w-[80px] text-center">
                  <div className="flex text-xs items-center justify-center gap-2">
                    <AucBiddingIcon className="w-4 h-4" />
                    เสนอราคา
                  </div>
                </TableHead>
                <TableHead className="w-[8%] min-w-[70px] text-center">
                  <div className="flex text-xs items-center justify-center gap-2">
                    <AucApartmentIcon className="w-4 h-4" />
                    ซัพพลายเออร์
                  </div>
                </TableHead>
                <TableHead className="w-[12%] min-w-[100px]">
                  <div className="flex text-xs items-center gap-2">
                    <AucTrophyIcon className="w-4 h-4" />
                    ผู้ชนะประมูล
                  </div>
                </TableHead>
                <TableHead className="w-[12%] min-w-[100px]">
                  <div className="flex text-xs items-center gap-2">
                    <AucEndedIcon className="w-4 h-4" />
                    ผู้ที่ได้รับคัดเลือก
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <EmptyState
                  title="ไม่พบข้อมูลรายงาน"
                  description="ไม่มีการประมูลที่สิ้นสุดแล้วในช่วงเวลาที่เลือก"
                  colSpan={11}
                />
              ) : (
                currentItems.map((item, index) => (
                  <TableRow
                    key={item.auction_id}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <TableCell className="font-medium text-center">
                      <div className="text-xs">
                        {(startIndex + index + 1).toLocaleString('th-TH')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-full overflow-hidden">
                        <div
                          className="font-medium truncate w-full text-sm"
                          title={item.title}
                        >
                          {item.title}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className="text-xs truncate w-full"
                        title={item.category}
                      >
                        {item.category}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-xs">
                        {formatDateTime(item.auctionDate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-xs font-medium">
                        {formatPriceForDisplay(item.reservePrice)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className={`text-xs font-medium ${
                          item.winnerPrice > 0
                            ? getPriceColor(item.winnerPrice, item.reservePrice)
                            : 'text-gray-400'
                        }`}
                      >
                        {item.winnerPrice > 0
                          ? formatPriceForDisplay(item.winnerPrice)
                          : '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className={`text-xs font-medium ${
                          item.saving !== 0
                            ? getPriceColor(item.winnerPrice, item.reservePrice)
                            : 'text-gray-400'
                        }`}
                      >
                        {item.saving !== 0
                          ? formatPriceForDisplay(item.saving)
                          : '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className={`text-xs font-medium ${
                          item.savingPercent !== 0
                            ? getPriceColor(item.winnerPrice, item.reservePrice)
                            : 'text-gray-400'
                        }`}
                      >
                        {item.savingPercent !== 0
                          ? `${item.savingPercent.toFixed(2)}%`
                          : '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-xs text-gray-600">
                        {formatNumber(item.bidCount)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-xs text-gray-600">
                        {formatNumber(item.supplierCount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className="text-xs truncate w-full"
                        title={item.winnerName}
                      >
                        {item.winnerName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className="text-xs truncate w-full"
                        title={item.selectedWinnerName}
                      >
                        {item.selectedWinnerName}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
      </div>
    </>
  );
}
