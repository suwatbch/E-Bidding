'use client';

import { useState } from 'react';
import { useLanguage } from '@/app/hooks/useLanguage';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
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
  UserIcon
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
  Collections
} from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import TimerIcon from '@mui/icons-material/Timer';
import BlockIcon from '@mui/icons-material/Block';
import Container from '@/app/components/ui/Container';

interface AuctionItem {
  id: string;
  title: string;
  category: string;
  startPrice: number;
  currentBid: number;
  bidCount: number;
  endTime: string;
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

const auctionItems: AuctionItem[] = [
  {
    id: 'A001',
    title: 'รถยนต์ Toyota Camry 2.5G ปี 2022',
    category: 'ยานพาหนะ',
    startPrice: 800000,
    currentBid: 850000,
    bidCount: 12,
    endTime: '2024-03-25 15:00',
    status: 'bidding'
  },
  {
    id: 'A002',
    title: 'ที่ดินเปล่า 100 ตร.วา ถ.พระราม 2',
    category: 'อสังหาริมทรัพย์',
    startPrice: 2500000,
    currentBid: 2800000,
    bidCount: 8,
    endTime: '2024-03-24 12:00',
    status: 'ending_soon'
  },
  {
    id: 'A003',
    title: 'แหวนเพชรน้ำงาม 1 กะรัต',
    category: 'เครื่องประดับ',
    startPrice: 150000,
    currentBid: 180000,
    bidCount: 15,
    endTime: '2024-03-26 18:00',
    status: 'bidding'
  },
  {
    id: 'A004',
    title: 'MacBook Pro M2 Max 16" 32GB 1TB',
    category: 'อิเล็กทรอนิกส์',
    startPrice: 89000,
    currentBid: 95000,
    bidCount: 6,
    endTime: '2024-03-23 20:00',
    status: 'ended'
  },
  {
    id: 'A005',
    title: 'เหรียญหลวงพ่อคูณ รุ่นแรก ปี 2512',
    category: 'พระเครื่อง',
    startPrice: 500000,
    currentBid: 580000,
    bidCount: 20,
    endTime: '2024-03-27 09:00',
    status: 'bidding'
  },
  {
    id: 'A006',
    title: 'คอนโดมิเนียม The Base สุขุมวิท 77',
    category: 'อสังหาริมทรัพย์',
    startPrice: 1800000,
    currentBid: 1950000,
    bidCount: 10,
    endTime: '2024-03-25 16:00',
    status: 'cancelled'
  },
  {
    id: 'A007',
    title: 'นาฬิกา Rolex Submariner Date',
    category: 'เครื่องประดับ',
    startPrice: 450000,
    currentBid: 480000,
    bidCount: 9,
    endTime: '2024-03-24 14:00',
    status: 'ending_soon'
  },
  {
    id: 'A008',
    title: 'เครื่องจักรโรงงานอุตสาหกรรม CNC',
    category: 'อุตสาหกรรม',
    startPrice: 1200000,
    currentBid: 1350000,
    bidCount: 5,
    endTime: '2024-03-26 11:00',
    status: 'bidding'
  },
  {
    id: 'A009',
    title: 'ภาพวาดศิลปินแห่งชาติ เฉลิมชัย',
    category: 'ศิลปะ',
    startPrice: 300000,
    currentBid: 320000,
    bidCount: 7,
    endTime: '2024-03-25 13:00',
    status: 'ended'
  },
  {
    id: 'A010',
    title: 'รถจักรยานยนต์ Ducati Panigale V4',
    category: 'ยานพาหนะ',
    startPrice: 950000,
    currentBid: 1020000,
    bidCount: 14,
    endTime: '2024-03-24 17:00',
    status: 'bidding'
  },
  {
    id: 'A011',
    title: 'โน๊ตบุ๊ค ASUS ROG Strix G16 2024',
    category: 'อิเล็กทรอนิกส์',
    startPrice: 55000,
    currentBid: 62000,
    bidCount: 8,
    endTime: '2024-03-28 10:00',
    status: 'bidding'
  },
  {
    id: 'A012',
    title: 'ทาวน์โฮม 3 ชั้น หลังมุม',
    category: 'อสังหาริมทรัพย์',
    startPrice: 3500000,
    currentBid: 3750000,
    bidCount: 4,
    endTime: '2024-03-29 15:00',
    status: 'cancelled'
  },
  {
    id: 'A013',
    title: 'กล้อง Sony A7R V Mirrorless',
    category: 'อิเล็กทรอนิกส์',
    startPrice: 125000,
    currentBid: 138000,
    bidCount: 11,
    endTime: '2024-03-26 14:00',
    status: 'ending_soon'
  },
  {
    id: 'A014',
    title: 'พระสมเด็จวัดระฆัง รุ่นอนุสรณ์ 100 ปี',
    category: 'พระเครื่อง',
    startPrice: 250000,
    currentBid: 285000,
    bidCount: 16,
    endTime: '2024-03-23 11:00',
    status: 'ended'
  },
  {
    id: 'A015',
    title: 'เพชรน้ำงาม GIA Certified 2 กะรัต',
    category: 'เครื่องประดับ',
    startPrice: 850000,
    currentBid: 920000,
    bidCount: 7,
    endTime: '2024-03-27 16:00',
    status: 'bidding'
  },
  {
    id: 'A016',
    title: 'รถ Porsche 911 GT3 ปี 2023',
    category: 'ยานพาหนะ',
    startPrice: 12500000,
    currentBid: 13200000,
    bidCount: 5,
    endTime: '2024-03-30 12:00',
    status: 'bidding'
  },
  {
    id: 'A017',
    title: 'ที่ดินติดทะเล 2 ไร่ หัวหิน',
    category: 'อสังหาริมทรัพย์',
    startPrice: 15000000,
    currentBid: 16500000,
    bidCount: 9,
    endTime: '2024-03-25 09:00',
    status: 'ending_soon'
  },
  {
    id: 'A018',
    title: 'เครื่องบินเล็ก Cessna 172',
    category: 'ยานพาหนะ',
    startPrice: 8500000,
    currentBid: 8900000,
    bidCount: 3,
    endTime: '2024-03-22 10:00',
    status: 'ended'
  },
  {
    id: 'A019',
    title: 'ตู้เซฟโบราณ อายุ 100 ปี',
    category: 'ของสะสม',
    startPrice: 180000,
    currentBid: 195000,
    bidCount: 6,
    endTime: '2024-03-28 13:00',
    status: 'cancelled'
  },
  {
    id: 'A020',
    title: 'ภาพวาดสีน้ำมัน Vincent van Gogh',
    category: 'ศิลปะ',
    startPrice: 450000,
    currentBid: 520000,
    bidCount: 13,
    endTime: '2024-03-29 17:00',
    status: 'bidding'
  }
];

export default function AuctionsPage() {
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AuctionItem['status']>('all');
  const { translate } = useLanguage();

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
          bgColor: 'bg-gray-50'
        };
      case 'bidding':
        return {
          icon: <StatusBiddingIcon />,
          text: 'กำลังประมูล',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'ending_soon':
        return {
          icon: <StatusEndingSoonIcon />,
          text: 'ใกล้สิ้นสุด',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        };
      case 'ended':
        return {
          icon: <StatusEndedIcon />,
          text: 'สิ้นสุดประมูล',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'cancelled':
        return {
          icon: <StatusCancelledIcon />,
          text: 'ยกเลิกประมูล',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
    }
  };

  // เรียงลำดับรายการตามสถานะและเวลา
  const sortedAuctions = [...auctionItems].sort((a, b) => {
    // เรียงตามสถานะ
    const statusOrder = {
      pending: 0,
      bidding: 1,
      ending_soon: 2,
      ended: 3,
      cancelled: 4
    };
    
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    
    // ถ้าสถานะเดียวกัน เรียงตามเวลา
    return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
  });

  const filteredItems = sortedAuctions.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
                {translate('hero_title')} <span className="text-blue-200">E-Bidding</span>
              </h1>
              <p className="text-lg text-blue-100 mb-8">
                {translate('hero_subtitle')}
              </p>
              <div className="relative max-w-xl mx-auto group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-300 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative">
                  <SearchBarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder={translate('hero_search_placeholder')}
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
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate('categories_title')}</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            <button className="flex items-center px-6 py-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-gray-700 hover:text-blue-600 min-w-max cursor-pointer">
              <span className="mr-2"><CategoryAllIcon /></span>
              {translate('category_all')}
            </button>
            <button className="flex items-center px-6 py-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-gray-700 hover:text-blue-600 min-w-max cursor-pointer">
              <span className="mr-2"><CategoryElectronicsIcon /></span>
              {translate('category_electronics')}
            </button>
            <button className="flex items-center px-6 py-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-gray-700 hover:text-blue-600 min-w-max cursor-pointer">
              <span className="mr-2"><CategoryFashionIcon /></span>
              {translate('category_fashion')}
            </button>
            <button className="flex items-center px-6 py-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-gray-700 hover:text-blue-600 min-w-max cursor-pointer">
              <span className="mr-2"><CategoryJewelryIcon /></span>
              {translate('category_jewelry')}
            </button>
            <button className="flex items-center px-6 py-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-gray-700 hover:text-blue-600 min-w-max cursor-pointer">
              <span className="mr-2"><CategoryVehicleIcon /></span>
              {translate('category_vehicles')}
            </button>
            <button className="flex items-center px-6 py-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-gray-700 hover:text-blue-600 min-w-max cursor-pointer">
              <span className="mr-2"><CategoryCollectiblesIcon /></span>
              {translate('category_collectibles')}
            </button>
          </div>
        </div>

        {/* Auction Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-semibold">{translate('table_title')}</h2>
              <div className="flex items-center gap-2 flex-nowrap overflow-x-auto pb-2 sm:pb-0 -mx-6 sm:mx-0 px-6 sm:px-0">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${statusFilter === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {translate('all_status')}
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${statusFilter === 'pending'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                  <StatusPendingIcon />
                  {translate('status_pending')}
                </button>
                <button
                  onClick={() => setStatusFilter('bidding')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${statusFilter === 'bidding'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                >
                  <StatusBiddingIcon />
                  {translate('status_bidding')}
                </button>
                <button
                  onClick={() => setStatusFilter('ending_soon')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${statusFilter === 'ending_soon'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}
                >
                  <StatusEndingSoonIcon />
                  {translate('status_ending_soon')}
                </button>
                <button
                  onClick={() => setStatusFilter('ended')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${statusFilter === 'ended'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                >
                  <StatusEndedIcon />
                  {translate('status_ended')}
                </button>
                <button
                  onClick={() => setStatusFilter('cancelled')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                    ${statusFilter === 'cancelled'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                >
                  <StatusCancelledIcon />
                  {translate('status_cancelled')}
                </button>
              </div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">รหัส</TableHead>
                <TableHead>รายการ</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead className="text-right">ราคาเริ่มต้น</TableHead>
                <TableHead className="text-right">ราคาปัจจุบัน</TableHead>
                <TableHead className="text-center">จำนวนบิด</TableHead>
                <TableHead className="text-center">เวลาที่เหลือ</TableHead>
                <TableHead className="text-center">สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const statusInfo = getStatusInfo(item.status);
                return (
                  <TableRow key={item.id} className="hover:bg-blue-50/50 cursor-pointer transition-colors">
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell className="font-medium text-blue-600 hover:text-blue-700">{item.title}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right text-gray-600">{formatPrice(item.startPrice)}</TableCell>
                    <TableCell className="text-right font-semibold text-blue-600">
                      {formatPrice(item.currentBid)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600">
                        <UserIcon />
                        {item.bidCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600">
                        <TimeIcon />
                        {getTimeRemaining(item.endTime)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
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
