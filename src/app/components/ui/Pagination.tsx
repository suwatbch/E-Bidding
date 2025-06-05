'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  mounted?: boolean;
}

export default function Pagination({
  currentPage,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange,
  mounted = true,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / perPage);

  return (
    <div className="flex justify-between items-center m-4">
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>แสดง</span>
          <div className="relative">
            <select
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:border-transparent bg-gray-50/50 appearance-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
          <span>รายการ</span>
        </div>
        <div>ทั้งหมด {mounted ? totalItems.toLocaleString() : '-'} รายการ</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-lg border border-gray-200 text-sm text-gray-600 
            hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
        >
          หน้าแรก
        </button>
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-lg border border-gray-200 text-sm text-gray-600 
            hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
        >
          ก่อนหน้า
        </button>
        <div className="flex items-center gap-1">
          {mounted &&
            totalPages > 0 &&
            Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
                if (i === 4)
                  return (
                    <span key="dots" className="px-2">
                      ...
                    </span>
                  );
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - (4 - i);
                if (i === 0)
                  return (
                    <span key="dots" className="px-2">
                      ...
                    </span>
                  );
              } else {
                if (i === 0)
                  return (
                    <span key="dots1" className="px-2">
                      ...
                    </span>
                  );
                if (i === 4)
                  return (
                    <span key="dots2" className="px-2">
                      ...
                    </span>
                  );
                pageNum = currentPage + (i - 2);
              }
              return (
                <button
                  key={i}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center
                  ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
        </div>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-lg border border-gray-200 text-sm text-gray-600 
            hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
        >
          ถัดไป
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-lg border border-gray-200 text-sm text-gray-600 
            hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
        >
          หน้าสุดท้าย
        </button>
      </div>
    </div>
  );
}
