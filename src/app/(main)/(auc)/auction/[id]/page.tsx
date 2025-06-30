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
import {
  auctionsService,
  type Auction,
  type AuctionParticipant,
  type AuctionItem,
  type AuctionBid,
} from '@/app/services/auctionsService';
import {
  getCurrentDateTime,
  decodeAuctionId,
} from '@/app/utils/globalFunction';

export default function AuctionDetailPage() {
  const router = useRouter();
  const params = useParams();

  // ใช้ decodeAuctionId จาก globalFunction
  const auctionId =
    decodeAuctionId(params.id as string) || parseInt(params.id as string);

  const [auction, setAuction] = useState<Auction | null>(null);
  const [participants, setParticipants] = useState<AuctionParticipant[]>([]);
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [bids, setBids] = useState<AuctionBid[]>([]);
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

  const loadAuctionData = async () => {
    try {
      setIsLoading(true);

      // ตรวจสอบว่า ID ถูกต้องหรือไม่
      if (isNaN(auctionId) || auctionId <= 0) {
        setError('รหัสตลาดไม่ถูกต้อง');
        return;
      }

      // ดึงข้อมูลตลาดประมูล
      const auctionResponse = await auctionsService.getAuctionById(auctionId);

      if (!auctionResponse.success || !auctionResponse.data) {
        setError('ไม่พบข้อมูลตลาดประมูลที่ต้องการ');
        return;
      }

      const auctionData = auctionResponse.data;

      // ตรวจสอบว่าตลาดถูกลบหรือไม่
      if (auctionData.is_deleted === 1) {
        setError('ตลาดประมูลนี้ถูกลบแล้ว');
        return;
      }

      setAuction(auctionData);

      // ดึงข้อมูลผู้เข้าร่วม
      const participantsResponse =
        await auctionsService.getAuctionParticipantsWithDetails(auctionId);
      if (participantsResponse.success) {
        setParticipants(participantsResponse.data);
      }

      // ดึงข้อมูลรายการสินค้า
      const itemsResponse = await auctionsService.getAuctionItems(auctionId);
      if (itemsResponse.success) {
        setItems(itemsResponse.data);
      }

      // ดึงข้อมูลการเสนอราคา
      const bidsResponse = await auctionsService.getAuctionBids(auctionId);
      if (bidsResponse.success) {
        setBids(bidsResponse.data);
      }

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

    const now = new Date();
    const endTime = new Date(auction.end_dt);
    const timeDiff = endTime.getTime() - now.getTime();

    if (timeDiff <= 0) {
      setTimeRemaining('หมดเวลา');
      return;
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    if (days > 0) {
      setTimeRemaining(`${days} วัน ${hours} ชั่วโมง ${minutes} นาที`);
    } else if (hours > 0) {
      setTimeRemaining(`${hours} ชั่วโมง ${minutes} นาที ${seconds} วินาที`);
    } else if (minutes > 0) {
      setTimeRemaining(`${minutes} นาที ${seconds} วินาที`);
    } else {
      setTimeRemaining(`${seconds} วินาที`);
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1:
        return <StatusPendingIcon />;
      case 2:
        return <AucOpenIcon />;
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
        return 'text-gray-500 bg-gray-100';
      case 2:
        return 'text-blue-600 bg-blue-100';
      case 3:
        return 'text-green-600 bg-green-100';
      case 4:
        return 'text-yellow-600 bg-yellow-100';
      case 5:
        return 'text-red-600 bg-red-100';
      case 6:
        return 'text-gray-600 bg-gray-200';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return 'รอดำเนินการ';
      case 2:
        return 'เปิดรับสมัคร';
      case 3:
        return 'กำลังประมูล';
      case 4:
        return 'ใกล้สิ้นสุด';
      case 5:
        return 'สิ้นสุดแล้ว';
      case 6:
        return 'ยกเลิก';
      default:
        return 'ไม่ทราบสถานะ';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatAuctionId = (auctionData: Auction) => {
    if (!auctionData) return '';
    const year = new Date(auctionData.created_dt).getFullYear();
    const paddedId = auctionData.auction_id.toString().padStart(4, '0');
    return `AUC${year}${paddedId}`;
  };

  const getLowestBid = () => {
    if (bids.length === 0) return null;
    const acceptedBids = bids.filter((bid) => bid.status === 'accept');
    if (acceptedBids.length === 0) return null;
    return acceptedBids.reduce((lowest, current) =>
      current.bid_amount < lowest.bid_amount ? current : lowest
    );
  };

  const getBidCount = () => {
    return bids.filter((bid) => bid.status === 'accept').length;
  };

  const getParticipantCount = () => {
    return participants.length;
  };

  const getOnlineParticipants = () => {
    return participants.filter((p) => p.is_connected).length;
  };

  const openBidPopup = () => {
    if (!canPlaceBid()) {
      alert('ไม่สามารถเสนอราคาได้ในขณะนี้');
      return;
    }
    setShowBidPopup(true);
    setBidAmount('');
    setBidError('');
  };

  const closeBidPopup = () => {
    setShowBidPopup(false);
    setBidAmount('');
    setBidError('');
  };

  const validateBidAmount = (amount: string): string | null => {
    if (!amount || amount.trim() === '') {
      return 'กรุณาระบุจำนวนเงิน';
    }

    const numericAmount = parseFloat(amount.replace(/,/g, ''));

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return 'จำนวนเงินต้องเป็นตัวเลขที่มากกว่า 0';
    }

    if (!auction) {
      return 'ไม่พบข้อมูลตลาดประมูล';
    }

    if (numericAmount >= auction.reserve_price) {
      return `จำนวนเงินต้องน้อยกว่าราคาเริ่มต้น (${formatPrice(
        auction.reserve_price
      )})`;
    }

    const lowestBid = getLowestBid();
    if (lowestBid && numericAmount >= lowestBid.bid_amount) {
      return `จำนวนเงินต้องน้อยกว่าราคาต่ำสุดปัจจุบัน (${formatPrice(
        lowestBid.bid_amount
      )})`;
    }

    return null;
  };

  const submitBid = async () => {
    if (isSubmittingBid) return;

    const validationError = validateBidAmount(bidAmount);
    if (validationError) {
      setBidError(validationError);
      return;
    }

    try {
      setIsSubmittingBid(true);
      setBidError('');

      const numericAmount = parseFloat(bidAmount.replace(/,/g, ''));

      const response = await auctionsService.createBid({
        auction_id: auctionId,
        bid_amount: numericAmount,
      });

      if (response.success) {
        alert('เสนอราคาสำเร็จ!');
        closeBidPopup();
        // รีโหลดข้อมูลการเสนอราคา
        const bidsResponse = await auctionsService.getAuctionBids(auctionId);
        if (bidsResponse.success) {
          setBids(bidsResponse.data);
        }
      } else {
        setBidError(response.message || 'เกิดข้อผิดพลาดในการเสนอราคา');
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
      setBidError('เกิดข้อผิดพลาดในการเสนอราคา');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const canPlaceBid = () => {
    return auction && auction.status === 3; // สถานะ "กำลังประมูล"
  };

  if (isLoading) {
    return (
      <Container className="py-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            เกิดข้อผิดพลาด
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ย้อนกลับ
          </button>
        </div>
      </Container>
    );
  }

  if (!auction) {
    return (
      <Container className="py-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ไม่พบข้อมูล</h2>
          <p className="text-gray-600 mb-6">ไม่พบข้อมูลตลาดประมูลที่ต้องการ</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ย้อนกลับ
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 rounded-full p-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {auction.name}
                </h1>
                <p className="text-gray-600">
                  รหัสตลาด: {formatAuctionId(auction)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  auction.status
                )}`}
              >
                {getStatusIcon(auction.status)}
                <span className="ml-2">{getStatusText(auction.status)}</span>
              </span>
              <button
                onClick={() => router.back()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>ย้อนกลับ</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Auction Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                รายละเอียดตลาดประมูล
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <AucStartTimeIcon className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">เวลาเริ่มต้น</p>
                    <p className="font-medium">
                      {new Date(auction.start_dt).toLocaleString('th-TH')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AucEndTimeIcon className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-500">เวลาสิ้นสุด</p>
                    <p className="font-medium">
                      {new Date(auction.end_dt).toLocaleString('th-TH')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AucOfferIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">ราคาเริ่มต้น</p>
                    <p className="font-medium text-blue-600">
                      {formatPrice(auction.reserve_price)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AucCategoryIcon className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">ประเภทประมูล</p>
                    <p className="font-medium">
                      ประเภท {auction.auction_type_id}
                    </p>
                  </div>
                </div>
              </div>
              {auction.remark && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{auction.remark}</p>
                </div>
              )}
            </div>

            {/* Items List */}
            {items.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  รายการสินค้า
                </h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.item_id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {item.item_name}
                          </h3>
                          {item.description && (
                            <p className="text-gray-600 text-sm mt-1">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>
                              จำนวน: {item.quantity} {item.unit}
                            </span>
                            <span>ราคาฐาน: {formatPrice(item.base_price)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bidding Results Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="bg-blue-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">
                  ผลการเสนอราคา
                </h2>
              </div>
              <div className="p-6">
                {bids.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            ลำดับ
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            บริษัท
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            ราคาเสนอ
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            เวลา
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">
                            สถานะ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bids
                          .filter((bid) => bid.status === 'accept')
                          .sort((a, b) => a.bid_amount - b.bid_amount)
                          .map((bid, index) => (
                            <tr
                              key={bid.bid_id}
                              className={index === 0 ? 'bg-yellow-50' : ''}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  {index === 0 && (
                                    <span className="text-yellow-500 mr-2">
                                      ⭐
                                    </span>
                                  )}
                                  {index + 1}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-medium text-gray-900">
                                  บริษัท {bid.company_id}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ผู้ใช้ {bid.user_id}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`font-medium ${
                                    index === 0
                                      ? 'text-green-600'
                                      : 'text-gray-900'
                                  }`}
                                >
                                  {formatPrice(bid.bid_amount)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-600">
                                {new Date(bid.bid_time).toLocaleString('th-TH')}
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ยอมรับ
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">📊</div>
                    <p className="text-gray-500">ยังไม่มีการเสนอราคา</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ผู้เข้าร่วมประมูล
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {getParticipantCount()}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  ออนไลน์ {getOnlineParticipants()} คน
                </div>
              </div>
            </div>

            {/* Time Remaining */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                เวลาคงเหลือ
              </h3>
              <div className="text-center">
                {auction.status === 3 ? (
                  <div className="text-2xl font-bold text-orange-600">
                    {timeRemaining}
                  </div>
                ) : auction.status === 5 ? (
                  <div className="text-2xl font-bold text-red-600">
                    สิ้นสุดแล้ว
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-gray-600">
                    ยังไม่เริ่ม
                  </div>
                )}
              </div>
            </div>

            {/* Current Bid Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                สถานะการเสนอราคา
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ราคาต่ำสุดปัจจุบัน:</span>
                  <span className="font-medium text-green-600">
                    {getLowestBid()
                      ? formatPrice(getLowestBid()!.bid_amount)
                      : 'ยังไม่มี'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">จำนวนการเสนอราคา:</span>
                  <span className="font-medium">{getBidCount()} ครั้ง</span>
                </div>
              </div>
            </div>

            {/* Bid Form */}
            {canPlaceBid() && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  เสนอราคา
                </h3>
                <button
                  onClick={openBidPopup}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  เสนอราคา
                </button>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600">
                    💡 ราคาเสนอต้องน้อยกว่าราคาเริ่มต้นและราคาต่ำสุดปัจจุบัน
                  </p>
                </div>
              </div>
            )}

            {/* History Button */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <button
                onClick={() => setShowHistoryPopup(true)}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                ดูประวัติการเสนอราคา
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bid Popup */}
      {showBidPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              เสนอราคา
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนเงิน (บาท)
                </label>
                <input
                  type="text"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ระบุจำนวนเงิน"
                />
                {bidError && (
                  <p className="mt-1 text-sm text-red-600">{bidError}</p>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p className="text-gray-600">
                  <strong>ราคาเริ่มต้น:</strong>{' '}
                  {formatPrice(auction.reserve_price)}
                </p>
                {getLowestBid() && (
                  <p className="text-gray-600">
                    <strong>ราคาต่ำสุดปัจจุบัน:</strong>{' '}
                    {formatPrice(getLowestBid()!.bid_amount)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeBidPopup}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={submitBid}
                disabled={isSubmittingBid}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingBid ? 'กำลังส่ง...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Popup */}
      {showHistoryPopup && (
        <BidHistory
          isOpen={showHistoryPopup}
          auctionId={auctionId}
          reservePrice={auction.reserve_price}
          onClose={() => setShowHistoryPopup(false)}
        />
      )}
    </Container>
  );
}
