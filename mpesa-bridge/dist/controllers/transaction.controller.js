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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const mpesa_service_1 = require("../services/mpesa.service");
const prisma_1 = require("../config/prisma");
class TransactionController {
    static initiate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { phone, amount, reference } = req.body;
                const project = req.project;
                // 1. Basic Validation
                if (!phone || !amount) {
                    res.status(400).json({ error: 'Missing required fields: phone, amount' });
                    return;
                }
                // 2. Create Transaction Record (PENDING)
                const transaction = yield prisma_1.prisma.transaction.create({
                    data: {
                        projectId: project.id,
                        amount,
                        phoneNumber: phone,
                        status: 'PENDING',
                        source: 'DIRECT_API',
                        metadata: JSON.stringify({ reference })
                    }
                });
                // 3. Trigger M-Pesa STK Push
                const mpesaResponse = yield mpesa_service_1.MpesaService.sendSTKPush(phone, amount, reference || 'Order');
                // 4. Update Transaction with Safaricom IDs
                yield prisma_1.prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        checkoutRequestId: mpesaResponse.CheckoutRequestID,
                        merchantRequestId: mpesaResponse.MerchantRequestID
                    }
                });
                // 5. Respond to Client
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
