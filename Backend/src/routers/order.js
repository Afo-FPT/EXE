import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStatistics,
  deleteOrder
} from '../controllers/order.js';
import { isAuth, isAdmin } from '../controllers/auth.js';

const router = express.Router();

// Public routes
router.post('/', createOrder); // Create order (for checkout)

// Admin routes (require authentication and admin role)
router.use(isAuth); // All routes below require authentication
router.use(isAdmin); // All routes below require admin role

// Order management routes
router.get('/', getOrders); // Get all orders with pagination and filtering
router.get('/statistics', getOrderStatistics); // Get order statistics
router.get('/:id', getOrderById); // Get single order by ID
router.put('/:id/status', updateOrderStatus); // Update order status
router.put('/:id/payment', updatePaymentStatus); // Update payment status
router.delete('/:id', deleteOrder); // Delete order (soft delete)

export default router;
