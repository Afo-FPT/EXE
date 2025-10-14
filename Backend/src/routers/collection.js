import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { isAdmin } from '../controllers/auth.js';
import {
    createCollection,
    getAllCollections,
    getCollectionById,
    getCollectionByIdPublic,
    updateCollection,
    deleteCollection,
    getActiveCollections
} from '../controllers/collection.js';

const router = express.Router();

// Cấu hình multer để upload ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/collections/');
        cb(null, uploadPath); // Thư mục lưu ảnh collection
    },
    filename: (req, file, cb) => {
        // Tạo tên file unique với timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'collection-' + uniqueSuffix + path.extname(file.originalname));
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

// Public routes (không cần đăng nhập) - phải đặt trước routes có parameter
router.get('/active', getActiveCollections); // Lấy collection active cho frontend
router.get('/public', getActiveCollections); // Lấy collection active cho frontend (alias)
router.get('/public/:id', getCollectionByIdPublic); // Lấy collection detail cho frontend (public)

// Admin routes (yêu cầu đăng nhập và quyền admin)
router.use(isAdmin); // Áp dụng middleware kiểm tra admin cho tất cả routes bên dưới

// Collection management - đặt routes cụ thể trước routes có parameter
router.post('/', upload.single('coverImage'), createCollection);
router.get('/', getAllCollections);
router.get('/:id', getCollectionById); // Admin route
router.put('/:id', upload.single('coverImage'), updateCollection);
router.delete('/:id', deleteCollection);

export default router;
