'use client';

import { useState } from 'react';
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
  CategoryAllIcon,
  CategoryElectronicsIcon,
  CategoryFashionIcon,
  CategoryJewelryIcon,
  CategoryVehicleIcon,
  CategoryCollectiblesIcon,
  StatusPendingIcon,
  StatusBiddingIcon,
  StatusEndingSoonIcon,
  StatusEndedIcon,
  StatusCancelledIcon,
  SearchBarIcon,
  TimeIcon,
  UserIcon,
} from '@/app/components/ui/icons';
import {
  Gavel,
  AccessTime,
  Person,
  Category,
  Devices,
  LocalOffer,
  Diamond,
  DirectionsCar,
  Collections,
} from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import TimerIcon from '@mui/icons-material/Timer';
import BlockIcon from '@mui/icons-material/Block';
import Container from '@/app/components/ui/Container';
import { dataAuction, Auction } from '@/app/model/dataAuction';
import { dataAuction_Type } from '@/app/model/dataAuction_Type';
import { dataAuction_Participant } from '@/app/model/dataAuction_Participant';

interface AuctionItem {
  no: number;
  title: string;
  category: string;
  startTime: string;
  endTime: string;
  bidCount: number;
  status: 'pending' | 'bidding' | 'ending_soon' | 'ended' | 'cancelled';
}

const categories = [
  { name: 'ทั้งหมด', icon: <CategoryAllIcon /> },
  { name: 'อิเล็กทรอนิกส์', icon: <CategoryElectronicsIcon /> },
  { name: 'แฟชั่น', icon: <CategoryFashionIcon /> },
  { name: 'เครื่องประดับ', icon: <CategoryJewelryIcon /> },
  { name: 'ยานยนต์', icon: <CategoryVehicleIcon /> },
  { name: 'ของสะสม', icon: <CategoryCollectiblesIcon /> },
];

const statusMap: Record<number, string> = {
  1: 'เปิดการประมูล',
  2: 'รอการประมูล',
  3: 'กำลังประมูล',
  4: 'ใกล้สิ้นสุด',
  5: 'สิ้นสุดประมูล',
  6: 'ยกเลิกประมูล',
};

export default function AuctionsPage() {
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | AuctionItem['status']
  >('all');

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
      case 'pending':
        return {
          icon: <StatusPendingIcon />,
          text: 'รอการประมูล',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
      case 'bidding':
        return {
          icon: <StatusBiddingIcon />,
          text: 'กำลังประมูล',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        };
      case 'ending_soon':
        return {
          icon: <StatusEndingSoonIcon />,
          text: 'ใกล้สิ้นสุด',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
        };
      case 'ended':
        return {
          icon: <StatusEndedIcon />,
          text: 'สิ้นสุดประมูล',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 'cancelled':
        return {
          icon: <StatusCancelledIcon />,
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
      no: idx + 1,
      title: `${auction.name} ${formatAuctionId(auction.auction_id)}`,
      category: auctionType?.name || '-',
      startTime: auction.start_dt,
      endTime: auction.end_dt,
      bidCount: participantCount,
      status: uiStatus,
    } as AuctionItem;
  });

  // กรองและเรียงลำดับข้อมูล
  const filteredItems = auctionTable
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // เรียงตามสถานะ
      const statusOrder = {
        pending: 0,
        bidding: 1,
        ending_soon: 2,
        ended: 3,
        cancelled: 4,
      };

      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }

      // ถ้าสถานะเดียวกัน เรียงตามเวลา
      return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
    });

  return (
    <Container className="py-8">
      {/* Hero Section */}
      <div className="pt-8">
        <div className="relative rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_theme(colors.blue.300/20%),_transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_theme(colors.blue.300/20%),_transparent_50%)]"></div>
          </div>

          {/* Content */}
          <div className="relative px-8 py-12">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                ยินดีต้อนรับสู่ <span className="text-blue-200">E-Bidding</span>
              </h1>
              <p className="text-lg text-blue-100 mb-8">
                ระบบประมูลออนไลน์ที่เชื่อถือได้และใช้งานง่าย
              </p>
              <div className="relative max-w-xl mx-auto group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-300 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative">
                  <SearchBarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder="ค้นหารายการประมูล..."
                    className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 bg-white shadow-md focus:ring-2 focus:ring-blue-300 focus:outline-none transition duration-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8">
        {/* Auction Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-semibold">รายการประมูล</h2>
              <div className="flex items-center gap-2 flex-nowrap overflow-x-auto pb-2 sm:pb-0 -mx-6 sm:mx-0 px-6 sm:px-0">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${
                      statusFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${
                      statusFilter === 'pending'
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <StatusPendingIcon />
                  รอการประมูล
                </button>
                <button
                  onClick={() => setStatusFilter('bidding')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${
                      statusFilter === 'bidding'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                >
                  <StatusBiddingIcon />
                  กำลังประมูล
                </button>
                <button
                  onClick={() => setStatusFilter('ending_soon')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${
                      statusFilter === 'ending_soon'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                    }`}
                >
                  <StatusEndingSoonIcon />
                  ใกล้สิ้นสุด
                </button>
                <button
                  onClick={() => setStatusFilter('ended')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${
                      statusFilter === 'ended'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                >
                  <StatusEndedIcon />
                  สิ้นสุดประมูล
                </button>
                <button
                  onClick={() => setStatusFilter('cancelled')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${
                      statusFilter === 'cancelled'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                >
                  <StatusCancelledIcon />
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
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-gray-500" />
                    ชื่อตลาด
                  </div>
                </TableHead>
                <TableHead className="w-[15%]">
                  <div className="flex items-center gap-2">
                    <Category className="w-5 h-5 text-gray-500" />
                    หมวดหมู่
                  </div>
                </TableHead>
                <TableHead className="w-[15%] text-center">
                  <div className="flex items-center justify-center gap-2">
                    <AccessTime className="w-5 h-5 text-gray-500" />
                    เวลาเปิด
                  </div>
                </TableHead>
                <TableHead className="w-[15%] text-center">
                  <div className="flex items-center justify-center gap-2">
                    <TimerIcon className="w-5 h-5 text-gray-500" />
                    เวลาปิด
                  </div>
                </TableHead>
                <TableHead className="w-[10%] text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Person className="w-5 h-5 text-gray-500" />
                    ผู้ประมูล
                  </div>
                </TableHead>
                <TableHead className="w-[15%] text-center">
                  <div className="flex items-center justify-center gap-2">
                    <LocalOffer className="w-5 h-5 text-gray-500" />
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
                    <TableCell className="font-medium">{item.no}</TableCell>
                    <TableCell className="font-medium text-blue-600 hover:text-blue-700">
                      {item.title}
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
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
                        {statusInfo.icon}
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
