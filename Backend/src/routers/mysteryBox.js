import express from 'express';
import { isAuth } from '../controllers/auth.js';
import {
  openMysteryBox,
  getUserInventory,
  getInventoryStats,
  toggleFavoriteItem,
  toggleEquipItem,
  getLeaderboard
} from '../controllers/mysteryBox.js';

const router = express.Router();

// Tất cả routes đều yêu cầu đăng nhập
router.use(isAuth);

// Đặt routes cụ thể trước routes có parameter
router.post('/open/:collectionId', openMysteryBox);
router.get('/inventory', getUserInventory);
router.get('/inventory/stats', getInventoryStats);
router.get('/leaderboard', getLeaderboard);
router.put('/inventory/items/:itemId/favorite', toggleFavoriteItem);
router.put('/inventory/items/:itemId/equip', toggleEquipItem);

export default router;
