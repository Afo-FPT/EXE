import { buildApiUrl, getAuthHeaders, API_CONFIG } from '@/config/api';

// API Service class
class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = buildApiUrl(endpoint);
    const config: RequestInit = {
      headers: getAuthHeaders(),
      ...options,
    };

    console.log('🌐 API Request:', {
      url,
      method: options.method || 'GET',
      headers: config.headers,
      body: options.body
    });



    try {
      console.log('🚀 Sending request to:', url);
      
      // Tạo AbortController để timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📡 API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.log('⚠️ Could not parse error response as JSON');
        }
        
        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url: response.url
        });
        
        // Nếu errorData có errors array (backend validation errors)
        if ((errorData as any).errors && Array.isArray((errorData as any).errors)) {
          throw new Error((errorData as any).errors.join(', '));
        }
        // Nếu có message
        if ((errorData as any).message) {
          throw new Error((errorData as any).message);
        }
        // Fallback
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ API Success:', data);
      return data;
    } catch (error) {
      console.error('❌ API request failed:', error);
      
      // Xử lý các loại lỗi khác nhau
      if ((error as any).name === 'AbortError') {
        throw new Error('Request timeout. Server không phản hồi trong thời gian quy định.');
      }
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('❌ Không thể kết nối đến server. Vui lòng:\n1. Kiểm tra backend có đang chạy tại http://localhost:5000\n2. Chạy: cd BE/Backend && npm run simple\n3. Kiểm tra file .env có đúng cấu hình không');
      }
      
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        throw new Error('Lỗi mạng. Vui lòng kiểm tra kết nối internet.');
      }
      
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    confirmpassword: string;
  }) {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  }

  async logout(token: string) {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });
  }

  async getCurrentUser(token: string) {
    try {
      // Backend không có /me endpoint, tạm thời return null để tránh lỗi
      console.log('⚠️ Backend không có /me endpoint, sử dụng token để xác thực');
      return { user: null };
    } catch (error) {
      console.error('❌ Get current user error:', error);
      throw error;
    }
  }

  // User methods
  async getUserProfile(token: string) {
    return this.request('/user/profile', {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
  }

  async updateUserProfile(token: string, userData: any) {
    return this.request('/user/update', {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(userData),
    });
  }

  // Generic methods
  async get(endpoint: string, token?: string) {
    return this.request(endpoint, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
  }

  async post(endpoint: string, data: any, token?: string) {
    return this.request(endpoint, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any, token?: string) {
    return this.request(endpoint, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string, token?: string) {
    return this.request(endpoint, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
