import axios, { AxiosResponse } from 'axios';

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ฟังก์ชันสำหรับอ่าน token จาก cookie และ localStorage
const getAuthTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null;

  // 1. ลองอ่านจาก cookie ก่อน (สำหรับ middleware compatibility)
  const getCookieToken = (): string | null => {
    const allCookies = document.cookie.split('; ');
    const authTokenCookie = allCookies.find((row) =>
      row.startsWith('auth_token=')
    );
    return authTokenCookie?.split('=')[1] || null;
  };

  let token = getCookieToken();
  if (token) return token;

  // 2. ถ้าไม่มี cookie ลองหาใน localStorage (สำหรับ remember me)
  token = localStorage.getItem('auth_token');
  if (token) return token;

  // 3. ถ้าไม่มีใน localStorage ลองหาใน sessionStorage
  token = sessionStorage.getItem('auth_token');
  if (token) return token;

  // 4. ถ้ายังไม่มี ลองหาใน session object
  const rememberMe = localStorage.getItem('auth_remember_me') === 'true';
  const storage = rememberMe ? localStorage : sessionStorage;
  const sessionData = storage.getItem('auth_session');

  if (sessionData) {
    try {
      const session = JSON.parse(sessionData);
      token = session.token;
    } catch (error) {
      console.error('Error parsing session data:', error);
    }
  }

  return token || null;
};

// Create axios instance with base configuration
const companyApi = axios.create({
  baseURL: `${API_URL}/api/company`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // เพิ่มเป็น 15 วินาที
  withCredentials: true,
});

// Add request interceptor to include Bearer token
companyApi.interceptors.request.use(
  (config) => {
    const token = getAuthTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`⚠️ No auth token found - API call may fail`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
companyApi.interceptors.response.use(
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

// Types for Company API
export interface Company {
  id: number;
  name: string;
  tax_id: string;
  address: string;
  email: string;
  phone: string;
  status: number;
  created_dt: string;
  updated_dt: string;
}

export interface CompanyResponse {
  success: boolean;
  message: string;
  data: Company[];
  total: number;
}

export interface SingleCompanyResponse {
  success: boolean;
  message: string;
  data: Company;
}

export interface CreateCompanyRequest {
  name: string;
  tax_id?: string;
  address?: string;
  email?: string;
  phone?: string;
  status?: number;
}

export interface UpdateCompanyRequest {
  name?: string;
  tax_id?: string;
  address?: string;
  email?: string;
  phone?: string;
  status?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Error response type
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}

// Utility function for better error handling
const handleApiError = (error: any, operation: string): any => {
  const isNetworkError = !error.response;
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;

  let message = `เกิดข้อผิดพลาดในการ${operation}`;

  if (isNetworkError) {
    if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
      message =
        'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ API ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่หรือไม่';
    } else {
      message =
        'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
    }
  } else if (status === 401) {
    message = 'กรุณาเข้าสู่ระบบใหม่';
  } else if (status === 403) {
    message = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
  } else if (status >= 500) {
    message = 'เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ในภายหลัง';
  } else if (serverMessage) {
    message = serverMessage;
  }

  console.error(`❌ ${operation} failed:`, {
    status,
    message: serverMessage,
    isNetworkError,
    errorCode: error.code,
    url: error.config?.url,
    method: error.config?.method,
  });

  return { success: false, message, data: [], total: 0 };
};

// Company Service
export const companyService = {
  /**
   * ดึงข้อมูลบริษัททั้งหมด
   */
  getAllCompanies: async (): Promise<CompanyResponse> => {
    try {
      const response: AxiosResponse<CompanyResponse> = await companyApi.get(
        '/'
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'ดึงข้อมูลบริษัท');
    }
  },

  /**
   * ดึงข้อมูลบริษัทที่เปิดใช้งานเท่านั้น
   */
  getActiveCompanies: async (): Promise<CompanyResponse> => {
    try {
      const response: AxiosResponse<CompanyResponse> = await companyApi.get(
        '/',
        {
          params: { active_only: 'true' },
        }
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'ดึงข้อมูลบริษัทที่เปิดใช้งาน');
    }
  },

  /**
   * ค้นหาบริษัท
   */
  searchCompanies: async (searchTerm: string): Promise<CompanyResponse> => {
    try {
      if (!searchTerm.trim()) {
        return companyService.getAllCompanies();
      }

      const response: AxiosResponse<CompanyResponse> = await companyApi.get(
        '/',
        {
          params: { search: searchTerm.trim() },
        }
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'ค้นหาบริษัท');
    }
  },

  /**
   * ดึงข้อมูลบริษัทตาม ID
   */
  getCompanyById: async (id: number): Promise<SingleCompanyResponse> => {
    try {
      const response: AxiosResponse<SingleCompanyResponse> =
        await companyApi.get(`/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching company by ID:', error);
      return {
        success: false,
        message:
          error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลบริษัท',
        data: {} as Company,
      };
    }
  },

  /**
   * สร้างบริษัทใหม่
   */
  createCompany: async (
    companyData: CreateCompanyRequest
  ): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await companyApi.post(
        '/',
        companyData
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating company:', error);
      return {
        success: false,
        message:
          error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างบริษัท',
      };
    }
  },

  /**
   * อัพเดทข้อมูลบริษัท
   */
  updateCompany: async (
    id: number,
    companyData: UpdateCompanyRequest
  ): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await companyApi.put(
        `/${id}`,
        companyData
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating company:', error);
      return {
        success: false,
        message:
          error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพเดทบริษัท',
      };
    }
  },

  /**
   * ลบบริษัท (soft delete)
   */
  deleteCompany: async (id: number): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await companyApi.delete(
        `/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting company:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบบริษัท',
      };
    }
  },

  /**
   * Utility: ตรวจสอบการเชื่อมต่อ API
   */
  healthCheck: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.get(`${API_URL}/api/health`, {
        timeout: 5000,
      });
      return { success: true, message: 'API connection is healthy' };
    } catch (error) {
      return { success: false, message: 'API connection failed' };
    }
  },

  /**
   * Utility: ตรวจสอบ Authentication Status
   */
  checkAuth: (): { hasToken: boolean; token: string | null } => {
    const token = getAuthTokenFromStorage();
    return {
      hasToken: !!token,
      token: token,
    };
  },
};

export default companyService;
