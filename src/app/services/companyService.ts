import axios, { AxiosResponse } from 'axios';

// Get base URL from environment or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create axios instance with base configuration
const companyApi = axios.create({
  baseURL: `${API_URL}/api/company`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get auth token from localStorage
const getAuthTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const token = localStorage.getItem('auth_token');
    return token;
  } catch (error) {
    console.error('Error getting auth token from localStorage:', error);
    return null;
  }
};

// Add request interceptor to include auth token
companyApi.interceptors.request.use(
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
  name: string;
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

// Helper function to handle API errors consistently
const handleApiError = (error: any, action: string): CompanyResponse => {
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
};

export default companyService;
