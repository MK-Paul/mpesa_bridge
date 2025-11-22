import { Router } from 'express';
import { CallbackController } from '../controllers/callback.controller';

import { whitelistSafaricomIPs } from '../middleware/webhook.middleware';

const router = Router();

// Only allow Safaricom IPs to access callback endpoint
router.post('/mpesa', whitelistSafaricomIPs, CallbackController.handleMpesaCallback);

export default router;
