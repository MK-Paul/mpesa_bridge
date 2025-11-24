```typescript
import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { MpesaService } from '../services/mpesa.service';
import { encrypt, decrypt } from '../utils/encryption';

interface AuthRequest extends Request {
    userId?: string;
}

export class PaymentLinkController {
    // Create a new payment link
    static async createLink(req: Request, res: Response) {
        try {
            const { projectId, title, description, amount, slug } = req.body;
            const userId = (req as AuthRequest).userId;

            // Verify project ownership
            const project = await (prisma as any).project.findFirst({
                where: { id: projectId, userId }
            });

            if (!project) {
                return res.status(404).json({ success: false, message: 'Project not found' });
            }

            // Check if slug exists
            const existingLink = await (prisma as any).paymentLink.findUnique({
                where: { slug }
            });

            if (existingLink) {
                return res.status(400).json({ success: false, message: 'Slug already taken' });
            }

            const link = await (prisma as any).paymentLink.create({
                data: {
                    projectId,
                    title,
                    description,
                    amount: parseFloat(amount),
                    slug
                }
            });

            res.status(201).json({ success: true, data: link });
        } catch (error: any) {
            console.error('Create link error:', error);
            res.status(500).json({ success: false, message: 'Failed to create link' });
        }
    }

    // Get all links for a project
    static async getLinks(req: Request, res: Response) {
        try {
            const { projectId } = req.params;
            const userId = (req as AuthRequest).userId;

            const project = await (prisma as any).project.findFirst({
                where: { id: projectId, userId }
            });

            if (!project) {
                return res.status(404).json({ success: false, message: 'Project not found' });
            }

            const links = await (prisma as any).paymentLink.findMany({
                where: { projectId },
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { transactions: true }
                    }
                }
            });

            res.json({ success: true, data: links });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Failed to fetch links' });
        }
    }

    // Get public link details
    static async getPublicLink(req: Request, res: Response) {
        try {
            const { slug } = req.params;

            const link = await (prisma as any).paymentLink.findUnique({
                where: { slug },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    amount: true,
                    currency: true,
                    isActive: true,
                    project: {
                        select: {
                            name: true,
                            consumerKey: true,
                            consumerSecret: true,
                            passkey: true,
                            shortCode: true
                        }
                    }
                }
            });

            if (!link || !link.isActive) {
                return res.status(404).json({ success: false, message: 'Link not found or inactive' });
            }

            // Remove secrets before sending response
            const { project, ...safeLink } = link;
            const safeResponse = {
                ...safeLink,
                project: {
                    name: project.name
                }
            };

            res.json({ success: true, data: safeResponse });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Failed to fetch link' });
        }
    }

    // Process payment for a link
    static async processPayment(req: Request, res: Response) {
        try {
            const { slug } = req.params;
            const { phoneNumber } = req.body;

            const link = await (prisma as any).paymentLink.findUnique({
                where: { slug },
                include: { project: true }
            });

            if (!link || !link.isActive) {
                return res.status(404).json({ success: false, message: 'Link not found' });
            }

            // Get credentials directly
            const project = link.project;
            if (!project.consumerKey || !project.consumerSecret || !project.passkey) {
                 return res.status(400).json({ success: false, message: 'Merchant credentials not configured' });
            }

            const consumerKey = decrypt(project.consumerKey);
            const consumerSecret = decrypt(project.consumerSecret);
            const passkey = decrypt(project.passkey);

            // Initiate STK Push
            const result = await MpesaService.sendSTKPush(
                phoneNumber,
                link.amount,
                link.slug,
                {
                    consumerKey,
                    consumerSecret,
                    passkey,
                    shortCode: project.shortCode || '174379'
                }
            );

            // Save transaction
            await (prisma as any).transaction.create({
                data: {
                    projectId: link.projectId,
                    paymentLinkId: link.id,
                    merchantRequestId: result.MerchantRequestID,
                    checkoutRequestId: result.CheckoutRequestID,
                    amount: link.amount,
                    phoneNumber,
                    reference: link.slug,
                    description: `Payment for ${ link.title }`,
                    status: 'PENDING'
                }
            });

            res.json({ 
                success: true, 
                message: 'Payment initiated',
                data: {
                    checkoutRequestId: result.CheckoutRequestID
                }
            });

        } catch (error: any) {
            console.error('Link payment error:', error);
            res.status(500).json({ success: false, message: error.message || 'Payment failed' });
        }
    }
}
```
