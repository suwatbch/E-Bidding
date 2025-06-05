'use client';

import React, { useState, useEffect } from 'react';
import Container from '@/app/components/ui/Container';
import {
  Language,
  languages as initialLanguages,
  LanguageCode,
} from '@/app/model/dataLanguageTemp';
import TransectionLanguage from '@/app/components/language/LanguageText';

interface FormData {
  language_code: string;
  language_name: string;
  flag: string;
  is_default: boolean;
  status: 1 | 0;
}

export default function LanguagePage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLanguage, setEditLanguage] = useState<Language | null>(null);
  const [form, setForm] = useState<FormData>({
    language_code: '',
    language_name: '',
    flag: '',
    is_default: false,
    status: 1,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // จำลองการโหลดข้อมูลจริง
        setLanguages(initialLanguages);
      } catch (error) {
        console.error('Error loading languages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Remove search filtering
  const filteredLanguages = languages;

  const openAddModal = () => {
    setEditLanguage(null);
    setForm({
      language_code: '',
      language_name: '',
      flag: '',
      is_default: false,
      status: 1,
    });
    setIsModalOpen(true);
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate language code
    if (!['th', 'en', 'zh'].includes(form.language_code)) {
      alert('รหัสภาษาไม่ถูกต้อง กรุณาระบุ th, en หรือ zh');
      return;
    }

    const languageData: Language = {
      ...form,
      language_code: form.language_code as LanguageCode,
    };

    if (editLanguage) {
      // If setting this language as default, unset others
      if (languageData.is_default) {
        setLanguages(
          languages.map((l) => ({
            ...l,
            is_default:
              l.language_code === editLanguage.language_code ? true : false,
          }))
        );
      } else {
        setLanguages(
          languages.map((l) =>
            l.language_code === editLanguage.language_code ? languageData : l
          )
        );
      }
    } else {
      // If adding new language as default, unset others
      if (languageData.is_default) {
        setLanguages([
          ...languages.map((l) => ({ ...l, is_default: false })),
          languageData,
        ]);
      } else {
        setLanguages([...languages, languageData]);
      }
    }
    closeModal();
  };

  const handleStatusChange = (code: string) => {
    if (window.confirm('คุณต้องการเปลี่ยนสถานะภาษานี้ใช่หรือไม่?')) {
      setLanguages(
        languages.map((language) =>
          language.language_code === code
            ? { ...language, status: language.status === 1 ? 0 : 1 }
            : language
        )
      );
    }
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
              เพิ่มภาษา
            </button>
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
                {isLoading ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredLanguages.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
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
                              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          ไม่พบข้อมูล
                        </h3>
                        <p className="text-sm text-gray-500">
                          ไม่พบข้อมูลที่ตรงกับการค้นหา
                        </p>
                      </div>
                    </td>
                  </tr>
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
                          <div className="text-sm font-medium text-gray-900 truncate cursor-help hover:text-blue-600">
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
                          <div className="text-sm text-gray-500 truncate cursor-help hover:text-blue-600">
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
                        <div className="flex justify-center items-center space-x-2">
                          <button
                            onClick={() => openEditModal(language)}
                            className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 px-2 py-1 rounded-full text-xs font-semibold
                            hover:bg-yellow-200 transition-colors duration-200"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(language.language_code)
                            }
                            className="text-red-600 hover:text-red-900 bg-red-100 px-2 py-1 rounded-full text-xs font-semibold
                            hover:bg-red-200 transition-colors duration-200"
                          >
                            ลบ
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
          onDelete={(key) => {
            if (window.confirm('คุณต้องการลบข้อความนี้ใช่หรือไม่?')) {
              console.log('Delete:', key);
            }
          }}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md relative">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50 py-4 px-5 border-b border-blue-100/50 relative">
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
              <h2 className="text-lg font-bold text-gray-900 pr-8">
                {editLanguage ? (
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
                        เพิ่มข้อมูลภาษา
                      </div>
                      <div className="text-xs text-gray-500 font-normal">
                        กรุณากรอกข้อมูลภาษาใหม่
                      </div>
                    </div>
                  </div>
                )}
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
                      focus:ring-blue-500 focus:border-transparent"
                    placeholder="th"
                    required
                    disabled={editLanguage !== null}
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
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={form.is_default}
                    onChange={handleChange}
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
                  className="group px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 
                    rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-gray-500 group-hover:text-gray-600"
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
                  className="group px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 
                    border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-600 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                    transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-1.5">
                    {editLanguage ? (
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
                        เพิ่มภาษา
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
