import { Response } from 'express';
import { prisma } from '../config/prisma';
import crypto from 'crypto';
import { encrypt } from '../utils/encryption';
import { AuthRequest } from '../middleware/auth.middleware';

export class ProjectController {

    static async create(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { name, callbackUrl } = req.body;
            const userId = req.userId;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            if (!name) {
                res.status(400).json({ error: 'Project name is required' });
                return;
            }

            // Generate Keys
            const publicKey = `pk_live_${crypto.randomBytes(12).toString('hex')}`;
            const secretKey = `sk_live_${crypto.randomBytes(24).toString('hex')}`;
            const testPublicKey = `pk_test_${crypto.randomBytes(12).toString('hex')}`;
            const testSecretKey = `sk_test_${crypto.randomBytes(24).toString('hex')}`;

            const project = await prisma.project.create({
                data: {
                    name,
                    publicKey,
                    secretKey,
                    testPublicKey,
                    testSecretKey,
                    callbackUrl,
                    userId
                }
            });

            res.status(201).json({
                message: 'Project created successfully',
                project
            });

        } catch (error) {
            console.error('Project Create Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async delete(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.userId;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            // Verify ownership
            const project = await prisma.project.findFirst({
                where: { id, userId }
            });

            if (!project) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }

            await prisma.project.delete({
                where: { id }
            });

            res.status(200).json({ message: 'Project deleted successfully' });

        } catch (error) {
            console.error('Project Delete Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Regenerate API keys for a project
     * PUT /api/v1/projects/:id/regenerate
     */
    static async regenerateKeys(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            const { id } = req.params;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            // Verify project belongs to user
            const project = await prisma.project.findFirst({
                where: { id, userId }
            });

            if (!project) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }

            // Generate new keys
            const publicKey = `pk_live_${crypto.randomBytes(12).toString('hex')}`;
            const secretKey = `sk_live_${crypto.randomBytes(24).toString('hex')}`;
            const testPublicKey = `pk_test_${crypto.randomBytes(12).toString('hex')}`;
            const testSecretKey = `sk_test_${crypto.randomBytes(24).toString('hex')}`;

            const updatedProject = await prisma.project.update({
                where: { id },
                data: {
                    publicKey,
                    secretKey,
                    testPublicKey,
                    testSecretKey
                },
                select: {
                    id: true,
                    name: true,
                    publicKey: true,
                    secretKey: true,
                    testPublicKey: true,
                    testSecretKey: true,
                    updatedAt: true
                }
            });

            res.status(200).json({
                message: 'API keys regenerated successfully',
                project: updatedProject
            });
        } catch (error) {
            console.error('Regenerate keys error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Update webhook configuration
     * PUT /api/v1/projects/:id/webhook
     */
    static async updateWebhook(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const { webhookUrl, webhookSecret } = req.body;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            // Verify project belongs to user
            const project = await prisma.project.findFirst({
                where: { id, userId }
            });

            if (!project) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }

            const updatedProject = await prisma.project.update({
                where: { id },
                data: {
                    webhookUrl: webhookUrl || null,
                    webhookSecret: webhookSecret || null
                },
                select: {
                    webhookUrl: true,
                    webhookSecret: true,
                    updatedAt: true
                }
            });

            res.status(200).json({
                message: 'Webhook configuration updated successfully',
                webhook: updatedProject
            });
        } catch (error) {
            console.error('Update webhook error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    /**
     * Update M-Pesa credentials
     * PUT /api/v1/projects/:id/mpesa-credentials
     */
    static async updateMpesaCredentials(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const { shortCode, consumerKey, consumerSecret, passkey } = req.body;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            // Verify project belongs to user
            const project = await prisma.project.findFirst({
                where: { id, userId }
            });

            if (!project) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }

            // Encrypt secrets if provided
            const encryptedConsumerKey = consumerKey ? encrypt(consumerKey) : undefined;
            const encryptedConsumerSecret = consumerSecret ? encrypt(consumerSecret) : undefined;
            const encryptedPasskey = passkey ? encrypt(passkey) : undefined;

            // Prepare update data
            const updateData: any = {};
            if (shortCode !== undefined) updateData.shortCode = shortCode || null;
            if (encryptedConsumerKey !== undefined) updateData.consumerKey = encryptedConsumerKey || null;
            if (encryptedConsumerSecret !== undefined) updateData.consumerSecret = encryptedConsumerSecret || null;
            if (encryptedPasskey !== undefined) updateData.passkey = encryptedPasskey || null;

            await prisma.project.update({
                where: { id },
                data: updateData
            });

            res.status(200).json({
                message: 'M-Pesa credentials updated successfully'
            });
        } catch (error) {
            console.error('Update M-Pesa credentials error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
