import axios, { AxiosResponse } from 'axios';

// Get base URL from environment or use default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance with base configuration
const userApi = axios.create({
  baseURL: `${API_URL}/api/users`,
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
userApi.interceptors.request.use(
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
userApi.interceptors.response.use(
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

// Types for User API
export interface User {
  user_id: number;
  username: string;
  fullname: string;
  email: string;
  phone?: string;
  type: string;
  language_code: string;
  tax_id?: string;
  address?: string;
  image?: string;
  status: 0 | 1;
  is_locked: boolean;
  login_count: number;
  created_dt: string;
  updated_dt: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User[];
  total: number;
}

export interface SingleUserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  fullname: string;
  email: string;
  phone?: string;
  type?: string;
  language_code?: string;
  tax_id: string;
  address?: string;
  image?: string;
  status: 0 | 1;
  is_locked?: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  fullname?: string;
  email?: string;
  phone?: string;
  type: string;
  language_code?: string;
  tax_id?: string;
  address?: string;
  image?: string;
  status: 0 | 1;
  is_locked?: boolean;
}

export interface UserFormData {
  username: string;
  password: string;
  fullname: string;
  email: string;
  phone: string;
  type: string;
  language_code: string;
  tax_id: string;
  address: string;
  image: string;
  status: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Helper function to handle API errors consistently
const handleApiError = (error: any, action: string): UserResponse => {
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

// User Service
export const userService = {
  /**
   * ดึงข้อมูลผู้ใช้งานทั้งหมด
   */
  getAllUsers: async (
    search?: string,
    type?: string,
    status?: string
  ): Promise<UserResponse> => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (type) params.type = type;
      if (status) params.status = status;

      const response: AxiosResponse<UserResponse> = await userApi.get('/', {
        params,
      });
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'ดึงข้อมูลผู้ใช้งาน');
    }
  },

  /**
   * ดึงข้อมูลผู้ใช้งานตาม ID
   */
  getUserById: async (userId: number): Promise<SingleUserResponse> => {
    try {
      const response: AxiosResponse<SingleUserResponse> = await userApi.get(
        `/${userId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting user by ID:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน',
        data: {} as User,
      };
    }
  },

  /**
   * ดึงข้อมูลผู้ใช้งานตามประเภท
   */
  getUsersByType: async (type: string): Promise<UserResponse> => {
    try {
      const response: AxiosResponse<UserResponse> = await userApi.get('/', {
        params: { type },
      });
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'ดึงข้อมูลผู้ใช้งานตามประเภท');
    }
  },

  /**
   * ดึงข้อมูลผู้ใช้งานตามสถานะ
   */
  getUsersByStatus: async (status: boolean): Promise<UserResponse> => {
    try {
      const response: AxiosResponse<UserResponse> = await userApi.get('/', {
        params: { status: status ? '1' : '0' },
      });
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'ดึงข้อมูลผู้ใช้งานตามสถานะ');
    }
  },

  /**
   * สร้างผู้ใช้งานใหม่
   */
  createUser: async (userData: CreateUserRequest): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await userApi.post(
        '/',
        userData
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating user:', error);
      return {
        success: false,
        message:
          error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน',
      };
    }
  },

  /**
   * อัปเดตข้อมูลผู้ใช้งาน
   */
  updateUser: async (
    userId: number,
    userData: UpdateUserRequest
  ): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await userApi.put(
        `/${userId}`,
        userData
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating user:', error);
      return {
        success: false,
        message:
          error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้งาน',
      };
    }
  },

  /**
   * ลบผู้ใช้งาน (soft delete)
   */
  deleteUser: async (userId: number): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await userApi.delete(
        `/${userId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting user:', error);
      return {
        success: false,
        message:
          error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน',
      };
    }
  },

  /**
   * ตรวจสอบว่า username มีอยู่หรือไม่
   */
  checkUsernameExists: async (
    username: string,
    excludeUserId?: number
  ): Promise<ApiResponse> => {
    try {
      const params: any = { username };
      if (excludeUserId) params.exclude_user_id = excludeUserId;

      const response: AxiosResponse<ApiResponse> = await userApi.get(
        '/check-username',
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Error checking username:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'เกิดข้อผิดพลาดในการตรวจสอบชื่อผู้ใช้',
      };
    }
  },

  /**
   * ตรวจสอบว่า email มีอยู่หรือไม่
   */
  checkEmailExists: async (
    email: string,
    excludeUserId?: number
  ): Promise<ApiResponse> => {
    try {
      const params: any = { email };
      if (excludeUserId) params.exclude_user_id = excludeUserId;

      const response: AxiosResponse<ApiResponse> = await userApi.get(
        '/check-email',
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Error checking email:', error);
      return {
        success: false,
        message:
          error.response?.data?.message || 'เกิดข้อผิดพลาดในการตรวจสอบอีเมล',
      };
    }
  },

  /**
   * อัปเดตภาษาของผู้ใช้งาน (เฉพาะ language_code)
   */
  updateUserLanguage: async (
    userId: number,
    languageCode: string
  ): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await userApi.patch(
        `/${userId}/language`,
        { language_code: languageCode }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating user language:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'เกิดข้อผิดพลาดในการอัปเดตภาษาผู้ใช้งาน',
      };
    }
  },
};

export default userService;
