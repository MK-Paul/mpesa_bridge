import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';

import { projectCreationLimiter } from '../middleware/rateLimiter.middleware';
import { validateProjectCreation, checkValidation } from '../middleware/validation.middleware';

const router = Router();

router.post('/', projectCreationLimiter, validateProjectCreation, checkValidation, ProjectController.create);

export default router;
