"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
// All admin routes require authentication AND admin role
router.use(auth_middleware_1.authenticateToken);
router.use(admin_middleware_1.adminMiddleware);
// User Management
router.get('/users', admin_controller_1.AdminController.getUsers);
router.put('/users/:id/ban', admin_controller_1.AdminController.banUser);
router.put('/users/:id/unban', admin_controller_1.AdminController.unbanUser);
// Analytics
router.get('/analytics', admin_controller_1.AdminController.getAnalytics);
router.get('/stats', admin_controller_1.AdminController.getStats);
// Transactions
router.get('/transactions', admin_controller_1.AdminController.getTransactions);
exports.default = router;
