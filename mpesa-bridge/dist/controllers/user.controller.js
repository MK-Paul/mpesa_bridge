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
exports.UserController = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
class UserController {
    /**
     * Get user profile
     * GET /api/v1/user/profile
     */
    static getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const user = yield prisma.user.findUnique({
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
            }
            catch (error) {
                console.error('Get profile error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    /**
     * Update user profile
     * PUT /api/v1/user/profile
     */
    static updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const user = yield prisma.user.update({
                    where: { id: userId },
                    data: Object.assign(Object.assign({}, (name && { name })), (email && { email })),
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        updatedAt: true
                    }
                });
                res.status(200).json({ message: 'Profile updated successfully', user });
            }
            catch (error) {
                console.error('Update profile error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    /**
     * Update password
     * PUT /api/v1/user/password
     */
    static updatePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const user = yield prisma.user.findUnique({
                    where: { id: userId }
                });
                if (!user) {
                    res.status(404).json({ message: 'User not found' });
                    return;
                }
                const isPasswordValid = yield bcrypt_1.default.compare(currentPassword, user.password);
                if (!isPasswordValid) {
                    res.status(401).json({ message: 'Current password is incorrect' });
                    return;
                }
                const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
                yield prisma.user.update({
                    where: { id: userId },
                    data: { password: hashedPassword }
                });
                res.status(200).json({ message: 'Password updated successfully' });
            }
            catch (error) {
                console.error('Update password error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    /**
     * Get user's projects
     * GET /api/v1/user/projects
     */
    static getProjects(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const projects = yield prisma.project.findMany({
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
            }
            catch (error) {
                console.error('Get projects error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    /**
     * Regenerate API keys for a project
     * PUT /api/v1/user/projects/:id/regenerate
     */
    static regenerateKeys(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                const projectId = req.params.id;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                // Verify project belongs to user
                const project = yield prisma.project.findFirst({
                    where: { id: projectId, userId }
                });
                if (!project) {
                    res.status(404).json({ message: 'Project not found' });
                    return;
                }
                // Generate new keys
                const publicKey = `pk_live_${crypto_1.default.randomBytes(12).toString('hex')}`;
                const secretKey = `sk_live_${crypto_1.default.randomBytes(24).toString('hex')}`;
                const updatedProject = yield prisma.project.update({
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
            }
            catch (error) {
                console.error('Regenerate keys error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    /**
     * Update webhook configuration
     * PUT /api/v1/user/webhook
     */
    static updateWebhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                const { webhookUrl, webhookSecret } = req.body;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                // Get user's first project (for now, assuming one project per user)
                const project = yield prisma.project.findFirst({
                    where: { userId }
                });
                if (!project) {
                    res.status(404).json({ message: 'No project found' });
                    return;
                }
                const updatedProject = yield prisma.project.update({
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
            }
            catch (error) {
                console.error('Update webhook error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    /**
     * Get user's transactions with filters
     * GET /api/v1/user/transactions?status=&search=&limit=&format=csv
     */
    static getTransactions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                const { status, search, limit, format } = req.query;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                // Get user's projects
                const projects = yield prisma.project.findMany({
                    where: { userId },
                    select: { id: true }
                });
                const projectIds = projects.map(p => p.id);
                if (projectIds.length === 0) {
                    if (format === 'csv') {
                        res.setHeader('Content-Type', 'text/csv');
                        res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
                        res.send('ID,Phone Number,Amount,Status,M-Pesa Receipt,Date\n');
                        return;
                    }
                    res.status(200).json({ transactions: [] });
                    return;
                }
                // Build filter
                const where = {
                    projectId: { in: projectIds }
                };
                if (status && status !== 'All') {
                    where.status = status;
                }
                if (search) {
                    where.OR = [
                        { id: { contains: search } },
                        { phoneNumber: { contains: search } },
                        { mpesaReceipt: { contains: search } }
                    ];
                }
                const transactions = yield prisma.transaction.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    take: limit ? parseInt(limit) : undefined,
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
                // Return CSV format if requested
                if (format === 'csv') {
                    const csvHeader = 'ID,Phone Number,Amount,Status,M-Pesa Receipt,Date\n';
                    const csvRows = transactions.map(tx => {
                        const date = new Date(tx.createdAt).toLocaleString('en-GB');
                        return `${tx.id},"${tx.phoneNumber}",${tx.amount},${tx.status},"${tx.mpesaReceipt || ''}","${date}"`;
                    }).join('\n');
                    res.setHeader('Content-Type', 'text/csv');
                    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
                    res.send(csvHeader + csvRows);
                    return;
                }
                res.status(200).json({ transactions });
            }
            catch (error) {
                console.error('Get transactions error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    /**
     * Get analytics/stats
     * GET /api/v1/user/analytics
     */
    static getAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                // Get user's projects
                const projects = yield prisma.project.findMany({
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
                const transactions = yield prisma.transaction.findMany({
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
            }
            catch (error) {
                console.error('Get analytics error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
}
exports.UserController = UserController;
