import { Request, Response } from 'express';
import { MpesaService } from '../services/mpesa.service';
import { prisma } from '../config/prisma';

export class TransactionController {

    static async initiate(req: Request, res: Response): Promise<void> {
        try {
            const { phone, amount, reference } = req.body;
            const project = (req as any).project;

            // 1. Basic Validation
            if (!phone || !amount) {
                res.status(400).json({ error: 'Missing required fields: phone, amount' });
                return;
            }

            // 2. Create Transaction Record (PENDING)
            const transaction = await prisma.transaction.create({
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
            const mpesaResponse = await MpesaService.sendSTKPush(phone, amount, reference || 'Order');

            // 4. Update Transaction with Safaricom IDs
            await prisma.transaction.update({
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

        } catch (error: any) {
            console.error('Transaction Init Error:', error);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    }

    static async getStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const transaction = await prisma.transaction.findUnique({
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

        } catch (error: any) {
            console.error('Transaction Status Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
