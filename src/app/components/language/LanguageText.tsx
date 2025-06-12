'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { languageService } from '@/app/services/languageService';
import { LanguageText } from '@/app/model/language_text';
import Pagination from '@/app/components/ui/Pagination';
import EmptyState from '@/app/components/ui/EmptyState';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';

interface TransectionLanguageProps {
  onEdit?: (key: string) => void;
}

interface FormData {
  text_key: string;
  th: string;
  en: string;
  zh: string;
}

export default function TransectionLanguage({
  onEdit,
}: TransectionLanguageProps) {
  const [languageTexts, setLanguageTexts] = useState<LanguageText[]>([]);
  const [groupedTexts, setGroupedTexts] = useState<
    Record<string, Record<string, string>>
  >({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    text_key: '',
    th: '',
    en: '',
    zh: '',
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useLocalStorage('languageTextPerPage', 10);

  const [mounted, setMounted] = useState(false);

  // โหลดข้อมูลจากฐานข้อมูล
  const loadLanguageTexts = useCallback(async () => {
    try {
      setError(null);

      // โหลดข้อมูลผ่าน languageService โดยตรงจาก API
      const languageTextsData =
        await languageService.loadLanguageTextsFromAPI();

      // กรองข้อมูลที่ไม่ถูกต้อง
      const validLanguageTexts = languageTextsData.filter((item) => {
        return (
          item &&
          item.text_key &&
          typeof item.text_key === 'string' &&
          item.text_key.trim() !== '' &&
          item.language_code &&
          typeof item.language_code === 'string'
        );
      });

      setLanguageTexts(validLanguageTexts);

      // จัดกลุ่มข้อมูลสำหรับแสดงผล
      const grouped: Record<string, Record<string, string>> = {};
      validLanguageTexts.forEach((item) => {
        if (!grouped[item.text_key]) {
          grouped[item.text_key] = {};
        }
        grouped[item.text_key][item.language_code] = item.text_value || '';
      });

      setGroupedTexts(grouped);
    } catch (error: any) {
      console.error('❌ Error loading language texts:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลข้อความภาษา');
    }
  }, []);

  useEffect(() => {
    loadLanguageTexts();
    setMounted(true);
  }, [loadLanguageTexts]);

  // Filter and paginate data
  const filteredAndPaginatedData = useMemo(() => {
    // Filter data
    const filtered = Object.entries(groupedTexts).filter(([key, value]) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        key.toLowerCase().includes(searchLower) ||
        (value.th && value.th.toLowerCase().includes(searchLower)) ||
        (value.en && value.en.toLowerCase().includes(searchLower)) ||
        (value.zh && value.zh.toLowerCase().includes(searchLower))
      );
    });

    // Calculate total pages
    const total = filtered.length;
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;

    return {
      data: filtered.slice(start, end),
      total,
    };
  }, [groupedTexts, searchTerm, currentPage, perPage]);

  const totalPages = Math.ceil(filteredAndPaginatedData.total / perPage);

  // Calculate pagination indices like Company page
  const startIndex = (currentPage - 1) * perPage;

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle per page change
  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const openEditModal = (key: string) => {
    setEditKey(key);
    const textData = groupedTexts[key] || {};
    setForm({
      text_key: key,
      th: textData.th || '',
      en: textData.en || '',
      zh: textData.zh || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditKey(null);
    setForm({ text_key: '', th: '', en: '', zh: '' });
    setError(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editKey) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // อัพเดทข้อความทั้ง 3 ภาษา
      const languages = ['th', 'en', 'zh'];
      const updatePromises = languages.map(async (lang) => {
        const existingText = languageTexts.find(
          (item) => item.text_key === editKey && item.language_code === lang
        );
        const newValue = form[lang as keyof FormData];

        if (existingText && existingText.text_id) {
          // อัพเดทข้อความที่มีอยู่
          return languageService.updateLanguageText(existingText.text_id, {
            text_value: newValue,
          });
        } else if (newValue.trim()) {
          // สร้างข้อความใหม่ถ้ายังไม่มี
          return languageService.createLanguageText({
            text_key: editKey,
            language_code: lang,
            text_value: newValue,
          });
        }
        return { success: true, message: 'ไม่มีการเปลี่ยนแปลง' };
      });

      const results = await Promise.all(updatePromises);
      const hasError = results.some((result) => !result.success);

      if (hasError) {
        const errorMessages = results
          .filter((result) => !result.success)
          .map((result) => result.message)
          .join(', ');
        setError(errorMessages);
      } else {
        // รีโหลดข้อมูลและปิด modal
        await loadLanguageTexts();
        closeModal();
        alert('อัปเดตข้อความภาษาเรียบร้อยแล้ว');
      }
    } catch (error: any) {
      console.error('❌ Error updating language text:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (textKey: string) => {
    if (!window.confirm(`คุณต้องการลบข้อความ "${textKey}" หรือไม่?`)) return;

    if (!confirm('คุณแน่ใจว่าต้องการลบข้อความนี้?')) return;

    try {
      setDeletingKey(textKey);
      setError(null);

      // ค้นหาข้อความทั้งหมดที่มี key นี้
      const textsToDelete = languageTexts.filter(
        (item) => item.text_key === textKey
      );

      // ลบข้อความทั้งหมด
      const deletePromises = textsToDelete.map((text) =>
        languageService.deleteLanguageText(text.text_id)
      );

      const results = await Promise.all(deletePromises);
      const hasError = results.some((result) => !result.success);

      if (hasError) {
        const errorMessages = results
          .filter((result) => !result.success)
          .map((result) => result.message)
          .join(', ');
        setError(errorMessages);
      } else {
        // รีโหลดข้อมูล
        await loadLanguageTexts();
        alert('ลบข้อความเรียบร้อยแล้ว');
      }
    } catch (error: any) {
      console.error('❌ Error deleting language text:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
    } finally {
      setDeletingKey(null);
    }
  };

  // ถ้ามี error ให้แสดง Error State
  if (error) {
    return (
      <div className="space-y-4 mt-10">
        <div className="bg-white rounded-2xl shadow-lg p-8">
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
                  onClick={loadLanguageTexts}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ลองใหม่
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
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 mt-10">
        <div className="flex justify-between items-center m-4">
          <div className="flex"></div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาข้อความ..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-50
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredAndPaginatedData.total}
          perPage={perPage}
          onPageChange={setCurrentPage}
          onPerPageChange={handlePerPageChange}
          mounted={mounted}
        />

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                  <col className="w-[10%]" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ลำดับ
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                          />
                        </svg>
                        คีย์
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇹🇭</span>
                        ไทย
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇬🇧</span>
                        English
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇨🇳</span>
                        中文
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
                        จัดการ
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndPaginatedData.data.length === 0 ? (
                    <EmptyState
                      title="ไม่พบข้อมูล"
                      description="ไม่พบข้อมูลที่ตรงกับการค้นหา"
                      colSpan={6}
                    />
                  ) : (
                    filteredAndPaginatedData.data.map(([key, texts], index) => (
                      <tr
                        key={key}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 text-center">
                          <div className="text-sm text-gray-500">
                            {(startIndex + index + 1).toLocaleString('th-TH')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <div
                              className="text-sm font-medium text-gray-900 truncate cursor-pointer"
                              title={key}
                            >
                              {key}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <div
                              className="text-sm text-gray-500 truncate cursor-pointer"
                              title={texts.th || '-'}
                            >
                              {texts.th || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <div
                              className="text-sm text-gray-500 truncate cursor-pointer"
                              title={texts.en || '-'}
                            >
                              {texts.en || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <div
                              className="text-sm text-gray-500 truncate cursor-pointer"
                              title={texts.zh || '-'}
                            >
                              {texts.zh || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-center items-center gap-1">
                            <button
                              onClick={() => openEditModal(key)}
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

      {/* Modal using Portal */}
      {isModalOpen &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              margin: 0,
              padding: 0,
            }}
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md relative mx-4">
              {/* Error Toast */}
              {error && (
                <div className="fixed top-4 right-4 z-[10000] max-w-md bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-red-800">
                        เกิดข้อผิดพลาด
                      </h3>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                      <button
                        onClick={() => setError(null)}
                        className="bg-red-50 rounded-md inline-flex text-red-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <span className="sr-only">ปิด</span>
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50 py-4 px-5 border-b border-blue-100/50 relative">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 
                  hover:bg-gray-100/80 rounded-lg p-1"
                  onClick={closeModal}
                  disabled={isSubmitting}
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
                <h2 className="text-lg font-bold text-gray-900 pr-8">
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
                        แก้ไขข้อความภาษา
                      </div>
                      <div className="text-xs text-gray-500 font-normal">
                        กรุณากรอกข้อความในแต่ละภาษา
                      </div>
                    </div>
                  </div>
                </h2>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="p-5 max-h-96 overflow-y-auto">
                <form
                  id="languageTextForm"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                          />
                        </svg>
                        คีย์ (Key)
                      </div>
                    </label>
                    <input
                      type="text"
                      name="text_key"
                      value={form.text_key}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇹🇭</span>
                        ภาษาไทย
                      </div>
                    </label>
                    <input
                      name="th"
                      value={form.th}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="ข้อความภาษาไทย..."
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇬🇧</span>
                        English
                      </div>
                    </label>
                    <input
                      name="en"
                      value={form.en}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="English text..."
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇨🇳</span>
                        中文
                      </div>
                    </label>
                    <input
                      name="zh"
                      value={form.zh}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="中文文本..."
                      disabled={isSubmitting}
                    />
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
                    form="languageTextForm"
                    disabled={isSubmitting}
                    className={`group px-3 py-1.5 text-sm font-medium text-white border border-transparent rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                    transition-all duration-200 shadow-sm hover:shadow-md ${
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
                          กำลังบันทึก...
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          บันทึกการแก้ไข
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
