'use client';

import React, { useEffect, useState } from 'react';
import { User, initialUsers } from '@/app/model/dataUser';
import Container from '@/app/components/ui/Container';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';
import { LockTableIcon } from '@/app/components/ui/Icons';
import UserFormModal from '@/app/components/user/FormDataUser';
import { useUser } from '@/app/contexts/UserContext';
import Pagination from '@/app/components/ui/Pagination';
import LoadingState from '@/app/components/ui/LoadingState';
import EmptyState from '@/app/components/ui/EmptyState';

interface FormData {
  username: string;
  password: string;
  language_code: string;
  fullname: string;
  tax_id: string;
  address: string;
  email: string;
  phone: string;
  type: 'admin' | 'user';
  status: boolean;
  is_locked: boolean;
  is_profile: boolean;
  image?: string;
}

const initialForm: FormData = {
  username: '',
  password: '',
  language_code: 'th',
  fullname: '',
  tax_id: '',
  address: '',
  email: '',
  phone: '',
  type: 'user',
  status: true,
  is_locked: false,
  is_profile: false,
  image: '',
};

export default function UserPage() {
  const { users, setUsers, updateUser, profile, updateProfile } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [perPage, setPerPage] = useLocalStorage('userPerPage', 5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: 'asc' | 'desc' | null;
  }>({
    key: 'username',
    direction: null,
  });

  const [form, setForm] = useState<FormData>(initialForm);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // จำลองการโหลดข้อมูลจริง
        setUsers(initialUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    setMounted(true);
  }, [setUsers]);

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const searchTermLower = searchTerm.toLowerCase().replace(/\s/g, '');
    return (
      user.fullname.toLowerCase().includes(searchTermLower) ||
      (user.address || '').toLowerCase().includes(searchTermLower) ||
      user.phone.toString().replace(/\s/g, '').includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower)
    );
  });

  // Sort users
  const sortedUsers = React.useMemo(() => {
    const sorted = [...filteredUsers];
    if (sortConfig.direction !== null) {
      sorted.sort((a, b) => {
        const aValue = String(a[sortConfig.key]).toLowerCase();
        const bValue = String(b[sortConfig.key]).toLowerCase();

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredUsers, sortConfig]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedUsers.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const currentUsers = sortedUsers.slice(startIndex, startIndex + perPage);

  // Sort function
  const requestSort = (key: keyof User) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Get sort icon
  const getSortIcon = (key: keyof User) => {
    if (sortConfig.key !== key) {
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
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }
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
    }
    if (sortConfig.direction === 'desc') {
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
    return null;
  };

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const openAddModal = () => {
    setEditUser(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    // เช็คว่าผู้ใช้นี้เป็นโปรไฟล์ปัจจุบันหรือไม่
    const isCurrentProfile = profile?.user_id === user.user_id;

    setForm({
      username: user.username,
      password: '',
      language_code: user.language_code,
      fullname: user.fullname,
      tax_id: user.tax_id || '',
      address: user.address || '',
      email: user.email,
      phone: user.phone,
      type: user.type,
      status: user.status,
      is_locked: user.is_locked,
      is_profile: isCurrentProfile,
      image: user.image || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditUser(null);
    setForm(initialForm);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (formData: FormData) => {
    if (editUser) {
      const updatedUser: User = {
        ...editUser,
        ...formData,
        updated_dt: new Date().toISOString(),
      };

      if (!formData.password) {
        updatedUser.password = editUser.password;
      }

      // ถ้าตั้งค่าเป็นโปรไฟล์
      if (formData.is_profile) {
        // อัพเดทโปรไฟล์
        updateProfile(updatedUser);
      } else if (profile?.user_id === editUser.user_id) {
        // ถ้าเป็นโปรไฟล์ปัจจุบันแต่ยกเลิกการตั้งค่าเป็นโปรไฟล์
        localStorage.removeItem('profile');
      }

      // อัพเดทข้อมูลผู้ใช้
      updateUser(updatedUser);

      setIsModalOpen(false);
      setEditUser(null);
      setForm(initialForm);
    } else {
      const newUser: User = {
        ...formData,
        user_id: Date.now(),
        created_dt: new Date().toISOString(),
        updated_dt: new Date().toISOString(),
        login_count: 0,
      };

      // ถ้าตั้งค่าเป็นโปรไฟล์
      if (formData.is_profile) {
        updateProfile(newUser);
      }

      const newUsers = [...users, newUser];
      setUsers(newUsers);
      localStorage.setItem('users', JSON.stringify(newUsers));

      setIsModalOpen(false);
      setForm(initialForm);
    }
  };

  const handleStatusChange = (id: number) => {
    const updatedUsers = users.map((user) =>
      user.user_id === id ? { ...user, status: !user.status } : user
    );
    setUsers(updatedUsers);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  จัดการผู้ใช้งาน
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  จัดการข้อมูลผู้ใช้งานในระบบ
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-[500px]">
                <input
                  type="text"
                  placeholder="ค้นหาผู้ใช้งาน..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-12 pr-4 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent bg-gray-50/50"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
              <div>
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center h-11 px-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg 
                    hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:ring-offset-2 transform transition-all duration-200 shadow-md hover:scale-[1.02] 
                    active:scale-[0.98] whitespace-nowrap gap-2"
                >
                  <div className="flex items-center gap-2">
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
                    <span>เพิ่มผู้ใช้งาน</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Info Section */}
        <Pagination
          currentPage={currentPage}
          totalItems={sortedUsers.length}
          perPage={perPage}
          onPageChange={setCurrentPage}
          onPerPageChange={handlePerPageChange}
          mounted={mounted}
        />

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[17%]" />
                  <col className="w-[15%]" />
                  <col className="w-[14%]" />
                  <col className="w-[13%]" />
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
                      <div>ลำดับ</div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('fullname')}
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>ชื่อ-นามสกุล</span>
                        {getSortIcon('fullname')}
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
                        <span>ที่อยู่</span>
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
                        <span>โทรศัพท์</span>
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
                        <span>อีเมล</span>
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
                        <span>สถานะ</span>
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort('type')}
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <span>ประเภท</span>
                        {getSortIcon('type')}
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
                        <span>จัดการ</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <LoadingState colSpan={8} />
                  ) : filteredUsers.length === 0 ? (
                    <EmptyState
                      title="ไม่พบข้อมูล"
                      description="ไม่พบข้อมูลที่ตรงกับการค้นหา"
                      colSpan={8}
                    />
                  ) : (
                    currentUsers.map((user, index) => (
                      <tr
                        key={user.user_id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 text-center">
                          <div>
                            {user.is_locked ? (
                              <div className="flex justify-center items-center text-red-400">
                                <LockTableIcon />
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">
                                {(startIndex + index + 1).toLocaleString(
                                  'th-TH'
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <div
                              className="text-sm font-medium text-gray-900 truncate cursor-help hover:text-blue-600"
                              title={user.fullname}
                            >
                              {user.fullname}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <div
                              className="text-sm text-gray-500 truncate cursor-help hover:text-blue-600"
                              title={user.address || '-'}
                            >
                              {user.address || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <div
                              className="text-sm text-gray-500 truncate cursor-help hover:text-blue-600"
                              title={user.phone}
                            >
                              {user.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <div
                              className="text-sm text-gray-500 truncate cursor-help hover:text-blue-600"
                              title={user.email}
                            >
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div>
                              <div
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${
                                  user.status
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {user.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div>
                            <div
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${
                                user.type === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {user.type === 'admin' ? 'ผู้ดูแล' : 'ผู้ใช้งาน'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center space-x-1">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 px-2 py-1 rounded-full text-xs font-semibold
                                hover:bg-yellow-200 transition-colors duration-200"
                            >
                              แก้ไข
                            </button>
                            <button
                              onClick={() => handleStatusChange(user.user_id)}
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
        </div>

        {/* Modal */}
        <UserFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          editUser={editUser}
          initialForm={initialForm}
          form={form}
          setForm={setForm}
          isFromProfileMenu={false}
        />
      </div>
    </Container>
  );
}
