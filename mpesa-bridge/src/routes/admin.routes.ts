import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

// All admin routes require authentication AND admin role
router.use(authenticateToken);
router.use(adminMiddleware);

// User Management
router.get('/users', AdminController.getUsers);
router.put('/users/:id/ban', AdminController.banUser);
router.put('/users/:id/unban', AdminController.unbanUser);

// Analytics
router.get('/analytics', AdminController.getAnalytics);
router.get('/stats', AdminController.getStats);

// Transactions
router.get('/transactions', AdminController.getTransactions);

export default router;
