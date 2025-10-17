# Hướng dẫn khắc phục lỗi Mystery Box

## Tổng quan vấn đề

Hệ thống Mystery Box gặp lỗi khi người dùng bấm "mở hộp" ở banner admin tạo. Các lỗi chính đã được khắc phục:

## Các lỗi đã sửa

### 1. Lỗi function `isAuth` không tồn tại

**Vấn đề:** Function `isAuth` không được định nghĩa trong `auth.js` nhưng lại được import trong `mysteryBox.js`

**Giải pháp:** Đã thêm function `isAuth` vào `auth.js` để kiểm tra xác thực người dùng đã đăng nhập

**File:** `backup04 API conect/Backend/src/controllers/auth.js`

### 2. Lỗi xử lý `totalItems` trong inventory

**Vấn đề:** Function `openMysteryBox` trả về `userInventory.totalItems` nhưng field này có thể chưa được cập nhật đúng cách

**Giải pháp:** Sử dụng `userInventory.items.length` thay vì `userInventory.totalItems`

**File:** `backup04 API conect/Backend/src/controllers/mysteryBox.js`

### 3. Lỗi xử lý image trong banner và chess piece

**Vấn đề:** Controller không xử lý đúng trường hợp image có thể là URL hoặc file path

**Giải pháp:** Cải thiện logic xử lý image trong các function `createBanner`, `addChessPiece`, `updateBanner`, `updateChessPiece`

**File:** `backup04 API conect/Backend/src/controllers/banner.js`

### 4. Cải thiện error handling và logging

**Vấn đề:** Thiếu logging chi tiết để debug

**Giải pháp:** Thêm logging chi tiết cho tất cả các function trong backend và frontend

**Files:** 
- `backup04 API conect/Backend/src/controllers/auth.js`
- `backup04 API conect/Backend/src/controllers/banner.js`
- `backup04 API conect/Backend/src/controllers/mysteryBox.js`
- `package/src/app/mystery-box/page.tsx`
- `package/src/app/admin/banner-management/page.tsx`

## Cách kiểm tra và test

### 1. Kiểm tra backend

1. Khởi động backend server
2. Kiểm tra console log khi tạo banner và thêm quân cờ
3. Kiểm tra console log khi mở mystery box

### 2. Kiểm tra frontend

1. Khởi động frontend
2. Mở Developer Tools (F12) và xem Console
3. Thử tạo banner và thêm quân cờ
4. Thử mở mystery box

### 3. Kiểm tra database

1. Đảm bảo MongoDB đang chạy
2. Kiểm tra collections: `banners`, `users`, `userinventories`

## Các bước để test hoàn chỉnh

### Bước 1: Tạo admin user
1. Đăng ký tài khoản admin
2. Đăng nhập với tài khoản admin

### Bước 2: Tạo banner
1. Vào trang admin banner management
2. Tạo banner mới với tên, mô tả, chủ đề
3. Kiểm tra console log

### Bước 3: Thêm quân cờ
1. Thêm quân cờ vào banner vừa tạo
2. Điền đầy đủ thông tin: tên, loại, độ hiếm, stats
3. Kiểm tra console log

### Bước 4: Test mở hộp
1. Vào trang mystery box
2. Kiểm tra banner hiển thị
3. Bấm "mở hộp"
4. Kiểm tra console log và kết quả

## Các lỗi thường gặp và cách khắc phục

### Lỗi "Không tìm thấy banner"
- Kiểm tra banner có `isActive: true` không
- Kiểm tra banner có quân cờ không
- Kiểm tra database connection

### Lỗi "Token không hợp lệ"
- Kiểm tra user đã đăng nhập chưa
- Kiểm tra token có hết hạn không
- Kiểm tra JWT_SECRET trong environment

### Lỗi "Banner này chưa có quân cờ nào"
- Thêm quân cờ vào banner trước khi mở hộp
- Kiểm tra banner có `chessPieces` array không

### Lỗi "Lỗi khi mở hộp mystery box"
- Kiểm tra console log backend
- Kiểm tra database connection
- Kiểm tra user inventory có được tạo đúng không

## Monitoring và Debug

### Backend Logs
- Tất cả API calls đều có logging chi tiết
- Error stack traces được hiển thị đầy đủ
- Database operations được log

### Frontend Logs
- Network requests được log
- Response status và data được log
- Error messages được hiển thị rõ ràng

### Database Queries
- Sử dụng MongoDB Compass để kiểm tra data
- Kiểm tra indexes và collections
- Monitor query performance

## Kết luận

Sau khi khắc phục các lỗi trên, hệ thống Mystery Box sẽ hoạt động ổn định. Các logging chi tiết sẽ giúp debug dễ dàng hơn trong tương lai.

Nếu vẫn gặp lỗi, hãy kiểm tra:
1. Console logs của cả backend và frontend
2. Database connection và data
3. Network requests và responses
4. User authentication và authorization


