import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export class UserController {
    /**
     * Get user profile
     * GET /api/v1/user/profile
     */
    static async getProfile(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            res.status(200).json({ user });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Update user profile
     * PUT /api/v1/user/profile
     */
    static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            const { name, email } = req.body;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            if (!name && !email) {
                res.status(400).json({ message: 'Name or email is required' });
                return;
            }

            const user = await prisma.user.update({
                where: { id: userId },
                data: {
                    ...(name && { name }),
                    ...(email && { email })
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    updatedAt: true
                }
            });

            res.status(200).json({ message: 'Profile updated successfully', user });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Update password
     * PUT /api/v1/user/password
     */
    static async updatePassword(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            const { currentPassword, newPassword } = req.body;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            if (!currentPassword || !newPassword) {
                res.status(400).json({ message: 'Current password and new password are required' });
                return;
            }

            if (newPassword.length < 6) {
                res.status(400).json({ message: 'New password must be at least 6 characters' });
                return;
            }

            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

            if (!isPasswordValid) {
                res.status(401).json({ message: 'Current password is incorrect' });
                return;
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword }
            });

            res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error('Update password error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Get user's projects
     * GET /api/v1/user/projects
     */
    static async getProjects(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const projects = await prisma.project.findMany({
                where: { userId },
                select: {
                    id: true,
                    name: true,
                    publicKey: true,
                    secretKey: true,
                    webhookUrl: true,
                    webhookSecret: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            res.status(200).json({ projects });
        } catch (error) {
            console.error('Get projects error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Regenerate API keys for a project
     * PUT /api/v1/user/projects/:id/regenerate
     */
    static async regenerateKeys(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            const projectId = req.params.id;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            // Verify project belongs to user
            const project = await prisma.project.findFirst({
                where: { id: projectId, userId }
            });

            if (!project) {
                res.status(404).json({ message: 'Project not found' });
                return;
            }

            // Generate new keys
            const publicKey = `pk_live_${crypto.randomBytes(12).toString('hex')}`;
            const secretKey = `sk_live_${crypto.randomBytes(24).toString('hex')}`;

            const updatedProject = await prisma.project.update({
                where: { id: projectId },
                data: { publicKey, secretKey },
                select: {
                    id: true,
                    name: true,
                    publicKey: true,
                    secretKey: true,
                    updatedAt: true
                }
            });

            res.status(200).json({
                message: 'API keys regenerated successfully',
                project: updatedProject
            });
        } catch (error) {
            console.error('Regenerate keys error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Update webhook configuration
     * PUT /api/v1/user/webhook
     */
    static async updateWebhook(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            const { webhookUrl, webhookSecret } = req.body;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            // Get user's first project (for now, assuming one project per user)
            const project = await prisma.project.findFirst({
                where: { userId }
            });

            if (!project) {
                res.status(404).json({ message: 'No project found' });
                return;
            }

            const updatedProject = await prisma.project.update({
                where: { id: project.id },
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
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Get user's transactions with filters
     * GET /api/v1/user/transactions?status=&search=&limit=
     */
    static async getTransactions(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            const { status, search, limit } = req.query;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            // Get user's projects
            const projects = await prisma.project.findMany({
                where: { userId },
                select: { id: true }
            });

            const projectIds = projects.map(p => p.id);

            if (projectIds.length === 0) {
                res.status(200).json({ transactions: [] });
                return;
            }

            // Build filter
            const where: any = {
                projectId: { in: projectIds }
            };

            if (status && status !== 'All') {
                where.status = status as string;
            }

            if (search) {
                where.OR = [
                    { id: { contains: search as string } },
                    { phoneNumber: { contains: search as string } },
                    { mpesaReceipt: { contains: search as string } }
                ];
            }

            const transactions = await prisma.transaction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit ? parseInt(limit as string) : undefined,
                select: {
                    id: true,
                    amount: true,
                    phoneNumber: true,
                    status: true,
                    mpesaReceipt: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            res.status(200).json({ transactions });
        } catch (error) {
            console.error('Get transactions error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Get analytics/stats
     * GET /api/v1/user/analytics
     */
    static async getAnalytics(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;

            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            // Get user's projects
            const projects = await prisma.project.findMany({
                where: { userId },
                select: { id: true }
            });

            const projectIds = projects.map(p => p.id);

            if (projectIds.length === 0) {
                res.status(200).json({
                    analytics: {
                        totalRevenue: 0,
                        totalTransactions: 0,
                        completedTransactions: 0,
                        successRate: 0,
                        growth: 0
                    }
                });
                return;
            }

            // Get all transactions
            const transactions = await prisma.transaction.findMany({
                where: { projectId: { in: projectIds } },
                select: {
                    amount: true,
                    status: true,
                    createdAt: true
                }
            });

            const completedTransactions = transactions.filter(t => t.status === 'COMPLETED');
            const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
            const successRate = transactions.length > 0
                ? (completedTransactions.length / transactions.length) * 100
                : 0;

            // Calculate growth (compared to last month - simplified)
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            const lastMonthTransactions = transactions.filter(t => new Date(t.createdAt) < lastMonth);
            const thisMonthTransactions = transactions.filter(t => new Date(t.createdAt) >= lastMonth);

            const growth = lastMonthTransactions.length > 0
                ? ((thisMonthTransactions.length - lastMonthTransactions.length) / lastMonthTransactions.length) * 100
                : 0;

            res.status(200).json({
                analytics: {
                    totalRevenue,
                    totalTransactions: transactions.length,
                    completedTransactions: completedTransactions.length,
                    successRate: Math.round(successRate * 10) / 10,
                    growth: Math.round(growth * 10) / 10
                }
            });
        } catch (error) {
            console.error('Get analytics error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
