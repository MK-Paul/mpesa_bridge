"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const callback_controller_1 = require("../controllers/callback.controller");
const webhook_middleware_1 = require("../middleware/webhook.middleware");
const router = (0, express_1.Router)();
// Only allow Safaricom IPs to access callback endpoint
router.post('/mpesa', webhook_middleware_1.whitelistSafaricomIPs, callback_controller_1.CallbackController.handleMpesaCallback);
exports.default = router;
