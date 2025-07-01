'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Container from '@/app/components/ui/Container';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/AucTable';
import EmptyState from '@/app/components/ui/EmptyState';
import BidHistory from '@/app/components/history/BidHistory';
import {
  AucCategoryIcon,
  AucStartTimeIcon,
  AucEndTimeIcon,
  AucOfferIcon,
  AucUserIcon,
  AucBalanceIcon,
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
  auctionTypeService,
  type AuctionType,
} from '@/app/services/auctionTypeService';
import {
  statusConfig,
  getStatusById,
  currencyConfig,
} from '@/app/model/config';
import {
  getCurrentDateTime,
  decodeAuctionId,
  formatAuctionId,
  formatPrice,
  formatPriceForDisplay,
  calculateTimeRemaining,
  formatTimeRemaining,
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
  const [auctionTypes, setAuctionTypes] = useState<AuctionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [showBidPopup, setShowBidPopup] = useState(false);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [bidError, setBidError] = useState<string>('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([loadAuctionTypes(), loadAuctionData()]);
    };

    initializeData();
  }, [auctionId]);

  useEffect(() => {
    if (auction && auction.status === 3) {
      const timer = setInterval(() => {
        updateTimeRemaining();
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [auction]);

  const loadAuctionTypes = async () => {
    try {
      const response = await auctionTypeService.getActiveAuctionTypes();
      if (response.success && response.message === null) {
        setAuctionTypes(response.data);
      } else {
        console.error('Error loading auction types:', response.message);
        setAuctionTypes([]);
      }
    } catch (error) {
      console.error('Error loading auction types:', error);
      setAuctionTypes([]);
    }
  };

  const loadAuctionData = async () => {
    try {
      setIsLoading(true);

      // ตรวจสอบว่า ID ถูกต้องหรือไม่
      if (isNaN(auctionId) || auctionId <= 0) {
        setError('รหัสตลาดไม่ถูกต้อง');
        return;
      }

      // ดึงข้อมูลทั้งหมดพร้อมกัน
      const [auctionResponse, participantsResponse, itemsResponse] =
        await Promise.all([
          auctionsService.getAuctionById(auctionId),
          auctionsService.getAuctionParticipantsWithDetails(auctionId),
          auctionsService.getAuctionItems(auctionId),
        ]);

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

      // ตั้งค่าข้อมูลอื่นๆ
      if (participantsResponse.success) {
        setParticipants(participantsResponse.data);
      }

      if (itemsResponse.success) {
        setItems(itemsResponse.data);
      }

      // Mock bids data since API doesn't exist yet
      setBids([]);

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

    const timeData = calculateTimeRemaining(auction.end_dt);

    if (timeData.isExpired) {
      setTimeRemaining('หมดเวลา');
      return;
    }

    setTimeRemaining(formatTimeRemaining(timeData));
  };

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

  const getAuctionTypeName = (auctionTypeId: number): string => {
    const auctionType = auctionTypes.find((type) => type.id === auctionTypeId);
    return auctionType ? auctionType.name : `ประเภท ${auctionTypeId}`;
  };

  const getCurrencyName = (currencyId: number): string => {
    const currency = currencyConfig[currencyId as keyof typeof currencyConfig];
    return currency ? currency.code : '';
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

  // ใช้ formatPrice จาก globalFunction.ts แทน

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-blue-50 p-3 rounded-xl">
                <AucBalanceIcon className="text-blue-600" />
              </div>
              <div className="flex flex-col justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {auction.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  รหัสตลาด: {formatAuctionId(auction.auction_id)}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => router.back()}
                className="flex text-sm font-medium items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors"
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
                ย้อนกลับ
              </button>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  getStatusDisplay(auction.status).color
                } ${getStatusDisplay(auction.status).bgColor}`}
              >
                {getStatusIcon(auction.status)}
                <span className="ml-2">
                  {getStatusDisplay(auction.status).text}
                </span>
              </span>
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
                    <p className="text-sm text-gray-500">ราคาประกัน</p>
                    <p className="font-medium">
                      {formatPriceForDisplay(auction.reserve_price)}{' '}
                      {getCurrencyName(auction.currency)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AucCategoryIcon className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">ประเภท</p>
                    <p className="font-medium">
                      {getAuctionTypeName(auction.auction_type_id)}
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
                            <span>
                              ราคา/หน่วย:{' '}
                              {formatPriceForDisplay(item.base_price)}{' '}
                              {getCurrencyName(auction.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

        {/* Bidding Results Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden mt-6">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[5%] min-w-[50px] max-w-[80px] text-center">
                  <div className="flex items-center justify-center gap-2">
                    ...
                  </div>
                </TableHead>
                <TableHead className="w-[5%] min-w-[200px] max-w-[400px]">
                  <div className="flex items-center justify-center gap-2">
                    ...
                  </div>
                </TableHead>
                <TableHead className="w-[25%] min-w-[100px] max-w-[150px]">
                  <div className="flex items-center gap-2">บริษัท</div>
                </TableHead>
                <TableHead className="w-[15%] min-w-[120px] max-w-[180px] text-center">
                  <div className="flex items-center justify-center gap-2">
                    ราคา
                  </div>
                </TableHead>
                <TableHead className="w-[15%] min-w-[120px] max-w-[180px] text-center">
                  <div className="flex items-center justify-center gap-2">
                    ประหยัด
                  </div>
                </TableHead>
                <TableHead className="w-[15%] min-w-[80px] max-w-[100px] text-center">
                  <div className="flex items-center justify-center gap-2">
                    อัตราประหยัด
                  </div>
                </TableHead>
                <TableHead className="w-[10%] min-w-[80px] max-w-[120px] text-center">
                  <div className="flex items-center justify-center gap-2">
                    สถานะ
                  </div>
                </TableHead>
                <TableHead className="w-[15%] min-w-[90px] max-w-[130px] text-center">
                  <div className="flex items-center justify-center gap-2">
                    เวลา
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.length === 0 ? (
                <EmptyState
                  title="ไม่พบข้อมูล"
                  description="ไม่พบข้อมูลบริษัทที่เข้าร่วมประมูล"
                  colSpan={8}
                />
              ) : (
                participants.map((participant, index) => {
                  // Mock data for price, saving, etc. since participants don't have bid data
                  const mockPrice = auction.reserve_price * 0.9; // ราคาเสนอ 90% ของราคาเริ่มต้น
                  const saving = auction.reserve_price - mockPrice;
                  const savingRate = (
                    (saving / auction.reserve_price) *
                    100
                  ).toFixed(2);
                  const isWinning = index === 0;

                  return (
                    <TableRow
                      key={participant.id}
                      className={
                        isWinning ? 'bg-yellow-100' : 'hover:bg-gray-50'
                      }
                    >
                      <TableCell className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isWinning && (
                            <span className="text-yellow-500">🏆</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {participant.is_connected ? (
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center">
                          <div>
                            <div className="font-medium text-gray-900">
                              {participant.company_name ||
                                `บริษัท ${participant.company_id}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {participant.user_name ||
                                `ผู้ใช้ ${participant.user_id}`}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <span className="font-medium">
                          {formatPriceForDisplay(mockPrice)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <span className="text-green-600">
                          {formatPriceForDisplay(saving)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center"></TableCell>
                      <TableCell className="py-3 px-4 text-center"></TableCell>
                      <TableCell className="py-3 px-4 text-center text-sm text-gray-600"></TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
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
