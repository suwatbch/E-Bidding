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
import CustomAlert from '@/app/components/ui/CustomAlert';
import {
  AucCategoryIcon,
  AucStartTimeIcon,
  AucEndTimeIcon,
  AucOfferIcon,
  AucBalanceIcon,
  AucOpenIcon,
  AucPendingIcon,
  AucBiddingIcon,
  AucEndingSoonIcon,
  AucEndedIcon,
  AucCancelledIcon,
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
import { getStatusById, currencyConfig } from '@/app/model/config';
import {
  decodeAuctionId,
  formatAuctionId,
  formatPriceForDisplay,
  formatDateTime,
  getPriceColor,
} from '@/app/utils/globalFunction';
import {
  connectSocket,
  joinAuction,
  leaveAuction,
  subscribeToAuctionUpdates,
  subscribeToAuctionJoined,
  unsubscribeFromAuctionUpdates,
  unsubscribeFromAuctionJoined,
  subscribeToBidUpdates,
  unsubscribeFromBidUpdates,
  subscribeToBidStatusUpdates,
  unsubscribeFromBidStatusUpdates,
  subscribeToAuctionStatusUpdates,
  unsubscribeFromAuctionStatusUpdates,
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
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  // Custom Alert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Socket states
  const [realTimeOnlineCount, setRealTimeOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Alert states for auction notifications
  const [hasShownStartAlert, setHasShownStartAlert] = useState(false);
  const [hasShownEndingSoonAlert, setHasShownEndingSoonAlert] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [initialStatus, setInitialStatus] = useState<number | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([loadAuctionTypes(), loadAuctionData()]);
    };

    // รีเซ็ต alert states เมื่อเปลี่ยนประมูล
    setHasShownStartAlert(false);
    setHasShownEndingSoonAlert(false);
    setIsCountingDown(false);
    setInitialStatus(null);

    initializeData();
  }, [auctionId]);

  // useEffect สำหรับ alert เมื่อสถานะเปลี่ยน
  useEffect(() => {
    if (!auction || !user || user.type === 'admin' || initialStatus === null)
      return;

    // แจ้งเตือนเริ่มประมูล (เฉพาะคนที่เข้ามาตอนสถานะ 2)
    if (auction.status === 3 && !hasShownStartAlert && initialStatus === 2) {
      alert('การประมูลได้เริ่มต้นแล้ว สามารถเสนอราคาได้เลย');
      setHasShownStartAlert(true);
    }

    // แจ้งเตือนใกล้สิ้นสุด (เฉพาะคนที่เข้ามาก่อนสถานะ 4)
    if (auction.status === 4 && !hasShownEndingSoonAlert && initialStatus < 4) {
      alert('การประมูลใกล้จะสิ้นสุดแล้ว');
      setHasShownEndingSoonAlert(true);
    }
  }, [
    auction?.status,
    user,
    initialStatus,
    hasShownStartAlert,
    hasShownEndingSoonAlert,
  ]);

  useEffect(() => {
    if (auction) {
      const timer = setInterval(() => {
        updateTimeRemaining();
      }, 1000);

      // เรียกครั้งแรกทันที
      updateTimeRemaining();

      return () => clearInterval(timer);
    }
  }, [auction, currentTime]);

  // Real-time clock update for bid button availability
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

      // Subscribe to bid updates
      subscribeToBidUpdates((data) => {
        if (data.auctionId === auctionId) {
          // เพิ่มการ bid ใหม่เข้าไปใน bids array
          setBids((prevBids) => {
            const newBid = {
              ...data.bidData,
              // ใช้ bid_id จาก server ไม่ต้องสร้างใหม่
            };
            return [newBid, ...prevBids];
          });
        }
      });

      // Subscribe to bid status updates (reject, cancel, etc.)
      subscribeToBidStatusUpdates((data) => {
        if (data.auctionId === auctionId) {
          // อัปเดทสถานะ bid ที่ถูก reject
          setBids((prevBids) => {
            return prevBids.map((bid) => {
              if (bid.bid_id === data.bidId) {
                return { ...bid, status: data.status };
              }
              return bid;
            });
          });
        }
      });

      // รับฟังการอัปเดทสถานะประมูล
      const unsubscribeFromStatusUpdates = subscribeToAuctionStatusUpdates(
        (data: { auctionId: number; status: number }) => {
          if (data.auctionId === auctionId) {
            setAuction((prev) =>
              prev ? { ...prev, status: data.status } : null
            );
          }
        }
      );

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
        unsubscribeFromBidUpdates();
        unsubscribeFromBidStatusUpdates();
        unsubscribeFromAuctionStatusUpdates();
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

      // บันทึกสถานะเริ่มต้นเพื่อใช้ในการเช็ค alert
      if (initialStatus === null) {
        setInitialStatus(auctionData.status);
      }

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

    const startTime = new Date(auction.start_dt);
    const endTime = new Date(auction.end_dt);

    // ถ้าเป็น status 1 (ดราฟ) ไม่ต้องนับถอยหลัง
    if (auction.status === 1) {
      setTimeRemaining('ยังไม่พร้อมประมูล');
      setIsCountingDown(false);
      return;
    }

    // ถ้าเป็น status 6 (ยกเลิก) ไม่ต้องนับถอยหลัง
    if (auction.status === 6) {
      setTimeRemaining('ยกเลิก');
      setIsCountingDown(false);
      return;
    }

    // ถ้ายังไม่เริ่ม
    if (currentTime < startTime) {
      setTimeRemaining(`ยังไม่เริ่ม`);
      setIsCountingDown(false);
      return;
    }

    // ถ้าสิ้นสุดแล้ว
    if (currentTime >= endTime) {
      setTimeRemaining('สิ้นสุดแล้ว');
      setIsCountingDown(false);
      // อัปเดทสถานะเป็น 5 (สิ้นสุดแล้ว)
      if (auction.status == 4) {
        updateAuctionStatusToEndingSoon(5);
      }
      return;
    }

    // ถ้ากำลังประมูล - แสดงเวลาที่เหลือ
    const diffMs = endTime.getTime() - currentTime.getTime();
    setIsCountingDown(true); // ตั้งค่าว่ากำลังนับถอยหลัง

    // คำนวณหน่วยเวลาต่างๆ
    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    const seconds = totalSeconds % 60;
    const minutes = totalMinutes % 60;
    const hours = totalHours % 24;

    // การเข้าฟังก์ชันนี้ได้ แสดงว่าอยู่ในช่วงประมูล
    // หากสถานะ = 2 (รอการประมูล) ให้อัปเดทเป็น 3 (กำลังประมูล)
    if (auction.status === 2) {
      updateAuctionStatusToEndingSoon(3);
    }
    // เช็คว่าเหลือเวลา 2 นาทีหรือไม่ และสถานะเป็น 3
    else if (totalMinutes <= 2 && auction.status === 3) {
      updateAuctionStatusToEndingSoon(4);
    }

    // จัดรูปแบบการแสดงเวลา
    let timeDisplay = '';

    if (totalDays > 30) {
      // มากกว่า 30 วัน - แสดงแค่วัน
      timeDisplay = `${totalDays} วัน`;
    } else if (totalDays > 0) {
      // 1-30 วัน - แสดงวัน + ชั่วโมง:นาที:วินาที
      timeDisplay = `${totalDays} วัน ${hours
        .toString()
        .padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    } else if (totalHours > 0) {
      // มีชั่วโมง - แสดง ชั่วโมง:นาที:วินาที
      timeDisplay = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      // น้อยกว่าชั่วโมง - แสดง นาที:วินาที
      timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    }

    setTimeRemaining(timeDisplay);
  };

  // ฟังก์ชันอัปเดทสถานะประมูล
  const updateAuctionStatusToEndingSoon = async (newStatus: number) => {
    try {
      const response = await auctionsService.updateAuctionStatus(
        auctionId,
        newStatus
      );
      if (response.success && response.message === null) {
        // อัปเดท auction state local
        setAuction((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (error) {
      console.error('Error updating auction status:', error);
    }
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
    const statusDisplay = getStatusDisplay(status);
    const iconClass = statusDisplay.color; // ใช้สีจาก getStatusDisplay

    switch (status) {
      case 1:
        return <AucPendingIcon className={iconClass} />;
      case 2:
        return <AucOpenIcon className={iconClass} />;
      case 3:
        return <AucBiddingIcon className={iconClass} />;
      case 4:
        return <AucEndingSoonIcon className={iconClass} />;
      case 5:
        return <AucEndedIcon className={iconClass} />;
      case 6:
        return <AucCancelledIcon className={iconClass} />;
      default:
        return <AucPendingIcon className={iconClass} />;
    }
  };

  // ใช้ formatPrice จาก globalFunction.ts แทน

  // ฟังก์ชันหาข้อมูลการเสนอราคาที่ดีที่สุด (ใช้ logic เดียวกับ getTableData)
  const getBestBidInfo = () => {
    if (!auction || bids.length === 0) return null;

    // หาข้อมูลการเสนอราคาล่าสุดของแต่ละคน (user_id) - เหมือน getTableData
    const latestBidsByUser: { [userId: number]: AuctionBid } = {};

    // กรองเฉพาะสถานะ accept และจัดกลุ่มตาม user_id
    const acceptedBids = bids.filter((bid) => bid.status === 'accept');

    acceptedBids.forEach((bid) => {
      const userId = bid.user_id;
      if (
        !latestBidsByUser[userId] ||
        bid.bid_id > latestBidsByUser[userId].bid_id
      ) {
        latestBidsByUser[userId] = bid;
      }
    });

    // หาราคาต่ำสุดจาก bid ล่าสุดของแต่ละคน
    const latestAcceptedBids = Object.values(latestBidsByUser);

    if (latestAcceptedBids.length === 0) {
      // ถ้าไม่มี bid ที่ accept แต่มี bid อยู่ แสดงว่ามีการเสนอราคาแล้ว
      const allBidAmounts = bids.map((bid) => bid.bid_amount);
      const lowestAmount = Math.min(...allBidAmounts);
      const savingAmount = auction.reserve_price - lowestAmount;
      const savingPercentage = (
        (savingAmount / auction.reserve_price) *
        100
      ).toFixed(2);

      return {
        amount: lowestAmount,
        savingAmount,
        savingPercentage,
        isAccepted: false,
        currency: getCurrencyName(auction.currency),
        reservePrice: auction.reserve_price,
      };
    }

    // หาราคาต่ำสุดจาก bid ล่าสุดของแต่ละคน
    const lowestBid = latestAcceptedBids.reduce((lowest, current) =>
      current.bid_amount < lowest.bid_amount ? current : lowest
    );

    const savingAmount = auction.reserve_price - lowestBid.bid_amount;
    const savingPercentage = (
      (savingAmount / auction.reserve_price) *
      100
    ).toFixed(2);

    return {
      amount: lowestBid.bid_amount,
      savingAmount,
      savingPercentage,
      isAccepted: true,
      currency: getCurrencyName(auction.currency),
      reservePrice: auction.reserve_price,
      bidData: lowestBid,
    };
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

    // หาข้อมูลการเสนอราคาล่าสุดที่ยัง accept อยู่ของแต่ละคน (user_id)
    const latestAcceptedBidsByUser: { [userId: number]: AuctionBid } = {};

    // กรองเฉพาะ bid ที่ accept ก่อน
    const acceptedBids = bids.filter((bid) => bid.status === 'accept');

    // จากข้อมุล accepted bids หา bid ที่มี bid_id ล่าสุดของแต่ละ user
    acceptedBids.forEach((bid) => {
      const userId = bid.user_id;
      if (
        !latestAcceptedBidsByUser[userId] ||
        bid.bid_id > latestAcceptedBidsByUser[userId].bid_id
      ) {
        latestAcceptedBidsByUser[userId] = bid;
      }
    });

    // TEST: ตรวจสอบ logic สำหรับ User ID 12 เฉพาะครั้งแรก
    if (Object.keys(latestAcceptedBidsByUser).length > 0) {
      const user12Bids = bids.filter((b) => b.user_id === 12);
      const user12AcceptedBids = user12Bids.filter(
        (b) => b.status === 'accept'
      );
      const user12LatestAccepted = latestAcceptedBidsByUser[12];
    }

    // ใช้ getBestBidInfo() เพื่อหาราคาที่ดีที่สุด
    const bestBidInfo = getBestBidInfo();
    const lowestPrice = bestBidInfo?.amount || null;

    // สร้างข้อมูลสำหรับแสดงในตาราง - แสดงทุกคนที่เข้าร่วมประมูล
    const tableData = participants.map((participant, index) => {
      const latestAcceptedBid = latestAcceptedBidsByUser[participant.user_id];

      let price = null;
      let saving = null;
      let savingRate = null;
      let status = null;
      let bidTime = null;

      if (latestAcceptedBid && auction) {
        price = latestAcceptedBid.bid_amount;
        saving = auction.reserve_price - price;
        savingRate = ((saving / auction.reserve_price) * 100).toFixed(2);
        status = latestAcceptedBid.status;
        bidTime = latestAcceptedBid.bid_time;

        // ถ้าราคาเท่ากับราคาประกัน ให้ saving = 0
        if (price === auction.reserve_price) {
          saving = 0;
          savingRate = '0.00';
        }
      }

      const isWinning =
        latestAcceptedBid &&
        lowestPrice !== null &&
        Number(price) === Number(lowestPrice);

      return {
        participant,
        price,
        saving,
        savingRate,
        status,
        bidTime,
        isWinning,
      };
    });

    return tableData;
  };

  const openBidPopup = () => {
    setShowBidPopup(true);
  };

  const closeBidPopup = () => {
    setShowBidPopup(false);
  };

  // Auto-close BidPopup when auction time expires
  useEffect(() => {
    if (showBidPopup && !canPlaceBid()) {
      setShowBidPopup(false);
    }
  }, [showBidPopup, currentTime, auction, user, participants]);

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
        setShowBidPopup(false);
        // ไม่ต้องรีโหลดข้อมูล เพราะ Socket จะอัปเดตให้อัตโนมัติแล้ว
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

    // ตรวจสอบช่วงเวลาการประมูล (ใช้ currentTime state ที่ update ทุกวินาที)
    const startTime = new Date(auction.start_dt);
    const endTime = new Date(auction.end_dt);

    // เวลาปัจจุบันต้องมากกว่าเวลาเริ่มต้นและน้อยกว่าเวลาสิ้นสุด
    if (currentTime < startTime || currentTime >= endTime) return false;

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
                      {formatDateTime(auction.start_dt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AucEndTimeIcon className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-500">เวลาสิ้นสุด</p>
                    <p className="font-medium">
                      {formatDateTime(auction.end_dt)}
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
                <div className="text-2xl font-bold text-orange-600">
                  {timeRemaining}
                </div>
              </div>
            </div>

            {/* History Button */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <button
                onClick={() => setShowHistoryPopup(true)}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
              >
                📊 ดูประวัติการเสนอราคา
              </button>
            </div>

            {/* Bid Button */}
            {canPlaceBid() && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <button
                  onClick={openBidPopup}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  💰 เสนอราคา
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bidding Results Table */}
        <div className="mt-6">
          {/* Best Bid Display */}
          {(() => {
            const bestBidInfo = getBestBidInfo();
            if (!bestBidInfo) return null;

            return (
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
                  <div className="flex items-center gap-1">
                    <span className="text-md font-semibold text-gray-700">
                      ราคาที่ดีที่สุดขณะนี้:
                    </span>
                    <span
                      className={`text-md font-semibold ${getPriceColor(
                        bestBidInfo.amount,
                        auction.reserve_price
                      )}`}
                    >
                      {formatPriceForDisplay(bestBidInfo.amount)}{' '}
                      {bestBidInfo.currency}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500">ประหยัด:</span>
                    <span
                      className={`text-md font-semibold ${getPriceColor(
                        bestBidInfo.amount,
                        auction.reserve_price
                      )}`}
                    >
                      {formatPriceForDisplay(bestBidInfo.savingAmount)} (
                      {bestBidInfo.savingPercentage}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
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
                      isWinning,
                    } = row;

                    return (
                      <TableRow key={participant.id}>
                        <TableCell className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isWinning ? (
                              <span className="text-yellow-500">🏆</span>
                            ) : (
                              ''
                            )}
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
                          <span>
                            {saving !== null
                              ? formatPriceForDisplay(saving)
                              : ''}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center">
                          <span>
                            {savingRate !== null ? `${savingRate}%` : ''}
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
          auction={{
            currency: auction.currency,
            name: auction.name,
            start_dt: auction.start_dt,
            end_dt: auction.end_dt,
          }}
          user={user}
          userCompanyId={
            user
              ? participants.find((p) => p.user_id === user.user_id)?.company_id
              : undefined
          }
          onClose={() => setShowHistoryPopup(false)}
        />
      )}

      {/* Custom Alert */}
      <CustomAlert
        isOpen={showAlert}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
    </Container>
  );
}
