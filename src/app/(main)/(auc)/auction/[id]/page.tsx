'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Container from '@/app/components/ui/Container';
import BidHistory from '@/app/components/history/BidHistory';
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
import {
  dataAuction_Participant,
  AuctionParticipant,
} from '@/app/model/dataAuction_Participant';
import { getStatusById, currencyConfig } from '@/app/model/config';
import { getCurrentDateTime } from '@/app/utils/globalFunction';
import {
  getParticipantStats,
  formatCurrency,
  formatDateForDisplay,
  safeParseDate,
  getBidTableData,
  calculateTimeRemaining,
  formatTimeRemaining,
  getLowestBid,
  getBidCount,
  getConnectionStatusText,
  getBidHistoryData,
  getBidStatsByStatus,
  getWinningBid,
  getTotalBidCount,
  getCompanyNameByUser,
} from '@/app/utils/globalFunction';

export default function AuctionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const auctionId = parseInt(params.id as string);

  const [auction, setAuction] = useState<Auction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [showBidPopup, setShowBidPopup] = useState(false);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [bidError, setBidError] = useState<string>('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

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
    return `[2024${id.toString().padStart(4, '0')}]`;
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

  // Bid handling functions
  const openBidPopup = () => {
    setBidAmount('');
    setBidError('');
    setShowBidPopup(true);
  };

  const closeBidPopup = () => {
    setShowBidPopup(false);
    setBidAmount('');
    setBidError('');
  };

  const validateBidAmount = (amount: string): string | null => {
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount)) {
      return 'กรุณาระบุจำนวนเงิน';
    }

    if (numAmount <= 0) {
      return 'จำนวนเงินต้องมากกว่า 0';
    }

    if (numAmount > (auction?.reserve_price || 0)) {
      return 'ราคาเสนอต้องไม่เกินราคาสำรอง';
    }

    const lowestBid = getLowestBid(auction?.auction_id || 0);
    if (lowestBid && numAmount >= lowestBid.bid_amount) {
      return `ราคาเสนอต้องต่ำกว่าราคาดีที่สุดปัจจุบัน (${lowestBid.bid_amount.toLocaleString(
        'th-TH'
      )} บาท)`;
    }

    return null;
  };

  const submitBid = async () => {
    if (!auction) return;

    const error = validateBidAmount(bidAmount);
    if (error) {
      setBidError(error);
      return;
    }

    setIsSubmittingBid(true);
    setBidError('');

    try {
      // จำลองการส่งข้อมูลไปยัง API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // แสดงข้อความสำเร็จ
      alert(
        `เสนอราคาสำเร็จ! จำนวน ${parseFloat(bidAmount).toLocaleString(
          'th-TH'
        )} บาท`
      );

      // ปิดป๊อปอัพและรีเฟรชข้อมูล
      closeBidPopup();
      loadAuctionData();
    } catch (error) {
      setBidError('เกิดข้อผิดพลาดในการเสนอราคา กรุณาลองใหม่');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const canPlaceBid = () => {
    return auction && (auction.status === 3 || auction.status === 4);
  };

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
                className="px-6 py-2 text-sm font-medium text-white bg-blue-400 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
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
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    หมวดหมู่
                  </label>
                  <div className="flex items-center gap-2">
                    <AucCategoryIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {auctionType?.name || '-'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
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
                    <span className="text-gray-700 font-medium">
                      {formatPrice(auction.reserve_price)}{' '}
                      {currency?.code || 'THB'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    วันเวลาเริ่มต้น
                  </label>
                  <div className="flex items-center gap-2">
                    <AucStartTimeIcon className="w-4 h-4 text-gray-700" />
                    <span className="text-gray-700">
                      {formatDateForDisplay(
                        safeParseDate(auction.start_dt),
                        true
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    วันเวลาสิ้นสุด
                  </label>
                  <div className="flex items-center gap-2">
                    <AucEndTimeIcon className="w-4 h-4 text-gray-700" />
                    <span className="text-gray-900">
                      {formatDateForDisplay(
                        safeParseDate(auction.end_dt),
                        true
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รายละเอียด
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {auction.remark || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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

            {/* Time Remaining Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                เวลาคงเหลือ
              </h3>

              {auction.status === 3 ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {timeRemaining}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    จนกว่าจะสิ้นสุดการประมูล
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-orange-600 text-sm font-medium">
                      กำลังดำเนินการ
                    </span>
                  </div>
                </div>
              ) : auction.status === 4 ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2 animate-pulse">
                    {timeRemaining}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">เวลาที่เหลือ</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-600 text-sm font-medium">
                      ใกล้สิ้นสุด!
                    </span>
                  </div>
                </div>
              ) : auction.status === 5 ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600 mb-2">
                    หมดเวลา
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    การประมูลสิ้นสุดแล้ว
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-600 text-sm font-medium">
                      สิ้นสุดแล้ว
                    </span>
                  </div>
                </div>
              ) : auction.status === 1 || auction.status === 2 ? (
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600 mb-2">
                    {formatDateForDisplay(
                      safeParseDate(auction.start_dt),
                      true
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">เวลาเริ่มประมูล</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-600 text-sm font-medium">
                      ยังไม่เริ่ม
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-2">
                    --:--:--
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    ไม่สามารถคำนวณเวลาได้
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-600 text-sm font-medium">
                      สถานะไม่ทราบ
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bidding Results Table */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2L13.09 8.26L20 9.27L15 14.14L16.18 21.02L10 17.77L3.82 21.02L5 14.14L0 9.27L6.91 8.26L10 2Z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-lg font-semibold text-gray-900">
                  ราคาดีที่สุดตอนนี้:{' '}
                  {(() => {
                    const lowestBid = getLowestBid(auction.auction_id);
                    if (lowestBid) {
                      return `${lowestBid.bid_amount.toLocaleString('th-TH')} ${
                        currency?.code || 'THB'
                      }`;
                    }
                    return 'ยังไม่มีการเสนอราคา';
                  })()}
                </span>
                {(() => {
                  const lowestBid = getLowestBid(auction.auction_id);
                  if (lowestBid) {
                    const savings =
                      auction.reserve_price - lowestBid.bid_amount;
                    const savingsRate = (savings / auction.reserve_price) * 100;
                    return (
                      <>
                        <span
                          className={`text-sm ${
                            savings > 0
                              ? 'text-green-600'
                              : savings < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          มูลค่าประหยัด {savings.toLocaleString('th-TH')}{' '}
                          {currency?.code || 'THB'}
                        </span>
                        <span
                          className={`text-sm ${
                            savingsRate > 0
                              ? 'text-green-600'
                              : savingsRate < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          อัตราประหยัด {savingsRate > 0 ? '+' : ''}
                          {savingsRate.toFixed(2)}%
                        </span>
                      </>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>

          {/* Bidding Results Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    ผลการเสนอราคา
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    รายการการเสนอราคาล่าสุดของแต่ละบริษัท
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-3">
                    {canPlaceBid() && (
                      <button
                        onClick={openBidPopup}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors shadow-sm"
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
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                        เสนอราคา
                      </button>
                    )}
                    <button
                      onClick={() => setShowHistoryPopup(true)}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      ประวัติประมูล
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-blue-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Company Name
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                      Saving
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                      Saving Rate
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                      เวลา
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getBidTableData(
                    auction.auction_id,
                    auction.reserve_price
                  ).map((bidData, index) => (
                    <tr
                      key={`${bidData.userId}-${bidData.companyId}`}
                      className={`${
                        bidData.isLowest ? 'bg-yellow-50' : 'hover:bg-gray-50'
                      } ${index === 0 ? 'bg-green-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {bidData.isLowest && (
                            <span className="inline-flex items-center p-1 mr-2">
                              <svg
                                className="w-5 h-5 text-yellow-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 14a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 7.618V16a1 1 0 11-2 0V7.618L6.237 6.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 14a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  {bidData.companyName.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {bidData.companyShortName}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      bidData.isConnected
                                        ? 'bg-green-500'
                                        : 'bg-gray-400'
                                    }`}
                                  ></div>
                                </div>
                                <span>
                                  ID:{' '}
                                  {bidData.companyId > 0
                                    ? bidData.companyId
                                    : bidData.userId}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div
                          className={`text-sm font-medium ${
                            bidData.isLowest
                              ? 'text-green-900'
                              : 'text-gray-900'
                          }`}
                        >
                          {formatCurrency(bidData.bidAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div
                          className={`text-sm font-medium ${
                            bidData.priceDifference > 0
                              ? 'text-green-600'
                              : bidData.priceDifference < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {bidData.priceDifference > 0 ? '+' : ''}
                          {formatCurrency(Math.abs(bidData.priceDifference))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div
                          className={`text-sm font-medium ${
                            bidData.percentageDifference > 0
                              ? 'text-green-600'
                              : bidData.percentageDifference < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {bidData.percentageDifference > 0 ? '+' : ''}
                          {bidData.percentageDifference.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bidData.statusColor}`}
                        >
                          {bidData.statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {formatDateForDisplay(
                          safeParseDate(bidData.bidTime),
                          true
                        )}
                      </td>
                    </tr>
                  ))}
                  {getBidTableData(auction.auction_id, auction.reserve_price)
                    .length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <svg
                            className="w-12 h-12 text-gray-300 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <p>ยังไม่มีการเสนอราคา</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Auction History Popup */}
      {showHistoryPopup && (
        <BidHistory
          isOpen={showHistoryPopup}
          onClose={() => setShowHistoryPopup(false)}
          auctionId={auction.auction_id}
          reservePrice={auction.reserve_price}
        />
      )}

      {/* Bid Popup */}
      {showBidPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                เสนอราคาประมูล
              </h2>
              <button
                onClick={closeBidPopup}
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

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">
                      ข้อมูลการประมูล
                    </span>
                  </div>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>
                      ราคาสำรอง:{' '}
                      <span className="font-semibold">
                        {formatCurrency(auction?.reserve_price || 0)}
                      </span>
                    </div>
                    {(() => {
                      const lowestBid = getLowestBid(auction?.auction_id || 0);
                      return lowestBid ? (
                        <div>
                          ราคาดีที่สุดปัจจุบัน:{' '}
                          <span className="font-semibold">
                            {formatCurrency(lowestBid.bid_amount)}
                          </span>
                        </div>
                      ) : (
                        <div>ยังไม่มีการเสนอราคา</div>
                      );
                    })()}
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="bidAmount"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    จำนวนเงินที่ต้องการเสนอ (บาท)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="bidAmount"
                      value={bidAmount}
                      onChange={(e) => {
                        setBidAmount(e.target.value);
                        setBidError('');
                      }}
                      placeholder="ระบุจำนวนเงิน"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                      disabled={isSubmittingBid}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">บาท</span>
                    </div>
                  </div>
                  {bidError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {bidError}
                    </p>
                  )}
                </div>

                {bidAmount &&
                  !isNaN(parseFloat(bidAmount)) &&
                  parseFloat(bidAmount) > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <div className="text-sm text-green-700">
                        <div className="font-medium mb-1">สรุปการเสนอราคา:</div>
                        <div>
                          จำนวนเงิน:{' '}
                          <span className="font-semibold">
                            {parseFloat(bidAmount).toLocaleString('th-TH')} บาท
                          </span>
                        </div>
                        {auction && (
                          <div>
                            ส่วนต่าง:{' '}
                            <span className="font-semibold">
                              {(
                                auction.reserve_price - parseFloat(bidAmount)
                              ).toLocaleString('th-TH')}{' '}
                              บาท
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={closeBidPopup}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmittingBid}
              >
                ยกเลิก
              </button>
              <button
                onClick={submitBid}
                disabled={isSubmittingBid || !bidAmount || bidError !== ''}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
              >
                {isSubmittingBid ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    กำลังเสนอราคา...
                  </>
                ) : (
                  'ยืนยันเสนอราคา'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
