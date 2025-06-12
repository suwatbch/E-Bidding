'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Container from '@/app/components/ui/Container';
import EmptyState from '@/app/components/ui/EmptyState';
import { Language, languageService } from '@/app/services/languageService';
import TransectionLanguage from '@/app/components/language/LanguageText';

interface FormData {
  language_code: string;
  language_name: string;
  flag: string;
  is_default: boolean;
  status: number;
}

export default function LanguagePage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLanguage, setEditLanguage] = useState<Language | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    language_code: '',
    language_name: '',
    flag: '',
    is_default: false,
    status: 1,
  });

  const loadLanguages = useCallback(async () => {
    try {
      setError(null);

      // โหลดข้อมูลจาก API ผ่าน languageService
      const data = await languageService.loadLanguagesFromAPI();
      setLanguages(data);
    } catch (error: any) {
      console.error('❌ Error loading languages:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลภาษา');
    }
  }, []);

  useEffect(() => {
    loadLanguages();
  }, [loadLanguages]);

  // Remove search filtering
  const filteredLanguages = languages;

  const openEditModal = (language: Language) => {
    setEditLanguage(language);
    setForm({
      language_code: language.language_code,
      language_name: language.language_name,
      flag: language.flag || '',
      is_default: language.is_default,
      status: language.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditLanguage(null);
    setForm({
      language_code: '',
      language_name: '',
      flag: '',
      is_default: false,
      status: 1,
    });
    setError(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    if (e.target.name === 'status') {
      setForm({ ...form, status: value ? 1 : 0 });
    } else if (e.target.name === 'is_default') {
      setForm({ ...form, is_default: Boolean(value) });
    } else if (e.target.name === 'language_code') {
      setForm({ ...form, language_code: value as string });
    } else {
      setForm({ ...form, [e.target.name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editLanguage) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // ใช้ languageService แทน direct API call
      const result = await languageService.updateLanguage(
        editLanguage.language_code,
        {
          language_name: form.language_name,
          flag: form.flag,
          is_default: form.is_default,
          status: form.status,
        }
      );

      if (result.success) {
        // รีโหลดข้อมูลภาษา
        await loadLanguages();
        closeModal();
        alert('อัปเดตข้อมูลภาษาเรียบร้อยแล้ว');
      } else {
        setError(result.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
      }
    } catch (error: any) {
      console.error('❌ Error updating language:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (code: string) => {
    const language = languages.find((l) => l.language_code === code);
    if (!language) return;

    if (
      !window.confirm(`คุณต้องการลบภาษา "${language.language_name}" หรือไม่?`)
    )
      return;

    if (!confirm('คุณแน่ใจว่าต้องการลบภาษานี้?')) return;

    try {
      setDeletingId(code);
      setError(null);

      const result = await languageService.deleteLanguage(code);

      if (result.success) {
        // รีโหลดข้อมูลภาษา
        await loadLanguages();
        alert('ลบภาษาเรียบร้อยแล้ว');
      } else {
        setError(result.message || 'เกิดข้อผิดพลาดในการลบภาษา');
      }
    } catch (error: any) {
      console.error('❌ Error deleting language:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
    } finally {
      setDeletingId(null);
    }
  };

  // ถ้ามี error ให้แสดง Error State
  if (error) {
    return (
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
                onClick={loadLanguages}
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
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex-1 py-8 flex flex-col">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
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
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                จัดการภาษา
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                จัดการข้อมูลภาษาในระบบ
              </p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <colgroup>
                <col className="w-[5%]" />
                <col className="w-[25%]" />
                <col className="w-[25%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead>
                <tr className="bg-gray-50">
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-2">ลำดับ</div>
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
                      รหัสภาษา
                    </div>
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
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        />
                      </svg>
                      ชื่อภาษา
                    </div>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      ค่าเริ่มต้น
                    </div>
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      สถานะ
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
                {filteredLanguages.length === 0 ? (
                  <EmptyState
                    title="ไม่พบข้อมูล"
                    description="ไม่พบข้อมูลที่ตรงกับการค้นหา"
                    colSpan={6}
                  />
                ) : (
                  filteredLanguages.map((language, index) => (
                    <tr
                      key={language.language_code}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-gray-500">
                          {(index + 1).toLocaleString('th-TH')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <div className="text-sm font-medium text-gray-900 truncate ">
                            <span className="inline-flex items-center">
                              <span className="mr-2">{language.flag}</span>
                              {language.language_code.toUpperCase()} -{' '}
                              {language.language_name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <div className="text-sm text-gray-500 truncate">
                            {language.language_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              language.is_default
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {language.is_default ? 'ใช่' : 'ไม่'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              language.status === 1
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {language.status === 1 ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-center items-center gap-1">
                          <button
                            onClick={() => openEditModal(language)}
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
                            onClick={() => handleDelete(language.language_code)}
                            disabled={deletingId === language.language_code}
                            className={`inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors ${
                              deletingId === language.language_code
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                            title="ลบ"
                          >
                            {deletingId === language.language_code ? (
                              <svg
                                className="w-4 h-4 animate-spin"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                            ) : (
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
                            )}
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

        {/* Language Text Table */}
        <TransectionLanguage
          onEdit={(key) => {
            console.log('Edit:', key);
          }}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md relative">
            {/* Error Toast */}
            {error && (
              <div className="fixed top-4 right-4 z-50 max-w-md bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
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
                      แก้ไขข้อมูลภาษา
                    </div>
                    <div className="text-xs text-gray-500 font-normal">
                      กรุณากรอกข้อมูลที่ต้องการแก้ไข
                    </div>
                  </div>
                </div>
              </h2>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-5">
              <form
                id="languageForm"
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
                      รหัสภาษา
                    </div>
                  </label>
                  <input
                    type="text"
                    name="language_code"
                    value={form.language_code}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder="th"
                    required
                    disabled
                  />
                </div>

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
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        />
                      </svg>
                      ชื่อภาษา
                    </div>
                  </label>
                  <input
                    type="text"
                    name="language_name"
                    value={form.language_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent"
                    placeholder="ภาษาไทย"
                    disabled={isSubmitting}
                    required
                  />
                </div>

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
                          d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                        />
                      </svg>
                      ธงชาติ (Emoji)
                    </div>
                  </label>
                  <input
                    type="text"
                    name="flag"
                    value={form.flag}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent"
                    placeholder="🇹🇭"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={form.is_default}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 flex items-center gap-2 text-sm text-gray-700">
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    ตั้งเป็นค่าเริ่มต้น
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="status"
                    checked={form.status === 1}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 flex items-center gap-2 text-sm text-gray-700">
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
                  form="languageForm"
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
        </div>
      )}
    </Container>
  );
}
