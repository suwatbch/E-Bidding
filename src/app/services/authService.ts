import axios, { AxiosResponse } from 'axios';

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance with base configuration
const authApi = axios.create({
  baseURL: `${API_URL}/api/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // เพื่อให้สามารถรับและส่ง cookie ได้
});

// Types for API requests and responses
export interface LoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user_id: number;
    username: string;
    fullname: string;
    type: string;
    token?: string;
  };
}

export interface OTPRequest {
  username: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  data?: {
    expires_at: string;
  };
}

export interface ResetPasswordRequest {
  username: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// Error response type
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}

// Auth Service
export const authService = {
  /**
   * Login user
   */
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await authApi.post('/login', request);

      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
      };
    }
  },

  /**
   * Request OTP for password reset
   */
  requestOTP: async (data: OTPRequest): Promise<OTPResponse> => {
    try {
      const response: AxiosResponse<OTPResponse> = await authApi.post(
        '/otp',
        data
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการส่ง OTP',
      };
    }
  },

  /**
   * Reset password with OTP
   */
  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> => {
    try {
      const response: AxiosResponse<ResetPasswordResponse> = await authApi.post(
        '/reset-password',
        data
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน',
      };
    }
  },

  /**
   * Logout user (if needed in the future)
   */
  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authApi.post('/logout');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการออกจากระบบ',
      };
    }
  },

  /**
   * Get active OTPs (Admin only)
   */
  getActiveOtps: async (): Promise<{
    success: boolean;
    message: string;
    data?: any[];
  }> => {
    try {
      const token =
        localStorage.getItem('auth_token') ||
        sessionStorage.getItem('auth_token');

      const response = await authApi.get('/active-otps', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error in authService.getActiveOtps:', error);

      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล OTP',
        data: [],
      };
    }
  },
};
