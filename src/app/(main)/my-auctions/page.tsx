'use client';

import Container from '@/app/components/ui/Container';
import { useState } from 'react';
import GavelIcon from '@mui/icons-material/Gavel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';

interface MyAuction {
  id: string;
  title: string;
  imageUrl: string;
  currentBid: number;
  myBid: number;
  endTime: string;
  status: 'winning' | 'losing' | 'ended' | 'pending';
}

export default function MyAuctionsPage() {
  const [activeTab, setActiveTab] = useState<'participating' | 'created'>('participating');
  
  const myAuctions: MyAuction[] = [
    {
      id: '1',
      title: 'iPhone 15 Pro Max',
      imageUrl: '/images/iphone.jpg',
      currentBid: 35000,
      myBid: 34000,
      endTime: '2024-03-25 15:00:00',
      status: 'losing'
    },
    {
      id: '2',
      title: 'PlayStation 5',
      imageUrl: '/images/ps5.jpg',
      currentBid: 15000,
      myBid: 15000,
      endTime: '2024-03-24 18:00:00',
      status: 'winning'
    },
    {
      id: '3',
      title: 'MacBook Pro M3',
      imageUrl: '/images/macbook.jpg',
      currentBid: 45000,
      myBid: 42000,
      endTime: '2024-03-23 12:00:00',
      status: 'ended'
    },
    {
      id: '4',
      title: 'iPad Pro 2023',
      imageUrl: '/images/ipad.jpg',
      currentBid: 25000,
      myBid: 25000,
      endTime: '2024-03-26 20:00:00',
      status: 'pending'
    }
  ];

  const getStatusColor = (status: MyAuction['status']) => {
    switch (status) {
      case 'winning':
        return 'text-green-600';
      case 'losing':
        return 'text-red-600';
      case 'ended':
        return 'text-gray-600';
      case 'pending':
        return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: MyAuction['status']) => {
    switch (status) {
      case 'winning':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'losing':
        return <GavelIcon className="h-5 w-5" />;
      case 'ended':
        return <AccessTimeIcon className="h-5 w-5" />;
      case 'pending':
        return <PendingIcon className="h-5 w-5" />;
    }
  };

  const getStatusText = (status: MyAuction['status']) => {
    switch (status) {
      case 'winning':
        return 'กำลังชนะ';
      case 'losing':
        return 'มีคนประมูลสูงกว่า';
      case 'ended':
        return 'สิ้นสุดการประมูล';
      case 'pending':
        return 'รอการประมูล';
    }
  };

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">ประมูลของฉัน</h1>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <SortIcon className="h-5 w-5 text-gray-600" />
            <span>เรียงลำดับ</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <FilterListIcon className="h-5 w-5 text-gray-600" />
            <span>กรอง</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('participating')}
          className={`pb-4 px-4 font-medium ${
            activeTab === 'participating'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          กำลังเข้าร่วม
        </button>
        <button
          onClick={() => setActiveTab('created')}
          className={`pb-4 px-4 font-medium ${
            activeTab === 'created'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          รายการที่สร้าง
        </button>
      </div>

      {/* Auction Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myAuctions.map((auction) => (
          <div key={auction.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              <img
                src={auction.imageUrl}
                alt={auction.title}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{auction.title}</h3>
              
              <div className="flex items-center gap-2 mb-2">
                <LocalOfferIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">ราคาปัจจุบัน:</span>
                <span className="font-medium text-gray-900">{auction.currentBid.toLocaleString()} บาท</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <GavelIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">ราคาที่คุณประมูล:</span>
                <span className="font-medium text-gray-900">{auction.myBid.toLocaleString()} บาท</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <AccessTimeIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">สิ้นสุด:</span>
                <span className="text-sm text-gray-900">{new Date(auction.endTime).toLocaleString('th-TH')}</span>
              </div>

              <div className={`flex items-center gap-2 ${getStatusColor(auction.status)}`}>
                {getStatusIcon(auction.status)}
                <span className="font-medium">{getStatusText(auction.status)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
} 