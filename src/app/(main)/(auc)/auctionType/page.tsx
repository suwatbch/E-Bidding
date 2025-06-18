'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AuctionType,
  auctionTypeService,
} from '@/app/services/auctionTypeService';
import Container from '@/app/components/ui/Container';
import Pagination from '@/app/components/ui/Pagination';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';

interface FormData {
  name: string;
  description: string;
  status: boolean;
}

export default function AuctionTypePage() {
  // === ALL HOOKS MUST COME FIRST ===
  const [auctionTypes, setAuctionTypes] = useState<AuctionType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useLocalStorage('auctionTypePerPage', 10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAuctionType, setEditAuctionType] = useState<AuctionType | null>(
    null
  );
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    status: true,
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof AuctionType | null;
    direction: 'asc' | 'desc' | null;
  }>({
    key: null,
    direction: null,
  });

  // === FUNCTIONS ===
  const loadAuctionTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await auctionTypeService.getAllAuctionTypes();
      if (result.success) {
        setAuctionTypes(result.data);
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      console.error('Error loading auction types:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลประเภทการประมูล');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRetry = async () => {
    setRetryCount((prev) => prev + 1);
    await loadAuctionTypes();
  };

  // === EFFECTS ===
  useEffect(() => {
    const initializeData = async () => {
      await loadAuctionTypes();
      setMounted(true);
    };
    initializeData();
  }, []); // ลบ dependency loadAuctionTypes ออก

  // โหลดข้อมูลใหม่เมื่อ searchTerm เปลี่ยน (debounced) - แต่ไม่จำเป็นต้องโหลดใหม่จริงๆ เพราะเราใช้ filter แล้ว
  useEffect(() => {
    // ไม่ต้องโหลดข้อมูลใหม่ เพราะเราใช้ filter ใน client side
    setCurrentPage(1); // reset page เมื่อค้นหา
  }, [searchTerm]);

  // === COMPONENT LOGIC CONTINUES ===
  // Filter auction types based on search term
  const filteredAuctionTypes = auctionTypes.filter((auctionType) => {
    if (!searchTerm.trim()) return true;
    const searchTermLower = searchTerm.toLowerCase().replace(/\s/g, '');
    return (
      auctionType.name.toLowerCase().includes(searchTermLower) ||
      auctionType.description.toLowerCase().includes(searchTermLower)
    );
  });

  // Sort auction types
  const sortedAuctionTypes = React.useMemo(() => {
    let sortableAuctionTypes = [...filteredAuctionTypes];
    if (sortConfig.key && sortConfig.direction) {
      sortableAuctionTypes.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        // Convert to string for consistent comparison
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();

        if (aString < bString) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aString > bString) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableAuctionTypes;
  }, [filteredAuctionTypes, sortConfig]);

  // Calculate pagination with sorted auction types
  const totalPages = Math.ceil(sortedAuctionTypes.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentAuctionTypes = sortedAuctionTypes.slice(startIndex, endIndex);

  const requestSort = (key: keyof AuctionType) => {
    let direction: 'asc' | 'desc' | null = 'asc';

    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }

    setSortConfig({ key: direction ? key : null, direction });
  };

  const getSortIcon = (columnKey: keyof AuctionType) => {
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

  const openAddModal = () => {
    setForm({
      name: '',
      description: '',
      status: true,
    });
    setEditAuctionType(null);
    setIsModalOpen(true);
  };

  const openEditModal = (auctionType: AuctionType) => {
    setForm({
      name: auctionType.name,
      description: auctionType.description,
      status: auctionType.status === 1,
    });
    setEditAuctionType(auctionType);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditAuctionType(null);
    setForm({
      name: '',
      description: '',
      status: true,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setForm((prev) => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert('กรุณากรอกชื่อประเภทการประมูล');
      return;
    }

    setIsSubmitting(true);

    try {
      const auctionTypeData = {
        name: form.name.trim(),
        description: form.description.trim(),
        status: form.status ? 1 : 0,
      };

      let result;

      if (editAuctionType) {
        // อัพเดท
        result = await auctionTypeService.updateAuctionType(
          editAuctionType.id,
          auctionTypeData
        );
      } else {
        // สร้างใหม่
        result = await auctionTypeService.createAuctionType(auctionTypeData);
      }

      if (result.success) {
        alert(
          editAuctionType
            ? 'อัพเดทข้อมูลประเภทการประมูลสำเร็จ'
            : 'สร้างประเภทการประมูลใหม่สำเร็จ'
        );
        closeModal();
        await loadAuctionTypes();
      } else {
        alert(result.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบประเภทการประมูลนี้?')) {
      return;
    }

    try {
      const result = await auctionTypeService.deleteAuctionType(id);
      if (result.success) {
        alert('ลบประเภทการประมูลสำเร็จ');
        await loadAuctionTypes();
      } else {
        alert(result.message || 'เกิดข้อผิดพลาดในการลบ');
      }
    } catch (error: any) {
      console.error('Error deleting auction type:', error);
      alert('เกิดข้อผิดพลาดในการลบประเภทการประมูล');
    }
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setCurrentPage(1);
  };

  // Error State Component
  const ErrorState = () => (
    <Container className="py-8">
      <div className="flex-1 py-8 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            เกิดข้อผิดพลาด
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ลองใหม่ (ครั้งที่ {retryCount + 1})
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              รีเฟรชหน้า
            </button>
          </div>
        </div>
      </div>
    </Container>
  );

  // Loading State Component
  const LoadingState = () => (
    <Container className="py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
      </div>
    </Container>
  );

  // Main Render
  if (error) {
    return <ErrorState />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ประเภทการประมูล
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  จัดการประเภทการประมูลในระบบ
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-[500px]">
                <input
                  type="text"
                  placeholder="ค้นหาหมวดหมู่..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-12 pr-4 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
              <button
                onClick={openAddModal}
                className="inline-flex items-center h-11 px-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg 
                  hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 
                  focus:ring-offset-2 transform transition-all duration-200 shadow-md hover:scale-[1.02] 
                  active:scale-[0.98] whitespace-nowrap gap-2"
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
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                เพิ่มหมวดหมู่
              </button>
            </div>
          </div>
        </div>

        {/* Table Info Section */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredAuctionTypes.length}
          perPage={perPage}
          onPageChange={setCurrentPage}
          onPerPageChange={handlePerPageChange}
          mounted={mounted}
        />

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            {currentAuctionTypes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mb-4 text-gray-300 mx-auto">
                  <svg
                    className="w-full h-full"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  ไม่พบข้อมูลประเภทการประมูล
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchTerm
                    ? `ไม่พบประเภทการประมูลที่ตรงกับ "${searchTerm}"`
                    : 'ยังไม่มีประเภทการประมูลในระบบ'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={openAddModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    เพิ่มประเภทการประมูลแรก
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[25%]" />
                  <col className="w-[40%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                </colgroup>
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ลำดับ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                        onClick={() => requestSort('name')}
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
                            strokeWidth="2"
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        ชื่อหมวดหมู่
                        {getSortIcon('name')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                            d="M4 6h16M4 12h16M4 18h7"
                          />
                        </svg>
                        คำอธิบาย
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                        onClick={() => requestSort('status')}
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
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        สถานะ
                        {getSortIcon('status')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        จัดการ
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentAuctionTypes.map((auctionType, index) => (
                    <tr
                      key={auctionType.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(startIndex + index + 1).toLocaleString('th-TH')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {auctionType.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 line-clamp-2">
                          {auctionType.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            auctionType.status === 1
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {auctionType.status === 1
                            ? 'เปิดใช้งาน'
                            : 'ปิดใช้งาน'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(auctionType)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="แก้ไข"
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
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(auctionType.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                            title="ลบ"
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
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden">
            {/* Modal Header - Fixed */}
            <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50 py-4 px-5 border-b border-blue-100/50">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 
                  hover:bg-gray-100/80 rounded-lg p-1"
                onClick={closeModal}
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
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2 className="text-lg font-bold text-gray-900">
                {editAuctionType ? (
                  <div className="flex items-center gap-2">
                    <div className="bg-yellow-100 p-1.5 rounded-lg">
                      <svg
                        className="w-5 h-5 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        แก้ไขหมวดหมู่
                      </div>
                      <div className="text-xs text-gray-500 font-normal">
                        กรุณากรอกข้อมูลที่ต้องการแก้ไข
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-1.5 rounded-lg">
                      <svg
                        className="w-5 h-5 text-blue-600"
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
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        เพิ่มหมวดหมู่
                      </div>
                      <div className="text-xs text-gray-500 font-normal">
                        กรุณากรอกข้อมูลหมวดหมู่ใหม่
                      </div>
                    </div>
                  </div>
                )}
              </h2>
            </div>

            {/* Modal Content - Scrollable */}
            <div
              className="max-h-[calc(100vh-12rem)] overflow-y-auto px-5 py-4 
              [&::-webkit-scrollbar]:w-2
              [&::-webkit-scrollbar-track]:bg-gray-100
              [&::-webkit-scrollbar-track]:rounded-lg
              [&::-webkit-scrollbar-thumb]:bg-gray-300
              [&::-webkit-scrollbar-thumb]:rounded-lg
              [&::-webkit-scrollbar-thumb]:border-2
              [&::-webkit-scrollbar-thumb]:border-gray-100
              hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
            >
              <form
                id="auctionTypeForm"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      ชื่อหมวดหมู่
                    </div>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 6h16M4 12h16M4 18h7"
                        />
                      </svg>
                      คำอธิบาย
                    </div>
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent"
                    placeholder="คำอธิบายเพิ่มเติม..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="status"
                    checked={form.status}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 flex items-center gap-2 text-sm text-gray-700">
                    <svg
                      className="w-5 h-5 text-gray-500"
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
                    เปิดใช้งาน
                  </label>
                </div>
              </form>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 py-3 px-5 border-t border-gray-100">
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className={`group px-3 py-1.5 text-sm font-medium border border-gray-200 
                    rounded-lg focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                      isSubmitting
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    <svg
                      className={`w-4 h-4 ${
                        isSubmitting
                          ? 'text-gray-400'
                          : 'text-gray-500 group-hover:text-gray-600'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    ยกเลิก
                  </div>
                </button>
                <button
                  type="submit"
                  form="auctionTypeForm"
                  disabled={isSubmitting}
                  className={`group px-3 py-1.5 text-sm font-medium text-white border border-transparent rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                    transition-all duration-200 shadow-md hover:shadow-md ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isSubmitting ? (
                      <>
                        <svg
                          className="w-4 h-4 text-white animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {editAuctionType ? 'กำลังบันทึก...' : 'กำลังเพิ่ม...'}
                      </>
                    ) : editAuctionType ? (
                      <>
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        บันทึกการแก้ไข
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 text-white"
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
                        เพิ่มหมวดหมู่
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
