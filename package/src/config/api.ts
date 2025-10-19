// API Configuration for Next.js API routes
export const API_CONFIG = {
  // Base URL for Next.js API routes (same origin, no CORS needed)
  BASE_URL: '/api',
  
  // API Endpoints
  ENDPOINTS: {
    // Auth endpoints - Next.js API routes
    AUTH: {
      LOGIN: '/signin',
      REGISTER: '/signup',
      LOGOUT: '/logout',
      ME: '/users',
      REFRESH: '/refresh',
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
