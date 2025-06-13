'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, getAllUsers } from '@/app/services/userService';
import Container from '@/app/components/ui/Container';
import Pagination from '@/app/components/ui/Pagination';
import EmptyState from '@/app/components/ui/EmptyState';
import LoadingState from '@/app/components/ui/LoadingState';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';
import { LockTableIcon } from '@/app/components/ui/Icons';

export default function UserPage() {
  // === ALL HOOKS MUST COME FIRST ===
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useLocalStorage('userPerPage', 10);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof User | null;
    direction: 'asc' | 'desc' | null;
  }>({
    key: null,
    direction: null,
  });

  // === FUNCTIONS ===
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getAllUsers(searchTerm);
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        setError(result.error || 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้งาน');
        setUsers([]);
      }
    } catch (error: any) {
      console.error('❌ Error loading users:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้งาน');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  // === EFFECTS ===
  useEffect(() => {
    const initializeData = async () => {
      await loadUsers();
    };

    initializeData();
    setMounted(true);
  }, [loadUsers]);

  // Filter and sort logic
  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.fullname?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower) ||
      user.address?.toLowerCase().includes(searchLower)
    );
  });

  const sortedUsers = React.useMemo(() => {
    const sorted = [...filteredUsers];
    if (sortConfig.direction && sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = String(
          a[sortConfig.key as keyof User] || ''
        ).toLowerCase();
        const bValue = String(
          b[sortConfig.key as keyof User] || ''
        ).toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredUsers, sortConfig]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedUsers.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const currentUsers = sortedUsers.slice(startIndex, startIndex + perPage);

  // Sort function
  const requestSort = (key: keyof User) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Get sort icon
  const getSortIcon = (columnKey: keyof User) => {
    if (sortConfig.key === columnKey) {
      if (sortConfig.direction === 'asc') {
        return (
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 15l7-7 7 7"
            />
          </svg>
        );
      } else if (sortConfig.direction === 'desc') {
        return (
          <svg
            className="w-4 h-4 text-blue-600"
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
        );
      }
    }
    return (
      <svg
        className="w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8 9l4-4 4 4m0 6l-4 4-4-4"
        />
      </svg>
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setCurrentPage(1);
  };

  return (
    <Container className="py-8">
      <div className="flex-1 py-8 flex flex-col">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  จัดการผู้ใช้งาน
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  จัดการข้อมูลผู้ใช้งานในระบบ
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-[500px]">
                <input
                  type="text"
                  placeholder="ค้นหาผู้ใช้งาน..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-12 pr-4 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <button
                  onClick={() =>
                    alert('ฟังก์ชันเพิ่มผู้ใช้งานยังไม่พร้อมใช้งาน')
                  }
                  className="inline-flex items-center h-11 px-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg 
                    hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:ring-offset-2 transform transition-all duration-200 shadow-md hover:scale-[1.02] 
                    active:scale-[0.98] whitespace-nowrap gap-2"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span>เพิ่มผู้ใช้งาน</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Info Section */}
        <Pagination
          currentPage={currentPage}
          totalItems={sortedUsers.length}
          perPage={perPage}
          onPageChange={setCurrentPage}
          onPerPageChange={handlePerPageChange}
          mounted={mounted}
        />

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[17%]" />
                  <col className="w-[15%]" />
                  <col className="w-[14%]" />
                  <col className="w-[13%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div>ลำดับ</div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('fullname')}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>ชื่อ-นามสกุล</span>
                        {getSortIcon('fullname')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('address')}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>ที่อยู่</span>
                        {getSortIcon('address')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('phone')}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span>โทรศัพท์</span>
                        {getSortIcon('phone')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('email')}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span>อีเมล</span>
                        {getSortIcon('email')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('status')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>สถานะ</span>
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('type')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <span>ประเภท</span>
                        {getSortIcon('type')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                          />
                        </svg>
                        <span>จัดการ</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <LoadingState colSpan={8} />
                  ) : error ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <svg
                            className="w-12 h-12 text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          <div className="text-gray-500">{error}</div>
                          <button
                            onClick={loadUsers}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            ลองใหม่
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : currentUsers.length === 0 ? (
                    <EmptyState
                      title="ไม่พบข้อมูล"
                      description="ไม่พบข้อมูลที่ตรงกับการค้นหา"
                      colSpan={8}
                    />
                  ) : (
                    currentUsers.map((user, index) => (
                      <tr
                        key={user.user_id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 text-center">
                          <div>
                            {user.is_locked ? (
                              <div className="flex justify-center items-center text-red-400">
                                <LockTableIcon />
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">
                                {(startIndex + index + 1).toLocaleString(
                                  'th-TH'
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <div
                              className="text-sm font-medium text-gray-900 truncate cursor-pointer"
                              title={user.fullname || ''}
                            >
                              {user.fullname || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <div
                              className="text-sm text-gray-500 truncate cursor-pointer"
                              title={user.address || '-'}
                            >
                              {user.address || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <div
                              className="text-sm text-gray-500 truncate cursor-pointer"
                              title={user.phone || '-'}
                            >
                              {user.phone || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <div
                              className="text-sm text-gray-500 truncate cursor-pointer"
                              title={user.email || ''}
                            >
                              {user.email || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div>
                              <div
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${
                                  user.status
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {user.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div>
                            <div
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${
                                user.type === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : user.type === 'company'
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {user.type === 'admin'
                                ? 'ผู้ดูแล'
                                : user.type === 'company'
                                ? 'บริษัท'
                                : 'ผู้ใช้งาน'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() =>
                                alert('ฟังก์ชันแก้ไขยังไม่พร้อมใช้งาน')
                              }
                              className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                              title="แก้ไข"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() =>
                                alert('ฟังก์ชันลบยังไม่พร้อมใช้งาน')
                              }
                              className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                              title="ลบ"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
