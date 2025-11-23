"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const mpesa_service_1 = require("../services/mpesa.service");
const prisma_1 = require("../config/prisma");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const encryption_1 = require("../utils/encryption");
class TransactionController {
    static initiate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { phoneNumber, amount, description } = req.body;
                const project = req.project;
                const apiKey = req.apiKey; // Middleware should attach this
                // 1. Basic Validation
                if (!phoneNumber || !amount) {
                    res.status(400).json({ error: 'Missing required fields: phoneNumber, amount' });
                    return;
                }
                // Check Environment
                const isSandbox = project.testPublicKey === apiKey;
                const environment = isSandbox ? 'SANDBOX' : 'LIVE';
                // 2. Create Transaction Record (PENDING)
                const transaction = yield prisma_1.prisma.transaction.create({
                    data: {
                        projectId: project.id,
                        amount,
                        phoneNumber: phoneNumber,
                        status: 'PENDING',
                        environment,
                        source: 'DIRECT_API',
                        metadata: JSON.stringify({ description })
                    }
                });
                // 3. Handle Sandbox Mode
                if (isSandbox) {
                    // Simulate M-Pesa Response
                    const mockCheckoutRequestID = `ws_CO_DMZ_${crypto_1.default.randomBytes(8).toString('hex')}`;
                    // Update transaction immediately
                    yield prisma_1.prisma.transaction.update({
                        where: { id: transaction.id },
                        data: {
                            checkoutRequestId: mockCheckoutRequestID,
                            merchantRequestId: `mock_${crypto_1.default.randomBytes(4).toString('hex')}`
                        }
                    });
                    // Simulate Callback (Async)
                    // Determine success/failure based on amount
                    // Ends in 1 -> FAILED (Insufficient Funds)
                    // Ends in 2 -> CANCELLED (User Cancelled)
                    // Else -> COMPLETED
                    const amountStr = amount.toString();
                    let status = 'COMPLETED';
                    let failureReason = null;
                    let mpesaReceipt = `SB${crypto_1.default.randomBytes(8).toString('hex').toUpperCase()}`;
                    if (amountStr.endsWith('1')) {
                        status = 'FAILED';
                        failureReason = 'Simulated Failure: Insufficient Funds';
                        mpesaReceipt = null;
                    }
                    else if (amountStr.endsWith('2')) {
                        status = 'CANCELLED';
                        failureReason = 'Simulated: Request Cancelled by User';
                        mpesaReceipt = null;
                    }
                    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        try {
                            // Update local transaction
                            yield prisma_1.prisma.transaction.update({
                                where: { id: transaction.id },
                                data: {
                                    status,
                                    failureReason,
                                    mpesaReceipt
                                }
                            });
                            // Send callback to user's URL if exists
                            if (project.webhookUrl) {
                                const payload = {
                                    transactionId: transaction.id,
                                    status,
                                    amount,
                                    phoneNumber: phoneNumber,
                                    mpesaReceipt,
                                    failureReason,
                                    timestamp: new Date().toISOString(),
                                    environment: 'SANDBOX'
                                };
                                // Calculate signature if secret exists
                                let signature = null;
                                if (project.webhookSecret) {
                                    signature = crypto_1.default
                                        .createHmac('sha256', project.webhookSecret)
                                        .update(JSON.stringify(payload))
                                        .digest('hex');
                                }
                                yield axios_1.default.post(project.webhookUrl, payload, {
                                    headers: {
                                        'X-Mpesa-Signature': signature
                                    }
                                });
                            }
                        }
                        catch (err) {
                            console.error('Sandbox Callback Error:', err);
                        }
                    }), 2000); // 2 second delay to simulate network
                    res.status(200).json({
                        status: 'PENDING',
                        message: 'STK Push sent successfully (Sandbox)',
                        transactionId: transaction.id,
                        providerData: {
                            MerchantRequestID: `mock_${crypto_1.default.randomBytes(4).toString('hex')}`,
                            CheckoutRequestID: mockCheckoutRequestID,
                            ResponseCode: "0",
                            ResponseDescription: "Success. Request accepted for processing",
                            CustomerMessage: "Success. Request accepted for processing"
                        }
                    });
                    return;
                }
                // 4. Handle Live Mode (Real M-Pesa)
                // Prepare credentials
                let mpesaCreds = undefined;
                if (project.consumerKey && project.consumerSecret && project.passkey && project.shortCode) {
                    try {
                        mpesaCreds = {
                            consumerKey: (0, encryption_1.decrypt)(project.consumerKey),
                            consumerSecret: (0, encryption_1.decrypt)(project.consumerSecret),
                            passkey: (0, encryption_1.decrypt)(project.passkey),
                            shortCode: project.shortCode
                        };
                    }
                    catch (err) {
                        console.error('Failed to decrypt M-Pesa credentials:', err);
                        // Fallback to env vars will happen in service if undefined
                    }
                }
                const mpesaResponse = yield mpesa_service_1.MpesaService.sendSTKPush(phoneNumber, amount, description || 'Order', mpesaCreds);
                // Update Transaction with Safaricom IDs
                yield prisma_1.prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        checkoutRequestId: mpesaResponse.CheckoutRequestID,
                        merchantRequestId: mpesaResponse.MerchantRequestID
                    }
                });
                // Respond to Client
                res.status(200).json({
                    status: 'PENDING',
                    message: 'STK Push sent successfully',
                    transactionId: transaction.id,
                    providerData: mpesaResponse
                });
            }
            catch (error) {
                console.error('Transaction Init Error:', error);
                res.status(500).json({ error: error.message || 'Internal Server Error' });
            }
        });
    }
    static getStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const transaction = yield prisma_1.prisma.transaction.findUnique({
                    where: { id }
                });
                if (!transaction) {
                    res.status(404).json({ error: 'Transaction not found' });
                    return;
                }
                res.status(200).json({
                    id: transaction.id,
                    status: transaction.status,
                    amount: transaction.amount,
                    phoneNumber: transaction.phoneNumber,
                    mpesaReceipt: transaction.mpesaReceipt,
                    failureReason: transaction.failureReason,
                    environment: transaction.environment,
                    createdAt: transaction.createdAt,
                    updatedAt: transaction.updatedAt
                });
            }
            catch (error) {
                console.error('Transaction Status Error:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
}
exports.TransactionController = TransactionController;
