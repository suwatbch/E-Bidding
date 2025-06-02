'use client';

import React, { useState, useEffect } from 'react';
import Container from '@/app/components/ui/Container';
import TableLoading from '@/app/components/ui/TableLoading';
import {
  Language,
  languages as initialLanguages,
  LanguageCode,
} from '@/app/model/dataLanguage';

interface FormData {
  code: string;
  name: string;
  flag: string;
  isDefault: boolean;
  status: 1 | 0;
}

export default function LanguagePage() {
  const [languages, setLanguages] = useState<Language[]>(initialLanguages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLanguage, setEditLanguage] = useState<Language | null>(null);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<FormData>({
    code: '',
    name: '',
    flag: '',
    isDefault: false,
    status: 1,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Remove search filtering
  const filteredLanguages = languages;

  const openAddModal = () => {
    setEditLanguage(null);
    setForm({
      code: '',
      name: '',
      flag: '',
      isDefault: false,
      status: 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (language: Language) => {
    setEditLanguage(language);
    setForm({
      code: language.code,
      name: language.name,
      flag: language.flag,
      isDefault: language.isDefault,
      status: language.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditLanguage(null);
    setForm({
      code: '',
      name: '',
      flag: '',
      isDefault: false,
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
    } else if (e.target.name === 'isDefault') {
      setForm({ ...form, isDefault: Boolean(value) });
    } else if (e.target.name === 'code') {
      setForm({ ...form, code: value as string });
    } else {
      setForm({ ...form, [e.target.name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate language code
    if (!['th', 'en', 'zh'].includes(form.code)) {
      alert('รหัสภาษาไม่ถูกต้อง กรุณาระบุ th, en หรือ zh');
      return;
    }

    const languageData: Language = {
      ...form,
      code: form.code as LanguageCode,
    };

    if (editLanguage) {
      // If setting this language as default, unset others
      if (languageData.isDefault) {
        setLanguages(
          languages.map((l) => ({
            ...l,
            isDefault: l.code === editLanguage.code ? true : false,
          }))
        );
      } else {
        setLanguages(
          languages.map((l) =>
            l.code === editLanguage.code ? languageData : l
          )
        );
      }
    } else {
      // If adding new language as default, unset others
      if (languageData.isDefault) {
        setLanguages([
          ...languages.map((l) => ({ ...l, isDefault: false })),
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
          language.code === code
            ? { ...language, status: language.status === 1 ? 0 : 1 }
            : language
        )
      );
    }
  };

  if (!mounted) {
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
                  <h1 className="text-2xl font-bold text-gray-900">
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
              <table className="min-w-full divide-y divide-gray-200">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[25%]" />
                  <col className="w-[25%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
                    >
                      ลำดับ
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
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
                          className="w-5 h-5 text-gray-500"
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
                          className="w-5 h-5 text-gray-500"
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
                          className="w-5 h-5 text-gray-500"
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
                          className="w-5 h-5 text-gray-500"
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
                <tbody>
                  <TableLoading />
                </tbody>
              </table>
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
                <h1 className="text-2xl font-bold text-gray-900">จัดการภาษา</h1>
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
            <table className="min-w-full divide-y divide-gray-200">
              <colgroup>
                <col className="w-[5%]" />
                <col className="w-[25%]" />
                <col className="w-[25%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
                  >
                    ลำดับ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
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
                        className="w-5 h-5 text-gray-500"
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
                        className="w-5 h-5 text-gray-500"
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
                        className="w-5 h-5 text-gray-500"
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
                        className="w-5 h-5 text-gray-500"
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
                {!mounted ? (
                  <TableLoading />
                ) : (
                  filteredLanguages.map((language, index) => (
                    <tr key={language.code}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 text-center">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center">
                            <span className="text-xl mr-2">
                              {language.flag}
                            </span>
                            {language.code.toUpperCase()} - {language.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {language.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            language.isDefault
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {language.isDefault ? 'ใช่' : 'ไม่'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            language.status === 1
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {language.status === 1 ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center space-x-1">
                        <button
                          onClick={() => openEditModal(language)}
                          className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 px-2 py-1 rounded-full text-xs font-semibold
                            hover:bg-yellow-200 transition-colors duration-200"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleStatusChange(language.code)}
                          className="text-red-600 hover:text-red-900 bg-red-100 px-2 py-1 rounded-full text-xs font-semibold
                            hover:bg-red-200 transition-colors duration-200"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
              hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
              dark:[&::-webkit-scrollbar-track]:bg-gray-700
              dark:[&::-webkit-scrollbar-thumb]:bg-gray-500
              dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
            >
              <form
                id="languageForm"
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
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                      รหัสภาษา
                    </div>
                  </label>
                  <input
                    type="text"
                    name="code"
                    id="code"
                    value={form.code}
                    onChange={handleChange}
                    maxLength={5}
                    placeholder="เช่น th, en"
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
                          d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M16 3l-2 3m0 0l-2-3m2 3v12"
                        />
                      </svg>
                      ธงชาติ (ไม่บังคับ)
                    </div>
                  </label>
                  <input
                    type="text"
                    name="flag"
                    id="flag"
                    value={form.flag}
                    onChange={handleChange}
                    maxLength={5}
                    placeholder="เช่น 🇹🇭, 🇬🇧"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent"
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
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        />
                      </svg>
                      ชื่อภาษา
                    </div>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isDefault"
                    id="isDefault"
                    checked={form.isDefault}
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
                    id="status"
                    checked={form.status === 1}
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
