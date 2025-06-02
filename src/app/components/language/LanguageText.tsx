import React, { useState } from 'react';
import { groupedTranslations } from '@/app/model/dataLanguageTextTemp';

interface TransectionLanguageProps {
  onEdit?: (key: string) => void;
  onDelete?: (key: string) => void;
}

export default function TransectionLanguage({
  onEdit,
  onDelete,
}: TransectionLanguageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [form, setForm] = useState({
    key: '',
    th: '',
    en: '',
    zh: '',
  });

  const openAddModal = () => {
    setEditKey(null);
    setForm({ key: '', th: '', en: '', zh: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (key: string) => {
    setEditKey(key);
    setForm({
      key,
      th: groupedTranslations[key].th,
      en: groupedTranslations[key].en,
      zh: groupedTranslations[key].zh,
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

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-8">
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
                  คีย์
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ไทย
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  English
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  中文
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.keys(groupedTranslations).map((key, index) => (
                <tr
                  key={key}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="text-sm font-medium text-gray-900 truncate"
                      title={key}
                    >
                      {key}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="text-sm text-gray-500 truncate"
                      title={groupedTranslations[key].th}
                    >
                      {groupedTranslations[key].th}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="text-sm text-gray-500 truncate"
                      title={groupedTranslations[key].en}
                    >
                      {groupedTranslations[key].en}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="text-sm text-gray-500 truncate"
                      title={groupedTranslations[key].zh}
                    >
                      {groupedTranslations[key].zh}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center space-x-1">
                    <button
                      onClick={() => openEditModal(key)}
                      className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 px-2 py-1 rounded-full text-xs font-semibold
                        hover:bg-yellow-200 transition-colors duration-200"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => onDelete?.(key)}
                      className="text-red-600 hover:text-red-900 bg-red-100 px-2 py-1 rounded-full text-xs font-semibold
                        hover:bg-red-200 transition-colors duration-200"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                {editKey ? 'แก้ไขข้อความ' : 'เพิ่มข้อความ'}
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
                    disabled={!!editKey}
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
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="group px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 
                      border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-600 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                      transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {editKey ? 'บันทึกการแก้ไข' : 'เพิ่มข้อความ'}
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
