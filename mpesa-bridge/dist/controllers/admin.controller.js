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
exports.AdminController = void 0;
const prisma_1 = require("../config/prisma");
class AdminController {
    // Get all users with pagination
    static getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = '1', limit = '20', search = '' } = req.query;
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const skip = (pageNum - 1) * limitNum;
                const where = search
                    ? {
                        OR: [
                            { email: { contains: search, mode: 'insensitive' } },
                            { name: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                    : {};
                const [users, total] = yield Promise.all([
                    prisma_1.prisma.user.findMany({
                        where,
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                            status: true,
                            createdAt: true,
                            _count: {
                                select: { projects: true }
                            }
                        },
                        orderBy: { createdAt: 'desc' },
                        skip,
                        take: limitNum
                    }),
                    prisma_1.prisma.user.count({ where })
                ]);
                res.json({
                    users,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total,
                        totalPages: Math.ceil(total / limitNum)
                    }
                });
            }
            catch (error) {
                console.error('Get users error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    // Ban a user
    static banUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield prisma_1.prisma.user.update({
                    where: { id },
                    data: { status: 'BANNED' },
                    select: { id: true, email: true, status: true }
                });
                res.json({ message: 'User banned successfully', user });
            }
            catch (error) {
                console.error('Ban user error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    // Unban a user
    static unbanUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield prisma_1.prisma.user.update({
                    where: { id },
                    data: { status: 'ACTIVE' },
                    select: { id: true, email: true, status: true }
                });
                res.json({ message: 'User unbanned successfully', user });
            }
            catch (error) {
                console.error('Unban user error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    // Get system-wide analytics
    static getAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [totalUsers, totalProjects, totalTransactions, totalRevenue, completedTransactions, recentUsers] = yield Promise.all([
                    prisma_1.prisma.user.count(),
                    prisma_1.prisma.project.count(),
                    prisma_1.prisma.transaction.count(),
                    prisma_1.prisma.transaction.aggregate({
                        where: { status: 'COMPLETED' },
                        _sum: { amount: true }
                    }),
                    prisma_1.prisma.transaction.count({ where: { status: 'COMPLETED' } }),
                    prisma_1.prisma.user.count({
                        where: {
                            createdAt: {
                                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                            }
                        }
                    })
                ]);
                const successRate = totalTransactions > 0
                    ? ((completedTransactions / totalTransactions) * 100).toFixed(1)
                    : 0;
                res.json({
                    analytics: {
                        totalUsers,
                        totalProjects,
                        totalTransactions,
                        totalRevenue: totalRevenue._sum.amount || 0,
                        successRate: parseFloat(successRate),
                        recentUsers // Last 30 days
                    }
                });
            }
            catch (error) {
                console.error('Get analytics error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    // Get all transactions across all projects
    static getTransactions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = '1', limit = '50', status = '', userId = '' } = req.query;
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const skip = (pageNum - 1) * limitNum;
                const where = {};
                if (status)
                    where.status = status;
                if (userId) {
                    where.project = {
                        userId: userId
                    };
                }
                const [transactions, total] = yield Promise.all([
                    prisma_1.prisma.transaction.findMany({
                        where,
                        include: {
                            project: {
                                select: {
                                    name: true,
                                    user: {
                                        select: { email: true, name: true }
                                    }
                                }
                            }
                        },
                        orderBy: { createdAt: 'desc' },
                        skip,
                        take: limitNum
                    }),
                    prisma_1.prisma.transaction.count({ where })
                ]);
                res.json({
                    transactions,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total,
                        totalPages: Math.ceil(total / limitNum)
                    }
                });
            }
            catch (error) {
                console.error('Get transactions error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    // Get platform statistics
    static getStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get user growth over last 30 days
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                const userGrowth = yield prisma_1.prisma.$queryRaw `
                SELECT DATE(created_at) as date, COUNT(*)::integer as count
                FROM users
                WHERE created_at >= ${thirtyDaysAgo}
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `;
                const revenueGrowth = yield prisma_1.prisma.$queryRaw `
                SELECT DATE(created_at) as date, SUM(amount)::float as total
                FROM transactions
                WHERE created_at >= ${thirtyDaysAgo} AND status = 'COMPLETED'
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `;
                res.json({
                    userGrowth: userGrowth.map(row => ({
                        date: row.date.toISOString().split('T')[0],
                        count: Number(row.count)
                    })),
                    revenueGrowth: revenueGrowth.map(row => ({
                        date: row.date.toISOString().split('T')[0],
                        total: row.total
                    }))
                });
            }
            catch (error) {
                console.error('Get stats error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
}
exports.AdminController = AdminController;
