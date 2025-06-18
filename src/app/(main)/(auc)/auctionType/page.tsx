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
  code: string;
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
    code: '',
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
  }, [loadAuctionTypes]);

  // โหลดข้อมูลใหม่เมื่อ searchTerm เปลี่ยน (debounced)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (mounted) {
        loadAuctionTypes();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, mounted, loadAuctionTypes]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // === COMPONENT LOGIC CONTINUES ===
  // Filter auction types based on search term
  const filteredAuctionTypes = auctionTypes.filter((auctionType) => {
    if (!searchTerm.trim()) return true;
    const searchTermLower = searchTerm.toLowerCase().replace(/\s/g, '');
    return (
      auctionType.code.toLowerCase().includes(searchTermLower) ||
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

  const openAddModal = () => {
    setForm({
      code: '',
      name: '',
      description: '',
      status: true,
    });
    setEditAuctionType(null);
    setIsModalOpen(true);
  };

  const openEditModal = (auctionType: AuctionType) => {
    setForm({
      code: auctionType.code,
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
      code: '',
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

    if (!form.code.trim() || !form.name.trim()) {
      alert('กรุณากรอกรหัสและชื่อประเภทการประมูล');
      return;
    }

    setIsSubmitting(true);

    try {
      const auctionTypeData = {
        code: form.code.trim(),
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
      <div className="bg-white rounded-2xl shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                จัดการประเภทการประมูล
              </h1>
              <p className="text-gray-600 mt-1">
                เพิ่ม แก้ไข และจัดการประเภทการประมูลในระบบ
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              เพิ่มประเภทการประมูล
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="ค้นหารหัส ชื่อ หรือคำอธิบาย..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">แสดง:</label>
              <select
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">รายการ</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {currentAuctionTypes.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ไม่พบข้อมูลประเภทการประมูล
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? `ไม่พบประเภทการประมูลที่ตรงกับ "${searchTerm}"`
                  : 'ยังไม่มีประเภทการประมูลในระบบ'}
              </p>
              {!searchTerm && (
                <button
                  onClick={openAddModal}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  เพิ่มประเภทการประมูลแรก
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-4 font-medium text-gray-700">
                    <button
                      onClick={() => requestSort('code')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      รหัส
                      {sortConfig.key === 'code' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    <button
                      onClick={() => requestSort('name')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      ชื่อประเภทการประมูล
                      {sortConfig.key === 'name' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    คำอธิบาย
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    <button
                      onClick={() => requestSort('status')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      สถานะ
                      {sortConfig.key === 'status' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="text-center p-4 font-medium text-gray-700">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentAuctionTypes.map((auctionType) => (
                  <tr
                    key={auctionType.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {auctionType.code}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {auctionType.name}
                    </td>
                    <td className="p-4 text-gray-600 max-w-xs truncate">
                      {auctionType.description || '-'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          auctionType.status === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {auctionType.status === 1 ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(auctionType)}
                          className="text-blue-600 hover:text-blue-800 p-1"
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
                          className="text-red-600 hover:text-red-800 p-1"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalItems={sortedAuctionTypes.length}
              perPage={perPage}
              onPageChange={setCurrentPage}
              onPerPageChange={handlePerPageChange}
              mounted={mounted}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editAuctionType
                  ? 'แก้ไขประเภทการประมูล'
                  : 'เพิ่มประเภทการประมูลใหม่'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสประเภทการประมูล *
                </label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="เช่น AUCTION_01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อประเภทการประมูล *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="เช่น การประมูลทั่วไป"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  คำอธิบาย
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="อธิบายรายละเอียดเพิ่มเติม..."
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
                <label className="ml-2 block text-sm text-gray-900">
                  เปิดใช้งาน
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? 'กำลังบันทึก...'
                    : editAuctionType
                    ? 'อัพเดท'
                    : 'สร้าง'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Container>
  );
}
