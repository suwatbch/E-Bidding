"use client";

import React, { useState, useEffect } from 'react';
import { Company, initialCompanies } from './data';

export default function CompanyInfoPage() {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({
    name: '',
    tax_id: '',
    address: '',
    phone: '',
    email: '',
    status: true
  });

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.tax_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredCompanies.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const openAddModal = () => {
    setEditCompany(null);
    setForm({ name: '', tax_id: '', address: '', phone: '', email: '', status: true });
    setIsModalOpen(true);
  };

  const openEditModal = (company: Company) => {
    setEditCompany(company);
    setForm({
      name: company.name,
      tax_id: company.tax_id,
      address: company.address,
      phone: company.phone,
      email: company.email,
      status: company.status
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditCompany(null);
    setForm({ name: '', tax_id: '', address: '', phone: '', email: '', status: true });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editCompany) {
      setCompanies(companies.map(c => c.id === editCompany.id ? { ...editCompany, ...form } : c));
    } else {
      setCompanies([...companies, { id: Date.now(), ...form }]);
    }
    closeModal();
  };

  const handleStatusChange = (id: number) => {
    if (window.confirm('คุณต้องการลบบริษัทนี้ใช่หรือไม่?')) {
      setCompanies(companies.map(company => 
        company.id === id 
          ? { ...company, status: !company.status }
          : company
      ));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto py-8 px-4 flex flex-col">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ข้อมูลบริษัท</h1>
              <p className="mt-1 text-sm text-gray-500">จัดการข้อมูลบริษัทในระบบ</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-[500px]">
                <input
                  type="text"
                  placeholder="ค้นหาบริษัท..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-12 pr-4 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <button
                onClick={openAddModal}
                className="inline-flex items-center h-11 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform 
                  transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
              >
                + เพิ่มบริษัท
              </button>
            </div>
          </div>
        </div>

        {/* Table Info Section */}
        <div className="flex justify-between items-center m-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>แสดง</span>
              <div className="relative">
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent bg-gray-50/50 appearance-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <span>รายการ</span>
            </div>
            <div>ทั้งหมด {filteredCompanies.length} รายการ</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg border border-gray-200 text-sm text-gray-600 
                hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              ก่อนหน้า
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center
                    ${currentPage === page 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg border border-gray-200 text-sm text-gray-600 
                hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              ถัดไป
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[25%]" />
                  <col className="w-[12%]" />
                  <col className="w-[20%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อบริษัท
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      เลขผู้เสียภาษี
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ที่อยู่
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      โทรศัพท์
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      อีเมล
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentCompanies.map(company => (
                    <tr key={company.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 truncate">{company.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate">{company.tax_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 line-clamp-1">{company.address}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate">{company.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate">{company.email}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${company.status 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'}`}
                        >
                          {company.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center space-x-1">
                        <button
                          onClick={() => openEditModal(company)}
                          className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 px-2 py-1 rounded-full text-xs font-semibold
                            hover:bg-yellow-200 transition-colors duration-200"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleStatusChange(company.id)}
                          className="text-red-600 hover:text-red-900 bg-red-100 px-2 py-1 rounded-full text-xs font-semibold
                            hover:bg-red-200 transition-colors duration-200"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                  {currentCompanies.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="w-16 h-16 mb-4 text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <p className="text-xl font-medium text-gray-500 mb-1">ไม่พบข้อมูลที่ค้นหา</p>
                          <p className="text-sm text-gray-400">ลองค้นหาด้วยคำค้นอื่น หรือลองตรวจสอบการสะกดอีกครั้ง</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              onClick={closeModal}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editCompany ? 'แก้ไขข้อมูลบริษัท' : 'เพิ่มบริษัท'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริษัท</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
                <input
                  type="text"
                  name="tax_id"
                  value={form.tax_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent"
                  maxLength={13}
                  placeholder="0000000000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">โทรศัพท์</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent"
                  required
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
                <label className="ml-2 block text-sm text-gray-700">
                  เปิดใช้งาน
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 
                    transition-colors duration-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg 
                    hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:ring-offset-2 transform transition-all duration-200"
                >
                  {editCompany ? 'บันทึก' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 