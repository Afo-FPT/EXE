import express from 'express';
import { forgotPassword, resetPassword, verifyResetToken, getResetTokens } from '../controllers/passwordReset.js';

const router = express.Router();

// Public routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-token/:token', verifyResetToken);

// Debug route (remove in production)
router.get('/debug/tokens', getResetTokens);

export default router;

