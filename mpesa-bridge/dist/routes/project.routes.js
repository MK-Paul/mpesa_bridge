"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const rateLimiter_middleware_1 = require("../middleware/rateLimiter.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
router.post('/', rateLimiter_middleware_1.projectCreationLimiter, validation_middleware_1.validateProjectCreation, validation_middleware_1.checkValidation, project_controller_1.ProjectController.create);
exports.default = router;
