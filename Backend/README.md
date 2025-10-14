# 🎁 Mystery Box System - Backend API

## 📋 Tổng quan hệ thống

Hệ thống Mystery Box cho phép admin tạo banner và quân cờ, người chơi đăng nhập và mở hộp để nhận quân cờ ngẫu nhiên dựa trên dropRate.

## 🏗️ Cấu trúc Database

### 1. **Banner Collection**
- Lưu thông tin banner (tên, mô tả, ảnh bìa, chủ đề)
- Không chứa quân cờ trực tiếp
- Có thống kê tổng số quân cờ và phân bố độ hiếm

### 2. **ChessPiece Collection**
- Lưu thông tin từng quân cờ riêng biệt
- Mỗi quân cờ thuộc về một banner
- Có dropRate để tính toán xác suất nhận được

### 3. **UserInventory Collection**
- Lưu inventory của từng user
- Sử dụng reference đến ChessPiece và Banner
- Có thống kê chi tiết và hệ thống level/experience

## 🔄 Luồng hoạt động

### **Admin tạo Banner:**
1. Tạo banner mới → lưu vào `Banner` collection
2. Thêm quân cờ vào banner → lưu vào `ChessPiece` collection
3. Tự động cập nhật thống kê banner

### **User mở hộp:**
1. Chọn banner muốn mở
2. Hệ thống tính toán quân cờ nhận được dựa trên dropRate
3. Lưu quân cờ vào `UserInventory`
4. Cập nhật thống kê user

## 🚀 API Endpoints

### **Banner Management**
- `POST /api/banners` - Tạo banner mới (Admin)
- `GET /api/banners` - Lấy tất cả banners (Admin)
- `GET /api/banners/active` - Lấy banners active (Public)
- `GET /api/banners/:id` - Lấy banner theo ID (Admin)
- `PUT /api/banners/:id` - Cập nhật banner (Admin)
- `DELETE /api/banners/:id` - Xóa banner (Admin)

### **Chess Piece Management**
- `POST /api/chess-pieces` - Tạo quân cờ mới (Admin)
- `GET /api/chess-pieces` - Lấy tất cả quân cờ (Admin)
- `GET /api/chess-pieces/banner/:bannerId` - Lấy quân cờ của banner (Public)
- `GET /api/chess-pieces/:id` - Lấy quân cờ theo ID (Admin)
- `PUT /api/chess-pieces/:id` - Cập nhật quân cờ (Admin)
- `DELETE /api/chess-pieces/:id` - Xóa quân cờ (Admin)

### **Mystery Box**
- `POST /api/mystery-box/open/:bannerId` - Mở hộp (User)
- `GET /api/mystery-box/inventory` - Lấy inventory (User)
- `GET /api/mystery-box/inventory/stats` - Lấy thống kê (User)
- `PUT /api/mystery-box/inventory/items/:itemId/favorite` - Toggle yêu thích (User)
- `PUT /api/mystery-box/inventory/items/:itemId/equip` - Toggle trang bị (User)
- `GET /api/mystery-box/leaderboard` - Lấy leaderboard (User)

## 🎯 Tính năng chính

### **Drop Rate System**
- Mỗi quân cờ có dropRate riêng
- Quân cờ hiếm có dropRate thấp hơn
- Hệ thống random weighted dựa trên dropRate

### **Inventory Management**
- Hệ thống level và experience cho quân cờ
- Toggle yêu thích và trang bị
- Thống kê chi tiết theo độ hiếm

### **Statistics & Leaderboard**
- Theo dõi chuỗi mở hộp
- Thống kê theo độ hiếm
- Leaderboard dựa trên số lượng quân cờ hiếm

## 🔧 Cài đặt và chạy

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Tạo file .env:**
```env
DB_URI=mongodb://localhost:27017/exe_project
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key_here
```

3. **Chạy server:**
```bash
npm start
```

## 📱 Frontend Integration

Frontend cần được cập nhật để:
- Sử dụng API endpoints mới
- Hiển thị thống kê banner thay vì danh sách quân cờ
- Xử lý response format mới với `success` field

## 🐛 Troubleshooting

### **Lỗi thường gặp:**
1. **Database connection failed** → Kiểm tra MongoDB và DB_URI
2. **isAuth middleware not found** → Đảm bảo auth controller đã export isAuth
3. **Chess piece not found** → Kiểm tra banner có quân cờ nào không

### **Debug:**
- Tất cả API đều có console.log chi tiết
- Kiểm tra terminal backend để xem log
- Sử dụng `/api/health` để kiểm tra trạng thái API

## 🔮 Tính năng tương lai

- Hệ thống crafting và fusion quân cờ
- Event banner với dropRate đặc biệt
- Hệ thống trading giữa users
- Achievement system
- Daily/weekly quests
