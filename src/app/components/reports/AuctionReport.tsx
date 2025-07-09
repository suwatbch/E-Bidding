'use client';

import { useState, useEffect, useRef } from 'react';
import {
  formatPriceForDisplay,
  formatDateTime,
  getBidHistoryData,
  formatAuctionId,
} from '@/app/utils/globalFunction';

interface AuctionReportProps {
  isOpen: boolean;
  onClose: () => void;
  auctionId: number;
  reservePrice: number;
  auction?: {
    currency: number;
    name?: string;
    start_dt?: string;
    end_dt?: string;
    description?: string;
  };
  user?: {
    user_id: number;
    type?: string;
    fullname?: string;
    username?: string;
  } | null;
  userCompanyId?: number;
}

export default function AuctionReport({
  isOpen,
  onClose,
  auctionId,
  reservePrice,
  auction,
  user,
  userCompanyId,
}: AuctionReportProps) {
  const [bidHistory, setBidHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadBidHistory = async () => {
      setIsLoading(true);
      try {
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
      } catch (error) {
        console.error('Error loading bid history:', error);
        setBidHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBidHistory();
  }, [isOpen, auctionId, reservePrice, user, userCompanyId]);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;

      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // รีโหลดหน้าเพื่อคืนค่า event listeners
    }
  };

  const getCurrentDateTime = () => {
    return new Date().toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWinningBid = () => {
    if (bidHistory.length === 0) return null;

    // หาราคาสูงสุดที่ยังไม่ถูก reject
    const acceptedBids = bidHistory.filter(
      (bid) => bid.statusText === 'accept'
    );
    if (acceptedBids.length === 0) return null;

    return acceptedBids.reduce((highest, current) =>
      current.bidAmount > highest.bidAmount ? current : highest
    );
  };

  const getSavingsAmount = () => {
    const winningBid = getWinningBid();
    if (!winningBid) return 0;
    return reservePrice - winningBid.bidAmount;
  };

  const getSavingsPercentage = () => {
    const savings = getSavingsAmount();
    if (savings <= 0) return 0;
    return (savings / reservePrice) * 100;
  };

  if (!isOpen) return null;

  const winningBid = getWinningBid();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-600 to-blue-600 text-white">
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
            รายงานผลการประมูล - {formatAuctionId(auctionId)}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center gap-2"
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
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              พิมพ์
            </button>
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
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
            </div>
          ) : (
            <div ref={printRef} className="space-y-6">
              {/* Header ของรายงาน */}
              <div className="text-center border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  รายงานผลการประมูลอิเล็กทรอนิกส์
                </h1>
                <h2 className="text-lg font-semibold text-gray-600">
                  {auction?.name || `การประมูล ${formatAuctionId(auctionId)}`}
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  วันที่พิมพ์: {getCurrentDateTime()}
                </p>
              </div>

              {/* ข้อมูลการประมูล */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    ข้อมูลการประมูล
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">รหัสการประมูล:</span>
                      <span>{formatAuctionId(auctionId)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">ชื่อการประมูล:</span>
                      <span>{auction?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">วันเวลาเริ่มต้น:</span>
                      <span>
                        {auction?.start_dt
                          ? formatDateTime(auction.start_dt)
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">วันเวลาสิ้นสุด:</span>
                      <span>
                        {auction?.end_dt ? formatDateTime(auction.end_dt) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">ราคาประกัน:</span>
                      <span className="font-semibold text-blue-600">
                        {formatPriceForDisplay(reservePrice)}{' '}
                        {auction?.currency}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    ผลการประมูล
                  </h3>
                  <div className="space-y-2 text-sm">
                    {winningBid ? (
                      <>
                        <div className="flex justify-between">
                          <span className="font-medium">ผู้ชนะการประมูล:</span>
                          <span className="font-semibold text-green-600">
                            {winningBid.companyName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">ราคาที่ชนะ:</span>
                          <span className="font-semibold text-green-600">
                            {formatPriceForDisplay(winningBid.bidAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">
                            จำนวนเงินที่ประหยัด:
                          </span>
                          <span className="font-semibold text-red-600">
                            {formatPriceForDisplay(getSavingsAmount())}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">
                            เปอร์เซ็นต์ประหยัด:
                          </span>
                          <span className="font-semibold text-red-600">
                            {getSavingsPercentage().toFixed(2)}%
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        ยังไม่มีผู้ชนะการประมูล
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ประวัติการเสนอราคา */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  ประวัติการเสนอราคา
                </h3>
                {bidHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 border text-left text-xs font-medium text-gray-500 uppercase">
                            ลำดับ
                          </th>
                          <th className="px-4 py-2 border text-left text-xs font-medium text-gray-500 uppercase">
                            บริษัท
                          </th>
                          <th className="px-4 py-2 border text-left text-xs font-medium text-gray-500 uppercase">
                            ผู้เสนอราคา
                          </th>
                          <th className="px-4 py-2 border text-right text-xs font-medium text-gray-500 uppercase">
                            ราคาเสนอ
                          </th>
                          <th className="px-4 py-2 border text-center text-xs font-medium text-gray-500 uppercase">
                            สถานะ
                          </th>
                          <th className="px-4 py-2 border text-left text-xs font-medium text-gray-500 uppercase">
                            วันเวลา
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {bidHistory.map((bid, index) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }
                          >
                            <td className="px-4 py-2 border text-sm">
                              {index + 1}
                            </td>
                            <td className="px-4 py-2 border text-sm">
                              {bid.companyName}
                            </td>
                            <td className="px-4 py-2 border text-sm">
                              {bid.fullname}
                            </td>
                            <td className="px-4 py-2 border text-sm text-right font-medium">
                              {formatPriceForDisplay(bid.bidAmount)}
                            </td>
                            <td className="px-4 py-2 border text-sm text-center">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  bid.statusText === 'accept'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {bid.statusText === 'accept'
                                  ? 'ยอมรับ'
                                  : 'ปฏิเสธ'}
                              </span>
                            </td>
                            <td className="px-4 py-2 border text-sm">
                              {formatDateTime(bid.bidTime)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    ไม่พบประวัติการเสนอราคา
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t pt-4 text-sm text-gray-500 text-center">
                <p>รายงานนี้สร้างโดยระบบประมูลอิเล็กทรอนิกส์</p>
                <p>วันเวลาที่พิมพ์: {getCurrentDateTime()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
