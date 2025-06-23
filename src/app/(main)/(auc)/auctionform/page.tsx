'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Container from '@/app/components/ui/Container';
import ThaiDatePicker from '@/app/components/ui/DatePicker';
import {
  AucCategoryIcon,
  AucStartTimeIcon,
  AucOfferIcon,
  AucUserIcon,
} from '@/app/components/ui/Icons';
import { statusConfig, currencyConfig } from '@/app/model/config';
import { User, userService } from '@/app/services/userService';
import { Company, companyService } from '@/app/services/companyService';
import {
  UserCompany,
  userCompanyService,
} from '@/app/services/userCompanyService';
import {
  AuctionParticipant,
  dataAuction_Participant,
} from '@/app/model/dataAuction_Participant';
import {
  auctionTypeService,
  AuctionType as ServiceAuctionType,
} from '@/app/services/auctionTypeService';
import {
  auctionsService,
  Auction,
  CreateAuctionRequest,
  UpdateAuctionRequest,
} from '@/app/services/auctionsService';
import {
  safeParseDate,
  getCurrentDateTime,
  createDateChangeHandler,
} from '@/app/utils/globalFunction';

export default function AuctionFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auctionId = searchParams.get('id');
  const isEdit = auctionId !== '0' && !!auctionId;

  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const [permissionError, setPermissionError] = useState('');
  const [formData, setFormData] = useState<Auction>({
    auction_id: 0,
    name: '',
    auction_type_id: 0,
    start_dt: getCurrentDateTime(),
    end_dt: getCurrentDateTime(),
    reserve_price: 0,
    currency: 1,
    status: 1,
    is_deleted: 0,
    remark: '',
    created_dt: getCurrentDateTime(),
    updated_dt: getCurrentDateTime(),
  });

  // States for participant selection
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(
    []
  );
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [companyUsers, setCompanyUsers] = useState<User[]>([]);
  const [usersCompany, setUsersCompany] = useState<UserCompany[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // States for auction types
  const [auctionTypes, setAuctionTypes] = useState<ServiceAuctionType[]>([]);
  const [loadingAuctionTypes, setLoadingAuctionTypes] = useState(false);

  // States for auction type modal
  const [isAuctionTypeModalOpen, setIsAuctionTypeModalOpen] = useState(false);
  const [isSubmittingAuctionType, setIsSubmittingAuctionType] = useState(false);
  const [auctionTypeForm, setAuctionTypeForm] = useState({
    name: '',
    description: '',
    status: true,
  });

  // States for auction items
  const [auctionItems, setAuctionItems] = useState<any[]>([]);
  const [isAuctionItemModalOpen, setIsAuctionItemModalOpen] = useState(false);
  const [isSubmittingAuctionItem, setIsSubmittingAuctionItem] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [auctionItemForm, setAuctionItemForm] = useState({
    item_name: '',
    description: '',
    quantity: 1,
    unit: '',
    base_price: '0.00',
  });

  // States for price input display
  const [reservePriceFocused, setReservePriceFocused] = useState(false);
  const [reservePriceDisplay, setReservePriceDisplay] = useState('0.00');

  // ฟังก์ชันตรวจสอบสิทธิ์การเข้าถึง
  const checkPermission = (auctionData: Auction | undefined) => {
    if (!auctionData) {
      setHasPermission(false);
      setPermissionError('ไม่พบข้อมูลตลาดที่ต้องการแก้ไข');
      return false;
    }

    // ตรวจสอบว่าตลาดถูกลบแล้วหรือไม่
    if (auctionData.is_deleted === 1) {
      setHasPermission(false);
      setPermissionError('ไม่สามารถแก้ไขตลาดที่ถูกลบแล้ว');
      return false;
    }

    // ตรวจสอบสถานะตลาด - ไม่ให้แก้ไขถ้าตลาดสิ้นสุดแล้ว
    if (auctionData.status === 5 || auctionData.status === 6) {
      setHasPermission(false);
      setPermissionError('ไม่สามารถแก้ไขตลาดที่สิ้นสุดหรือยกเลิกแล้ว');
      return false;
    }

    // ตรวจสอบว่าเวลาเริ่มต้นผ่านไปแล้วหรือไม่
    const startDate = new Date(auctionData.start_dt);
    const now = new Date();
    if (startDate <= now && auctionData.status >= 3) {
      setHasPermission(false);
      setPermissionError('ไม่สามารถแก้ไขตลาดที่เริ่มต้นแล้ว');
      return false;
    }

    // TODO: เพิ่มการตรวจสอบสิทธิ์ของ user
    // เช่น ตรวจสอบว่า user เป็นเจ้าของตลาดหรือมี role ที่เหมาะสม
    // const currentUser = getCurrentUser();
    // if (auctionData.created_by !== currentUser.id && !currentUser.isAdmin) {
    //   setHasPermission(false);
    //   setPermissionError('คุณไม่มีสิทธิ์แก้ไขตลาดนี้');
    //   return false;
    // }

    return true;
  };

  // ฟังก์ชันตรวจสอบ ID ที่ส่งมา
  const validateAuctionId = async (id: string): Promise<number | null> => {
    // ตรวจสอบว่าเป็นตัวเลขหรือไม่
    const numericId = parseInt(id);
    if (isNaN(numericId) || numericId < 0) {
      return null;
    }

    // สำหรับ ID = 0 (สร้างใหม่) ให้ผ่านได้เลย
    if (numericId === 0) {
      return numericId;
    }

    // ตรวจสอบว่า ID มีอยู่ในระบบหรือไม่
    try {
      const response = await auctionsService.getAuctionById(numericId);
      if (response.message !== null) {
        return null;
      }
      return numericId;
    } catch (error) {
      console.error('Error validating auction ID:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      // โหลดข้อมูลประเภทประมูล, บริษัท, users-company relationships, และผู้ใช้ทั้งหมด
      await Promise.all([
        loadAuctionTypes(),
        loadCompanies(),
        loadAllUsersCompany(),
        loadAllUsers(),
      ]);

      if (isEdit && auctionId && auctionId !== '0') {
        // ตรวจสอบ ID ที่ส่งมา
        const validatedId = await validateAuctionId(auctionId);

        if (validatedId === null) {
          setHasPermission(false);
          setPermissionError('รหัสตลาดไม่ถูกต้องหรือไม่มีอยู่ในระบบ');
          return;
        }

        // โหลดข้อมูลตลาดที่ต้องการแก้ไข
        await loadAuctionData(validatedId);
        // โหลดข้อมูลผู้เข้าร่วมประมูล
        await loadAuctionParticipants(validatedId);
      }
    };

    initializeData();
  }, [isEdit, auctionId]);

  // Flag เพื่อป้องกันการรีเซ็ตผู้ใช้เมื่อ auto-select บริษัท
  const isAutoSelectingRef = useRef(false);

  // เมื่อเลือกบริษัท ให้โหลดผู้ใช้ในบริษัทนั้น
  useEffect(() => {
    if (selectedCompanyId) {
      loadUsersByCompany(selectedCompanyId);

      // รีเซ็ตการเลือกผู้ใช้เฉพาะเมื่อไม่ใช่ auto-select
      if (!isAutoSelectingRef.current) {
        setSelectedUserId(null);
        setUserSearchTerm('');
      }

      // รีเซ็ต flag หลังจากประมวลผลเสร็จ
      isAutoSelectingRef.current = false;
    } else {
      setAvailableUsers([]);
      setSelectedUserId(null);
      setUserSearchTerm('');
    }
  }, [selectedCompanyId]);

  // จัดการการคลิกนอก dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.company-dropdown-container')) {
        setShowCompanyDropdown(false);
      }
      if (!target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // อัพเดทชื่อบริษัทในช่อง input เมื่อข้อมูลบริษัทโหลดเสร็จ
  useEffect(() => {
    if (selectedCompanyId && availableCompanies.length > 0) {
      const selectedCompany = availableCompanies.find(
        (c) => c.id === selectedCompanyId
      );
      if (selectedCompany && !companySearchTerm) {
        setCompanySearchTerm(selectedCompany.name);
      }
    }
  }, [selectedCompanyId, availableCompanies]);

  const loadAuctionData = async (id: number) => {
    try {
      setIsLoading(true);
      // ดึงข้อมูลจาก API ตาม auction_id
      const response = await auctionsService.getAuctionById(id);

      if (response.message !== null) {
        setHasPermission(false);
        setPermissionError(response.message || 'ไม่พบข้อมูลตลาด');
        return;
      }

      const auction = response.data;

      // ตรวจสอบสิทธิ์การเข้าถึง
      if (!checkPermission(auction)) {
        return;
      }

      setFormData({
        ...auction,
        // อัพเดท updated_dt เมื่อแก้ไข
        updated_dt: getCurrentDateTime(),
      });
      setHasPermission(true);
      setPermissionError('');
    } catch (error) {
      console.error('Error loading auction data:', error);
      setHasPermission(false);
      setPermissionError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuctionParticipants = async (auctionId: number) => {
    try {
      setLoadingParticipants(true);
      // ดึงข้อมูลผู้เข้าร่วมประมูลจาก dataAuction_Participant
      const participants = dataAuction_Participant
        .filter((p) => p.auction_id === auctionId && p.status === 1)
        .map((p) => p.user_id);

      setSelectedParticipants(participants);
    } catch (error) {
      console.error('Error loading auction participants:', error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const loadAuctionTypes = async () => {
    try {
      setLoadingAuctionTypes(true);
      const response = await auctionTypeService.getActiveAuctionTypes();

      if (response.success && response.message === null) {
        setAuctionTypes(response.data);
      } else {
        alert(response.message);
        setAuctionTypes([]);
      }
    } catch (error) {
      console.error('Error loading auction types:', error);
      setAuctionTypes([]);
    } finally {
      setLoadingAuctionTypes(false);
    }
  };

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);

      const response = await companyService.getAllCompanies();

      if (response.success && response.message === null) {
        // กรองเฉพาะบริษัทที่ status = 1 (เปิดใช้งาน)
        const activeCompanies = response.data.filter(
          (company: Company) => company.status === 1
        );
        setAvailableCompanies(activeCompanies);
      } else {
        alert(response.message);
        setAvailableCompanies([]);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      setAvailableCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const loadAllUsersCompany = async () => {
    try {
      const response = await userCompanyService.getAllUserCompanies();

      if (response.success && response.message === null) {
        const activeUsersCompany = response.data.filter(
          (uc: UserCompany) => uc.status === 1
        );
        setUsersCompany(activeUsersCompany);
      } else {
        alert(response.message);
        setUsersCompany([]);
      }
    } catch (error) {
      console.error('Error loading users-company:', error);
      setUsersCompany([]);
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await userService.getAllUsers();

      if (response.success && response.message === null) {
        const activeUsers = response.data.filter(
          (user: User) => user.status === 1 && !user.is_locked
        );
        setAllUsers(activeUsers);
        setAvailableUsers(activeUsers); // ใช้เป็นค่าเริ่มต้นสำหรับ dropdown
      } else {
        alert(response.message);
        setAllUsers([]);
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('Error loading all users:', error);
      setAllUsers([]);
      setAvailableUsers([]);
    }
  };

  const loadUsersByCompany = async (companyId: number) => {
    try {
      setLoadingUsers(true);
      // ใช้ข้อมูลที่โหลดไว้แล้วแทนการเรียก API ใหม่
      // หาผู้ใช้ที่เชื่อมโยงกับบริษัทนี้จาก usersCompany
      const companyUserIds = usersCompany
        .filter((uc) => uc.company_id === companyId && uc.status === 1)
        .map((uc) => uc.user_id);

      // กรองผู้ใช้จาก allUsers ที่โหลดไว้แล้ว
      const filteredCompanyUsers = allUsers.filter((user) =>
        companyUserIds.includes(user.user_id)
      );

      setCompanyUsers(filteredCompanyUsers);
    } catch (error) {
      console.error('Error loading company users:', error);
      setCompanyUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const saveAuctionParticipants = async (
    auctionId: number,
    participantUserIds: number[]
  ) => {
    try {
      return true;
    } catch (error) {
      console.error('Error saving auction participants:', error);
      return false;
    }
  };

  const saveAuctionItems = async (auctionId: number, items: any[]) => {
    try {
      // เตรียมข้อมูลรายการประมูลสำหรับบันทึก
      const itemsToSave = items.map((item) => ({
        auction_id: auctionId,
        item_name: item.item_name,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        base_price: item.base_price,
        status: 1, // เปิดใช้งาน
      }));

      // TODO: เรียก API เพื่อบันทึกข้อมูลรายการประมูล
      console.log('Saving auction items:', itemsToSave);

      // เมื่อมี API แล้วจะใช้บรรทัดนี้
      // const response = await auctionItemService.createMultipleItems(itemsToSave);
      // if (response.message !== null) {
      //   throw new Error(response.message);
      // }

      return true;
    } catch (error) {
      console.error('Error saving auction items:', error);
      throw error;
    }
  };

  // Handle company selection
  const handleCompanySelect = (companyId: number) => {
    isAutoSelectingRef.current = false;
    setSelectedCompanyId(companyId);

    // แสดงชื่อบริษัทที่เลือกในช่อง input
    const selectedCompany = availableCompanies.find((c) => c.id === companyId);
    setCompanySearchTerm(selectedCompany ? selectedCompany.name : '');
    setShowCompanyDropdown(false);

    // ตรวจสอบว่าผู้ใช้ที่เลือกอยู่ (ถ้ามี) อยู่ในบริษัทที่เลือกหรือไม่
    if (selectedUserId) {
      const userBelongsToCompany = usersCompany.some(
        (uc) =>
          uc.user_id === selectedUserId &&
          uc.company_id === companyId &&
          uc.status === 1
      );

      // ถ้าผู้ใช้ที่เลือกไม่อยู่ในบริษัทใหม่ ให้ล้างการเลือกผู้ใช้
      if (!userBelongsToCompany) {
        setSelectedUserId(null);
        setUserSearchTerm('');
      }
    }

    setShowUserDropdown(false);

    // Load users for selected company
    loadUsersByCompany(companyId);
  };

  // Handle user selection
  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);

    // แสดงชื่อผู้ใช้ที่เลือกในช่อง input (ใช้ allUsers เพื่อให้หาเจอแน่นอน)
    const selectedUser = allUsers.find((u) => u.user_id === userId);
    setUserSearchTerm(selectedUser ? selectedUser.fullname : '');
    setShowUserDropdown(false);

    // Auto-select company based on user's company relationship
    // Find user's company from usersCompany data
    // Try to find primary company first, if not found, use any active company
    let userCompanyData = usersCompany.find(
      (uc) => uc.user_id === userId && uc.status === 1 && uc.is_primary === true
    );

    // If no primary company found, get the first active company for this user
    if (!userCompanyData) {
      userCompanyData = usersCompany.find(
        (uc) => uc.user_id === userId && uc.status === 1
      );
    }

    if (userCompanyData) {
      // ตั้ง flag ให้รู้ว่าเป็นการ auto-select บริษัท
      isAutoSelectingRef.current = true;

      // แสดงชื่อบริษัทที่เลือกอัตโนมัติ
      const autoSelectedCompany = availableCompanies.find(
        (c) => c.id === userCompanyData.company_id
      );

      if (autoSelectedCompany) {
        setCompanySearchTerm(autoSelectedCompany.name);
      } else {
        // ถ้าไม่เจอในรายการ อาจเป็นเพราะข้อมูลยังไม่โหลดเสร็จ
        // ใช้ฟังก์ชันหาชื่อบริษัทแทน
        const companyName = getCompanyNameById(userCompanyData.company_id);
        setCompanySearchTerm(companyName);
      }

      setShowCompanyDropdown(false);

      // โหลดผู้ใช้ในบริษัทนั้นโดยไม่ผ่าน useEffect
      loadUsersByCompany(userCompanyData.company_id);

      // ตั้งค่า selectedCompanyId หลังจากโหลดข้อมูลเสร็จแล้ว
      setSelectedCompanyId(userCompanyData.company_id);
    } else {
      // ถ้าไม่มีบริษัทที่เชื่อมโยง ให้ล้างการเลือกบริษัท
      console.log('No company relationship found for user:', userId);
      setSelectedCompanyId(null);
      setCompanySearchTerm('');
    }
  };

  // ฟังก์ชันหาชื่อผู้ใช้จาก ID
  const getUserNameById = (userId: number): string => {
    const user = allUsers.find((u) => u.user_id === userId);
    return user ? user.fullname : `ผู้ใช้ ID: ${userId}`;
  };

  // ฟังก์ชันหาชื่อบริษัทจาก ID
  const getCompanyNameById = (companyId: number): string => {
    const company = availableCompanies.find((c) => c.id === companyId);
    return company ? company.name : `บริษัท ID: ${companyId}`;
  };

  // ฟังก์ชันหาชื่อบริษัทของผู้ใช้จาก user ID
  const getUserCompanyNameById = (userId: number): string => {
    // หาความสัมพันธ์ user-company ของผู้ใช้นี้
    const userCompanyData =
      usersCompany.find(
        (uc) =>
          uc.user_id === userId && uc.status === 1 && uc.is_primary === true
      ) || usersCompany.find((uc) => uc.user_id === userId && uc.status === 1);

    if (userCompanyData) {
      const company = availableCompanies.find(
        (c) => c.id === userCompanyData.company_id
      );
      return company
        ? company.name
        : `บริษัท ID: ${userCompanyData.company_id}`;
    }

    return 'ไม่พบข้อมูลบริษัท';
  };

  // ฟังก์ชันกรองบริษัทตามคำค้นหา
  const getFilteredCompanies = () => {
    // กรองเฉพาะบริษัทที่ status = 1
    const activeCompanies = availableCompanies.filter(
      (company) => company.status === 1
    );

    if (!companySearchTerm.trim()) {
      return activeCompanies;
    }
    return activeCompanies.filter((company) =>
      company.name.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
  };

  // ฟังก์ชันจัดการการพิมพ์ค้นหาบริษัท
  const handleCompanySearch = (value: string) => {
    setCompanySearchTerm(value);
    setShowCompanyDropdown(true);

    // ถ้าไม่มีข้อความ ให้รีเซ็ตการเลือก
    if (!value.trim()) {
      setSelectedCompanyId(null);
      setSelectedUserId(null); // ล้างการเลือกผู้ใช้ด้วย
      setUserSearchTerm(''); // ล้างข้อความค้นหาผู้ใช้
      setCompanyUsers([]); // ล้างผู้ใช้ของบริษัท
    }
  };

  // ฟังก์ชันกรองผู้ใช้ตามคำค้นหา
  const getFilteredUsers = () => {
    // ถ้าเลือกบริษัทแล้ว ให้แสดงเฉพาะผู้ใช้ในบริษัทนั้น
    // ถ้ายังไม่เลือกบริษัท ให้แสดงผู้ใช้ทั้งหมด
    const usersToFilter = selectedCompanyId ? companyUsers : allUsers;

    if (!userSearchTerm.trim()) {
      return usersToFilter;
    }
    return usersToFilter.filter(
      (user) =>
        user.fullname.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  };

  // ฟังก์ชันจัดการการพิมพ์ค้นหาผู้ใช้
  const handleUserSearch = (value: string) => {
    setUserSearchTerm(value);
    setShowUserDropdown(true);

    // ถ้าไม่มีข้อความ ให้รีเซ็ตการเลือก
    if (!value.trim()) {
      setSelectedUserId(null);

      // ถ้าไม่มีบริษัทที่เลือกไว้จากการพิมพ์ค้นหา (companySearchTerm ว่าง)
      // แสดงว่าบริษัทถูกเลือกอัตโนมัติจากผู้ใช้ ให้ล้างบริษัทด้วย
      if (!companySearchTerm.trim()) {
        setSelectedCompanyId(null);
        setCompanyUsers([]);
      }
    }
  };

  // ฟังก์ชันล้างการเลือกบริษัทและผู้ใช้
  const handleClearSelection = () => {
    isAutoSelectingRef.current = false; // ล้าง flag
    setSelectedCompanyId(null);
    setSelectedUserId(null);
    setCompanySearchTerm('');
    setUserSearchTerm('');
    setCompanyUsers([]);
    setShowCompanyDropdown(false);
    setShowUserDropdown(false);
  };

  const handleInputChange = (field: keyof Auction, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // อัพเดท updated_dt ทุกครั้งที่มีการเปลี่ยนแปลง
      updated_dt: getCurrentDateTime(),
    }));
  };

  // ใช้ utility function สำหรับจัดการการเปลี่ยนแปลงวันที่
  const handleDateChange = createDateChangeHandler(setFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Validation
      if (!formData.name.trim()) {
        alert('กรุณากรอกชื่อตลาด');
        return;
      }

      const startDate = new Date(formData.start_dt);
      const endDate = new Date(formData.end_dt);

      if (endDate <= startDate) {
        alert('วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น');
        return;
      }

      if (formData.reserve_price < 0) {
        alert('ราคาประกันต้องมากกว่าหรือเท่ากับ 0');
        return;
      }

      // เตรียมข้อมูลสำหรับบันทึก
      let response;

      if (isEdit) {
        // อัพเดทข้อมูลที่มีอยู่
        const updateData: UpdateAuctionRequest = {
          auction_id: formData.auction_id,
          name: formData.name,
          auction_type_id: formData.auction_type_id,
          start_dt: formData.start_dt,
          end_dt: formData.end_dt,
          reserve_price: formData.reserve_price,
          currency: formData.currency,
          status: formData.status,
          remark: formData.remark,
        };

        response = await auctionsService.updateAuction(
          formData.auction_id,
          updateData
        );
      } else {
        // สร้างใหม่
        const createData: CreateAuctionRequest = {
          name: formData.name,
          auction_type_id: formData.auction_type_id,
          start_dt: formData.start_dt,
          end_dt: formData.end_dt,
          reserve_price: formData.reserve_price,
          currency: formData.currency,
          status: formData.status,
          remark: formData.remark,
        };

        response = await auctionsService.createAuction(createData);
      }

      if (response.message !== null) {
        alert(response.message);
        return;
      }

      // จัดการข้อมูลผู้เข้าร่วมประมูล (จะต้องได้ auction_id จาก response)
      const auctionIdForOperations = isEdit
        ? formData.auction_id
        : response.data?.auction_id || formData.auction_id;

      // บันทึกข้อมูลผู้เข้าร่วมประมูล
      await saveAuctionParticipants(
        auctionIdForOperations,
        selectedParticipants
      );

      // บันทึกข้อมูลรายการประมูล (auction items) - เฉพาะกรณีแก้ไข
      if (auctionItems.length > 0 && isEdit) {
        await saveAuctionItems(auctionIdForOperations, auctionItems);
      }

      alert(
        isEdit ? 'แก้ไขข้อมูลตลาดเรียบร้อยแล้ว' : 'เพิ่มตลาดใหม่เรียบร้อยแล้ว'
      );
      router.push('/auctions');
    } catch (error) {
      console.error('Error saving auction:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/auctions');
  };

  // ฟังก์ชันสำหรับแสดงผลราคาขณะ focus (ไม่มีคอมม่า)
  const formatPriceForInput = (value: number) => {
    if (value === 0) return '0.00';
    return value.toString();
  };

  // ฟังก์ชันสำหรับแสดงผลราคาขณะ blur (มีคอมม่า)
  const formatPriceForDisplay = (value: number) => {
    if (value === 0) return '0.00';
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // ฟังก์ชันจัดการ focus ราคา (ใช้ร่วมกันได้)
  const handlePriceFocus = (
    currentValue: string | number,
    updateFunction: (formattedValue: string) => void
  ) => {
    const numericValue =
      typeof currentValue === 'string'
        ? parseFloat(currentValue.replace(/,/g, '')) || 0
        : currentValue || 0;
    const formattedValue = formatPriceForInput(numericValue);
    updateFunction(formattedValue);
  };

  const handlePriceBlur = (
    currentValue: string,
    updateFunction: (formattedValue: string) => void
  ) => {
    const numericValue = parseFloat(currentValue.replace(/,/g, '')) || 0;
    const formattedValue = formatPriceForDisplay(numericValue);
    updateFunction(formattedValue);
  };

  // ฟังก์ชันจัดการ onChange ราคาประกัน
  const handleReservePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // อนุญาตให้มีตัวเลขและจุดทศนิยมได้
    const cleanValue = value.replace(/[^\d.]/g, '');

    // ป้องกันการมีจุดทศนิยมมากกว่า 1 ตัว และจำกัดทศนิยมไม่เกิน 2 ตัว
    const parts = cleanValue.split('.');
    let finalValue = cleanValue;

    if (parts.length > 2) {
      // เอาเฉพาะส่วนที่ 1 (หลังจุดแรก) และจำกัดไม่เกิน 2 ตัว
      finalValue = parts[0] + '.' + parts[1].substring(0, 2);
    } else if (parts.length === 2 && parts[1].length > 2) {
      // จำกัดทศนิยมไม่เกิน 2 ตัว
      finalValue = parts[0] + '.' + parts[1].substring(0, 2);
    }

    setReservePriceDisplay(finalValue);

    // แปลงเป็นตัวเลขสำหรับบันทึก
    const numericValue = parseFloat(finalValue) || 0;
    handleInputChange('reserve_price', numericValue);
  };

  // อัปเดต reservePriceDisplay เมื่อ formData.reserve_price เปลี่ยน
  useEffect(() => {
    if (!reservePriceFocused) {
      setReservePriceDisplay(formatPriceForDisplay(formData.reserve_price));
    }
  }, [formData.reserve_price, reservePriceFocused]);

  // ฟังก์ชันจัดการ onChange ราคา/หน่วย
  const handleItemPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // อนุญาตให้มีตัวเลขและจุดทศนิยมได้
    const cleanValue = value.replace(/[^\d.]/g, '');

    // ป้องกันการมีจุดทศนิยมมากกว่า 1 ตัว และจำกัดทศนิยมไม่เกิน 2 ตัว
    const parts = cleanValue.split('.');
    let finalValue = cleanValue;

    if (parts.length > 2) {
      // เอาเฉพาะส่วนที่ 1 (หลังจุดแรก) และจำกัดไม่เกิน 2 ตัว
      finalValue = parts[0] + '.' + parts[1].substring(0, 2);
    } else if (parts.length === 2 && parts[1].length > 2) {
      // จำกัดทศนิยมไม่เกิน 2 ตัว
      finalValue = parts[0] + '.' + parts[1].substring(0, 2);
    }

    // อัปเดต form ด้วยค่าที่ไม่มีคอมม่า (เหมือนราคาประกัน)
    setAuctionItemForm((prev) => ({
      ...prev,
      base_price: finalValue,
    }));
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return 'วันที่ไม่ถูกต้อง';
      }

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch (error) {
      return 'วันที่ไม่ถูกต้อง';
    }
  };

  // Auction Type Modal Functions
  const openAuctionTypeModal = () => {
    setAuctionTypeForm({
      name: '',
      description: '',
      status: true,
    });
    setIsAuctionTypeModalOpen(true);
  };

  const closeAuctionTypeModal = () => {
    setIsAuctionTypeModalOpen(false);
    setAuctionTypeForm({
      name: '',
      description: '',
      status: true,
    });
  };

  const handleAuctionTypeFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAuctionTypeForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAuctionTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuctionType(true);

    try {
      const requestData = {
        name: auctionTypeForm.name.trim(),
        description: auctionTypeForm.description.trim(),
        status: auctionTypeForm.status ? 1 : 0,
      };

      const result = await auctionTypeService.createAuctionType(requestData);

      if (result.success && result.message === null) {
        alert('เพิ่มประเภทการประมูลสำเร็จ');
        closeAuctionTypeModal();
        // โหลดประเภทการประมูลใหม่
        await loadAuctionTypes();
        // เลือกประเภทที่เพิ่มใหม่ในฟอร์ม
        if (result.data && result.data.id) {
          handleInputChange('auction_type_id', result.data.id);
        }
      } else {
        alert(result.message);
      }
    } catch (error: any) {
      console.error('Error creating auction type:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มประเภทการประมูล');
    } finally {
      setIsSubmittingAuctionType(false);
    }
  };

  // Auction Item Modal Functions
  const openAuctionItemModal = () => {
    setAuctionItemForm({
      item_name: '',
      description: '',
      quantity: 1,
      unit: '',
      base_price: '0.00',
    });
    setEditingItemIndex(null);
    setIsAuctionItemModalOpen(true);
  };

  const openEditItemModal = (index: number) => {
    const item = auctionItems[index];
    setAuctionItemForm({
      item_name: item.item_name,
      description: item.description || '',
      quantity: item.quantity,
      unit: item.unit || '',
      base_price: formatPriceForDisplay(item.base_price),
    });
    setEditingItemIndex(index);
    setIsAuctionItemModalOpen(true);
  };

  const closeAuctionItemModal = () => {
    setIsAuctionItemModalOpen(false);
    setAuctionItemForm({
      item_name: '',
      description: '',
      quantity: 1,
      unit: '',
      base_price: '0.00',
    });
    setEditingItemIndex(null);
  };

  const handleAuctionItemFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'quantity') {
      const numValue = parseInt(value) || 1;
      setAuctionItemForm((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setAuctionItemForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAuctionItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuctionItem(true);

    try {
      if (!auctionItemForm.item_name.trim()) {
        alert('กรุณากรอกชื่อรายการ');
        return;
      }

      const numericPrice = parseFloat(
        auctionItemForm.base_price.replace(/,/g, '')
      );
      if (!auctionItemForm.base_price || numericPrice < 0) {
        alert('กรุณากรอกราคาที่ถูกต้อง');
        return;
      }

      const newItem = {
        item_name: auctionItemForm.item_name.trim(),
        description: auctionItemForm.description.trim(),
        quantity: auctionItemForm.quantity,
        unit: auctionItemForm.unit.trim(),
        base_price: numericPrice,
        status: true,
      };

      if (editingItemIndex !== null) {
        // แก้ไขรายการที่มีอยู่
        const updatedItems = [...auctionItems];
        updatedItems[editingItemIndex] = newItem;
        setAuctionItems(updatedItems);
        alert('แก้ไขรายการเรียบร้อยแล้ว');
      } else {
        // เพิ่มรายการใหม่
        setAuctionItems((prev) => [...prev, newItem]);
        alert('เพิ่มรายการเรียบร้อยแล้ว');
      }

      closeAuctionItemModal();
    } catch (error) {
      console.error('Error saving auction item:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกรายการ');
    } finally {
      setIsSubmittingAuctionItem(false);
    }
  };

  const handleDeleteItem = (index: number) => {
    if (confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      const updatedItems = auctionItems.filter((_, i) => i !== index);
      setAuctionItems(updatedItems);
      alert('ลบรายการเรียบร้อยแล้ว');
    }
  };

  const formatPriceDisplay = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // แสดงหน้า Error ถ้าไม่มีสิทธิ์
  if (!hasPermission) {
    return (
      <Container className="py-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 text-red-500 mx-auto"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              ไม่สามารถเข้าถึงได้
            </h1>
            <p className="text-gray-600 mb-6">{permissionError}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/auctions')}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                กลับไปหน้ารายการตลาด
              </button>
              <button
                onClick={() => router.push('/auctionform?id=0')}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                สร้างตลาดใหม่
              </button>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if ((isLoading && isEdit) || loadingAuctionTypes) {
    return (
      <Container className="py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {isEdit
                ? 'กำลังตรวจสอบสิทธิ์และโหลดข้อมูล...'
                : 'กำลังโหลดข้อมูลประเภทประมูล...'}
            </p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-3 rounded-xl">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isEdit ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {isEdit ? 'แก้ไขข้อมูลตลาด' : 'เพิ่มตลาดใหม่'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEdit
                    ? `แก้ไขข้อมูลตลาดประมูล ID: ${formData.auction_id}`
                    : 'กรอกข้อมูลเพื่อสร้างตลาดประมูลใหม่'}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
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
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="text-sm font-medium">ย้อนกลับ</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AucOfferIcon className="w-5 h-5 text-blue-600" />
              ข้อมูลพื้นฐาน
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ชื่อตลาด */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.001 3.001 0 01-.621-1.72c0-.966.459-1.82 1.17-2.36a3.001 3.001 0 012.7 0 2.974 2.974 0 011.17 2.36 3.001 3.001 0 01-.621 1.72m12.96 0a3.001 3.001 0 01-.621-1.72c0-.966.459-1.82 1.17-2.36a3.001 3.001 0 012.7 0 2.974 2.974 0 011.17 2.36 3.001 3.001 0 01-.621 1.72m-2.35 0a3.001 3.001 0 01-1.85-.875A3.001 3.001 0 0114.25 16.5a3.001 3.001 0 01-2.4 1.125c-.84 0-1.59-.327-2.15-.875a3.001 3.001 0 01-2.4 1.125"
                      />
                    </svg>
                    ชื่อตลาด
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="กรอกชื่อตลาด"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-gray-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* ประเภท */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AucCategoryIcon className="w-4 h-4 text-gray-500" />
                      ประเภท
                    </div>
                    <div
                      className="flex items-center gap-2 text-blue-500 cursor-pointer hover:text-blue-700"
                      onClick={openAuctionTypeModal}
                    >
                      + เพิ่มประเภท
                    </div>
                  </div>
                </label>
                <div className="relative">
                  <select
                    value={formData.auction_type_id}
                    onChange={(e) =>
                      handleInputChange(
                        'auction_type_id',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    required
                    disabled={loadingAuctionTypes}
                  >
                    {loadingAuctionTypes ? (
                      <option disabled>กำลังโหลดข้อมูล...</option>
                    ) : auctionTypes.length === 0 ? (
                      <option disabled>ไม่พบข้อมูลประเภทประมูล</option>
                    ) : (
                      auctionTypes
                        .filter((type) => type.status === 1)
                        .map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* สถานะ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <AucOfferIcon className="w-4 h-4 text-gray-500" />
                    สถานะ
                  </div>
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange('status', parseInt(e.target.value))
                    }
                    className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    required
                  >
                    {Object.values(statusConfig).map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.description}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* วันที่เริ่มต้น */}
              <div className="relative w-full">
                <div className="w-full">
                  <ThaiDatePicker
                    selected={safeParseDate(formData.start_dt)}
                    onChange={(date) => handleDateChange('start_dt', date)}
                    label="วันเวลาเริ่มต้น"
                    placeholder="เลือกวันเวลาเริ่มต้น"
                    showTimeSelect={true}
                    timeCaption="เวลา"
                    minDate={new Date()}
                    maxDate={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() + 5)
                      )
                    }
                  />
                </div>
              </div>

              {/* วันที่สิ้นสุด */}
              <div className="relative w-full">
                <div className="w-full">
                  <ThaiDatePicker
                    selected={safeParseDate(formData.end_dt)}
                    onChange={(date) => handleDateChange('end_dt', date)}
                    label="วันเวลาสิ้นสุด"
                    placeholder="เลือกวันเวลาสิ้นสุด"
                    showTimeSelect={true}
                    timeCaption="เวลา"
                    minDate={safeParseDate(formData.start_dt)}
                    maxDate={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() + 5)
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* ราคาประกัน */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0118 0Z"
                      />
                    </svg>
                    ราคาประกัน
                  </div>
                </label>
                <input
                  type="text"
                  value={reservePriceDisplay}
                  onFocus={() => {
                    setReservePriceFocused(true);
                    handlePriceFocus(formData.reserve_price, (formattedValue) =>
                      setReservePriceDisplay(formattedValue)
                    );
                  }}
                  onChange={handleReservePriceChange}
                  onBlur={() => {
                    setReservePriceFocused(false);
                    handlePriceBlur(reservePriceDisplay, (formattedValue) =>
                      setReservePriceDisplay(formattedValue)
                    );
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* หน่วยเงิน */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0118 0Z"
                      />
                    </svg>
                    หน่วยเงิน
                  </div>
                </label>
                <div className="relative">
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      handleInputChange('currency', parseInt(e.target.value))
                    }
                    className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    required
                  >
                    {Object.values(currencyConfig).map((currency) => (
                      <option key={currency.id} value={currency.id}>
                        {currency.code} - {currency.description}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Participant Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AucUserIcon className="w-5 h-5 text-blue-600" />
                ผู้เข้าร่วมประมูล
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSelectedParticipants([]);
                  handleClearSelection();
                }}
                className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                ยกเลิกทั้งหมด
              </button>
            </div>

            <div className="space-y-4">
              {/* Company and User Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Company Selection */}
                <div className="company-dropdown-container">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เลือกบริษัท
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={companySearchTerm}
                      onChange={(e) => handleCompanySearch(e.target.value)}
                      onFocus={() => setShowCompanyDropdown(true)}
                      disabled={loadingCompanies}
                      placeholder={
                        loadingCompanies
                          ? 'กำลังโหลด...'
                          : 'พิมพ์หรือเลือกบริษัท'
                      }
                      className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
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
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    {/* Dropdown List */}
                    {showCompanyDropdown && !loadingCompanies && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {getFilteredCompanies().length > 0 ? (
                          getFilteredCompanies().map((company) => (
                            <button
                              key={company.id}
                              type="button"
                              onClick={() => handleCompanySelect(company.id)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                            >
                              {company.name}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            ไม่พบบริษัทที่ค้นหา
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* User Selection */}
                <div className="user-dropdown-container">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เลือกผู้ใช้
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={(e) => handleUserSearch(e.target.value)}
                      onFocus={() => setShowUserDropdown(true)}
                      disabled={loadingUsers}
                      placeholder={
                        loadingUsers ? 'กำลังโหลด...' : 'พิมพ์หรือเลือกผู้ใช้'
                      }
                      className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
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
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    {/* Dropdown List */}
                    {showUserDropdown && !loadingUsers && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {getFilteredUsers().length > 0 ? (
                          getFilteredUsers().map((user) => (
                            <button
                              key={user.user_id}
                              type="button"
                              onClick={() => handleUserSelect(user.user_id)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">
                                {user.fullname}
                              </div>
                              <div className="text-xs text-gray-500">
                                @{user.username}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            ไม่พบผู้ใช้ที่ค้นหา
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Button */}
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    disabled={!selectedCompanyId && !selectedUserId}
                    className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
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
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                    ล้าง
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        selectedUserId &&
                        selectedCompanyId &&
                        !selectedParticipants.includes(selectedUserId)
                      ) {
                        setSelectedParticipants((prev) => [
                          ...prev,
                          selectedUserId,
                        ]);

                        // เรียกฟังก์ชันล้างการเลือกหลังจากเพิ่มผู้เข้าร่วมเสร็จ
                        handleClearSelection();
                      }
                    }}
                    disabled={
                      !selectedUserId ||
                      !selectedCompanyId ||
                      selectedParticipants.includes(selectedUserId)
                    }
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    เพิ่มผู้เข้าร่วม
                  </button>
                </div>
              </div>

              {/* Selected Participants Display */}
              {selectedParticipants.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-3">
                    ผู้เข้าร่วมที่เลือก ({selectedParticipants.length} คน)
                  </h3>
                  <div className="space-y-2">
                    {selectedParticipants.map((userId) => (
                      <div
                        key={userId}
                        className="flex items-center justify-between bg-white border border-blue-200 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <AucUserIcon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {getUserNameById(userId)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {getUserCompanyNameById(userId)}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedParticipants((prev) =>
                              prev.filter((id) => id !== userId)
                            );
                          }}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading States */}
              {(loadingCompanies || loadingUsers) && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">
                    {loadingCompanies
                      ? 'กำลังโหลดข้อมูลบริษัท...'
                      : 'กำลังโหลดข้อมูลผู้ใช้...'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Auction Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                รายการประมูล
                {auctionItems.length > 0 && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    {auctionItems.length} รายการ
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={openAuctionItemModal}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                เพิ่มรายการ
              </button>
            </div>

            {/* Items Table */}
            {auctionItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ลำดับ
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ชื่อรายการ
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        คำอธิบาย
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        จำนวน
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        หน่วย
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ราคา/หน่วย
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {auctionItems.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900">
                          {item.item_name}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-500">
                          {item.description || '-'}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-center text-gray-900">
                          {item.quantity.toLocaleString()}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-center text-gray-900">
                          {item.unit || '-'}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-right text-gray-900">
                          {formatPriceDisplay(item.base_price)}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditItemModal(index)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                              title="แก้ไข"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(index)}
                              className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                              title="ลบ"
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-gray-500 text-sm">ยังไม่มีรายการประมูล</p>
                <p className="text-gray-400 text-xs mt-1">
                  คลิกปุ่ม "เพิ่มรายการ" เพื่อเพิ่มรายการประมูล
                </p>
              </div>
            )}
          </div>

          {/* Remark */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              รายละเอียด
            </h2>

            <div className="relative">
              <textarea
                value={formData.remark || ''}
                onChange={(e) => handleInputChange('remark', e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="กรอกรายละเอียดเพิ่มเติม"
              />
              <div className="absolute top-3 left-0 flex items-start pl-3 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                  />
                </svg>
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                ย้อนกลับ
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {!isLoading && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    {isEdit ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 3.75a1.125 1.125 0 011.125 1.125v8.252c0 .36-.148.7-.398.938l-5.057 4.786a2.25 2.25 0 01-3.084 0l-5.057-4.786a1.125 1.125 0 01-.398-.938V4.875A1.125 1.125 0 015.625 3.75h10.875z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    )}
                  </svg>
                )}
                {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มตลาด'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Auction Type Modal */}
      {isAuctionTypeModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden">
            {/* Modal Header - Fixed */}
            <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50 py-4 px-5 border-b border-blue-100/50">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 
                  hover:bg-gray-100/80 rounded-lg p-1"
                onClick={closeAuctionTypeModal}
                disabled={isSubmittingAuctionType}
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
                      เพิ่มประเภทการประมูล
                    </div>
                    <div className="text-xs text-gray-500 font-normal">
                      กรุณากรอกข้อมูลประเภทใหม่
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
              hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
            >
              <form
                id="auctionTypeForm"
                onSubmit={handleAuctionTypeSubmit}
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
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      ชื่อประเภท
                    </div>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={auctionTypeForm.name}
                    onChange={handleAuctionTypeFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent"
                    placeholder="กรอกชื่อประเภท"
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
                          d="M4 6h16M4 12h16M4 18h7"
                        />
                      </svg>
                      คำอธิบาย
                    </div>
                  </label>
                  <textarea
                    name="description"
                    value={auctionTypeForm.description}
                    onChange={handleAuctionTypeFormChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:border-transparent"
                    placeholder="คำอธิบายเพิ่มเติม..."
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 py-3 px-5 border-t border-gray-100">
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAuctionTypeModal}
                  disabled={isSubmittingAuctionType}
                  className={`group px-3 py-1.5 text-sm font-medium border border-gray-200 
                    rounded-lg focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                      isSubmittingAuctionType
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    <svg
                      className={`w-4 h-4 ${
                        isSubmittingAuctionType
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
                  form="auctionTypeForm"
                  disabled={isSubmittingAuctionType}
                  className={`group px-3 py-1.5 text-sm font-medium text-white border border-transparent rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                    transition-all duration-200 shadow-md hover:shadow-md ${
                      isSubmittingAuctionType
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isSubmittingAuctionType ? (
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
                        กำลังเพิ่ม...
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
                        เพิ่มประเภท
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auction Item Modal */}
      {isAuctionItemModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden">
            {/* Modal Header - Fixed */}
            <div className="bg-gradient-to-r from-green-50 via-white to-green-50 py-4 px-5 border-b border-green-100/50">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 
                  hover:bg-gray-100/80 rounded-lg p-1"
                onClick={closeAuctionItemModal}
                disabled={isSubmittingAuctionItem}
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
                  <div className="bg-green-100 p-1.5 rounded-lg">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {editingItemIndex !== null
                        ? 'แก้ไขรายการประมูล'
                        : 'เพิ่มรายการประมูล'}
                    </div>
                    <div className="text-xs text-gray-500 font-normal">
                      กรุณากรอกข้อมูลรายการ
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
              hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
            >
              <form
                id="auctionItemForm"
                onSubmit={handleAuctionItemSubmit}
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
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      ชื่อรายการ *
                    </div>
                  </label>
                  <input
                    type="text"
                    name="item_name"
                    value={auctionItemForm.item_name}
                    onChange={handleAuctionItemFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-green-500 focus:border-transparent"
                    placeholder="กรอกชื่อรายการ"
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
                          d="M4 6h16M4 12h16M4 18h7"
                        />
                      </svg>
                      คำอธิบาย
                    </div>
                  </label>
                  <textarea
                    name="description"
                    value={auctionItemForm.description}
                    onChange={handleAuctionItemFormChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-green-500 focus:border-transparent"
                    placeholder="คำอธิบายเพิ่มเติม..."
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
                            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                          />
                        </svg>
                        จำนวน *
                      </div>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={auctionItemForm.quantity}
                      onChange={handleAuctionItemFormChange}
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                        focus:ring-green-500 focus:border-transparent"
                      placeholder="1"
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
                            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        หน่วย
                      </div>
                    </label>
                    <input
                      type="text"
                      name="unit"
                      value={auctionItemForm.unit}
                      onChange={handleAuctionItemFormChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                        focus:ring-green-500 focus:border-transparent"
                      placeholder="เช่น ชิ้น, กิโลกรัม"
                    />
                  </div>
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
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      ราคา/หน่วย *
                    </div>
                  </label>
                  <input
                    type="text"
                    name="base_price"
                    value={auctionItemForm.base_price}
                    onFocus={() => {
                      handlePriceFocus(
                        auctionItemForm.base_price,
                        (formattedValue) =>
                          setAuctionItemForm((prev) => ({
                            ...prev,
                            base_price: formattedValue,
                          }))
                      );
                    }}
                    onChange={handleItemPriceChange}
                    onBlur={() => {
                      handlePriceBlur(
                        auctionItemForm.base_price,
                        (formattedValue) =>
                          setAuctionItemForm((prev) => ({
                            ...prev,
                            base_price: formattedValue,
                          }))
                      );
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
                      focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 py-3 px-5 border-t border-gray-100">
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAuctionItemModal}
                  disabled={isSubmittingAuctionItem}
                  className={`group px-3 py-1.5 text-sm font-medium border border-gray-200 
                    rounded-lg focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ${
                      isSubmittingAuctionItem
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    <svg
                      className={`w-4 h-4 ${
                        isSubmittingAuctionItem
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
                  form="auctionItemForm"
                  disabled={isSubmittingAuctionItem}
                  className={`group px-3 py-1.5 text-sm font-medium text-white border border-transparent rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 
                    transition-all duration-200 shadow-md hover:shadow-md ${
                      isSubmittingAuctionItem
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600'
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isSubmittingAuctionItem ? (
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
                        กำลังบันทึก...
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
                            d={
                              editingItemIndex !== null
                                ? 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                : 'M12 6v6m0 0v6m0-6h6m-6 0H6'
                            }
                          />
                        </svg>
                        {editingItemIndex !== null
                          ? 'บันทึกการแก้ไข'
                          : 'เพิ่มรายการ'}
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
