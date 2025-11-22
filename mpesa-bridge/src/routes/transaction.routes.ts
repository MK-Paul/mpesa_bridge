import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';

import { validateApiKey } from '../middleware/auth.middleware';
import { transactionLimiter } from '../middleware/rateLimiter.middleware';
import { validateTransactionInit, checkValidation } from '../middleware/validation.middleware';
import { sanitizePhoneNumber } from '../middleware/sanitize.middleware';

const router = Router();

router.post(
    '/initiate',
    transactionLimiter,
    validateApiKey,
    sanitizePhoneNumber,  // Sanitize BEFORE validation
    validateTransactionInit,
    checkValidation,
    TransactionController.initiate
);
router.get('/status/:id', TransactionController.getStatus);

export default router;
