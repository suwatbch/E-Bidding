import axios, { AxiosResponse } from 'axios';

// Get base URL from environment or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance with base configuration
const auctionTypeApi = axios.create({
  baseURL: `${API_URL}/api/auction-type`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get auth token from cookie first, then localStorage
const getAuthTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // 1. ลองดึงจาก cookie ก่อน (เพื่อความเร็วและความแม่นยำ)
    const allCookies = document.cookie.split('; ');
    const authTokenCookie = allCookies.find((row) =>
      row.startsWith('auth_token=')
    );
    const cookieToken = authTokenCookie?.split('=')[1];

    if (cookieToken) {
      return cookieToken;
    }

    // 2. Fallback: ดึงจาก localStorage
    const localToken = localStorage.getItem('auth_token');
    return localToken;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Add request interceptor to include auth token
auctionTypeApi.interceptors.request.use(
  (config) => {
    const token = getAuthTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('🔥 Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
auctionTypeApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.error('🚫 Unauthorized: Please login again');
    } else if (status === 403) {
      console.error('🔒 Forbidden: Insufficient permissions');
    } else if (status >= 500) {
      console.error('🔥 Server Error:', error.response?.data?.message);
    }

    return Promise.reject(error);
  }
);

// Types for AuctionType API
export interface AuctionType {
  id: number;
  name: string;
  description: string;
  status: number;
}

export interface AuctionTypeResponse {
  success: boolean;
  message: string;
  data: AuctionType[];
  total: number;
}

export interface SingleAuctionTypeResponse {
  success: boolean;
  message: string;
  data: AuctionType;
}

export interface CreateAuctionTypeRequest {
  name: string;
  description?: string;
  status?: number;
}

export interface UpdateAuctionTypeRequest {
  name: string;
  description?: string;
  status?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Helper function to handle API errors consistently
const handleApiError = (error: any, action: string): AuctionTypeResponse => {
  console.error(`❌ Error ${action}:`, error);

  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;
  let userMessage = `เกิดข้อผิดพลาดในการ${action}`;

  if (status === 400) {
    userMessage = serverMessage || 'ข้อมูลไม่ถูกต้อง';
  } else if (status === 401) {
    userMessage = 'กรุณาเข้าสู่ระบบใหม่';
  } else if (status === 403) {
    userMessage = 'คุณไม่มีสิทธิ์ในการดำเนินการนี้';
  } else if (status === 404) {
    userMessage = 'ไม่พบข้อมูลที่ต้องการ';
  } else if (status >= 500) {
    userMessage = 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์';
  } else if (error.code === 'ECONNABORTED') {
    userMessage = 'การเชื่อมต่อใช้เวลาเกินกำหนด';
  } else if (error.code === 'NETWORK_ERROR') {
    userMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
  }

  return {
    success: false,
    message: userMessage,
    data: [],
    total: 0,
  };
};

// AuctionType Service
export const auctionTypeService = {
  /**
   * ดึงข้อมูลประเภทการประมูลทั้งหมด
   */
  getAllAuctionTypes: async (): Promise<AuctionTypeResponse> => {
    try {
      const response: AxiosResponse<AuctionTypeResponse> =
        await auctionTypeApi.get('/');
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'ดึงข้อมูลประเภทการประมูล');
    }
  },

  /**
   * ดึงข้อมูลประเภทการประมูลที่เปิดใช้งานเท่านั้น
   */
  getActiveAuctionTypes: async (): Promise<AuctionTypeResponse> => {
    try {
      const response: AxiosResponse<AuctionTypeResponse> =
        await auctionTypeApi.get('/', {
          params: { active_only: 'true' },
        });
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'ดึงข้อมูลประเภทการประมูลที่เปิดใช้งาน');
    }
  },

  /**
   * ค้นหาประเภทการประมูล
   */
  searchAuctionTypes: async (
    searchTerm: string
  ): Promise<AuctionTypeResponse> => {
    try {
      if (!searchTerm.trim()) {
        return auctionTypeService.getAllAuctionTypes();
      }

      const response: AxiosResponse<AuctionTypeResponse> =
        await auctionTypeApi.get('/', {
          params: { search: searchTerm.trim() },
        });
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'ค้นหาประเภทการประมูล');
    }
  },

  /**
   * ดึงข้อมูลประเภทการประมูลตาม ID
   */
  getAuctionTypeById: async (
    id: number
  ): Promise<SingleAuctionTypeResponse> => {
    try {
      const response: AxiosResponse<SingleAuctionTypeResponse> =
        await auctionTypeApi.get(`/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching auction type by ID:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทการประมูล',
        data: {} as AuctionType,
      };
    }
  },

  /**
   * สร้างประเภทการประมูลใหม่
   */
  createAuctionType: async (
    auctionTypeData: CreateAuctionTypeRequest
  ): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await auctionTypeApi.post(
        '/',
        auctionTypeData
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating auction type:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'เกิดข้อผิดพลาดในการสร้างประเภทการประมูล',
      };
    }
  },

  /**
   * อัพเดทข้อมูลประเภทการประมูล
   */
  updateAuctionType: async (
    id: number,
    auctionTypeData: UpdateAuctionTypeRequest
  ): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await auctionTypeApi.put(
        `/${id}`,
        auctionTypeData
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'เกิดข้อผิดพลาดในการอัพเดทประเภทการประมูล',
      };
    }
  },

  /**
   * ลบประเภทการประมูล (soft delete)
   */
  deleteAuctionType: async (id: number): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await auctionTypeApi.delete(
        `/${id}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'เกิดข้อผิดพลาดในการลบประเภทการประมูล',
      };
    }
  },
};

export default auctionTypeService;
