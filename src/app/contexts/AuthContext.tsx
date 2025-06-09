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
  full_name: string;
  role: string;
  email?: string;
  phone?: string;
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

// Storage keys
const STORAGE_KEYS = {
  SESSION: 'auth_session',
  USER: 'auth_user',
  TOKEN: 'auth_token',
  REMEMBER: 'auth_remember',
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
    if (!tokenExpiresAt) return false;
    return new Date() > tokenExpiresAt;
  };

  // Auto logout when token expires
  const checkTokenExpiration = () => {
    if (isAuthenticated && isTokenExpired()) {
      console.log('🕐 Token expired, logging out...');
      logout();
      return true;
    }
    return false;
  };

  // Load session from storage
  const loadSession = () => {
    try {
      // Check for remember me preference
      const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER) === 'true';
      const storage = rememberMe ? localStorage : sessionStorage;

      const sessionData = storage.getItem(STORAGE_KEYS.SESSION);

      if (sessionData) {
        const session: AuthSession = JSON.parse(sessionData);

        // Check if session is expired
        if (session.expires_at) {
          const expiresAt = new Date(session.expires_at);
          const now = new Date();

          if (now > expiresAt) {
            // Session expired
            clearSession();
            return;
          }
        }

        // Restore session
        setUser(session.user);
        setToken(session.token || null);
        setTokenExpiresAt(
          session.expires_at ? new Date(session.expires_at) : null
        );
      }
    } catch (error) {
      console.error('Error loading session:', error);
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
      const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

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
      console.error('Error saving session:', error);
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

  // Login method
  const login = (userData: User, authToken?: string, rememberMe = false) => {
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

    setUser(userData);
    setToken(authToken || null);
    setTokenExpiresAt(tokenExpiresAt);
    saveSession(userData, authToken, rememberMe);
  };

  // Logout method
  const logout = () => {
    setUser(null);
    setToken(null);
    setTokenExpiresAt(null);
    clearSession();
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

  // Context value
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    token,
    tokenExpiresAt,
    login,
    logout,
    updateUser,
    checkAuth,
    getToken,
    getTokenExpiresAt: () => tokenExpiresAt,
    isTokenExpired,
    getTimeUntilExpiration: () => {
      if (!tokenExpiresAt) return 0;
      const now = new Date();
      const timeUntilExpiration = tokenExpiresAt.getTime() - now.getTime();
      return timeUntilExpiration;
    },
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Export context for direct access (optional)
export { AuthContext };
