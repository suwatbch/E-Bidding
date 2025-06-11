import React, { useState, useMemo, useEffect } from 'react';
import { groupedTranslations } from '@/app/model/language_text_Temp';
import Pagination from '@/app/components/ui/Pagination';
import LoadingState from '@/app/components/ui/LoadingState';
import EmptyState from '@/app/components/ui/EmptyState';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';

interface TransectionLanguageProps {
  onEdit?: (key: string) => void;
}

export default function TransectionLanguage({
  onEdit,
}: TransectionLanguageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    key: '',
    th: '',
    en: '',
    zh: '',
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useLocalStorage('languageTextPerPage', 10);

  // Loading and mounting states
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [translations, setTranslations] = useState(groupedTranslations);

  // Filter and paginate data
  const filteredAndPaginatedData = useMemo(() => {
    // Filter data
    const filtered = Object.entries(translations).filter(([key, value]) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        key.toLowerCase().includes(searchLower) ||
        value.th.toLowerCase().includes(searchLower) ||
        value.en.toLowerCase().includes(searchLower) ||
        value.zh.toLowerCase().includes(searchLower)
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
  }, [translations, searchTerm, currentPage, perPage]);

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
    setForm({
      key,
      th: translations[key].th,
      en: translations[key].en,
      zh: translations[key].zh,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditKey(null);
    setForm({ key: '', th: '', en: '', zh: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    closeModal();
  };

  // Loading effect
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // จำลองการโหลดข้อมูลจริง
        setTranslations(groupedTranslations);
      } catch (error) {
        console.error('Error loading translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    setMounted(true);
  }, []);

  return (
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
                <col className="w-[15%]" />
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
                      ไทย
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
                      English
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
                {isLoading ? (
                  <LoadingState colSpan={6} />
                ) : filteredAndPaginatedData.data.length === 0 ? (
                  <EmptyState
                    title="ไม่พบข้อมูล"
                    description="ไม่พบข้อมูลที่ตรงกับการค้นหา"
                    colSpan={6}
                  />
                ) : (
                  filteredAndPaginatedData.data.map(([key, value], index) => (
                    <tr
                      key={key}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-center text-sm text-gray-500">
                        {(startIndex + index + 1).toLocaleString('th-TH')}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm font-medium text-gray-900 truncate cursor-pointer"
                          title={key}
                        >
                          {key}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm text-gray-500 truncate cursor-pointer"
                          title={value.th}
                        >
                          {value.th}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm text-gray-500 truncate cursor-pointer"
                          title={value.en}
                        >
                          {value.en}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm text-gray-500 truncate cursor-pointer"
                          title={value.zh}
                        >
                          {value.zh}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
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
                          <button
                            onClick={() => {
                              if (
                                confirm(`คุณต้องการลบข้อความ "${key}" หรือไม่?`)
                              ) {
                                // Handle delete logic here
                                console.log('Delete:', key);
                              }
                            }}
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
                      แก้ไขข้อความ
                    </div>
                    <div className="text-xs text-gray-500 font-normal">
                      กรุณากรอกข้อมูลที่ต้องการแก้ไข
                    </div>
                  </div>
                </div>
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
                    คีย์
                  </label>
                  <input
                    type="text"
                    name="key"
                    value={form.key}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ไทย
                  </label>
                  <input
                    type="text"
                    name="th"
                    value={form.th}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    English
                  </label>
                  <input
                    type="text"
                    name="en"
                    value={form.en}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    中文
                  </label>
                  <input
                    type="text"
                    name="zh"
                    value={form.zh}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

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
                    className="group px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 
                      border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-600 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                      transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-1.5">
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
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
