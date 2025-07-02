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
import BidPopup from '@/app/components/ui/BidPopup';
import {
  AucCategoryIcon,
  AucStartTimeIcon,
  AucEndTimeIcon,
  AucOfferIcon,
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
  decodeAuctionId,
  formatAuctionId,
  formatPriceForDisplay,
  calculateTimeRemaining,
  formatTimeRemaining,
  formatDateTime,
} from '@/app/utils/globalFunction';
import {
  connectSocket,
  joinAuction,
  leaveAuction,
  subscribeToAuctionUpdates,
  subscribeToAuctionJoined,
  unsubscribeFromAuctionUpdates,
  unsubscribeFromAuctionJoined,
} from '@/app/services/socketService';
import { useAuth } from '@/app/contexts/AuthContext';

export default function AuctionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

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

  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  // Socket states
  const [realTimeOnlineCount, setRealTimeOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

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

  // Socket useEffect
  useEffect(() => {
    if (auction && auctionId && user) {
      // Connect socket
      connectSocket();
      setIsSocketConnected(true);

      // Subscribe to auction updates
      subscribeToAuctionUpdates((data) => {
        if (data.auctionId === auctionId) {
          setRealTimeOnlineCount(data.onlineCount);
          setOnlineUsers(data.onlineUsers);
        }
      });

      subscribeToAuctionJoined((data) => {
        if (data.auctionId === auctionId) {
          setRealTimeOnlineCount(data.onlineCount);
          setOnlineUsers(data.onlineUsers);
        }
      });

      // หาข้อมูล company ของ user (ถ้ามี)
      const participantData = participants.find(
        (p) => p.user_id === user.user_id
      );

      // ทุกคนสามารถ join ได้ แต่เฉพาะ participants เท่านั้นที่จะถูกนับใน online count
      joinAuction({
        auctionId: auctionId,
        userId: user.user_id,
        userName: user.fullname || user.username,
        companyId: participantData?.company_id,
        companyName: participantData?.company_name || '',
      });

      // Cleanup function
      return () => {
        leaveAuction({ auctionId: auctionId });
        unsubscribeFromAuctionUpdates();
        unsubscribeFromAuctionJoined();
        setIsSocketConnected(false);
      };
    }
  }, [auction, auctionId, user, participants]);

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
      const [
        auctionResponse,
        participantsResponse,
        itemsResponse,
        bidsResponse,
      ] = await Promise.all([
        auctionsService.getAuctionById(auctionId),
        auctionsService.getAuctionParticipantsWithDetails(auctionId),
        auctionsService.getAuctionItems(auctionId),
        auctionsService.getAuctionBids(auctionId),
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
    // ใช้เฉพาะ real-time data จาก socket เท่านั้น
    return realTimeOnlineCount;
  };

  // เช็คว่า participant แต่ละคนออนไลน์หรือไม่
  const isParticipantOnline = (participantUserId: number): boolean => {
    return onlineUsers.some((user) => user.userId === participantUserId);
  };

  // สร้างข้อมูลสำหรับแสดงในตาราง
  const getTableData = () => {
    if (!auction) return [];

    // หาข้อมูลการเสนอราคาล่าสุดของแต่ละคน (user_id)
    const latestBidsByUser: { [userId: number]: AuctionBid } = {};

    // กรองเฉพาะสถานะ accept และจัดกลุ่มตาม user_id
    bids
      .filter((bid) => bid.status === 'accept')
      .forEach((bid) => {
        const userId = bid.user_id;
        if (
          !latestBidsByUser[userId] ||
          new Date(bid.bid_time) > new Date(latestBidsByUser[userId].bid_time)
        ) {
          latestBidsByUser[userId] = bid;
        }
      });

    // สร้างข้อมูลสำหรับแสดงในตาราง
    return participants.map((participant, index) => {
      const latestBid = latestBidsByUser[participant.user_id];

      let price = null;
      let saving = null;
      let savingRate = null;
      let status = null;
      let bidTime = null;

      if (latestBid && auction) {
        price = latestBid.bid_amount;
        saving = auction.reserve_price - latestBid.bid_amount;
        savingRate = ((saving / auction.reserve_price) * 100).toFixed(2);
        status = latestBid.status;
        bidTime = latestBid.bid_time;
      }

      return {
        participant,
        price,
        saving,
        savingRate,
        status,
        bidTime,
        isWinning:
          latestBid &&
          price ===
            Math.min(
              ...Object.values(latestBidsByUser).map((bid) => bid.bid_amount)
            ),
      };
    });
  };

  const openBidPopup = () => {
    setShowBidPopup(true);
  };

  const closeBidPopup = () => {
    setShowBidPopup(false);
  };

  const submitBid = async (bidAmount: number) => {
    if (!user || !auction) return;

    try {
      setIsSubmittingBid(true);

      // หาข้อมูล company ของ user
      const userParticipant = participants.find(
        (p) => p.user_id === user.user_id
      );

      const response = await auctionsService.placeBid({
        auction_id: auctionId,
        user_id: user.user_id,
        company_id: userParticipant?.company_id || 0,
        bid_amount: bidAmount,
      });

      if (response.success && response.message === null) {
        // เก็บตำแหน่ง scroll ปัจจุบัน
        const currentScrollPosition =
          window.pageYOffset || document.documentElement.scrollTop;

        setShowBidPopup(false);
        // รีโหลดข้อมูลหน้าใหม่
        await loadAuctionData();

        // กลับไปตำแหน่ง scroll เดิม
        setTimeout(() => {
          window.scrollTo(0, currentScrollPosition);
        }, 100);
      } else {
        alert(response.message || 'เกิดข้อผิดพลาดในการเสนอราคา');
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
      alert('เกิดข้อผิดพลาดในการเสนอราคา: ' + error);
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const canPlaceBid = () => {
    if (!auction || !user) return false;

    // ตรวจสอบสถานะการประมูล
    if (auction.status !== 3 && auction.status !== 4) return false; // สถานะ "กำลังประมูล" หรือ "ใกล้สิ้นสุด"

    // ตรวจสอบว่าผู้ใช้เป็น participant ในตารางประมูลหรือไม่
    const isUserParticipant = participants.some(
      (p) => p.user_id === user.user_id
    );

    return isUserParticipant;
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
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{auction.remark}</p>
              </div>
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
                <div className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-2">
                  {isSocketConnected ? (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live: {getOnlineParticipants()} คน
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      ไม่ได้เชื่อมต่อ
                    </span>
                  )}
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

            {/* History Button */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <button
                onClick={() => setShowHistoryPopup(true)}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                ดูประวัติการเสนอราคา
              </button>
            </div>

            {/* Bid Button */}
            {canPlaceBid() && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <button
                  onClick={openBidPopup}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  เสนอราคา
                </button>
              </div>
            )}
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
              {getTableData().length === 0 ? (
                <EmptyState
                  title="ไม่พบข้อมูล"
                  description="ไม่พบข้อมูลบริษัทที่เข้าร่วมประมูล"
                  colSpan={8}
                />
              ) : (
                getTableData().map((row, index) => {
                  const {
                    participant,
                    price,
                    saving,
                    savingRate,
                    status,
                    bidTime,
                  } = row;

                  return (
                    <TableRow
                      key={participant.id}
                      className={0 ? 'bg-yellow-100' : 'hover:bg-gray-50'}
                    >
                      <TableCell className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-yellow-500">🏆</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {isParticipantOnline(participant.user_id) ? (
                            <div
                              className="w-3 h-3 bg-green-500 rounded-full"
                              title="ออนไลน์"
                            ></div>
                          ) : (
                            <div
                              className="w-3 h-3 bg-gray-300 rounded-full"
                              title="ออฟไลน์"
                            ></div>
                          )}
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
                          {price ? formatPriceForDisplay(price) : ''}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <span
                          className={`${
                            price && price < auction.reserve_price
                              ? 'text-green-600'
                              : ''
                          }`}
                        >
                          {saving ? formatPriceForDisplay(saving) : ''}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <span
                          className={`${
                            price && price < auction.reserve_price
                              ? 'text-green-600'
                              : ''
                          }`}
                        >
                          {savingRate ? `${savingRate}%` : ''}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        {status === 'accept' ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {status || ''}
                          </span>
                        ) : status === 'reject' ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {status || ''}
                          </span>
                        ) : (
                          ''
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center text-sm text-gray-600">
                        {bidTime ? formatDateTime(bidTime) : ''}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Bid Popup */}
      <BidPopup
        isOpen={showBidPopup}
        onClose={() => setShowBidPopup(false)}
        onSubmit={submitBid}
        isLoading={isSubmittingBid}
      />

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
