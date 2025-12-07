# Hướng dẫn Deploy lên Vercel

## Yêu cầu

1. Tài khoản Vercel (đăng ký tại https://vercel.com)
2. Node.js đã cài đặt
3. Git (nếu deploy từ Git repository)

## Cách 1: Deploy bằng Vercel CLI (Nhanh)

### Bước 1: Cài đặt Vercel CLI (nếu chưa có)
```bash
npm install -g vercel
```

### Bước 2: Chạy script deploy
```bash
deploy-vercel.bat
```

Script sẽ tự động:
- Kiểm tra và cài đặt Vercel CLI nếu cần
- Cài đặt dependencies
- Build ứng dụng
- Deploy lên Vercel production

### Bước 3: Đăng nhập Vercel (lần đầu)
Lần đầu tiên chạy, Vercel sẽ yêu cầu đăng nhập:
1. Mở trình duyệt
2. Đăng nhập vào tài khoản Vercel
3. Quay lại terminal

## Cách 2: Deploy từ Git Repository (Khuyến nghị)

### Bước 1: Push code lên GitHub/GitLab/Bitbucket
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

### Bước 2: Kết nối repository với Vercel
1. Truy cập https://vercel.com/dashboard
2. Click "Add New Project"
3. Import Git repository
4. Vercel sẽ tự động detect Next.js và cấu hình

### Bước 3: Cấu hình Environment Variables
Trong Vercel Dashboard:
1. Vào Project Settings > Environment Variables
2. Thêm các biến môi trường:
   - `NEXT_PUBLIC_API_URL` - URL của backend API
   - `NEXTAUTH_URL` - URL của ứng dụng (sẽ tự động set khi deploy)
   - `MONGODB_URI` - Connection string MongoDB
   - `JWT_SECRET` - Secret key cho JWT
   - `NEXT_PUBLIC_MAX_FILE_SIZE` - Giới hạn kích thước file (104857600 = 100MB)

### Bước 4: Deploy
Vercel sẽ tự động deploy mỗi khi bạn push code lên branch `main` hoặc `master`.

## Cấu hình Vercel

File `vercel.json` đã được cấu hình với:
- Function timeout: 300 giây (cho upload file lớn)
- CORS headers cho API routes
- Environment variables

## Lưu ý

1. **File Upload**: Vercel có giới hạn 4.5MB cho serverless functions. Đã cấu hình để hỗ trợ upload lên Vercel Blob Storage.

2. **Environment Variables**: Đảm bảo tất cả biến môi trường đã được set trong Vercel Dashboard.

3. **Build Time**: Build trên Vercel có thể mất 2-5 phút tùy vào kích thước project.

4. **Custom Domain**: Có thể thêm custom domain trong Vercel Dashboard > Settings > Domains.

## Troubleshooting

### Lỗi build
- Kiểm tra `package.json` có đầy đủ dependencies
- Xem build logs trong Vercel Dashboard

### Lỗi runtime
- Kiểm tra Environment Variables đã được set đúng
- Xem function logs trong Vercel Dashboard

### Upload file lỗi
- Kiểm tra `NEXT_PUBLIC_MAX_FILE_SIZE` đã được set
- Kiểm tra Vercel Blob Storage đã được cấu hình

## Hỗ trợ

Nếu gặp vấn đề, xem logs trong Vercel Dashboard hoặc liên hệ support.

