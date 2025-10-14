// API Configuration for backup04 backend
export const API_CONFIG = {
  // Base URL for your backend API
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  
  // API Endpoints
  ENDPOINTS: {
    // Auth endpoints - Khớp với backend thực tế
    AUTH: {
      LOGIN: '/signin',               // Backend có /signin
      REGISTER: '/signup',            // Backend có /signup
      LOGOUT: '/logout',              // Backend có /logout
      ME: '/users',                   // Backend có /users (thay thế /me)
      REFRESH: '/refresh',            // Không có trong backend
    },
    
    // User endpoints
    USER: {
      PROFILE: '/user/profile',
      UPDATE: '/user/update',
      AVATAR: '/user/avatar',
    },
    
    // Other endpoints can be added here
    PRODUCTS: '/products',
    COLLECTIONS: '/collections',
    FEATURES: '/features',
  },
  
  // Request timeout (in milliseconds)
  TIMEOUT: 10000,
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    ...API_CONFIG.DEFAULT_HEADERS,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};
