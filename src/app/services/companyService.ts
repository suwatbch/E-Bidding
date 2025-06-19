import axios, { AxiosResponse } from 'axios';

// Get base URL from environment or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance with base configuration
const companyApi = axios.create({
  baseURL: `${API_URL}/api/company`,
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
      const status = error.response?.status;
      if (status >= 500) {
        console.error('Server Error in getAllCompanies:', error);
      }
      return {
        success: false,
        message: error.response?.data?.message,
        data: [],
        total: 0,
      };
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
      const status = error.response?.status;
      if (status >= 500) {
        console.error('Server Error in getActiveCompanies:', error);
      }
      return {
        success: false,
        message: error.response?.data?.message,
        data: [],
        total: 0,
      };
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
      const status = error.response?.status;
      if (status >= 500) {
        console.error('Server Error in searchCompanies:', error);
      }
      return {
        success: false,
        message: error.response?.data?.message,
        data: [],
        total: 0,
      };
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
      const status = error.response?.status;
      if (status >= 500) {
        console.error('Server Error in getCompanyById:', error);
      }
      return {
        success: false,
        message: error.response?.data?.message,
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
      const status = error.response?.status;
      if (status >= 500) {
        console.error('Server Error in createCompany:', error);
      }
      return {
        success: false,
        message: error.response?.data?.message,
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
      const response: AxiosResponse<ApiResponse> = await companyApi.post(
        `/update/${id}`,
        companyData
      );
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      if (status >= 500) {
        console.error('Server Error in updateCompany:', error);
      }
      return {
        success: false,
        message: error.response?.data?.message,
      };
    }
  },

  /**
   * ลบบริษัท (soft delete)
   */
  deleteCompany: async (id: number): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await companyApi.post(
        `/delete/${id}`,
        {}
      );
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      if (status >= 500) {
        console.error('Server Error in deleteCompany:', error);
      }
      return {
        success: false,
        message: error.response?.data?.message,
      };
    }
  },
};

export default companyService;
