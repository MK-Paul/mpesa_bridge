import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authenticateToken);

// Profile routes
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.put('/password', UserController.updatePassword);

// Project routes
router.get('/projects', UserController.getProjects);
router.put('/projects/:id/regenerate', UserController.regenerateKeys);

// Webhook route
router.put('/webhook', UserController.updateWebhook);

// Transaction routes
router.get('/transactions', UserController.getTransactions);

// Analytics route
router.get('/analytics', UserController.getAnalytics);

export default router;
