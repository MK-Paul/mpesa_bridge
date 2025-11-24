import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All analytics routes require authentication
router.use(authenticateToken);

// Analytics endpoints
router.get('/overview', AnalyticsController.getOverview);
router.get('/time-series', AnalyticsController.getTimeSeries);
router.get('/status-breakdown', AnalyticsController.getStatusBreakdown);
router.get('/payment-links-performance', AnalyticsController.getPaymentLinksPerformance);

export default router;
