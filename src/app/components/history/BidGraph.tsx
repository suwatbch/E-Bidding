'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  formatPriceForDisplay,
  formatDateTime,
  getBidHistoryData,
  formatAuctionId,
} from '@/app/utils/globalFunction';
import { currencyConfig } from '@/app/model/config';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BidGraphProps {
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

interface DataPoint {
  time: string;
  [companyName: string]: string | number;
}

interface GraphResult {
  data: DataPoint[];
  companies: string[];
}

export default function BidGraph({
  isOpen,
  onClose,
  auctionId,
  reservePrice,
  auction,
  user,
  userCompanyId,
}: BidGraphProps) {
  const [bidHistory, setBidHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ฟังก์ชันสำหรับดึงชื่อ currency
  const getCurrencyName = useCallback((currencyId: number): string => {
    const currency = currencyConfig[currencyId as keyof typeof currencyConfig];
    return currency ? currency.code : 'THB';
  }, []);

  // แปลงข้อมูลสำหรับแสดงในกราฟ
  const prepareGraphData = useCallback((data: any[]): GraphResult => {
    // เรียงข้อมูลตามเวลา
    const sortedData = data.sort(
      (a, b) => new Date(a.bidTime).getTime() - new Date(b.bidTime).getTime()
    );

    // สร้างข้อมูลกราฟที่แสดงทุกจุด
    const companies = new Set<string>();
    sortedData.forEach((bid) => companies.add(bid.companyName));

    // สร้างข้อมูลสำหรับกราฟ โดยแต่ละจุดจะมีเวลาที่แตกต่างกัน
    const graphData: DataPoint[] = [];

    sortedData.forEach((bid, index) => {
      const timeKey = `${formatDateTime(bid.bidTime)}_${index}`; // เพิ่ม index เพื่อให้แต่ละจุดแตกต่างกัน
      const dataPoint: DataPoint = { time: formatDateTime(bid.bidTime) };

      // ตั้งค่าราคาเฉพาะบริษัทที่เสนอราคา (ไม่ carry forward)
      companies.forEach((company) => {
        if (company === bid.companyName) {
          dataPoint[company] = bid.bidAmount;
        }
        // บริษัทอื่นๆ ไม่ต้องมีค่า (undefined) เพื่อไม่ให้แสดงจุดที่ไม่ได้เสนอ
      });

      graphData.push(dataPoint);
    });

    return {
      data: graphData,
      companies: Array.from(companies),
    };
  }, []);

  // สีสำหรับแต่ละบริษัท
  const colors = useMemo(
    () => [
      '#8884d8',
      '#82ca9d',
      '#ffc658',
      '#ff7300',
      '#00ff00',
      '#ff0000',
      '#00ffff',
      '#ff00ff',
      '#ffff00',
      '#8000ff',
    ],
    []
  );

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

  // ใช้ useMemo เพื่อป้องกันการ re-calculate ข้อมูลกราฟบ่อยๆ
  const graphResult = useMemo(() => {
    const result = prepareGraphData(bidHistory);
    return result;
  }, [bidHistory, prepareGraphData]);

  if (!isOpen) return null;

  const { data: graphData, companies } = graphResult;

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
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            กราฟประวัติการประมูล - {formatAuctionId(auctionId)}
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
            <div className="w-full h-[500px]">
              {bidHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={graphData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 80,
                      bottom: 100,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="time"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis
                      tickFormatter={(value: number) =>
                        formatPriceForDisplay(value)
                      }
                      fontSize={12}
                      width={70}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ paddingTop: '36px' }}
                    />
                    {companies.map((company: string, index: number) => (
                      <Line
                        key={company}
                        type="monotone"
                        dataKey={company}
                        name={company}
                        stroke={colors[index % colors.length]}
                        strokeWidth={3}
                        activeDot={{ r: 8, strokeWidth: 2 }}
                        connectNulls={true}
                        dot={{ r: 6, strokeWidth: 2 }}
                        isAnimationActive={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  ไม่พบข้อมูลการประมูล
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
