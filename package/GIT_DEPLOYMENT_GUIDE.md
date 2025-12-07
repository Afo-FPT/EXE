# 🚀 Git Deployment Guide

Deploy qua Git nhanh hơn và chuyên nghiệp hơn so với upload file trực tiếp.

## 📋 Yêu cầu

1. **Git repository** (GitHub, GitLab, Bitbucket, etc.)
2. **Code đã được push lên Git**
3. **EC2 đã setup SSH key** (hoặc dùng HTTPS với token)

## 🔧 Setup lần đầu (chỉ cần làm 1 lần)

### Cách 1: Sử dụng script tự động

```batch
deploy-git.bat https://github.com/username/repo.git main
```

### Cách 2: Setup thủ công trên EC2

```bash
# 1. Kết nối vào EC2
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9

# 2. Upload setup script
# (Từ máy Windows, đã được script tự động làm)

# 3. Chạy setup
chmod +x /tmp/setup-git-deploy.sh
bash /tmp/setup-git-deploy.sh https://github.com/username/repo.git main
```

## 🚀 Deploy updates (sau khi setup)

### Cách 1: Sử dụng script nhanh (Khuyến nghị)

```batch
deploy-git-quick.bat
```

Hoặc chỉ định branch:
```batch
deploy-git-quick.bat develop
```

### Cách 2: Chạy trực tiếp trên EC2

```bash
# Kết nối vào EC2
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9

# Deploy
bash /home/ubuntu/exe-project/deploy-from-git.sh
```

### Cách 3: Từ máy Windows (một lệnh)

```batch
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "bash /home/ubuntu/exe-project/deploy-from-git.sh"
```

## 📝 Quy trình làm việc

1. **Làm việc trên máy local:**
   ```bash
   # Code changes
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **Deploy lên EC2:**
   ```batch
   deploy-git-quick.bat
   ```

   Hoặc trên EC2:
   ```bash
   bash /home/ubuntu/exe-project/deploy-from-git.sh
   ```

## 🔐 Setup Git với Private Repository

### Option 1: SSH Key (Khuyến nghị)

1. **Tạo SSH key trên EC2:**
   ```bash
   ssh-keygen -t ed25519 -C "ec2-deploy" -f ~/.ssh/deploy_key
   ```

2. **Thêm public key vào Git provider:**
   ```bash
   cat ~/.ssh/deploy_key.pub
   # Copy và thêm vào GitHub/GitLab Settings > SSH Keys
   ```

3. **Cấu hình Git để dùng key này:**
   ```bash
   cd /home/ubuntu/exe-project
   git remote set-url origin git@github.com:username/repo.git
   ```

### Option 2: Personal Access Token (HTTPS)

1. **Tạo token trên Git provider** (GitHub: Settings > Developer settings > Personal access tokens)

2. **Clone với token:**
   ```bash
   git clone https://TOKEN@github.com/username/repo.git /home/ubuntu/exe-project
   ```

## ⚙️ Cấu hình nâng cao

### Deploy từ branch khác

```bash
bash /home/ubuntu/exe-project/deploy-from-git.sh develop
```

### Xem logs deployment

```bash
# PM2 logs
pm2 logs exe-project

# Git logs
cd /home/ubuntu/exe-project
git log --oneline -10
```

### Rollback về commit trước

```bash
cd /home/ubuntu/exe-project
git log --oneline  # Xem danh sách commits
git reset --hard <commit-hash>
npm install
npm run build
pm2 restart exe-project
```

## 🆚 So sánh với Upload File

| Tính năng | Upload File | Git Deploy |
|-----------|-------------|------------|
| **Tốc độ** | Chậm (5-15 phút) | Nhanh (1-3 phút) |
| **Kích thước** | ~100MB+ | Chỉ thay đổi |
| **Version control** | ❌ | ✅ |
| **Rollback** | ❌ | ✅ Dễ dàng |
| **Setup** | Đơn giản | Cần Git repo |
| **Network** | Upload toàn bộ | Chỉ sync thay đổi |

## 🐛 Troubleshooting

### Lỗi: "Permission denied (publickey)"

→ Cần setup SSH key hoặc dùng HTTPS với token

### Lỗi: "Repository not found"

→ Kiểm tra:
- Repository URL đúng chưa
- SSH key đã được thêm vào Git provider chưa
- Token có quyền truy cập repository không

### Lỗi: "Branch not found"

→ Kiểm tra branch name:
```bash
cd /home/ubuntu/exe-project
git branch -a  # Xem tất cả branches
```

## 📞 Tips

1. **Tạo alias cho deploy nhanh:**
   ```bash
   # Trên EC2
   echo 'alias deploy="bash /home/ubuntu/exe-project/deploy-from-git.sh"' >> ~/.bashrc
   source ~/.bashrc
   
   # Sau đó chỉ cần:
   deploy
   ```

2. **Auto-deploy với webhook:**
   - Setup GitHub/GitLab webhook
   - Tự động deploy khi có push

3. **Deploy staging/production:**
   - Tạo 2 scripts riêng cho staging và production
   - Deploy từ branches khác nhau

