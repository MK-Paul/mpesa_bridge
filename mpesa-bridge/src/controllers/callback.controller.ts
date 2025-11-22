import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { getIo } from '../config/socket';
import { emailService } from '../services/email.service';

export class CallbackController {

    static async handleMpesaCallback(req: Request, res: Response): Promise<void> {
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
            const transaction = await prisma.transaction.findUnique({
                where: { checkoutRequestId: CheckoutRequestID },
                include: {
                    project: {
                        include: { user: true }
                    }
                }
            });

            if (!transaction) {
                console.error(`Transaction not found for CheckoutRequestID: ${CheckoutRequestID}`);
                res.status(404).json({ message: 'Transaction not found' });
                return;
            }

            // 2. Determine Status
            let status: 'COMPLETED' | 'FAILED' = 'FAILED';
            let receipt = null;

            if (ResultCode === 0) {
                status = 'COMPLETED';
                // Extract Receipt Number (Item 1 usually holds the receipt)
                const receiptItem = CallbackMetadata?.Item.find((item: any) => item.Name === 'MpesaReceiptNumber');
                receipt = receiptItem?.Value || null;
            }

            // 3. Update Database
            const updatedTransaction = await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status,
                    mpesaReceipt: receipt,
                    failureReason: ResultCode !== 0 ? ResultDesc : null
                }
            });

            // 4. Emit Socket Events (Real-time update to web clients)
            const io = getIo();

            // Specific transaction event
            io.emit(`transaction:${transaction.id}`, {
                transactionId: transaction.id,
                status: updatedTransaction.status,
                mpesaReceipt: updatedTransaction.mpesaReceipt,
                amount: updatedTransaction.amount,
                updatedAt: updatedTransaction.updatedAt
            });

            // Generic transaction-updated event for dashboard
            io.emit('transaction-updated', {
                transactionId: transaction.id,
                status: updatedTransaction.status,
                mpesaReceipt: updatedTransaction.mpesaReceipt,
                amount: updatedTransaction.amount,
                phoneNumber: updatedTransaction.phoneNumber,
                updatedAt: updatedTransaction.updatedAt
            });

            // 5. Send Email Notification (if successful)
            if (status === 'COMPLETED' && transaction.project.user) {
                emailService.sendEmail({
                    to: transaction.project.user.email,
                    subject: 'Payment Received! 💰',
                    html: emailService.getTransactionSuccessTemplate(
                        updatedTransaction.amount,
                        updatedTransaction.mpesaReceipt || 'N/A',
                        updatedTransaction.phoneNumber
                    )
                });
            }

            console.log(`✅ Transaction ${transaction.id} updated to ${status} - WebSocket events emitted`);

            res.status(200).json({ message: 'Callback processed successfully' });

        } catch (error) {
            console.error('Callback Error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}
