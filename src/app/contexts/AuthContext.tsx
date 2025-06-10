'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// Types
export interface User {
  user_id: number;
  username: string;
  fullname: string;
  type: string;
  email?: string;
  phone?: string;
  language_code?: string;
  tax_id?: string;
  address?: string;
  login_count?: number;
  is_locked?: boolean;
  image?: string;
  status?: number;
  created_dt?: string;
  updated_dt?: string;
}

export interface AuthSession {
  user: User;
  token?: string;
  expires_at?: string;
  remember_me?: boolean;
}

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  tokenExpiresAt: Date | null;

  // Methods
  login: (userData: User, token?: string, rememberMe?: boolean) => void;
  logout: () => void;
  clearSession: () => void;
  updateUser: (userData: Partial<User>) => void;
  checkAuth: () => boolean;
  getToken: () => string | null;
  getTokenExpiresAt: () => Date | null;
  isTokenExpired: () => boolean;
  getTimeUntilExpiration: () => number; // milliseconds
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ฟังก์ชันสำหรับดึงข้อมูล user จาก JWT token
const getUserFromJWT = (token: string): User | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];

    // ใช้ฟังก์ชันที่รองรับทั้ง client และ server side
    let decoded;
    if (typeof window !== 'undefined') {
      // Browser environment
      decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } else {
      // Node.js environment
      decoded = JSON.parse(
        Buffer.from(
          payload.replace(/-/g, '+').replace(/_/g, '/'),
          'base64'
        ).toString('utf-8')
      );
    }

    // ตรวจสอบว่ามีข้อมูล user ครบ
    if (decoded.user_id && decoded.username) {
      return {
        user_id: decoded.user_id,
        username: decoded.username,
        fullname: decoded.fullname || decoded.username,
        type: decoded.type || 'user',
        email: decoded.email,
        phone: decoded.phone,
        language_code: decoded.language_code,
        tax_id: decoded.tax_id,
        address: decoded.address,
        login_count: decoded.login_count,
        is_locked: decoded.is_locked,
        image: decoded.image,
        status: decoded.status,
        created_dt: decoded.created_dt,
        updated_dt: decoded.updated_dt,
      } as User;
    }

    return null;
  } catch (error) {
    return null;
  }
};

// ฟังก์ชันสำหรับอ่าน cookie auth_token
const getAuthTokenFromCookie = (): string | null => {
  if (typeof window === 'undefined') return null;

  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith('auth_token='))
    ?.split('=')[1];

  return cookieValue || null;
};

// ฟังก์ชันสำหรับถอด JWT และดึงเวลาหมดอายุ
const getTokenExpirationFromJWT = (token: string): Date | null => {
  try {
    // JWT token มี 3 ส่วน: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // ถอด payload (ส่วนที่ 2)
    const payload = parts[1];

    // Decode Base64URL - รองรับทั้ง client และ server side
    let decoded;
    if (typeof window !== 'undefined') {
      // Browser environment
      decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } else {
      // Node.js environment
      decoded = JSON.parse(
        Buffer.from(
          payload.replace(/-/g, '+').replace(/_/g, '/'),
          'base64'
        ).toString('utf-8')
      );
    }

    // แสดงข้อมูลทั้งหมดจาก JWT payload
    if (!decoded.exp) {
      return null;
    }

    // แปลง exp (seconds) เป็น Date object
    const expirationDate = new Date(decoded.exp * 1000);

    return expirationDate;
  } catch (error) {
    return null;
  }
};

// ฟังก์ชันสำหรับอ่านวันหมดอายุจาก cookie
const getTokenExpiresAt = (): Date | null => {
  const token = getAuthTokenFromCookie();
  if (!token) {
    return null;
  }

  const expiration = getTokenExpirationFromJWT(token);

  return expiration;
};

// Fallback: สำหรับกรณีที่ไม่มี token ให้สร้างเวลาหมดอายุ 24 ชั่วโมง
const getFallbackTokenExpiresAt = (): Date => {
  const TOKEN_EXPIRES_HOURS = 24;
  const TOKEN_EXPIRES_MS = TOKEN_EXPIRES_HOURS * 60 * 60 * 1000;
  return new Date(Date.now() + TOKEN_EXPIRES_MS);
};

// Storage keys
const STORAGE_KEYS = {
  SESSION: 'auth_session',
  USER: 'auth_user',
  TOKEN: 'auth_token',
  REMEMBER: 'auth_remember_me',
} as const;

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<Date | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Check if token is expired
  const isTokenExpired = (): boolean => {
    // ลองอ่านจาก cookie ก่อน
    const cookieToken = getAuthTokenFromCookie();
    if (cookieToken) {
      const cookieExpiration = getTokenExpirationFromJWT(cookieToken);
      if (cookieExpiration) {
        const isExpired = new Date() > cookieExpiration;
        return isExpired;
      }
    }

    // Fallback: ใช้จาก state ถ้าไม่มี cookie
    if (!tokenExpiresAt) return false;
    return new Date() > tokenExpiresAt;
  };

  // Auto logout when token expires
  const checkTokenExpiration = () => {
    if (isAuthenticated && isTokenExpired()) {
      logout();
      return true;
    }
    return false;
  };

  // Load session from storage
  const loadSession = () => {
    try {
      // ลองอ่านจาก cookie ก่อนเสมอ
      if (syncFromCookie()) {
        setIsLoading(false);
        return;
      }

      // ถ้าไม่มี cookie ให้ลองอ่านจาก storage
      const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER) === 'true';
      const storage = rememberMe ? localStorage : sessionStorage;
      const sessionData = storage.getItem(STORAGE_KEYS.SESSION);

      if (sessionData) {
        const session: AuthSession = JSON.parse(sessionData);

        // ตรวจสอบว่า session หมดอายุหรือไม่
        if (session.expires_at) {
          const expiresAt = new Date(session.expires_at);
          const now = new Date();

          if (now > expiresAt) {
            clearSession();
            setIsLoading(false);
            return;
          }
        }

        // Restore session จาก storage
        setUser(session.user);
        setToken(session.token || null);
        setTokenExpiresAt(
          session.expires_at ? new Date(session.expires_at) : null
        );
      }
    } catch (error) {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  // Save session to storage
  const saveSession = (
    userData: User,
    authToken?: string,
    rememberMe = false
  ) => {
    try {
      console.log('💾 saveSession called with:', {
        userData,
        authToken,
        rememberMe,
      });

      // Token หมดอายุใน 1 วันสำหรับทุกกรณี
      const tokenExpiresAt = getTokenExpiresAt() || getFallbackTokenExpiresAt();
      console.log('🕐 Token expires at:', tokenExpiresAt);

      const session: AuthSession = {
        user: userData,
        token: authToken,
        remember_me: rememberMe,
        expires_at: tokenExpiresAt.toISOString(),
      };
      console.log('📦 Session object:', session);

      // Store remember preference
      localStorage.setItem(STORAGE_KEYS.REMEMBER, rememberMe.toString());
      console.log('💭 Remember preference stored:', rememberMe);

      // Choose storage based on remember me
      const storage = rememberMe ? localStorage : sessionStorage;
      console.log(
        '🗂️ Using storage:',
        rememberMe ? 'localStorage' : 'sessionStorage'
      );

      // Save session
      storage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      console.log('✅ Session saved to storage');

      // Also save individual items for compatibility
      storage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      if (authToken) {
        storage.setItem(STORAGE_KEYS.TOKEN, authToken);
      }
      console.log('✅ Individual items saved');
    } catch (error) {
      console.error('❌ Error saving session:', error);
    }
  };

  // Clear session from storage
  const clearSession = () => {
    try {
      // Clear from both storages
      [localStorage, sessionStorage].forEach((storage) => {
        Object.values(STORAGE_KEYS).forEach((key) => {
          storage.removeItem(key);
        });
      });

      // Clear legacy keys
      localStorage.removeItem('user');
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('login_credentials');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  // Login method - ให้ sync จาก cookie หลัง login
  const login = (userData: User, authToken?: string, rememberMe = false) => {
    console.log('🔑 Login method called:', { userData, authToken, rememberMe });

    setUser(userData);
    setToken(authToken || null);

    // บันทึกข้อมูลใน storage ทันที
    const tokenExpiresAt = getFallbackTokenExpiresAt();
    setTokenExpiresAt(tokenExpiresAt);
    saveSession(userData, authToken, rememberMe);

    console.log('💾 Session saved to storage');

    // ลอง sync จาก cookie หลังจากนั้น (กรณี backend set cookie แล้ว)
    setTimeout(() => {
      console.log('🍪 Attempting to sync from cookie...');
      if (syncFromCookie()) {
        console.log('✅ Cookie sync successful');
      } else {
        console.log('❌ Cookie sync failed, using saved session');
      }
    }, 500); // เพิ่มเวลารอให้ cookie ถูก set
  };

  // Logout method
  const logout = () => {
    setUser(null);
    setToken(null);
    setTokenExpiresAt(null);
    clearSession();

    // ลบ token จาก cookies
    document.cookie =
      'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict';
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);

      // Update session with new user data
      const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER) === 'true';
      saveSession(updatedUser, token || undefined, rememberMe);
    }
  };

  // Check authentication status
  const checkAuth = (): boolean => {
    return isAuthenticated;
  };

  // Get current token
  const getToken = (): string | null => {
    return token;
  };

  // Load session on mount
  useEffect(() => {
    loadSession();
  }, []);

  // Auto check token expiration every minute
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      checkTokenExpiration();
    }, 60000); // Check every 1 minute

    // Check immediately when authentication status changes
    checkTokenExpiration();

    return () => clearInterval(interval);
  }, [isAuthenticated, tokenExpiresAt]);

  // Sync with cookie changes
  useEffect(() => {
    const syncWithCookie = () => {
      const cookieToken = getAuthTokenFromCookie();
      if (cookieToken) {
        const cookieExpiration = getTokenExpirationFromJWT(cookieToken);
        if (cookieExpiration && cookieExpiration !== tokenExpiresAt) {
          setTokenExpiresAt(cookieExpiration);
        }
      } else if (tokenExpiresAt && isAuthenticated) {
        logout();
      }
    };

    // Sync ทันทีเมื่อโหลด
    syncWithCookie();

    // Sync ทุก 30 วินาที
    const syncInterval = setInterval(syncWithCookie, 30000);

    return () => clearInterval(syncInterval);
  }, [isAuthenticated]);

  // ฟังก์ชันสำหรับ sync ข้อมูลจาก cookie
  const syncFromCookie = () => {
    const cookieToken = getAuthTokenFromCookie();
    if (cookieToken) {
      const cookieExpiration = getTokenExpirationFromJWT(cookieToken);
      const userFromJWT = getUserFromJWT(cookieToken);

      if (userFromJWT && cookieExpiration) {
        // อัพเดต state จาก cookie
        setUser(userFromJWT);
        setToken(cookieToken);
        setTokenExpiresAt(cookieExpiration);

        // อัพเดต storage ด้วย
        const session: AuthSession = {
          user: userFromJWT,
          token: cookieToken,
          expires_at: cookieExpiration.toISOString(),
          remember_me: localStorage.getItem(STORAGE_KEYS.REMEMBER) === 'true',
        };

        const storage = session.remember_me ? localStorage : sessionStorage;
        storage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
        storage.setItem(STORAGE_KEYS.USER, JSON.stringify(userFromJWT));
        storage.setItem(STORAGE_KEYS.TOKEN, cookieToken);

        return true; // sync สำเร็จ
      }
    } else if (isAuthenticated) {
      // ไม่มี cookie แต่ยังมี session - logout
      logout();
    }

    return false; // sync ไม่สำเร็จ
  };

  // Context value
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    token,
    tokenExpiresAt,
    login,
    logout,
    clearSession,
    updateUser,
    checkAuth,
    getToken,
    getTokenExpiresAt: () => {
      const cookieToken = getAuthTokenFromCookie();
      if (cookieToken) {
        const cookieExpiration = getTokenExpirationFromJWT(cookieToken);
        if (cookieExpiration) {
          return cookieExpiration;
        }
      }
      return tokenExpiresAt;
    },
    isTokenExpired,
    getTimeUntilExpiration: () => {
      const cookieToken = getAuthTokenFromCookie();
      if (cookieToken) {
        const cookieExpiration = getTokenExpirationFromJWT(cookieToken);
        if (cookieExpiration) {
          const now = new Date();
          const timeUntilExpiration =
            cookieExpiration.getTime() - now.getTime();
          return Math.max(0, timeUntilExpiration);
        }
      }

      // Fallback: ใช้จาก state
      if (!tokenExpiresAt) return 0;
      const now = new Date();
      const timeUntilExpiration = tokenExpiresAt.getTime() - now.getTime();
      return Math.max(0, timeUntilExpiration);
    },
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Export context for direct access (optional)
export { AuthContext };
