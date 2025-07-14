'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { User, userService } from '@/app/services/userService';
import { Company, companyService } from '@/app/services/companyService';
import {
  UserCompany,
  userCompanyService,
} from '@/app/services/userCompanyService';
import Container from '@/app/components/ui/Container';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';
import { LockTableIcon } from '@/app/components/ui/icons';
import Pagination from '@/app/components/ui/Pagination';
import EmptyState from '@/app/components/ui/EmptyState';
import { handleFormChange, formChangeConfig } from '@/app/utils/globalFunction';
import { Language, languageService } from '@/app/services/languageService';

// Eye icons for password visibility toggle
const EyeIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
    />
  </svg>
);

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
  image?: string;
}

interface UserCompanyForm {
  company_id: number;
  role_in_company: string;
  is_primary: boolean;
  status: number;
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
  image: '',
};

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [perPage, setPerPage] = useLocalStorage('userPerPage', 10);
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
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Company related states
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  const [userCompanies, setUserCompanies] = useState<UserCompanyForm[]>([]);
  const [currentUserCompanies, setCurrentUserCompanies] = useState<
    UserCompany[]
  >([]);
  const [allUserCompanies, setAllUserCompanies] = useState<UserCompany[]>([]);

  // ฟังก์ชันตรวจสอบความยาวรหัสผ่าน
  const getPasswordBorderClass = () => {
    const passwordLength = form.password.length;

    if (passwordLength === 0) {
      return 'border-gray-300 focus:border-blue-500'; // สีปกติ
    } else if (passwordLength > 0 && passwordLength < 6) {
      return 'border-red-500 focus:border-red-500'; // สีแดง
    } else if (passwordLength >= 6) {
      return 'border-green-500 focus:border-green-500'; // สีเขียว
    }
    return 'border-gray-300 focus:border-blue-500';
  };

  const loadUsers = useCallback(async () => {
    try {
      const result = await userService.getAllUsers(searchTerm);
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        setUsers([]);
        alert(result.message);
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      setUsers([]);
      alert(error);
    }
  }, [searchTerm]);

  const loadAllUserCompanies = useCallback(async () => {
    try {
      const result = await userCompanyService.getAllUserCompanies();
      if (result.success && result.data) {
        setAllUserCompanies(result.data);
      } else {
        console.error('Error loading all user companies:', result.message);
        setAllUserCompanies([]);
      }
    } catch (error: any) {
      console.error('Error loading all user companies:', error);
      setAllUserCompanies([]);
    }
  }, []);

  const loadLanguages = useCallback(async () => {
    try {
      const languages = await languageService.loadLanguagesFromAPI();
      // กรองเฉพาะภาษาที่เปิดใช้งาน (status = 1)
      const activeLanguages = languages.filter((lang) => lang.status === 1);
      setAvailableLanguages(activeLanguages);
    } catch (error: any) {
      console.error('Error loading languages:', error);
      // ถ้าโหลดภาษาไม่ได้ ให้ใช้ค่า default
      setAvailableLanguages([
        {
          language_code: 'th',
          language_name: 'ไทย',
          flag: '🇹🇭',
          is_default: true,
          status: 1,
        },
      ]);
    }
  }, []);

  const loadCompanies = useCallback(async () => {
    try {
      const result = await companyService.getActiveCompanies();
      if (result.success && result.data) {
        setAvailableCompanies(result.data);
      } else {
        console.error('Error loading companies:', result.message);
        setAvailableCompanies([]);
      }
    } catch (error: any) {
      console.error('Error loading companies:', error);
      setAvailableCompanies([]);
    }
  }, []);

  const loadUserCompanies = useCallback(async (userId: number) => {
    try {
      const result = await userCompanyService.getUserCompanies(userId);
      if (result.success && result.data) {
        setCurrentUserCompanies(result.data);
        // แปลงเป็น form format
        const userCompanyForms = result.data.map((uc) => ({
          company_id: uc.company_id,
          role_in_company: uc.role_in_company || '',
          is_primary: uc.is_primary,
          status: uc.status,
        }));
        setUserCompanies(userCompanyForms);
      } else {
        console.error('Error loading user companies:', result.message);
        setCurrentUserCompanies([]);
        setUserCompanies([]);
      }
    } catch (error: any) {
      console.error('Error loading user companies:', error);
      setCurrentUserCompanies([]);
      setUserCompanies([]);
    }
  }, []);

  const handleRetry = useCallback(async () => {
    setRetryCount((prev) => prev + 1);
    await loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        loadUsers(),
        loadLanguages(),
        loadCompanies(),
        loadAllUserCompanies(),
      ]);
    };

    initializeData();
    setMounted(true);
  }, [loadUsers, loadLanguages, loadCompanies, loadAllUserCompanies]);

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.fullname?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower) ||
      user.address?.toLowerCase().includes(searchLower)
    );
  });

  const sortedUsers = React.useMemo(() => {
    const sorted = [...filteredUsers];
    if (sortConfig.direction !== null) {
      sorted.sort((a, b) => {
        const aValue = String(a[sortConfig.key] || '').toLowerCase();
        const bValue = String(b[sortConfig.key] || '').toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredUsers, sortConfig]);

  const totalPages = Math.ceil(sortedUsers.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const currentUsers = sortedUsers.slice(startIndex, startIndex + perPage);

  const requestSort = (key: keyof User) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const getSortIcon = (key: keyof User) => {
    if (sortConfig.key === key) {
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
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const openAddModal = () => {
    setEditUser(null);
    setForm(initialForm);
    setUserCompanies([]);
    setCurrentUserCompanies([]);
    setIsModalOpen(true);
  };

  const openEditModal = async (user: User) => {
    setEditUser(user);
    setForm({
      username: user.username,
      password: '',
      language_code: user.language_code,
      fullname: user.fullname,
      tax_id: user.tax_id || '',
      address: user.address || '',
      email: user.email,
      phone: user.phone || '',
      type: user.type as 'admin' | 'user',
      status: user.status === 1,
      is_locked: user.is_locked,
      image: user.image || '',
    });

    // โหลดข้อมูลบริษัทของผู้ใช้
    await loadUserCompanies(user.user_id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditUser(null);
    setForm(initialForm);
    setUserCompanies([]);
    setCurrentUserCompanies([]);
    setShowPassword(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    handleFormChange(e, setForm, formChangeConfig);
  };

  // Company management functions
  const addCompanyToUser = () => {
    const newCompany: UserCompanyForm = {
      company_id: 0,
      role_in_company: '',
      is_primary: userCompanies.length === 0, // ถ้าเป็นบริษัทแรก ให้เป็น primary
      status: 1,
    };
    setUserCompanies([...userCompanies, newCompany]);
  };

  const removeCompanyFromUser = (index: number) => {
    const updatedCompanies = userCompanies.filter((_, i) => i !== index);
    // ถ้าลบบริษัท primary ให้ตั้งบริษัทแรกเป็น primary
    if (userCompanies[index].is_primary && updatedCompanies.length > 0) {
      updatedCompanies[0].is_primary = true;
    }
    setUserCompanies(updatedCompanies);
  };

  const updateUserCompany = (
    index: number,
    field: keyof UserCompanyForm,
    value: any
  ) => {
    const updatedCompanies = [...userCompanies];

    if (field === 'is_primary' && value) {
      // ถ้าตั้งเป็น primary ให้ยกเลิก primary ของบริษัทอื่น
      updatedCompanies.forEach((company, i) => {
        company.is_primary = i === index;
      });
    } else {
      updatedCompanies[index] = { ...updatedCompanies[index], [field]: value };
    }

    setUserCompanies(updatedCompanies);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      // ตรวจสอบข้อมูลบริษัท
      const validCompanies = userCompanies.filter((uc) => uc.company_id > 0);
      if (validCompanies.length === 0) {
        alert('กรุณาเลือกบริษัทอย่างน้อย 1 บริษัท');
        return;
      }

      // ตรวจสอบว่ามี primary company หรือไม่
      const hasPrimary = validCompanies.some((uc) => uc.is_primary);
      if (!hasPrimary && validCompanies.length > 0) {
        alert('กรุณาระบุบริษัทหลัก');
        return;
      }

      // เพิ่มตรวจสอบข้อมูลบริษัทที่เพิ่มเข้ามาใหม่ แล้วไม่เลือกบริษัท
      const hasUnselectedCompany = userCompanies.some(
        (uc) => uc.company_id === 0
      );
      if (hasUnselectedCompany) {
        alert('กรุณาระบุบริษัท');
        return;
      }

      if (editUser) {
        // แก้ไขผู้ใช้ - ใช้ transaction function
        const userData = {
          username: form.username,
          password: form.password || undefined,
          fullname: form.fullname,
          email: form.email,
          phone: form.phone,
          address: form.address,
          tax_id: form.tax_id,
          type: form.type,
          status: (form.status ? 1 : 0) as 0 | 1,
          is_locked: form.is_locked,
          language_code: form.language_code,
          image: form.image,
        };

        // เตรียมข้อมูลบริษัทสำหรับ Smart Update
        const companiesData = validCompanies.map((uc) => ({
          id:
            currentUserCompanies.find(
              (cuc) =>
                cuc.company_id === uc.company_id &&
                cuc.role_in_company === uc.role_in_company
            )?.id || 0, // ถ้าหาไม่เจอ ให้เป็น 0 (INSERT)
          company_id: uc.company_id,
          role_in_company: uc.role_in_company,
          is_primary: uc.is_primary,
          status: uc.status,
        }));

        const result = await userService.updateUserWithCompanies(
          editUser.user_id,
          userData,
          companiesData
        );

        if (result.success && result.message === null) {
          await Promise.all([loadUsers(), loadAllUserCompanies()]);
          closeModal();
          alert('อัปเดทข้อมูลผู้ใช้งานเรียบร้อยแล้ว');
        } else {
          alert(result.message);
        }
      } else {
        // เพิ่มผู้ใช้ใหม่ - ใช้ transaction function
        const userData = {
          username: form.username,
          password: form.password,
          fullname: form.fullname,
          email: form.email,
          phone: form.phone,
          address: form.address,
          tax_id: form.tax_id,
          type: form.type,
          status: (form.status ? 1 : 0) as 0 | 1,
          language_code: form.language_code,
          image: form.image,
        };

        // เตรียมข้อมูลบริษัท (ทั้งหมดเป็น INSERT)
        const companiesData = validCompanies.map((uc) => ({
          company_id: uc.company_id,
          role_in_company: uc.role_in_company,
          is_primary: uc.is_primary,
          status: uc.status,
        }));

        const result = await userService.createUserWithCompanies(
          userData,
          companiesData
        );

        if (result.success && result.message === null) {
          await Promise.all([loadUsers(), loadAllUserCompanies()]);
          closeModal();
          alert('เพิ่มข้อมูลผู้ใช้งานเรียบร้อยแล้ว');
        } else {
          alert(result.message);
        }
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('คุณแน่ใจว่าต้องการลบผู้ใช้งานนี้?')) return;

    try {
      const result = await userService.deleteUser(userId);
      if (result.success && result.message === null) {
        await loadUsers();
        alert('ลบข้อมูลผู้ใช้งานเรียบร้อยแล้ว');
      } else {
        alert(result.message);
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error);
    }
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  // ฟังก์ชันดึงบริษัทของผู้ใช้ (แสดงเฉพาะบริษัทหลัก)
  const getUserCompaniesForDisplay = (userId: number) => {
    return allUserCompanies.filter(
      (uc) => uc.user_id === userId && uc.status === 1 && uc.is_primary === true
    );
  };

  // ฟังก์ชันหาชื่อบริษัทจาก company_id
  const getCompanyName = (companyId: number) => {
    const company = availableCompanies.find((c) => c.id === companyId);
    return company ? company.name : 'ไม่พบข้อมูลบริษัท';
  };

  return (
    <Container className="py-8">
      <div className="flex-1 py-8 flex flex-col">
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
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer"
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
                  {filteredUsers.length === 0 ? (
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
                              className="text-sm font-medium text-gray-900 truncate cursor-pointer"
                              title={user.fullname || ''}
                            >
                              {user.fullname || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <div
                              className="text-sm text-gray-500 truncate cursor-pointer"
                              title={user.address || '-'}
                            >
                              {user.address || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <div
                              className="text-sm text-gray-500 truncate cursor-pointer"
                              title={user.phone || ''}
                            >
                              {user.phone || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <div
                              className="text-sm text-gray-500 truncate cursor-pointer"
                              title={user.email || ''}
                            >
                              {user.email || '-'}
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
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditModal(user)}
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
                                    `คุณต้องการลบผู้ใช้ "${user.fullname}" หรือไม่?`
                                  )
                                ) {
                                  handleDelete(user.user_id);
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

        {/* Table Info Section */}
        <Pagination
          currentPage={currentPage}
          totalItems={sortedUsers.length}
          perPage={perPage}
          onPageChange={setCurrentPage}
          onPerPageChange={handlePerPageChange}
          mounted={mounted}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden">
            {/* Modal Header */}
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
                {editUser ? (
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
                        แก้ไขข้อมูลผู้ใช้งาน
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
                        เพิ่มผู้ใช้งานใหม่
                      </div>
                      <div className="text-xs text-gray-500 font-normal">
                        กรุณากรอกข้อมูลผู้ใช้งานใหม่
                      </div>
                    </div>
                  </div>
                )}
              </h2>
            </div>

            {/* Modal Content */}
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-5 py-4">
              <form id="userForm" onSubmit={handleSubmit} className="space-y-4">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      ชื่อผู้ใช้
                    </div>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                      รหัสผ่าน
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:border-transparent ${
                        form.password.length === 0
                          ? 'border-gray-300 focus:ring-blue-500'
                          : form.password.length < 6
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-green-500 focus:ring-green-500'
                      }`}
                      required={!editUser}
                      placeholder={
                        editUser ? 'เว้นว่างไว้หากไม่ต้องการเปลี่ยน' : ''
                      }
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 text-right">
                    ต้องมีอย่างน้อย 6 ตัวอักษร
                  </p>
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      ชื่อ-นามสกุล
                    </div>
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    value={form.fullname}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                <div className="grid grid-cols-2 gap-4">
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        ประเภทผู้ใช้
                      </div>
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.75rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1rem 1rem',
                      }}
                      required
                    >
                      <option value="user">ผู้ใช้งาน</option>
                      <option value="admin">ผู้ดูแลระบบ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                        ภาษา
                      </div>
                    </label>
                    <select
                      name="language_code"
                      value={form.language_code}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.75rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1rem 1rem',
                      }}
                      required
                    >
                      {availableLanguages.length > 0 ? (
                        availableLanguages.map((language) => (
                          <option
                            key={language.language_code}
                            value={language.language_code}
                          >
                            {language.flag && `${language.flag} `}
                            {language.language_name}
                          </option>
                        ))
                      ) : (
                        <option value="th">🇹🇭 ไทย</option>
                      )}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="status"
                          checked={form.status}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          เปิดใช้งาน
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="is_locked"
                          checked={form.is_locked}
                          onChange={handleChange}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          ล็อคบัญชี
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Management Section */}
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
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
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        บริษัทที่เชื่อมโยง
                      </h3>
                      <p className="text-sm text-gray-500">
                        กำหนดบริษัทและตำแหน่งของผู้ใช้งาน
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addCompanyToUser}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
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

                  {userCompanies.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <svg
                        className="w-12 h-12 mx-auto text-gray-400 mb-4"
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
                      <p className="text-sm">ยังไม่มีบริษัทที่เชื่อมโยง</p>
                      <p className="text-xs text-gray-400 mt-1">
                        คลิกปุ่ม "เพิ่มบริษัท" เพื่อเริ่มต้น
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {userCompanies.map((userCompany, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg ${
                          userCompany.is_primary
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="grid grid-cols-12 gap-3 items-center">
                          {/* Company Selection */}
                          <div className="col-span-4">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              บริษัท
                            </label>
                            <select
                              value={userCompany.company_id}
                              onChange={(e) =>
                                updateUserCompany(
                                  index,
                                  'company_id',
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              required
                            >
                              <option value={0}>เลือกบริษัท</option>
                              {availableCompanies.map((company) => (
                                <option key={company.id} value={company.id}>
                                  {company.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Role Input */}
                          <div className="col-span-4">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              ตำแหน่ง/บทบาท
                            </label>
                            <input
                              type="text"
                              value={userCompany.role_in_company}
                              onChange={(e) =>
                                updateUserCompany(
                                  index,
                                  'role_in_company',
                                  e.target.value
                                )
                              }
                              placeholder="เช่น Manager, Director"
                              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          {/* Primary & Status */}
                          <div className="col-span-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              สถานะ
                            </label>
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={userCompany.is_primary}
                                  onChange={(e) =>
                                    updateUserCompany(
                                      index,
                                      'is_primary',
                                      e.target.checked
                                    )
                                  }
                                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-1 text-xs text-gray-700">
                                  บริษัทหลัก
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={userCompany.status === 1}
                                  onChange={(e) =>
                                    updateUserCompany(
                                      index,
                                      'status',
                                      e.target.checked ? 1 : 0
                                    )
                                  }
                                  className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <label className="ml-1 text-xs text-gray-700">
                                  เปิดใช้งาน
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <div className="col-span-1 flex justify-center">
                            <button
                              type="button"
                              onClick={() => removeCompanyFromUser(index)}
                              className="text-red-600 hover:text-red-800 focus:outline-none"
                              title="ลบบริษัท"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* {userCompany.is_primary && (
                          <div className="mt-2 text-xs text-blue-600 flex items-center">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            บริษัทหลักของผู้ใช้งาน
                          </div>
                        )} */}
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 py-3 px-5 border-t border-gray-100">
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="group px-3 py-1.5 text-sm font-medium border border-gray-200 
                    rounded-lg focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 
                    text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300"
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
                  form="userForm"
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
                        {editUser ? 'กำลังบันทึก...' : 'กำลังเพิ่ม...'}
                      </>
                    ) : editUser ? (
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
                        เพิ่มผู้ใช้งาน
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
