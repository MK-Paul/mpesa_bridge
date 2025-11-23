"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const rateLimiter_middleware_1 = require("../middleware/rateLimiter.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const sanitize_middleware_1 = require("../middleware/sanitize.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const apiKey_middleware_1 = require("../middleware/apiKey.middleware");
const router = (0, express_1.Router)();
router.post('/initiate', rateLimiter_middleware_1.transactionLimiter, auth_middleware_1.authenticateToken, // Use JWT auth instead of API key
sanitize_middleware_1.sanitizePhoneNumber, // Sanitize BEFORE validation
validation_middleware_1.validateTransactionInit, validation_middleware_1.checkValidation, transaction_controller_1.TransactionController.initiate);
// Alias for /initiate - used by frontend test payment with API key
router.post('/stk-push', rateLimiter_middleware_1.transactionLimiter, apiKey_middleware_1.authenticateApiKey, // Use API key auth for public API
sanitize_middleware_1.sanitizePhoneNumber, validation_middleware_1.validateTransactionInit, validation_middleware_1.checkValidation, transaction_controller_1.TransactionController.initiate);
router.get('/status/:id', transaction_controller_1.TransactionController.getStatus);
exports.default = router;
