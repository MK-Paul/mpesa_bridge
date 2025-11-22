import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';

import { transactionLimiter } from '../middleware/rateLimiter.middleware';
import { validateTransactionInit, checkValidation } from '../middleware/validation.middleware';
import { sanitizePhoneNumber } from '../middleware/sanitize.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { authenticateApiKey } from '../middleware/apiKey.middleware';

const router = Router();

router.post(
    '/initiate',
    transactionLimiter,
    authenticateToken,  // Use JWT auth instead of API key
    sanitizePhoneNumber,  // Sanitize BEFORE validation
    validateTransactionInit,
    checkValidation,
    TransactionController.initiate
);

// Alias for /initiate - used by frontend test payment with API key
router.post(
    '/stk-push',
    transactionLimiter,
    authenticateApiKey,  // Use API key auth for public API
    sanitizePhoneNumber,
    validateTransactionInit,
    checkValidation,
    TransactionController.initiate
);

router.get('/status/:id', TransactionController.getStatus);

export default router;
