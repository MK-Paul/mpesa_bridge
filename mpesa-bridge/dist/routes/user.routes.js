"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes are protected
router.use(auth_middleware_1.authenticateToken);
// Profile routes
router.get('/profile', user_controller_1.UserController.getProfile);
router.put('/profile', user_controller_1.UserController.updateProfile);
router.put('/password', user_controller_1.UserController.updatePassword);
// Project routes
router.get('/projects', user_controller_1.UserController.getProjects);
// Webhook route
// Transaction routes
router.get('/transactions', user_controller_1.UserController.getTransactions);
// Analytics route
router.get('/analytics', user_controller_1.UserController.getAnalytics);
router.get('/api-usage', user_controller_1.UserController.getApiUsage);
exports.default = router;
