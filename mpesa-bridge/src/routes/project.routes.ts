import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';

import { projectCreationLimiter } from '../middleware/rateLimiter.middleware';
import { validateProjectCreation, checkValidation } from '../middleware/validation.middleware';

import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/', projectCreationLimiter, validateProjectCreation, checkValidation, ProjectController.create);
router.delete('/:id', ProjectController.delete);
router.put('/:id/regenerate', ProjectController.regenerateKeys);
router.put('/:id/webhook', ProjectController.updateWebhook);
router.put('/:id/mpesa-credentials', ProjectController.updateMpesaCredentials);

export default router;
