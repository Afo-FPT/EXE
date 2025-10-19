'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { buildApiUrl } from '@/config/api';

// Types
export interface User {
  _id: string;
  id?: string; // Để tương thích với code cũ
  username: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface LoginResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  token: string;
}

interface RegisterResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  token: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, confirmpassword: string) => Promise<void>;
  logout: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Toast component
const Toast: React.FC<{ message: string; type: 'success' | 'error' | 'info'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${bgColor} min-w-80`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{icon}</span>
          <span>{message}</span>
        </div>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    </div>
  );
};

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const router = useRouter();

  // Show toast function
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken) {
          console.log('🔍 Checking stored token...');
          
          // Try to restore user from localStorage first
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              console.log('✅ Restoring user from localStorage:', userData.username);
              setUser(userData);
              setToken(storedToken);
              setIsLoading(false);
              return;
            } catch (parseError) {
              console.log('❌ Failed to parse stored user data:', parseError);
            }
          }
          
          // Decode JWT token to get user info
          try {
            const tokenParts = storedToken.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              const currentTime = Math.floor(Date.now() / 1000);
              
              // Check if token is expired
              if (payload.exp && payload.exp < currentTime) {
                console.log('❌ Token expired');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsLoading(false);
                return;
              }
              
              // Set user from token payload
              if (payload.id && payload.username && payload.email) {
                console.log('✅ Token valid, setting user:', payload.username);
                const userData = {
                  _id: payload.id,
                  id: payload.id,
                  username: payload.username,
                  email: payload.email,
                  role: payload.role || 'user'
                };
                setUser(userData);
                setToken(storedToken);
                // Save user data to localStorage for future reloads
                localStorage.setItem('user', JSON.stringify(userData));
                setIsLoading(false);
                return;
              }
            }
          } catch (decodeError) {
            console.log('❌ Token decode error:', decodeError);
          }
          
          // If token decode fails, try to verify with backend
          try {
            const response = await fetch(buildApiUrl('/verify-token'), {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const userData = await response.json();
              const user = {
                _id: userData.id,
                id: userData.id,
                username: userData.username,
                email: userData.email,
                role: userData.role
              };
              setUser(user);
              setToken(storedToken);
              // Save user data to localStorage for future reloads
              localStorage.setItem('user', JSON.stringify(user));
            } else {
              console.log('❌ Token verification failed');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          } catch (apiError) {
            console.log('❌ API verification failed, using token decode');
            // Token decode already handled above
          }
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await fetch(buildApiUrl('/signin'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Login response status:', response.status);
      console.log('📡 Login response headers:', response.headers);

      if (!response.ok) {
        let errorMessage = 'Đăng nhập thất bại';
        let responseData: any = null;
        
        try {
          // Clone the response to avoid "body stream already read" error
          const responseClone = response.clone();
          responseData = await responseClone.json();
          // Handle different error response formats from backend
          if (responseData.errors && Array.isArray(responseData.errors)) {
            errorMessage = responseData.errors.join(', ');
          } else if (responseData.error) {
            errorMessage = responseData.error;
          } else if (responseData.message) {
            errorMessage = responseData.message;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data: LoginResponse = await response.json();
      console.log('✅ Login successful:', data.user.username, 'Role:', data.user.role);
      
      // Transform backend response to frontend format
      const userData = {
        _id: data.user.id,
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role
      };
      
      setUser(userData);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));

      showToast('Đăng nhập thành công! Chào mừng bạn trở lại! 🎉', 'success');

      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      showToast(error.message || 'Đăng nhập thất bại! Vui lòng kiểm tra email và mật khẩu.', 'error');
      throw error;
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string, confirmpassword: string) => {
    try {
      console.log('📝 Attempting register for:', username, email);
      
      const response = await fetch(buildApiUrl('/signup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, confirmpassword }),
      });

      console.log('📡 Register response status:', response.status);
      console.log('📡 Register response headers:', response.headers);

      if (!response.ok) {
        let errorMessage = 'Đăng ký thất bại';
        let responseData: any = null;
        
        try {
          // Clone the response to avoid "body stream already read" error
          const responseClone = response.clone();
          responseData = await responseClone.json();
          // Handle different error response formats from backend
          if (responseData.errors && Array.isArray(responseData.errors)) {
            errorMessage = responseData.errors.join(', ');
          } else if (responseData.error) {
            errorMessage = responseData.error;
          } else if (responseData.message) {
            errorMessage = responseData.message;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data: RegisterResponse = await response.json();
      console.log('✅ Register successful:', data.user.username, 'Role:', data.user.role);
      
      // Transform backend response to frontend format
      const userData = {
        _id: data.user.id,
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role
      };
      
      setUser(userData);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));

      showToast('Đăng ký thành công! Chào mừng bạn đến với EXE Project! 🎉', 'success');

      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      console.error('❌ Register error:', error);
      showToast(error.message || 'Đăng ký thất bại! Vui lòng thử lại.', 'error');
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (token) {
        await fetch(buildApiUrl('/logout'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/');
      showToast('Đăng xuất thành công! 👋', 'success');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    showToast,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
