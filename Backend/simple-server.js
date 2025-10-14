import express from "express";
import cors from 'cors';
import passwordResetRouter from './src/routers/passwordReset.js';

const app = express();

// CORS middleware để cho phép frontend gọi API
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Thêm middleware để parse JSON body
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/signup, /api/signin, /api/logout',
      verify: '/api/verify-token'
    }
  });
});

// Simple auth endpoints for testing
app.post('/api/signin', (req, res) => {
  console.log('🔐 Signin request:', req.body);
  
  const { email, password } = req.body;
  
  // Simple test credentials
  if (email === 'admin@exe.com' && password === 'admin123') {
    const token = 'test-token-' + Date.now();
    res.json({
      message: "Đăng nhập thành công!",
      token,
      data: { 
        id: 'admin-id', 
        username: 'admin', 
        email: 'admin@exe.com', 
        role: 'admin' 
      }
    });
  } else {
    res.status(400).json({ errors: ["Sai email hoặc mật khẩu!"] });
  }
});

app.post('/api/signup', (req, res) => {
  console.log('📝 Signup request:', req.body);
  
  const { username, email, password, confirmpassword } = req.body;
  
  if (password !== confirmpassword) {
    return res.status(400).json({ errors: ["Mật khẩu xác nhận không khớp!"] });
  }
  
  const token = 'test-token-' + Date.now();
  res.status(201).json({
    message: "Đăng ký thành công!",
    token,
    data: { 
      id: 'user-id-' + Date.now(), 
      username, 
      email, 
      role: 'user' 
    }
  });
});

app.post('/api/logout', (req, res) => {
  res.json({ message: "Đăng xuất thành công!" });
});

app.get('/api/verify-token', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ errors: ["Token không hợp lệ!"] });
  }
  
  const token = authHeader.split(' ')[1];
  if (token.startsWith('test-token-')) {
    res.json({
      id: 'admin-id',
      username: 'admin',
      email: 'admin@exe.com',
      role: 'admin'
    });
  } else {
    res.status(401).json({ errors: ["Token không hợp lệ!"] });
  }
});

// Admin dashboard endpoints
app.get('/api/dashboard', (req, res) => {
  console.log('📊 Dashboard stats request');
  
  const stats = {
    totalUsers: 150,
    adminUsers: 3,
    regularUsers: 147,
    totalOrders: 89,
    totalRevenue: 12500000,
    recentOrders: 12
  };
  
  res.json({ stats });
});

app.get('/api/users', (req, res) => {
  console.log('👥 Users list request');
  
  const users = [
    {
      _id: 'user-1',
      username: 'admin',
      email: 'admin@exe.com',
      role: 'admin',
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: 'user-2',
      username: 'john_doe',
      email: 'john@example.com',
      role: 'user',
      createdAt: '2024-01-15T00:00:00.000Z'
    },
    {
      _id: 'user-3',
      username: 'jane_smith',
      email: 'jane@example.com',
      role: 'user',
      createdAt: '2024-02-01T00:00:00.000Z'
    }
  ];
  
  res.json({ users });
});

// Profile endpoints
app.get('/api/profile', (req, res) => {
  console.log('👤 Profile request');
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ errors: ["Token không hợp lệ!"] });
  }
  
  const token = authHeader.split(' ')[1];
  if (token.startsWith('test-token-')) {
    res.json({
      success: true,
      user: {
        id: 'admin-id',
        username: 'admin',
        email: 'admin@exe.com',
        fullName: 'Administrator',
        phone: '0123456789',
        address: '123 Admin Street, Ho Chi Minh City',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    });
  } else {
    res.status(401).json({ errors: ["Token không hợp lệ!"] });
  }
});

app.put('/api/profile', (req, res) => {
  console.log('👤 Profile update request:', req.body);
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ errors: ["Token không hợp lệ!"] });
  }
  
  const token = authHeader.split(' ')[1];
  if (token.startsWith('test-token-')) {
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: 'admin-id',
        username: req.body.username || 'admin',
        email: req.body.email || 'admin@exe.com',
        fullName: req.body.fullName || 'Administrator',
        phone: req.body.phone || '0123456789',
        address: req.body.address || '123 Admin Street, Ho Chi Minh City',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({ errors: ["Token không hợp lệ!"] });
  }
});

app.post('/api/change-password', (req, res) => {
  console.log('🔐 Change password request');
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ errors: ["Token không hợp lệ!"] });
  }
  
  const token = authHeader.split(' ')[1];
  if (token.startsWith('test-token-')) {
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } else {
    res.status(401).json({ errors: ["Token không hợp lệ!"] });
  }
});

// Orders endpoints
app.get('/api/orders/user/:userId', (req, res) => {
  console.log('📦 Orders by user request:', req.params.userId);
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ errors: ["Token không hợp lệ!"] });
  }
  
  const orders = [
    {
      _id: 'order-1',
      orderNumber: 'ORD-001',
      status: 'delivered',
      totalAmount: 500000,
      items: [
        {
          name: 'Chess Piece - King',
          quantity: 1,
          price: 500000,
          image: '/images/products/king.jpg'
        }
      ],
      createdAt: '2024-01-15T00:00:00.000Z',
      shippingAddress: '123 Main Street, Ho Chi Minh City',
      paymentMethod: 'Credit Card'
    },
    {
      _id: 'order-2',
      orderNumber: 'ORD-002',
      status: 'processing',
      totalAmount: 750000,
      items: [
        {
          name: 'Chess Piece - Queen',
          quantity: 1,
          price: 750000,
          image: '/images/products/queen.jpg'
        }
      ],
      createdAt: '2024-02-01T00:00:00.000Z',
      shippingAddress: '456 Oak Avenue, Ho Chi Minh City',
      paymentMethod: 'Bank Transfer'
    }
  ];
  
  res.json({ success: true, orders });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working!' });
});

// Password reset routes - Simple test endpoint
app.post('/api/password-reset/forgot-password', (req, res) => {
  console.log('📧 Forgot password request:', req.body);
  
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email là bắt buộc'
    });
  }
  
  // Simple success response for testing
  res.status(200).json({
    success: true,
    message: 'Email đặt lại mật khẩu đã được gửi thành công (TEST MODE)',
    data: {
      email: email,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });
});

app.post('/api/password-reset/reset-password', (req, res) => {
  console.log('🔐 Reset password request:', req.body);
  
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Token và mật khẩu mới là bắt buộc'
    });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Mật khẩu đã được đặt lại thành công (TEST MODE)'
  });
});

app.get('/api/password-reset/verify-token/:token', (req, res) => {
  console.log('🔍 Verify token request:', req.params.token);
  
  const { token } = req.params;
  
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token là bắt buộc'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Token hợp lệ (TEST MODE)',
    data: {
      email: 'test@example.com',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Lỗi server nội bộ',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Đã xảy ra lỗi'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint không tồn tại',
    path: req.originalUrl,
    method: req.method
  });
});

// Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log(`✅ Server đang chạy tại port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 API health check: http://localhost:${PORT}/api/health`);
  console.log(`📱 Frontend URL: http://localhost:3000`);
  console.log('🚀 ========================================');
  console.log('🔐 Test credentials:');
  console.log('   Email: admin@exe.com');
  console.log('   Password: admin123');
  console.log('🚀 ========================================');
});
