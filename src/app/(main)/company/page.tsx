'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Company, companyService } from '@/app/services/companyService';
import Container from '@/app/components/ui/Container';
import Pagination from '@/app/components/ui/Pagination';
import EmptyState from '@/app/components/ui/EmptyState';
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
  // === ALL HOOKS MUST COME FIRST ===
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useLocalStorage('companyPerPage', 10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<FormData>({
    name: '',
    tax_id: '',
    address: '',
    phone: '',
    email: '',
    status: true,
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Company | null;
    direction: 'asc' | 'desc' | null;
  }>({
    key: null,
    direction: null,
  });

  // === FUNCTIONS ===
  const loadCompanies = useCallback(async () => {
    try {
      const result = await companyService.getAllCompanies();
      if (result.success) {
        setCompanies(result.data);
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      console.error('❌ Error loading companies:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลบริษัท');
    }
  }, []);

  const handleRetry = async () => {
    setRetryCount((prev) => prev + 1);
    await loadCompanies();
  };

  // === EFFECTS ===
  useEffect(() => {
    const initializeData = async () => {
      // โหลดข้อมูลบริษัท
      await loadCompanies();
    };

    initializeData();
    setMounted(true);
  }, []);

  // โหลดข้อมูลใหม่เมื่อ searchTerm เปลี่ยน (debounced)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (mounted) {
        loadCompanies();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // === EARLY RETURN AFTER ALL HOOKS ===
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
                onClick={handleRetry}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ลองใหม่ (ครั้งที่ {retryCount + 1})
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

  // === COMPONENT LOGIC CONTINUES ===
  // Filter companies based on search term (ใช้สำหรับ local filtering ถ้าต้องการ)
  const filteredCompanies = companies.filter((company) => {
    if (!searchTerm.trim()) return true;
    const searchTermLower = searchTerm.toLowerCase().replace(/\s/g, '');
    return (
      company.name.toLowerCase().includes(searchTermLower) ||
      company.address.toLowerCase().includes(searchTermLower) ||
      company.phone.toString().replace(/\s/g, '').includes(searchTermLower) ||
      company.email.toLowerCase().includes(searchTermLower)
    );
  });

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
  };

  const getSortIcon = (columnKey: keyof Company) => {
    if (sortConfig.key === columnKey) {
      if (sortConfig.direction === 'asc') {
        return (
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 15l7-7 7 7"
            />
          </svg>
        );
      } else if (sortConfig.direction === 'desc') {
        return (
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        );
      }
    }
    return (
      <svg
        className="w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8 9l4-4 4 4m0 6l-4 4-4-4"
        />
      </svg>
    );
  };

  const openAddModal = () => {
    setEditCompany(null);
    setForm({
      name: '',
      tax_id: '',
      address: '',
      phone: '',
      email: '',
      status: true,
    });
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
      status: !!company.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditCompany(null);
    setForm({
      name: '',
      tax_id: '',
      address: '',
      phone: '',
      email: '',
      status: true,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    // ถ้าเป็นช่องโทรศัพท์ ให้ filter เฉพาะตัวเลขและ -
    if (name === 'phone') {
      const filteredValue = value.replace(/[^0-9-]/g, '');
      setForm({ ...form, [name]: filteredValue });
      return;
    }

    // ถ้าเป็นช่อง email ให้ตรวจสอบรูปแบบ
    if (name === 'email') {
      // อนุญาตให้พิมพ์ได้ แต่จะเช็ครูปแบบตอน submit
      setForm({ ...form, [name]: value.toLowerCase().trim() });
      return;
    }

    const newValue = type === 'checkbox' ? checked : value;
    setForm({ ...form, [name]: newValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError(null);

      // ตรวจสอบรูปแบบอีเมล
      const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(form.email)) {
        setError('กรุณากรอกอีเมลในรูปแบบที่ถูกต้อง เช่น user@example.com');
        return;
      }

      // แปลง status จาก boolean เป็น number สำหรับ API
      const formData = {
        ...form,
        status: form.status ? 1 : 0,
      };

      let result;

      if (editCompany) {
        // อัปเดทบริษัทที่มีอยู่
        const updateData = {
          name: formData.name,
          tax_id: formData.tax_id,
          address: formData.address,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
        };

        result = await companyService.updateCompany(editCompany.id, updateData);

        if (result.success) {
          await loadCompanies();
          closeModal();
          alert('อัปเดทข้อมูลบริษัทเรียบร้อยแล้ว');
        } else {
          console.error('❌ Failed to update company:', result.message);
          setError(result.message);
        }
      } else {
        // สร้างบริษัทใหม่
        const createData = {
          name: formData.name,
          tax_id: formData.tax_id,
          address: formData.address,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
        };

        result = await companyService.createCompany(createData);

        if (result.success) {
          await loadCompanies();
          closeModal();
          alert('เพิ่มข้อมูลบริษัทเรียบร้อยแล้ว');
        } else {
          console.error('❌ Failed to create company:', result.message);
          setError(result.message);
        }
      }
    } catch (error: any) {
      console.error('❌ Error saving company:', error);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจว่าต้องการลบบริษัทนี้?')) return;

    try {
      const result = await companyService.deleteCompany(id);

      if (result.success) {
        await loadCompanies();
        alert('ลบข้อมูลบริษัทเรียบร้อยแล้ว');
      } else {
        console.error('Failed to delete company:', result.message);
        setError(result.message);
      }
    } catch (error: any) {
      console.error('Error deleting company:', error);
      setError('เกิดข้อผิดพลาดในการลบบริษัท');
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ข้อมูลบริษัท
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  จัดการข้อมูลบริษัทในระบบ
                </p>
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
                  <svg
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
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
                เพิ่มบริษัท
              </button>
            </div>
          </div>
        </div>

        {/* Table Info Section */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredCompanies.length}
          perPage={perPage}
          onPageChange={setCurrentPage}
          onPerPageChange={handlePerPageChange}
          mounted={mounted}
        />

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ลำดับ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('name')}
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
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
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      สถานะ
                      {getSortIcon('status')}
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
                {filteredCompanies.length === 0 ? (
                  <EmptyState
                    title="ไม่พบข้อมูล"
                    description="ไม่พบข้อมูลที่ตรงกับการค้นหา"
                    colSpan={7}
                  />
                ) : (
                  currentCompanies.map((company, index) => (
                    <tr
                      key={company.id}
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
                            title={company.name}
                          >
                            {company.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <div
                            className="text-sm text-gray-500 line-clamp-1 cursor-pointer"
                            title={company.address}
                          >
                            {company.address}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <div
                            className="text-sm text-gray-500 truncate cursor-pointer"
                            title={company.phone}
                          >
                            {company.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <div
                            className="text-sm text-gray-500 truncate cursor-pointer"
                            title={company.email}
                          >
                            {company.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            company.status
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {company.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(company)}
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
                                confirm(
                                  `คุณต้องการลบบริษัท "${company.name}" หรือไม่?`
                                )
                              ) {
                                handleDelete(company.id);
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

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden">
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
                      {error.includes('API') && (
                        <div className="mt-2 text-xs text-red-600">
                          <p>💡 วิธีแก้ไข:</p>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>
                              ตรวจสอบว่า API Server ทำงานอยู่ที่ port 3001
                            </li>
                            <li>
                              รัน{' '}
                              <code className="bg-red-100 px-1 rounded">
                                npm run dev:api
                              </code>{' '}
                              ใน terminal
                            </li>
                            <li>ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต</li>
                          </ul>
                        </div>
                      )}
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
                  {editCompany ? (
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
                          แก้ไขข้อมูลบริษัท
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
                          เพิ่มข้อมูลบริษัท
                        </div>
                        <div className="text-xs text-gray-500 font-normal">
                          กรุณากรอกข้อมูลบริษัทใหม่
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
                  id="companyForm"
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
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
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
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        โทรศัพท์
                      </div>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      pattern="[0-9\-]+"
                      inputMode="numeric"
                      placeholder="02-123-4567 หรือ 0812345678"
                      title="กรุณากรอกเฉพาะตัวเลขและเครื่องหมาย - เท่านั้น"
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
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        อีเมล
                      </div>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                      placeholder="example@company.com"
                      title="กรุณากรอกอีเมลในรูปแบบที่ถูกต้อง เช่น user@example.com"
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
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
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="status"
                      checked={form.status}
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
                    form="companyForm"
                    disabled={isSubmitting}
                    className={`group px-3 py-1.5 text-sm font-medium text-white border border-transparent rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                      transition-all duration-200 shadow-md hover:shadow-md ${
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
                          {editCompany ? 'กำลังบันทึก...' : 'กำลังเพิ่ม...'}
                        </>
                      ) : editCompany ? (
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
