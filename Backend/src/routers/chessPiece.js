import express from 'express';
import { isAdmin } from '../controllers/auth.js';
import upload3D, { handleUploadError } from '../middleware/upload3D.js';
import {
    createChessPiece,
    getChessPiecesByCollection,
    getChessPieceById,
    updateChessPiece,
    deleteChessPiece,
    getAllChessPieces
} from '../controllers/chessPiece.js';

const router = express.Router();

// Public routes (không cần đăng nhập) - phải đặt trước routes có parameter
router.get('/collection/:collectionId', getChessPiecesByCollection); // Lấy quân cờ của một collection

// Admin routes (yêu cầu đăng nhập và quyền admin)
router.use(isAdmin);

// Chess piece management - đặt routes cụ thể trước routes có parameter
router.post('/', upload3D.single('model3D'), handleUploadError, createChessPiece);
router.get('/', getAllChessPieces);
router.get('/:id', getChessPieceById);
router.put('/:id', upload3D.single('model3D'), handleUploadError, updateChessPiece);
router.delete('/:id', deleteChessPiece);

export default router;
