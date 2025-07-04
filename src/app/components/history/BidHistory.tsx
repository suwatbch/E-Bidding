'use client';

import { useState, useEffect } from 'react';
import {
  formatPriceForDisplay,
  formatDateTime,
  getBidHistoryData,
  formatAuctionId,
  getPriceColor,
} from '@/app/utils/globalFunction';
import { currencyConfig } from '@/app/model/config';

interface BidHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  auctionId: number;
  reservePrice: number;
  auction?: {
    currency: number;
    name?: string;
    start_dt?: string;
    end_dt?: string;
  };
  user?: {
    user_id: number;
    type?: string;
    fullname?: string;
    username?: string;
  } | null;
  userCompanyId?: number;
}

export default function BidHistory({
  isOpen,
  onClose,
  auctionId,
  reservePrice,
  auction,
  user,
  userCompanyId,
}: BidHistoryProps) {
  const [bidHistory, setBidHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time clock update for reject button availability
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ฟังก์ชันสำหรับดึงชื่อ currency
  const getCurrencyName = (currencyId: number): string => {
    const currency = currencyConfig[currencyId as keyof typeof currencyConfig];
    return currency ? currency.code : 'THB';
  };

  // ฟังก์ชันตรวจสอบว่าสามารถ reject bid ได้หรือไม่ (ใช้ logic เดียวกับ canPlaceBid)
  const canRejectBid = (): boolean => {
    if (!auction || !user) return false;

    // ตรวจสอบช่วงเวลาการประมูล (ใช้ currentTime state ที่ update ทุกวินาที)
    const startTime = new Date(auction.start_dt || '');
    const endTime = new Date(auction.end_dt || '');

    // เวลาปัจจุบันต้องมากกว่าเวลาเริ่มต้นและน้อยกว่าเวลาสิ้นสุด
    if (currentTime < startTime || currentTime >= endTime) return false;

    return true;
  };

  // ฟังก์ชันสำหรับตรวจสอบว่าควรแสดงปุ่ม Reject หรือไม่
  const shouldShowRejectButton = (bid: any, index: number): boolean => {
    // ตรวจสอบเวลาก่อน - ถ้าไม่ได้อยู่ในช่วงประมูลแล้วไม่แสดงปุ่ม
    if (!canRejectBid()) return false;

    // แสดงเฉพาะถ้าเป็น user ปัจจุบัน
    if (!user || bid.userId !== user.user_id) return false;

    // แสดงเฉพาะถ้าสถานะเป็น accept
    if (bid.statusText !== 'accept') return false;

    // หาแถวล่าสุดที่เป็น accept ของ user นี้
    const userBids = bidHistory.filter(
      (b) => b.userId === user.user_id && b.statusText === 'accept'
    );
    if (userBids.length === 0) return false;

    // เรียงตามเวลาใหม่สุดก่อน และเช็คว่าเป็นแถวล่าสุดหรือไม่
    const latestAcceptedBid = userBids.sort(
      (a, b) => new Date(b.bidTime).getTime() - new Date(a.bidTime).getTime()
    )[0];

    return bid.bidId === latestAcceptedBid.bidId;
  };

  // ฟังก์ชันสำหรับ reject bid
  const handleRejectBid = async (bidId: number) => {
    if (!confirm('คุณต้องการปฏิเสธการเสนอราคานี้หรือไม่?')) return;

    try {
      setIsLoading(true);
      const { auctionsService } = await import(
        '@/app/services/auctionsService'
      );
      const response = await auctionsService.rejectBid(bidId);

      if (response.success && response.message === null) {
        // รีโหลดข้อมูลประวัติการเสนอราคา
        const data = await getBidHistoryData(auctionId, reservePrice);

        // กรองข้อมูลตามสิทธิ์ผู้ใช้
        let filteredData = data;
        if (user && user.type !== 'admin') {
          if (userCompanyId) {
            filteredData = data.filter(
              (bid: any) => bid.companyId === userCompanyId
            );
          } else {
            filteredData = data.filter(
              (bid: any) => bid.userId === user.user_id
            );
          }
        }

        setBidHistory(filteredData);
        alert('ปฏิเสธการเสนอราคาเรียบร้อยแล้ว');
      } else {
        alert(response.message || 'เกิดข้อผิดพลาดในการปฏิเสธการเสนอราคา');
      }
    } catch (error) {
      console.error('Error rejecting bid:', error);
      alert('เกิดข้อผิดพลาดในการปฏิเสธการเสนอราคา');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const loadBidHistory = async () => {
      setIsLoading(true);
      try {
        const data = await getBidHistoryData(auctionId, reservePrice);

        // กรองข้อมูลตามสิทธิ์ผู้ใช้
        let filteredData = data;

        if (user && user.type !== 'admin') {
          // User ทั่วไป: เห็นเฉพาะการเสนอราคาของบริษัทที่ตัวเองสังกัด
          if (userCompanyId) {
            filteredData = data.filter(
              (bid: any) => bid.companyId === userCompanyId
            );
          } else {
            // Fallback: ถ้าไม่มี companyId ให้กรองตาม userId
            filteredData = data.filter(
              (bid: any) => bid.userId === user.user_id
            );
          }
        }
        // Admin: เห็นทั้งหมด (ไม่ต้องกรอง)

        setBidHistory(filteredData);
      } catch (error) {
        console.error('Error loading bid history:', error);
        setBidHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBidHistory();
  }, [isOpen, auctionId, reservePrice]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h2 className="text-xl font-semibold flex items-center gap-2">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            ประวัติการประมูล - {formatAuctionId(auctionId)}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {bidHistory.length > 0 ? (
                <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        รหัสตลาด
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        บริษัท
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        ผู้ประมูล
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        ราคาเสนอ
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        สถานะ
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        วันที่-เวลา
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bidHistory.map((bid, index) => (
                      <tr
                        key={bid.bidId}
                        className={`hover:bg-gray-50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                        }`}
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatAuctionId(bid.auctionId)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white text-xs font-medium">
                                  {bid.companyName.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {bid.companyName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {bid.userName}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div
                            className={`text-sm font-semibold ${getPriceColor(
                              bid.bidAmount,
                              reservePrice
                            )}`}
                          >
                            {formatPriceForDisplay(bid.bidAmount)}
                          </div>
                          {bid.priceDifference !== 0 && (
                            <div
                              className={`text-xs ${
                                bid.priceDifference > 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {bid.priceDifference > 0 ? '' : '-'}
                              {formatPriceForDisplay(
                                Math.abs(bid.priceDifference)
                              )}{' '}
                              ({bid.percentageDifference.toFixed(1)}%)
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${bid.statusColor}`}
                          >
                            {bid.statusText}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {formatDateTime(bid.bidTime)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          {shouldShowRejectButton(bid, index) ? (
                            <button
                              onClick={() => handleRejectBid(bid.bidId)}
                              className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                              title="ปฏิเสธการเสนอราคานี้"
                            >
                              <svg
                                className="w-3 h-3 mr-1"
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
                              ปฏิเสธ
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-lg text-gray-500 font-medium">
                    {user && user.type !== 'admin'
                      ? 'บริษัทของคุณยังไม่ได้เสนอราคา'
                      : 'ยังไม่มีประวัติการเสนอราคา'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {user && user.type !== 'admin'
                      ? 'เมื่อบริษัทของคุณเสนอราคาในการประมูลนี้ จะแสดงประวัติที่นี่'
                      : 'เมื่อมีการเสนอราคาในการประมูลนี้ จะแสดงที่นี่'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600 space-y-1">
            {bidHistory.length > 0 ? (
              <>
                <div>
                  {user && user.type !== 'admin'
                    ? `การเสนอราคาของบริษัท ${bidHistory.length} ครั้ง`
                    : `ทั้งหมด ${bidHistory.length} รายการ`}
                  <span className="ml-2">
                    • ราคาประกัน:{' '}
                    <span className="font-medium text-blue-600">
                      {formatPriceForDisplay(reservePrice)}{' '}
                      {getCurrencyName(auction?.currency || 1)}{' '}
                    </span>
                    • ราคาต่ำสุด:{' '}
                    <span
                      className={`font-medium ${(() => {
                        const acceptedBids = bidHistory.filter(
                          (b) => b.status === 'accept'
                        );
                        return acceptedBids.length > 0
                          ? getPriceColor(
                              Math.min(...acceptedBids.map((b) => b.bidAmount)),
                              reservePrice
                            )
                          : 'text-gray-500';
                      })()}`}
                    >
                      {(() => {
                        const acceptedBids = bidHistory.filter(
                          (b) => b.status === 'accept'
                        );
                        return acceptedBids.length > 0
                          ? formatPriceForDisplay(
                              Math.min(...acceptedBids.map((b) => b.bidAmount))
                            )
                          : 'ยังไม่มี';
                      })()}{' '}
                      {bidHistory.filter((b) => b.status === 'accept').length >
                        0 && getCurrencyName(auction?.currency || 1)}
                    </span>
                  </span>
                </div>
              </>
            ) : (
              <>
                <div>
                  {user && user.type !== 'admin'
                    ? 'บริษัทของคุณยังไม่ได้เสนอราคา'
                    : 'ไม่มีข้อมูลการเสนอราคา'}
                </div>
                <div>
                  ราคาประกัน:{' '}
                  <span className="font-medium text-blue-600">
                    {formatPriceForDisplay(reservePrice)}{' '}
                    {getCurrencyName(auction?.currency || 1)}
                  </span>
                </div>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
