import { Request, Response } from 'express';
import { MpesaService } from '../services/mpesa.service';
import { prisma } from '../config/prisma';
import axios from 'axios';
import crypto from 'crypto';

export class TransactionController {

    static async initiate(req: Request, res: Response): Promise<void> {
        try {
            const { phoneNumber, amount, description } = req.body;
            const project = (req as any).project;
            const apiKey = (req as any).apiKey; // Middleware should attach this

            // 1. Basic Validation
            if (!phoneNumber || !amount) {
                res.status(400).json({ error: 'Missing required fields: phoneNumber, amount' });
                return;
            }

            // Check Environment
            const isSandbox = project.testPublicKey === apiKey;
            const environment = isSandbox ? 'SANDBOX' : 'LIVE';

            // 2. Create Transaction Record (PENDING)
            const transaction = await prisma.transaction.create({
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
                const mockCheckoutRequestID = `ws_CO_DMZ_${crypto.randomBytes(8).toString('hex')}`;

                // Update transaction immediately
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        checkoutRequestId: mockCheckoutRequestID,
                        merchantRequestId: `mock_${crypto.randomBytes(4).toString('hex')}`
                    }
                });

                // Simulate Callback (Async)
                // Determine success/failure based on amount (e.g., amount ending in 1 fails)
                const shouldFail = amount.toString().endsWith('1');
                const status = shouldFail ? 'FAILED' : 'COMPLETED';
                const failureReason = shouldFail ? 'Simulated Failure: Insufficient Funds' : null;
                const mpesaReceipt = shouldFail ? null : `SB${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

                setTimeout(async () => {
                    try {
                        // Update local transaction
                        await prisma.transaction.update({
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
                                signature = crypto
                                    .createHmac('sha256', project.webhookSecret)
                                    .update(JSON.stringify(payload))
                                    .digest('hex');
                            }

                            await axios.post(project.webhookUrl, payload, {
                                headers: {
                                    'X-Mpesa-Signature': signature
                                }
                            });
                        }
                    } catch (err) {
                        console.error('Sandbox Callback Error:', err);
                    }
                }, 2000); // 2 second delay to simulate network

                res.status(200).json({
                    status: 'PENDING',
                    message: 'STK Push sent successfully (Sandbox)',
                    transactionId: transaction.id,
                    providerData: {
                        MerchantRequestID: `mock_${crypto.randomBytes(4).toString('hex')}`,
                        CheckoutRequestID: mockCheckoutRequestID,
                        ResponseCode: "0",
                        ResponseDescription: "Success. Request accepted for processing",
                        CustomerMessage: "Success. Request accepted for processing"
                    }
                });
                return;
            }

            // 4. Handle Live Mode (Real M-Pesa)
            const mpesaResponse = await MpesaService.sendSTKPush(phoneNumber, amount, description || 'Order');

            // Update Transaction with Safaricom IDs
            await prisma.transaction.update({
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
                environment: transaction.environment,
                createdAt: transaction.createdAt,
                updatedAt: transaction.updatedAt
            });

        } catch (error: any) {
            console.error('Transaction Status Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
