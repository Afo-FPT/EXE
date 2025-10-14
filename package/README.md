# EXE Project - Hệ thống Xác thực và Phân quyền Hoàn chỉnh

## 🎯 Tổng quan

Hệ thống xác thực và phân quyền hoàn chỉnh với:
- **Backend**: Node.js + Express + JWT (thư mục `backup04 API conect`)
- **Frontend**: Next.js + React + TypeScript (thư mục `EXE_Project-develop`)

## 🏗️ Cấu trúc dự án

```
EXE_Project-develop/
├── package/                    # Frontend Next.js
│   ├── src/
│   │   ├── app/               # App Router
│   │   │   ├── signin/        # Trang đăng nhập/đăng ký
│   │   │   ├── admin/         # Admin dashboard
│   │   │   │   └── dashboard/ # Trang quản trị
│   │   │   └── mystery-box/   # Trang game (yêu cầu đăng nhập)
│   │   ├── components/        # React components
│   │   │   ├── ProtectedRoute.tsx  # Bảo vệ route
│   │   │   └── Layout/        # Layout components
│   │   └── contexts/          # React Context
│   │       └── AuthContext.tsx # Quản lý authentication
│   ├── start-frontend.bat     # Script khởi động frontend
│   └── README.md              # Hướng dẫn này
│
backup04 API conect/            # Backend Node.js
├── server.js                  # Server chính
├── package.json               # Dependencies
├── test-backend.js            # Script test backend
├── start-backend.bat          # Script khởi động backend
└── README.md                  # Hướng dẫn backend
```

## 🚀 Cách khởi động

### **Bước 1: Khởi động Backend**
```bash
# Mở terminal mới, di chuyển đến thư mục backend
cd "backup04 API conect"

# Sử dụng script Windows
start-backend.bat

# Hoặc thủ công
npm install
npm run dev
```

**Kết quả mong đợi:**
```
🚀 Server đang chạy trên port 5000
📡 API endpoint: http://localhost:5000/api

🔍 Đang kiểm tra và tạo tài khoản admin...
🎯 Tài khoản admin đã được tạo tự động!
   📧 Email: admin@exe.com
   🔑 Password: 123123123
   👑 Role: admin
   ✅ Trạng thái: Đã xác thực
   🆔 ID: admin-1234567890
```

### **Bước 2: Khởi động Frontend**
```bash
# Mở terminal mới khác, di chuyển đến thư mục frontend
cd EXE_Project-develop/package

# Sử dụng script Windows
start-frontend.bat

# Hoặc thủ công
npm install
npm run dev
```

**Kết quả mong đợi:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

## 🎭 Hệ thống phân quyền

### **👑 Admin Role**
- ✅ Truy cập tất cả endpoints
- ✅ Admin Dashboard (`/admin/dashboard`)
- ✅ Quản lý users
- ✅ Truy cập Mystery Box
- 🔑 **Tài khoản mặc định**: `admin@exe.com` / `123123123`

### **👤 User Role**
- ✅ Đăng ký/đăng nhập
- ✅ Truy cập user endpoints
- ✅ Truy cập Mystery Box
- ❌ Không thể truy cập admin endpoints

### **🚶 Guest Role**
- ✅ Chỉ xem public endpoints
- ❌ **KHÔNG thể truy cập Mystery Box**
- 🔒 Bị chuyển hướng về trang đăng nhập

## 🔐 API Endpoints

### **Public Endpoints**
- `GET /` - Test connection
- `GET /api` - API status
- `POST /api/register` - Đăng ký tài khoản
- `POST /api/login` - Đăng nhập
- `GET /api/users` - Xem tất cả users (test)

### **Protected Endpoints (yêu cầu đăng nhập)**
- `GET /api/me` - Lấy thông tin user hiện tại
- `POST /api/logout` - Đăng xuất
- `GET /api/mystery-box` - Truy cập Mystery Box

### **Admin Only Endpoints**
- `GET /api/admin/dashboard` - Admin dashboard với thống kê
- `GET /api/admin/users` - Danh sách tất cả users

## 🧪 Test chức năng

### **Test Backend**
```bash
cd "backup04 API conect"
node test-backend.js
```

### **Test Frontend**
1. Mở trình duyệt: `http://localhost:3000`
2. Đăng nhập với tài khoản admin: `admin@exe.com` / `123123123`
3. Kiểm tra chuyển hướng đến Admin Dashboard
4. Test truy cập Mystery Box
5. Test đăng xuất

## 📱 Các trang chính

### **🏠 Trang chủ** (`/`)
- Hiển thị navigation
- Nút đăng nhập/đăng ký
- Thông tin user nếu đã đăng nhập

### **🔐 Trang đăng nhập** (`/signin`)
- Form đăng nhập/đăng ký
- Chuyển đổi giữa login và register
- Thông tin tài khoản admin mặc định
- Validation và error handling

### **👑 Admin Dashboard** (`/admin/dashboard`)
- **Yêu cầu**: Role admin
- Thống kê hệ thống (tổng users, admin, user, verified)
- Bảng danh sách tất cả users
- Thao tác nhanh (Mystery Box, trang chủ, làm mới)

### **🎁 Mystery Box** (`/mystery-box`)
- **Yêu cầu**: Đã đăng nhập (không cho guest)
- 3 loại hộp: Lucky Box, Premium Box, Legendary Box
- Thông tin tài khoản user
- Thông báo bảo mật

## 🔒 Bảo mật

- **JWT Token**: Có thời hạn 7 ngày
- **Password Hashing**: bcrypt với salt rounds 10
- **Role-based Access Control**: Middleware bảo vệ routes
- **ProtectedRoute Component**: Bảo vệ frontend routes
- **Token Validation**: Tất cả protected routes đều validate JWT

## 🚨 Lưu ý quan trọng

1. **Backend và Frontend phải chạy đồng thời**
   - Backend: Port 5000
   - Frontend: Port 3000

2. **Tài khoản admin được tạo tự động** mỗi khi khởi động backend

3. **Dữ liệu sử dụng in-memory storage** - sẽ mất khi restart server

4. **Guest users bị từ chối** khi truy cập Mystery Box

5. **Frontend tự động chuyển hướng** dựa trên role sau khi đăng nhập

## 🐛 Troubleshooting

### **Backend không start**
```bash
# Kiểm tra dependencies
npm list

# Cài đặt lại dependencies
npm install

# Kiểm tra port 5000 có bị chiếm không
netstat -an | findstr :5000
```

### **Frontend không start**
```bash
# Kiểm tra dependencies
npm list

# Cài đặt lại dependencies
npm install

# Kiểm tra port 3000 có bị chiếm không
netstat -an | findstr :3000
```

### **Lỗi CORS**
- Backend đã cấu hình CORS cho `http://localhost:3000`
- Kiểm tra cả backend và frontend đều đang chạy

### **Lỗi 404 API**
- Kiểm tra backend có đang chạy trên port 5000 không
- Kiểm tra URL API trong frontend có đúng không

## 🎉 Kết luận

Hệ thống đã được cấu hình hoàn chỉnh với:
- ✅ Backend tự động tạo tài khoản admin
- ✅ Frontend với giao diện đẹp và responsive
- ✅ Hệ thống phân quyền 3 role hoàn chỉnh
- ✅ Bảo vệ routes và API endpoints
- ✅ Chuyển hướng thông minh dựa trên role
- ✅ Toast notifications cho user feedback
- ✅ Loading states và error handling

**Để sử dụng:**
1. Chạy backend trước (`start-backend.bat`)
2. Chạy frontend sau (`start-frontend.bat`)
3. Đăng nhập với `admin@exe.com` / `123123123`
4. Khám phá các tính năng!

