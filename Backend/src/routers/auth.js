import express from 'express';
import {signup, signin, logout, isAdmin, getAllUsers, banUser, getDashboardStats, verifyToken, isAuth, googleLogin} from '../controllers/auth.js';
const router = express.Router();

// Đặt routes cụ thể trước routes có parameter
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google-login', googleLogin); // NOTE: Google OAuth endpoint
router.post('/logout', logout);
router.get('/verify-token', isAuth, verifyToken);
router.get('/users', isAdmin, getAllUsers);
router.get('/dashboard', isAdmin, getDashboardStats);
router.put('/users/:id/ban', isAdmin, banUser);

export default router; 