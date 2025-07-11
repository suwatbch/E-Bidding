'use client';

import { useState, useEffect, useRef } from 'react';
import {
  formatPriceForDisplay,
  formatDateTime,
  getBidHistoryData,
  formatAuctionId,
  getCurrentDateTimeFormatted,
  getPriceColor,
  getCurrencyName,
  getBidStatusColor,
  BidStatus,
  decodeAuctionId,
} from '@/app/utils/globalFunction';
import { auctionsService } from '@/app/services/auctionsService';

interface AuctionReport2Props {
  isOpen: boolean;
  onClose: () => void;
  auctionIdString: string; // รับ string เช่น "AUC0040"
}

export default function AuctionReport2({
  isOpen,
  onClose,
  auctionIdString,
}: AuctionReport2Props) {
  const [auction, setAuction] = useState<any>(null);
  const [bidHistory, setBidHistory] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reservePrice, setReservePrice] = useState(0);
  const printRef = useRef<HTMLDivElement>(null);

  // แปลง auctionIdString เป็น number
  const auctionId =
    decodeAuctionId(auctionIdString) ||
    parseInt(auctionIdString.replace(/\D/g, ''));

  useEffect(() => {
    if (!isOpen || !auctionId) return;

    const loadAllData = async () => {
      setIsLoading(true);
      try {
        // 1. โหลดข้อมูลประมูล
        const auctionResponse = await auctionsService.getAuctionById(auctionId);
        if (auctionResponse.success && auctionResponse.data) {
          setAuction(auctionResponse.data);
          setReservePrice(auctionResponse.data.reserve_price);

          // 2. โหลดข้อมูลผู้เข้าร่วมประมูล
          const participantsResponse =
            await auctionsService.getAuctionParticipantsWithDetails(auctionId);
          if (participantsResponse.success && participantsResponse.data) {
            setParticipants(participantsResponse.data);
          }

          // 3. โหลดประวัติการเสนอราคา
          const bidData = await getBidHistoryData(
            auctionId,
            auctionResponse.data.reserve_price
          );
          setBidHistory(bidData);
        }
      } catch (error) {
        console.error('Error loading auction data:', error);
        setBidHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [isOpen, auctionId]);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;

      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const getWinningBid = () => {
    if (bidHistory.length === 0) return null;

    // หาการเสนอราคาที่ accept ทั้งหมด
    const acceptedBids = bidHistory.filter(
      (bid) => bid.statusText === 'accept'
    );
    if (acceptedBids.length === 0) return null;

    // หารายการล่าสุดของแต่ละบริษัทที่เป็น accept
    const companyLatestBids = new Map();

    acceptedBids.forEach((bid) => {
      const companyId = bid.companyId;
      const existing = companyLatestBids.get(companyId);
      if (!existing || new Date(bid.bidTime) > new Date(existing.bidTime)) {
        companyLatestBids.set(companyId, bid);
      }
    });

    // หาราคาต่ำสุดจากรายการล่าสุดของแต่ละบริษัท (ราคาที่ดีที่สุด)
    const latestBids = Array.from(companyLatestBids.values());
    if (latestBids.length === 0) return null;

    return latestBids.reduce((min, current) =>
      current.bidAmount < min.bidAmount ? current : min
    );
  };

  const getSavingsAmount = () => {
    const winningBid = getWinningBid();
    if (!winningBid) return 0;
    return reservePrice - winningBid.bidAmount;
  };

  const getSavingsPercentage = () => {
    const savings = getSavingsAmount();
    if (reservePrice === 0) return 0;
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
            รายงานผลการประมูล - {auctionIdString}
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
                  {auction?.name || `การประมูล ${auctionIdString}`}
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  วันที่พิมพ์: {getCurrentDateTimeFormatted()}
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
                      <span>{auctionIdString}</span>
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
                        {auction?.currency
                          ? getCurrencyName(auction.currency)
                          : ''}
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
                          <span
                            className={`font-semibold ${getPriceColor(
                              winningBid.bidAmount,
                              reservePrice
                            )}`}
                          >
                            {formatPriceForDisplay(winningBid.bidAmount)}{' '}
                            {auction?.currency
                              ? getCurrencyName(auction.currency)
                              : ''}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">
                            จำนวนเงินที่ประหยัด:
                          </span>
                          <span
                            className={`font-semibold ${
                              getSavingsAmount() > 0
                                ? 'text-green-600'
                                : getSavingsAmount() < 0
                                ? 'text-red-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {formatPriceForDisplay(getSavingsAmount())}{' '}
                            {auction?.currency
                              ? getCurrencyName(auction.currency)
                              : ''}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">
                            เปอร์เซ็นต์ประหยัด:
                          </span>
                          <span
                            className={`font-semibold ${
                              getSavingsPercentage() > 0
                                ? 'text-green-600'
                                : getSavingsPercentage() < 0
                                ? 'text-red-600'
                                : 'text-gray-600'
                            }`}
                          >
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

              {/* ตารางผลการประมูล */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  ตารางผลการประมูล
                </h3>
                {(() => {
                  // สร้างข้อมูลตารางแบบเดียวกับหน้าประมูล (ใช้ participants)
                  const getTableData = () => {
                    if (!auction || participants.length === 0) return [];

                    // หาข้อมูลการเสนอราคาล่าสุดที่ยัง accept อยู่ของแต่ละบริษัท
                    const latestAcceptedBidsByCompany = new Map();

                    // กรองเฉพาะ bid ที่ accept ก่อน
                    const acceptedBids = bidHistory.filter(
                      (bid) => bid.statusText === 'accept'
                    );

                    // จากข้อมูล accepted bids หา bid ที่มี bidTime ล่าสุดของแต่ละบริษัท
                    acceptedBids.forEach((bid) => {
                      const companyId = bid.companyId;
                      const existing =
                        latestAcceptedBidsByCompany.get(companyId);
                      if (
                        !existing ||
                        new Date(bid.bidTime) > new Date(existing.bidTime)
                      ) {
                        latestAcceptedBidsByCompany.set(companyId, bid);
                      }
                    });

                    // หาราคาที่ดีที่สุด (ต่ำสุด)
                    const latestBids = Array.from(
                      latestAcceptedBidsByCompany.values()
                    );
                    const lowestPrice =
                      latestBids.length > 0
                        ? latestBids.reduce((min, bid) =>
                            bid.bidAmount < min.bidAmount ? bid : min
                          ).bidAmount
                        : null;

                    // ใช้ข้อมูลจาก participants (ผู้เข้าร่วมประมูลทั้งหมด)
                    return participants.map((participant) => {
                      const latestAcceptedBid = latestAcceptedBidsByCompany.get(
                        participant.company_id
                      );

                      let price = null;
                      let saving = null;
                      let savingRate = null;
                      let status = null;
                      let bidTime = null;

                      if (latestAcceptedBid && auction) {
                        price = latestAcceptedBid.bidAmount;
                        saving = reservePrice - price;
                        savingRate = ((saving / reservePrice) * 100).toFixed(2);
                        status = latestAcceptedBid.statusText;
                        bidTime = latestAcceptedBid.bidTime;

                        // ถ้าราคาเท่ากับราคาประกัน ให้ saving = 0
                        if (price === reservePrice) {
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
                  };

                  const tableData = getTableData();

                  return tableData.length > 0 ? (
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 border text-left text-xs font-medium text-gray-500 uppercase">
                              ลำดับ
                            </th>
                            <th className="px-4 py-2 border text-left text-xs font-medium text-gray-500 uppercase">
                              บริษัท
                            </th>
                            <th className="px-4 py-2 border text-right text-xs font-medium text-gray-500 uppercase">
                              ราคา
                            </th>
                            <th className="px-4 py-2 border text-right text-xs font-medium text-gray-500 uppercase">
                              ประหยัด
                            </th>
                            <th className="px-4 py-2 border text-center text-xs font-medium text-gray-500 uppercase">
                              อัตราประหยัด
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
                          {tableData
                            .sort((a, b) => {
                              // ใส่คนที่ไม่มีราคาไว้ท้าย
                              if (a.price === null && b.price === null)
                                return 0;
                              if (a.price === null) return 1;
                              if (b.price === null) return -1;
                              return a.price - b.price; // เรียงตามราคาจากน้อยไปมาก
                            })
                            .map((row, index) => (
                              <tr
                                key={row.participant.id}
                                className={`${
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                } ${
                                  row.isWinning
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : ''
                                }`}
                              >
                                <td className="px-4 py-2 border text-sm">
                                  <div className="flex items-center gap-2">
                                    <span>{index + 1}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2 border">
                                  <div className="flex items-center">
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">
                                        {row.participant.company_name ||
                                          `บริษัท ${row.participant.company_id}`}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {row.participant.user_name ||
                                          `ผู้ใช้ ${row.participant.user_id}`}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-2 border text-right">
                                  {row.price && (
                                    <div
                                      className={`text-sm font-semibold ${getPriceColor(
                                        row.price,
                                        reservePrice
                                      )}`}
                                    >
                                      {formatPriceForDisplay(row.price)}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-2 border text-right">
                                  {row.saving && (
                                    <div
                                      className={`text-sm font-medium ${
                                        row.saving > 0
                                          ? 'text-green-600'
                                          : row.saving < 0
                                          ? 'text-red-600'
                                          : 'text-gray-600'
                                      }`}
                                    >
                                      {formatPriceForDisplay(row.saving)}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-2 border text-center">
                                  {row.savingRate && (
                                    <div
                                      className={`text-sm font-medium ${
                                        parseFloat(row.savingRate) > 0
                                          ? 'text-green-600'
                                          : parseFloat(row.savingRate) < 0
                                          ? 'text-red-600'
                                          : 'text-gray-600'
                                      }`}
                                    >
                                      {row.savingRate}%
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-2 border text-center">
                                  {row.status && (
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${getBidStatusColor(
                                        row.status
                                      )}`}
                                    >
                                      {row.status}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2 border text-sm">
                                  {row.bidTime && formatDateTime(row.bidTime)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8 mb-6">
                      ไม่พบผลการประมูล
                    </div>
                  );
                })()}
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
                            ราคา
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
                              {bid.userName}
                            </td>
                            <td className="px-4 py-2 border text-sm text-right font-medium">
                              <div
                                className={`text-sm font-semibold ${getPriceColor(
                                  bid.bidAmount,
                                  reservePrice
                                )}`}
                              >
                                {formatPriceForDisplay(bid.bidAmount)}
                              </div>
                            </td>
                            <td className="px-4 py-2 border text-sm text-center">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getBidStatusColor(
                                  bid.statusText
                                )}`}
                              >
                                {bid.statusText}
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
                <p>วันที่พิมพ์: {getCurrentDateTimeFormatted()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
