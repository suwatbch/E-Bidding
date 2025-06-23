'use client';

import { useState, useEffect } from 'react';
import {
  formatCurrency,
  formatDateForDisplay,
  safeParseDate,
  getBidHistoryData,
} from '@/app/utils/globalFunction';

interface BidHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  auctionId: number;
  reservePrice: number;
}

export default function BidHistory({
  isOpen,
  onClose,
  auctionId,
  reservePrice,
}: BidHistoryProps) {
  const [bidHistory, setBidHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadBidHistory = async () => {
      setIsLoading(true);
      try {
        const data = await getBidHistoryData(auctionId, reservePrice);
        setBidHistory(data);
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
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600"
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
            ประวัติการประมูล
          </h2>
          <button
            onClick={onClose}
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {bidHistory.map((bid, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {bid.companyName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {bid.companyName}
                        </div>
                        <div className="text-xs text-gray-500">
                          User ID: {bid.userId}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(bid.bidAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateForDisplay(safeParseDate(bid.bidTime), true)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {bidHistory.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 text-gray-300 mx-auto mb-2"
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
                  <p className="text-gray-500">ยังไม่มีประวัติการเสนอราคา</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
