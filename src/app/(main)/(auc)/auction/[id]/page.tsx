'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Container from '@/app/components/ui/Container';
import {
  AucCategoryIcon,
  AucStartTimeIcon,
  AucEndTimeIcon,
  AucOfferIcon,
  AucUserIcon,
  StatusBiddingIcon,
  StatusEndingSoonIcon,
  StatusEndedIcon,
  StatusCancelledIcon,
  StatusPendingIcon,
  AucOpenIcon,
} from '@/app/components/ui/Icons';
import { dataAuction, Auction } from '@/app/model/dataAuction';
import { dataAuction_Type } from '@/app/model/dataAuction_Type';
import { dataAuction_Item } from '@/app/model/dataAuction_Item';
import { dataAuction_Participant } from '@/app/model/dataAuction_Participant';
import { getStatusById, currencyConfig } from '@/app/model/dataConfig';
import {
  formatDateForDisplay,
  safeParseDate,
  getCurrentDateTime,
  getParticipantStats,
  getConnectionStatusText,
} from '@/app/utils/globalFunction';

export default function AuctionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const auctionId = parseInt(params.id as string);

  const [auction, setAuction] = useState<Auction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    loadAuctionData();
  }, [auctionId]);

  useEffect(() => {
    if (auction && auction.status === 3) {
      const timer = setInterval(() => {
        updateTimeRemaining();
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [auction]);

  const loadAuctionData = () => {
    try {
      setIsLoading(true);

      // ตรวจสอบว่า ID ถูกต้องหรือไม่
      if (isNaN(auctionId) || auctionId <= 0) {
        setError('รหัสตลาดไม่ถูกต้อง');
        return;
      }

      // ค้นหาข้อมูลตลาดประมูล
      const auctionData = dataAuction.find((a) => a.auction_id === auctionId);

      if (!auctionData) {
        setError('ไม่พบข้อมูลตลาดประมูลที่ต้องการ');
        return;
      }

      // ตรวจสอบว่าตลาดถูกลบหรือไม่
      if (auctionData.is_deleted === 1) {
        setError('ตลาดประมูลนี้ถูกลบแล้ว');
        return;
      }

      setAuction(auctionData);
      setError('');
    } catch (err) {
      console.error('Error loading auction data:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTimeRemaining = () => {
    if (!auction) return;

    const endTime = safeParseDate(auction.end_dt);
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeRemaining('สิ้นสุดแล้ว');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      setTimeRemaining(`${days} วัน ${hours} ชั่วโมง ${minutes} นาที`);
    } else if (hours > 0) {
      setTimeRemaining(`${hours} ชั่วโมง ${minutes} นาที ${seconds} วินาที`);
    } else {
      setTimeRemaining(`${minutes} นาที ${seconds} วินาที`);
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1:
        return <AucOpenIcon />;
      case 2:
        return <StatusPendingIcon />;
      case 3:
        return <StatusBiddingIcon />;
      case 4:
        return <StatusEndingSoonIcon />;
      case 5:
        return <StatusEndedIcon />;
      case 6:
        return <StatusCancelledIcon />;
      default:
        return <StatusPendingIcon />;
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return 'text-green-600 bg-green-50';
      case 2:
        return 'text-yellow-600 bg-yellow-50';
      case 3:
        return 'text-blue-600 bg-blue-50';
      case 4:
        return 'text-orange-600 bg-orange-50';
      case 5:
        return 'text-gray-600 bg-gray-50';
      case 6:
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('th-TH');
  };

  const formatAuctionId = (id: number) => {
    const currentYear = new Date().getFullYear();
    const paddedId = id.toString().padStart(4, '0');
    return `[${currentYear}${paddedId}]`;
  };

  // ดึงข้อมูลเพิ่มเติม
  const auctionType = auction
    ? dataAuction_Type.find(
        (t) => t.auction_type_id === auction.auction_type_id
      )
    : null;
  const auctionItems = auction
    ? dataAuction_Item.filter((item) => item.auction_id === auction.auction_id)
    : [];
  const participantStats = auction
    ? getParticipantStats(auction.auction_id)
    : {
        total: 0,
        online: 0,
        offline: 0,
        participants: [],
      };
  const currency = auction
    ? currencyConfig[auction.currency as keyof typeof currencyConfig]
    : null;
  const statusInfo = auction ? getStatusById(auction.status) : null;

  if (isLoading) {
    return (
      <Container className="py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูลตลาดประมูล...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !auction) {
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
              ไม่พบข้อมูลตลาดประมูล
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/auctions')}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                กลับไปหน้ารายการตลาด
              </button>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-8 h-8 text-blue-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {auction.name}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    รหัสตลาด: {formatAuctionId(auction.auction_id)}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  auction.status
                )}`}
              >
                {getStatusIcon(auction.status)}
                {statusInfo?.description || 'ไม่ทราบสถานะ'}
              </div>
            </div>

            <button
              onClick={() => router.push('/auctions')}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Auction Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AucOfferIcon className="w-5 h-5 text-blue-600" />
                รายละเอียดตลาดประมูล
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    หมวดหมู่
                  </label>
                  <div className="flex items-center gap-2">
                    <AucCategoryIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">
                      {auctionType?.name || '-'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ราคาประกัน
                  </label>
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
                    <span className="text-gray-900 font-medium">
                      {formatPrice(auction.reserve_price)}{' '}
                      {currency?.code || 'THB'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วันเวลาเริ่มต้น
                  </label>
                  <div className="flex items-center gap-2">
                    <AucStartTimeIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">
                      {formatDateForDisplay(
                        safeParseDate(auction.start_dt),
                        true
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วันเวลาสิ้นสุด
                  </label>
                  <div className="flex items-center gap-2">
                    <AucEndTimeIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">
                      {formatDateForDisplay(
                        safeParseDate(auction.end_dt),
                        true
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {auction.remark && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หมายเหตุ
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {auction.remark}
                  </p>
                </div>
              )}
            </div>

            {/* Auction Items */}
            {auctionItems.length > 0 && (
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
                      d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                  รายการสินค้าในตลาด
                </h2>

                <div className="space-y-4">
                  {auctionItems.map((item) => (
                    <div
                      key={item.item_id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">
                          {item.item_name}
                        </h3>
                        <span className="text-sm font-medium text-blue-600">
                          {formatPrice(item.base_price)}{' '}
                          {currency?.code || 'THB'}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-gray-600 text-sm mb-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          จำนวน: {formatPrice(item.quantity)} {item.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Time Remaining */}
            {auction.status === 3 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-orange-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  เวลาที่เหลือ
                </h3>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {timeRemaining}
                  </div>
                  <p className="text-sm text-gray-600">
                    จนกว่าจะสิ้นสุดการประมูล
                  </p>
                </div>
              </div>
            )}

            {/* Participants */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AucUserIcon className="w-5 h-5 text-blue-600" />
                ผู้เข้าร่วมประมูล
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {participantStats.total}
                  </div>
                  <p className="text-sm text-gray-600">ผู้ลงทะเบียนแล้ว</p>
                </div>

                {/* Online Status */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">ออนไลน์</span>
                    </div>
                    <span className="font-medium text-green-600">
                      {participantStats.online}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-600">ออฟไลน์</span>
                    </div>
                    <span className="font-medium text-gray-600">
                      {participantStats.offline}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants List */}
            {participantStats.participants.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                    />
                  </svg>
                  รายชื่อผู้เข้าร่วม
                </h3>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {participantStats.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              participant.is_connected
                                ? 'bg-green-500'
                                : 'bg-gray-400'
                            }`}
                          ></div>
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {participant.user_id.toString().slice(-2)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            ผู้ใช้ #{participant.user_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            เข้าร่วมเมื่อ:{' '}
                            {formatDateForDisplay(
                              safeParseDate(participant.joined_dt),
                              true
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            participant.is_connected
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {getConnectionStatusText(participant.is_connected)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                การดำเนินการ
              </h3>
              <div className="space-y-3">
                {auction.status === 1 || auction.status === 2 ? (
                  <button className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors">
                    ลงทะเบียนเข้าร่วมประมูล
                  </button>
                ) : auction.status === 3 ? (
                  <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                    เข้าร่วมประมูล
                  </button>
                ) : null}

                <button
                  onClick={() =>
                    router.push(`/auctionform?id=${auction.auction_id}`)
                  }
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  แก้ไขตลาด
                </button>
              </div>
            </div>

            {/* Auction Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ข้อมูลเพิ่มเติม
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">สร้างเมื่อ:</span>
                  <span className="text-gray-900">
                    {formatDateForDisplay(
                      safeParseDate(auction.created_dt),
                      true
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">อัพเดทล่าสุด:</span>
                  <span className="text-gray-900">
                    {formatDateForDisplay(
                      safeParseDate(auction.updated_dt),
                      true
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">สกุลเงิน:</span>
                  <span className="text-gray-900">
                    {currency?.description || 'ไม่ระบุ'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
