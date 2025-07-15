import axios, { AxiosResponse } from 'axios';

// Get base URL from environment or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance with base configuration
const userCompanyApi = axios.create({
  baseURL: `${API_URL}/api/user-company`,
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
userCompanyApi.interceptors.request.use(
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
userCompanyApi.interceptors.response.use(
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

// Types for UserCompany API
export interface UserCompany {
  id: number;
  user_id: number;
  company_id: number;
  role_in_company: string | null;
  is_primary: boolean;
  status: number;
  created_dt?: string;
  updated_dt?: string;
  // Joined data
  company_name?: string;
  company_tax_id?: string;
}

export interface UserCompanyResponse {
  success: boolean;
  message: string;
  data: UserCompany[];
  total: number;
}

export interface SingleUserCompanyResponse {
  success: boolean;
  message: string;
  data: UserCompany;
}

export interface CreateUserCompanyRequest {
  user_id: number;
  company_id: number;
  role_in_company?: string;
  is_primary?: boolean;
  status?: number;
}

export interface UpdateUserCompanyRequest {
  role_in_company?: string;
  is_primary?: boolean;
  status?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Helper function to handle API errors consistently
const handleApiError = (error: any, action: string): UserCompanyResponse => {
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

// UserCompany Service
export const userCompanyService = {
  /**
   * ดึงข้อมูลบริษัทของผู้ใช้ตาม user_id
   */
  getUserCompanies: async (userId: number): Promise<UserCompanyResponse> => {
    try {
      const response: AxiosResponse<UserCompanyResponse> =
        await userCompanyApi.get(`/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'ดึงข้อมูลบริษัทของผู้ใช้');
    }
  },

  /**
   * ดึงข้อมูลผู้ใช้ในบริษัทตาม company_id
   */
  getCompanyUsers: async (companyId: number): Promise<UserCompanyResponse> => {
    try {
      const response: AxiosResponse<UserCompanyResponse> =
        await userCompanyApi.get(`/company/${companyId}`);
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'ดึงข้อมูลผู้ใช้ในบริษัท');
    }
  },

  /**
   * เพิ่มผู้ใช้เข้าบริษัท
   */
  addUserToCompany: async (
    data: CreateUserCompanyRequest
  ): Promise<SingleUserCompanyResponse> => {
    try {
      const response: AxiosResponse<SingleUserCompanyResponse> =
        await userCompanyApi.post('/', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: handleApiError(error, 'เพิ่มผู้ใช้เข้าบริษัท').message,
        data: {} as UserCompany,
      };
    }
  },

  /**
   * อัปเดตข้อมูลผู้ใช้ในบริษัท
   */
  updateUserCompany: async (
    id: number,
    data: UpdateUserCompanyRequest
  ): Promise<SingleUserCompanyResponse> => {
    try {
      const response: AxiosResponse<SingleUserCompanyResponse> =
        await userCompanyApi.post(`/update/${id}`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: handleApiError(error, 'อัปเดตข้อมูลผู้ใช้ในบริษัท').message,
        data: {} as UserCompany,
      };
    }
  },

  /**
   * ลบผู้ใช้ออกจากบริษัท
   */
  removeUserFromCompany: async (id: number): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await userCompanyApi.post(
        `/delete/${id}`,
        {}
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: handleApiError(error, 'ลบผู้ใช้ออกจากบริษัท').message,
      };
    }
  },

  /**
   * ตั้งบริษัทหลักของผู้ใช้
   */
  setPrimaryCompany: async (
    userId: number,
    companyId: number
  ): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await userCompanyApi.post(
        `/set-primary`,
        { user_id: userId, company_id: companyId }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: handleApiError(error, 'ตั้งบริษัทหลัก').message,
      };
    }
  },

  /**
   * ดึงข้อมูลทั้งหมด
   */
  getAllUserCompanies: async (): Promise<UserCompanyResponse> => {
    try {
      const response: AxiosResponse<UserCompanyResponse> =
        await userCompanyApi.get('/');
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'ดึงข้อมูลความสัมพันธ์ผู้ใช้-บริษัท');
    }
  },
};
