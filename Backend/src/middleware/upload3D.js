import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Cấu hình storage cho file 3D
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/models';
        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Tạo tên file unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter file 3D
const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.fbx', '.glb', '.gltf', '.dae'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file 3D với định dạng: FBX, GLB, GLTF, DAE!'), false);
    }
};

// Cấu hình multer
const upload3D = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50 MB
    }
});

// Middleware xử lý lỗi upload
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ 
            success: false, 
            message: `Lỗi upload file: ${err.message}` 
        });
    } else if (err) {
        return res.status(400).json({ 
            success: false, 
            message: err.message 
        });
    }
    next();
};

export default upload3D;
