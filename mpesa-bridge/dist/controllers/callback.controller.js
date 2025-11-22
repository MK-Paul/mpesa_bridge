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
exports.CallbackController = void 0;
const prisma_1 = require("../config/prisma");
const socket_1 = require("../config/socket");
class CallbackController {
    static handleMpesaCallback(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { Body } = req.body;
                if (!Body || !Body.stkCallback) {
                    console.error('Invalid Callback Payload:', req.body);
                    res.status(400).json({ message: 'Invalid Payload' });
                    return;
                }
                const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;
                console.log(`🔔 Callback Received: ${ResultCode} - ${ResultDesc}`);
                // 1. Find the transaction
                const transaction = yield prisma_1.prisma.transaction.findUnique({
                    where: { checkoutRequestId: CheckoutRequestID }
                });
                if (!transaction) {
                    console.error(`Transaction not found for CheckoutRequestID: ${CheckoutRequestID}`);
                    res.status(404).json({ message: 'Transaction not found' });
                    return;
                }
                // 2. Determine Status
                let status = 'FAILED';
                let receipt = null;
                if (ResultCode === 0) {
                    status = 'COMPLETED';
                    // Extract Receipt Number (Item 1 usually holds the receipt)
                    const receiptItem = CallbackMetadata === null || CallbackMetadata === void 0 ? void 0 : CallbackMetadata.Item.find((item) => item.Name === 'MpesaReceiptNumber');
                    receipt = (receiptItem === null || receiptItem === void 0 ? void 0 : receiptItem.Value) || null;
                }
                // 3. Update Database
                const updatedTransaction = yield prisma_1.prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        status,
                        mpesaReceipt: receipt,
                        failureReason: ResultCode !== 0 ? ResultDesc : null
                    }
                });
                // 4. Emit Socket Event (Real-time update to web clients)
                const io = (0, socket_1.getIo)();
                io.emit(`transaction:${transaction.id}`, {
                    transactionId: transaction.id,
                    status: updatedTransaction.status,
                    mpesaReceipt: updatedTransaction.mpesaReceipt,
                    amount: updatedTransaction.amount,
                    updatedAt: updatedTransaction.updatedAt
                });
                console.log(`✅ Transaction ${transaction.id} updated to ${status} - WebSocket event emitted`);
                res.status(200).json({ message: 'Callback processed successfully' });
            }
            catch (error) {
                console.error('Callback Error:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
}
exports.CallbackController = CallbackController;
