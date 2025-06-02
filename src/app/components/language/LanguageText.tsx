import React from 'react';
import { translations } from '@/app/model/dataLanguageText';

interface TransectionLanguageProps {
  onEdit?: (key: string) => void;
  onDelete?: (key: string) => void;
}

export default function TransectionLanguage({
  onEdit,
  onDelete,
}: TransectionLanguageProps) {
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
              {Object.keys(translations.th).map((key, index) => (
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
                      className="text-sm text-gray-900 truncate"
                      title={translations.th[key]}
                    >
                      {translations.th[key]}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="text-sm text-gray-900 truncate"
                      title={translations.en[key]}
                    >
                      {translations.en[key]}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="text-sm text-gray-900 truncate"
                      title={translations.zh[key]}
                    >
                      {translations.zh[key]}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center space-x-1">
                    <button
                      onClick={() => onEdit?.(key)}
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
    </div>
  );
}
