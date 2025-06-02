'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/hooks/useLanguage';
import { Language, languages as initialLanguages, LanguageCode } from '@/app/model/dataLanguage';
import { translations } from '@/app/model/dataLanguageText';
import { SearchBarIcon } from '@/app/components/ui/icons';

interface FormData extends Language {
  translations: {
    [key: string]: string;
  };
}

const initialForm: FormData = {
  code: 'th' as LanguageCode,
  name: '',
  isDefault: false,
  status: 1,
  translations: {}
};

export default function LanguagePage() {
  const [languages, setLanguages] = useState<Language[]>(initialLanguages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLanguage, setEditLanguage] = useState<Language | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [searchTerm, setSearchTerm] = useState('');
  const { translate } = useLanguage();

  // Filter languages based on search term
  const filteredLanguages = languages.filter(language =>
    language.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    language.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (formData: FormData) => {
    if (editLanguage) {
      // Update existing language
      setLanguages(prev =>
        prev.map(lang => (lang.code === editLanguage.code ? { ...formData } : lang))
      );
    } else {
      // Add new language
      setLanguages(prev => [...prev, { ...formData }]);
    }
    setIsModalOpen(false);
    setForm(initialForm);
  };

  const handleEdit = (language: Language) => {
    setEditLanguage(language);
    setForm({
      ...language,
      translations: translations[language.code] || {}
    });
    setIsModalOpen(true);
  };

  const handleDelete = (code: string) => {
    if (window.confirm('คุณต้องการลบภาษานี้ใช่หรือไม่?')) {
      setLanguages(prev => prev.filter(lang => lang.code !== code));
    }
  };

  const handleAdd = () => {
    setEditLanguage(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-white">ข้อมูลภาษา</h1>
        <p className="text-blue-100 mt-1">จัดการข้อมูลภาษาในระบบ</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-b-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="ค้นหาภาษา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-2.5">
              <SearchBarIcon />
            </span>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 min-w-[120px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            เพิ่มภาษา
          </button>
        </div>
      </div>

      {/* Language List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสภาษา</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อภาษา</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ค่าเริ่มต้น</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLanguages.map((language) => (
                <tr key={language.code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{language.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{language.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {language.isDefault ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ใช่
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        ไม่
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {language.status === 1 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        เปิดใช้งาน
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        ปิดใช้งาน
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(language)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(language.code)}
                      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors"
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

      {/* Language Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editLanguage ? 'แก้ไขภาษา' : 'เพิ่มภาษา'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(form);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสภาษา</label>
                  <select
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value as LanguageCode })}
                    className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="th">ไทย (th)</option>
                    <option value="en">อังกฤษ (en)</option>
                    <option value="zh">จีน (zh)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อภาษา</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-900">ตั้งเป็นค่าเริ่มต้น</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="status"
                    checked={form.status === 1}
                    onChange={(e) => setForm({ ...form, status: e.target.checked ? 1 : 0 })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="status" className="text-sm text-gray-900">เปิดใช้งาน</label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editLanguage ? 'บันทึกการแก้ไข' : 'เพิ่มภาษา'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 