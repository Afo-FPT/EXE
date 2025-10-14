import express from 'express';
import { getCollectionByIdPublic } from '../controllers/collection.js';

const router = express.Router();

// Public routes (không cần đăng nhập)
router.get('/:id', getCollectionByIdPublic); // Lấy collection detail cho frontend (public)

export default router;
