import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { isAdmin } from '../controllers/auth.js';
import { 
    createMysteryBag, 
    getAllMysteryBags, 
    getMysteryBagById, 
    updateMysteryBag, 
    deleteMysteryBag,
    getPublicMysteryBags 
} from '../controllers/mysteryBag.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Cấu hình multer để upload ảnh sản phẩm
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/products/');
        cb(null, uploadPath); // Thư mục lưu ảnh sản phẩm
    },
    filename: (req, file, cb) => {
        // Tạo tên file unique với timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter để chỉ cho phép upload ảnh
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file ảnh!'), false);
    }
};

// Cấu hình multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    }
});

// Debug multer middleware
const debugMulter = (req, res, next) => {
    console.log('🔧 Multer Debug - Before:');
    console.log('  Body:', req.body);
    console.log('  File:', req.file);
    console.log('  Files:', req.files);
    next();
};

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ message: 'Mystery Bag API is working!', timestamp: new Date().toISOString() });
});

// Routes cho người dùng công khai (phải đặt trước middleware admin)
router.get('/public', getPublicMysteryBags);
router.get('/public/:id', getMysteryBagById);

// Debug middleware
router.use((req, res, next) => {
    console.log('🔍 Mystery Bag Route:', req.method, req.path);
    console.log('📝 Request Body:', req.body);
    console.log('📁 Request File:', req.file);
    console.log('🔑 Request Headers:', req.headers);
    next();
});

// Admin routes (yêu cầu đăng nhập và quyền admin)
router.use(isAdmin); // Áp dụng middleware kiểm tra admin cho tất cả routes bên dưới

// Routes cho admin với upload
router.post('/', upload.single('image'), debugMulter, createMysteryBag);
router.get('/admin', getAllMysteryBags);
router.get('/admin/:id', getMysteryBagById);
router.put('/admin/:id', upload.single('image'), debugMulter, updateMysteryBag);
router.delete('/admin/:id', deleteMysteryBag);

// Error handling middleware
router.use((error, req, res, next) => {
    console.error('❌ Mystery Bag Router Error:', error);
    res.status(500).json({ 
        errors: [error.message || 'Internal server error'],
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
});

export default router;
