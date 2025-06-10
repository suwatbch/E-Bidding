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
  protectRoute: (currentPath: string) => boolean; // Client-side route protection
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

// ฟังก์ชันสำหรับถอดข้อมูล user จาก JWT token
const getUserFromJWT = (token: string): User | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    let decoded;
    if (typeof window !== 'undefined') {
      decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } else {
      decoded = JSON.parse(
        Buffer.from(
          payload.replace(/-/g, '+').replace(/_/g, '/'),
          'base64'
        ).toString('utf-8')
      );
    }

    // ฟังก์ชันสำหรับ decode Unicode escape sequences
    const decodeUnicodeString = (str: string): string => {
      if (!str || typeof str !== 'string') return str;

      try {
        let decoded = str;

        // Method 1: Decode hex escape sequences (\xNN)
        decoded = decoded.replace(/\\x([0-9A-Fa-f]{2})/g, (match, hex) => {
          return String.fromCharCode(parseInt(hex, 16));
        });

        // Method 2: Try to decode as UTF-8 byte sequence
        try {
          // แปลง string เป็น bytes แล้ว decode เป็น UTF-8
          const bytes = [];
          for (let i = 0; i < decoded.length; i++) {
            bytes.push(decoded.charCodeAt(i));
          }

          // ใช้ TextDecoder สำหรับ UTF-8
          if (typeof TextDecoder !== 'undefined') {
            const uint8Array = new Uint8Array(bytes);
            const textDecoder = new TextDecoder('utf-8');
            decoded = textDecoder.decode(uint8Array);
          }
        } catch (e) {
          // ถ้า decode ไม่ได้ ใช้ค่าเดิม
        }

        return decoded;
      } catch {
        return str;
      }
    };

    const decodedFullname = decodeUnicodeString(decoded.fullname || '');
    const finalFullname =
      decodedFullname ||
      decoded.username ||
      `${decoded.firstName || ''} ${decoded.lastName || ''}`.trim();

    console.log('🔍 decoded.image', decoded.image);

    return {
      user_id: decoded.user_id || decoded.id,
      username: decoded.username || decoded.sub,
      fullname: finalFullname,
      type: decoded.type || decoded.role || 'user',
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
    };
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};

// ฟังก์ชันสำหรับอ่าน cookie auth_token
const getAuthTokenFromCookie = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const allCookies = document.cookie.split('; ');
  const authTokenCookie = allCookies.find((row) =>
    row.startsWith('auth_token=')
  );
  const cookieValue = authTokenCookie?.split('=')[1];

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
      // Token หมดอายุใน 1 วันสำหรับทุกกรณี
      const tokenExpiresAt = getTokenExpiresAt() || getFallbackTokenExpiresAt();

      const session: AuthSession = {
        user: userData,
        token: authToken,
        remember_me: rememberMe,
        expires_at: tokenExpiresAt.toISOString(),
      };

      // Store remember preference
      localStorage.setItem(STORAGE_KEYS.REMEMBER, rememberMe.toString());

      // Choose storage based on remember me
      const storage = rememberMe ? localStorage : sessionStorage;

      // Save session
      storage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));

      // Also save individual items for compatibility
      storage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      if (authToken) {
        storage.setItem(STORAGE_KEYS.TOKEN, authToken);
      }
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

  // Login method - ตั้ง cookie สำหรับ middleware
  const login = (userData: User, authToken?: string, rememberMe = false) => {
    setUser(userData);
    setToken(authToken || null);

    // บันทึกข้อมูลใน storage ทันที
    const tokenExpiresAt = getFallbackTokenExpiresAt();
    setTokenExpiresAt(tokenExpiresAt);
    saveSession(userData, authToken, rememberMe);

    // ตั้ง cookie สำหรับ middleware (ฝั่ง server)
    if (authToken) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 1); // 1 วัน

      document.cookie = `auth_token=${authToken}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
    }

    // ลอง sync จาก cookie หลังจากนั้น (กรณี backend set cookie แล้ว)
    setTimeout(() => {
      const cookieToken = getAuthTokenFromCookie();
      if (syncFromCookie()) {
        // Cookie sync successful
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

  // Client side effects
  useEffect(() => {
    setIsLoading(true);

    // โหลดข้อมูลจาก storage
    loadSession();

    const handleMiddlewareLogout = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const reason = urlParams.get('reason');

      if (reason === 'token_expired') {
        logout();
        // แสดงข้อความแจ้งเตือน
        setTimeout(() => {
          alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
        }, 100);
      }
    };

    handleMiddlewareLogout();
    setIsLoading(false);
  }, []);

  // Initialize user data from cookie
  useEffect(() => {
    // โหลดข้อมูล user จาก cookie เมื่อเริ่มต้น
    syncFromCookie();
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
        // อัพเดต state จาก cookie - บังคับให้อัพเดทใหม่
        setUser(null); // ล้างข้อมูลเก่าก่อน
        setTimeout(() => {
          setUser(userFromJWT);
          setToken(cookieToken);
          setTokenExpiresAt(cookieExpiration);
        }, 0);

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

  // Client-side route protection - ใช้แทน middleware
  const protectRoute = (currentPath: string): boolean => {
    const protectedRoutes = [
      '/auctions',
      '/auction',
      '/auctionform',
      '/my-auctions',
      '/alerts',
      '/company',
      '/language',
      '/user',
      '/token-session',
      '/test',
    ];

    const authRoutes = ['/login', '/register', '/forget'];

    const isProtectedRoute = protectedRoutes.some((route) =>
      currentPath.startsWith(route)
    );
    const isAuthRoute = authRoutes.some((route) =>
      currentPath.startsWith(route)
    );

    // ถ้าเป็นหน้า auth และมี user แล้ว ควรไป auctions
    if (isAuthRoute && isAuthenticated && !isTokenExpired()) {
      return false; // ไม่ควรอยู่หน้า auth
    }

    // ถ้าเป็นหน้าที่ต้อง login และยังไม่ได้ login
    if (isProtectedRoute && (!isAuthenticated || isTokenExpired())) {
      return false; // ไม่ควรเข้าหน้านี้
    }

    return true; // อนุญาตให้เข้าได้
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
    protectRoute,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Export context for direct access (optional)
export { AuthContext };
