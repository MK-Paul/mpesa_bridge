import { Router } from 'express';
import { PaymentLinkController } from '../controllers/paymentLink.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/public/:slug', PaymentLinkController.getPublicLink);
router.post('/public/:slug/pay', PaymentLinkController.processPayment);

// Protected routes
router.post('/', authenticateToken, PaymentLinkController.createLink);
router.get('/project/:projectId', authenticateToken, PaymentLinkController.getLinks);

export default router;
