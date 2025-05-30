"use client";

import React, { useState, useEffect } from 'react';
import { Company, initialCompanies } from '@/app/model/dataCompany';
import Container from '@/app/components/ui/Container';
import TableLoading from '@/app/components/ui/TableLoading';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';

interface FormData {
  name: string;
  tax_id: string;
  address: string;
  phone: string;
  email: string;
  status: boolean;
}

export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [perPage, setPerPage] = useLocalStorage('companyPerPage', 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Company | null;
    direction: 'asc' | 'desc' | null;
  }>({ key: null, direction: null });
  const [form, setForm] = useState<FormData>({
    name: '',
    tax_id: '',
    address: '',
    phone: '',
    email: '',
    status: true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.tax_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort companies
  const sortedCompanies = React.useMemo(() => {
    let sortableCompanies = [...filteredCompanies];
    if (sortConfig.key && sortConfig.direction) {
      sortableCompanies.sort((a, b) => {
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
    return sortableCompanies;
  }, [filteredCompanies, sortConfig]);

  // Calculate pagination with sorted companies
  const totalPages = Math.ceil(sortedCompanies.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentCompanies = sortedCompanies.slice(startIndex, endIndex);

  const requestSort = (key: keyof Company) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    
    setSortConfig({ key: direction ? key : null, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (columnKey: keyof Company) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (sortConfig.direction === 'asc') {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

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
    if (window.confirm('คุณต้องการ "ลบ" บริษัทนี้ใช่หรือไม่ ?')) {
      setCompanies(companies.map(company => 
        company.id === id 
          ? { ...company, status: !company.status }
          : company
      ));
    }
  };

  // แก้ไข handlePerPageChange
  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setCurrentPage(1);
  };

  return (
    <Container className="py-8">
      <div className="flex-1 py-8 flex flex-col">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ข้อมูลบริษัท</h1>
                <p className="mt-1 text-sm text-gray-500">จัดการข้อมูลบริษัทในระบบ</p>
              </div>
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
                className="inline-flex items-center h-11 px-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg 
                  hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 
                  focus:ring-offset-2 transform transition-all duration-200 shadow-md hover:scale-[1.02] 
                  active:scale-[0.98] whitespace-nowrap gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                เพิ่มบริษัท
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
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent bg-gray-50/50 appearance-none cursor-pointer"
                >
                  <option value={5}>5</option>
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
            <div>ทั้งหมด {mounted ? filteredCompanies.length.toLocaleString() : '-'} รายการ</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg border border-gray-200 text-sm text-gray-600 
                hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              หน้าแรก
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg border border-gray-200 text-sm text-gray-600 
                hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              ก่อนหน้า
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                  if (i === 4) return <span key="dots" className="px-2">...</span>;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - (4 - i);
                  if (i === 0) return <span key="dots" className="px-2">...</span>;
                } else {
                  if (i === 0) return <span key="dots1" className="px-2">...</span>;
                  if (i === 4) return <span key="dots2" className="px-2">...</span>;
                  pageNum = currentPage + (i - 2);
                }
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center
                      ${currentPage === pageNum 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg border border-gray-200 text-sm text-gray-600 
                hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              ถัดไป
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg border border-gray-200 text-sm text-gray-600 
                hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              หน้าสุดท้าย
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[25%]" />
                  <col className="w-[20%]" />
                  <col className="w-[15%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        ลำดับ
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        ชื่อบริษัท
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('address')}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        ที่อยู่
                        {getSortIcon('address')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('phone')}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        โทรศัพท์
                        {getSortIcon('phone')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('email')}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        อีเมล
                        {getSortIcon('email')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('status')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        สถานะ
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        จัดการ
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mounted ? (
                    <>
                      {currentCompanies.map((company, index) => (
                        <tr key={company.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 text-center">
                            <div className="text-sm text-gray-500">
                              {(startIndex + index + 1).toLocaleString('th-TH')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative">
                              <div className="text-sm font-medium text-gray-900 truncate cursor-help hover:text-blue-600"
                                   title={company.name}>
                                {company.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative">
                              <div className="text-sm text-gray-500 line-clamp-1 cursor-help hover:text-blue-600"
                                   title={company.address}>
                                {company.address}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative">
                              <div className="text-sm text-gray-500 truncate cursor-help hover:text-blue-600"
                                   title={company.phone}>
                                {company.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative">
                              <div className="text-sm text-gray-500 truncate cursor-help hover:text-blue-600"
                                   title={company.email}>
                                {company.email}
                              </div>
                            </div>
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
                          <td colSpan={8}>
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
                    </>
                  ) : (
                    <TableLoading />
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-lg font-bold text-gray-900">
                  {editCompany ? (
                    <div className="flex items-center gap-2">
                      <div className="bg-yellow-100 p-1.5 rounded-lg">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">แก้ไขข้อมูลบริษัท</div>
                        <div className="text-xs text-gray-500 font-normal">กรุณากรอกข้อมูลที่ต้องการแก้ไข</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 p-1.5 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">เพิ่มข้อมูลบริษัท</div>
                        <div className="text-xs text-gray-500 font-normal">กรุณากรอกข้อมูลบริษัทใหม่</div>
                      </div>
                    </div>
                  )}
                </h2>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-5 py-4 
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
                dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                <form id="companyForm" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        ชื่อบริษัท
                      </div>
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        เลขประจำตัวผู้เสียภาษี
                      </div>
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        ที่อยู่
                      </div>
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        โทรศัพท์
                      </div>
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        อีเมล
                      </div>
                    </label>
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
                    <label className="ml-2 flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                      <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      ยกเลิก
                    </div>
                  </button>
                  <button
                    type="submit"
                    form="companyForm"
                    className="group px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 
                      border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-600 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                      transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-1.5">
                      {editCompany ? (
                        <>
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          บันทึกการแก้ไข
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          เพิ่มบริษัท
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
} 