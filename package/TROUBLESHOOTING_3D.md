# Hướng dẫn khắc phục sự cố Model 3D

## Vấn đề: "Không thể tải model 3D"

### 1. Kiểm tra Backend
```bash
# Kiểm tra backend có đang chạy không
curl http://localhost:5000/health

# Kiểm tra file 3D có thể truy cập không
curl http://localhost:5000/uploads/models/demo.glb
```

### 2. Kiểm tra CORS
Backend đã được cấu hình CORS để cho phép frontend truy cập:
```javascript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
```

### 3. Kiểm tra Static Files
Backend serve static files từ thư mục uploads:
```javascript
app.use('/uploads', express.static('uploads'));
```

### 4. Các nguyên nhân có thể gây lỗi

#### A. URL không đúng
- Model3D URL trong database phải bắt đầu bằng `/uploads/models/`
- Frontend sẽ tự động thêm `http://localhost:5000` vào đầu URL

#### B. File không tồn tại
- Kiểm tra file có tồn tại trong `BE/Backend/uploads/models/`
- Kiểm tra quyền truy cập file

#### C. Định dạng file không hỗ trợ
- Hỗ trợ: `.glb`, `.gltf`, `.obj`
- Không hỗ trợ: `.fbx`, `.dae`, `.blend`

#### D. Lỗi CORS
- Kiểm tra browser console có lỗi CORS không
- Đảm bảo backend và frontend chạy trên cùng domain hoặc CORS được cấu hình đúng

### 5. Debug Steps

#### Bước 1: Kiểm tra dữ liệu
```javascript
// Trong browser console
fetch('http://localhost:5000/api/collections/active')
  .then(res => res.json())
  .then(data => console.log(data))
```

#### Bước 2: Kiểm tra quân cờ
```javascript
// Lấy quân cờ từ collection đầu tiên
fetch('http://localhost:5000/api/collections/active')
  .then(res => res.json())
  .then(data => {
    const collectionId = data.collections[0]._id
    return fetch(`http://localhost:5000/api/chess-pieces/collection/${collectionId}`)
  })
  .then(res => res.json())
  .then(data => console.log(data))
```

#### Bước 3: Test URL trực tiếp
```javascript
// Test URL model 3D
const testUrl = 'http://localhost:5000/uploads/models/demo.glb'
fetch(testUrl, { method: 'HEAD' })
  .then(res => console.log('Status:', res.status))
  .catch(err => console.error('Error:', err))
```

### 6. Các component debug đã thêm

#### DebugChessPieces
- Hiển thị danh sách quân cờ và URL model3D
- Có link test trực tiếp đến model

#### TestModel3D
- Test việc tải model 3D với file demo.glb
- Hiển thị lỗi nếu có

### 7. Cách sử dụng debug components

1. Vào trang `/collection`
2. Scroll xuống để thấy các component debug
3. Kiểm tra:
   - DebugChessPieces: Xem dữ liệu quân cờ
   - TestModel3D: Test việc tải model 3D

### 8. Khắc phục nhanh

#### Nếu backend không chạy:
```bash
cd BE/Backend
npm start
```

#### Nếu frontend không chạy:
```bash
cd FE/package
npm run dev
```

#### Nếu file 3D không tồn tại:
- Upload file 3D mới qua admin panel
- Hoặc copy file demo.glb vào thư mục uploads/models

### 9. Logs để kiểm tra

#### Backend logs:
- Kiểm tra console khi serve static files
- Kiểm tra CORS headers

#### Frontend logs:
- Mở browser DevTools > Console
- Kiểm tra Network tab khi tải model

### 10. Test cases

#### Test case 1: File tồn tại và có thể truy cập
- URL: `http://localhost:5000/uploads/models/demo.glb`
- Expected: Status 200, file content

#### Test case 2: File không tồn tại
- URL: `http://localhost:5000/uploads/models/nonexistent.glb`
- Expected: Status 404

#### Test case 3: CORS error
- Kiểm tra browser console có lỗi CORS không
- Expected: Không có lỗi CORS

### 11. Performance tips

- Model 3D nên được nén để giảm kích thước
- Sử dụng GLB thay vì GLTF để có kích thước nhỏ hơn
- Implement lazy loading cho model 3D
