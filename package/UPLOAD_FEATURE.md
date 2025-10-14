# 🛍️ Tính năng Upload Hình ảnh Sản phẩm

## ✅ Đã hoàn thành

### Backend:
1. **Multer Middleware** - Cấu hình upload file với:
   - Lưu trữ trong thư mục `uploads/products/`
   - Tên file unique với timestamp
   - Giới hạn kích thước 5MB
   - Chỉ cho phép file ảnh

2. **Controller Updates**:
   - `createMysteryBag` - Xử lý upload file khi tạo mới
   - `updateMysteryBag` - Xử lý upload file khi cập nhật (optional)
   - Validation schema đã được cập nhật

3. **API Routes**:
   - `POST /api/mystery-bags` - Tạo sản phẩm với upload
   - `PUT /api/mystery-bags/admin/:id` - Cập nhật sản phẩm với upload

### Frontend:
1. **File Upload Input**:
   - Thay thế input URL bằng input file
   - Accept chỉ file ảnh (`image/*`)
   - Required khi tạo mới, optional khi chỉnh sửa

2. **Image Preview**:
   - Hiển thị preview hình ảnh trước khi upload
   - Sử dụng FileReader API
   - Preview kích thước 128x128px

3. **FormData Handling**:
   - Sử dụng FormData thay vì JSON
   - Tự động set Content-Type với boundary
   - Xử lý file upload với progress

## 🚀 Cách sử dụng

### Admin - Tạo sản phẩm mới:
1. Vào `/admin/store-management`
2. Click "Thêm túi mù"
3. Điền thông tin sản phẩm
4. **Chọn file ảnh từ máy tính**
5. Xem preview hình ảnh
6. Click "Tạo mới"

### Admin - Chỉnh sửa sản phẩm:
1. Click "Sửa" trên sản phẩm cần chỉnh sửa
2. Thay đổi thông tin cần thiết
3. **Chọn file ảnh mới (optional)** - nếu không chọn sẽ giữ ảnh cũ
4. Xem preview hình ảnh mới
5. Click "Cập nhật"

## 📁 Cấu trúc File

```
Backend/uploads/products/
├── product-1758011933746-601679659.jpg
├── product-1758012326478-409045471.png
└── ...
```

## 🔧 Cấu hình

### Multer Settings:
- **Destination**: `uploads/products/`
- **File Size Limit**: 5MB
- **File Types**: Chỉ file ảnh (image/*)
- **Naming**: `product-{timestamp}-{random}.{ext}`

### Frontend Settings:
- **Preview Size**: 128x128px
- **Accepted Types**: image/*
- **Required**: Chỉ khi tạo mới

## 🛡️ Bảo mật

- ✅ **File Type Validation** - Chỉ cho phép file ảnh
- ✅ **File Size Limit** - Giới hạn 5MB
- ✅ **Admin Authentication** - Chỉ admin mới upload được
- ✅ **Unique Filenames** - Tránh conflict tên file
- ✅ **Path Sanitization** - An toàn đường dẫn file

## 🎯 Tính năng nổi bật

1. **Drag & Drop Support** - Có thể kéo thả file vào input
2. **Real-time Preview** - Xem ảnh ngay khi chọn
3. **Error Handling** - Thông báo lỗi chi tiết
4. **Progress Indication** - Hiển thị trạng thái upload
5. **Responsive Design** - Hoạt động tốt trên mobile

## 🔄 Workflow

```
User chọn file → Preview hiển thị → FormData tạo → Upload API → Server lưu file → Database cập nhật → UI refresh
```

Tính năng upload hình ảnh đã hoàn thành và sẵn sàng sử dụng! 🎉
