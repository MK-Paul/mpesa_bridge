import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export class AdminController {
    // Get all users with pagination
    static async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const { page = '1', limit = '20', search = '' } = req.query;
            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const skip = (pageNum - 1) * limitNum;

            const where = search
                ? {
                    OR: [
                        { email: { contains: search as string, mode: 'insensitive' as any } },
                        { name: { contains: search as string, mode: 'insensitive' as any } }
                    ]
                }
                : {};

            const [users, total] = await Promise.all([
                prisma.user.findMany({
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
                prisma.user.count({ where })
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
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Ban a user
    static async banUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const user = await prisma.user.update({
                where: { id },
                data: { status: 'BANNED' },
                select: { id: true, email: true, status: true }
            });

            res.json({ message: 'User banned successfully', user });
        } catch (error) {
            console.error('Ban user error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Unban a user
    static async unbanUser(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const user = await prisma.user.update({
                where: { id },
                data: { status: 'ACTIVE' },
                select: { id: true, email: true, status: true }
            });

            res.json({ message: 'User unbanned successfully', user });
        } catch (error) {
            console.error('Unban user error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Get system-wide analytics
    static async getAnalytics(req: Request, res: Response): Promise<void> {
        try {
            const [
                totalUsers,
                totalProjects,
                totalTransactions,
                totalRevenue,
                completedTransactions,
                recentUsers
            ] = await Promise.all([
                prisma.user.count(),
                prisma.project.count(),
                prisma.transaction.count(),
                prisma.transaction.aggregate({
                    where: { status: 'COMPLETED' },
                    _sum: { amount: true }
                }),
                prisma.transaction.count({ where: { status: 'COMPLETED' } }),
                prisma.user.count({
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
                    successRate: parseFloat(successRate as string),
                    recentUsers // Last 30 days
                }
            });
        } catch (error) {
            console.error('Get analytics error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Get all transactions across all projects
    static async getTransactions(req: Request, res: Response): Promise<void> {
        try {
            const { page = '1', limit = '50', status = '', userId = '' } = req.query;
            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const skip = (pageNum - 1) * limitNum;

            const where: any = {};
            if (status) where.status = status;

            if (userId) {
                where.project = {
                    userId: userId as string
                };
            }

            const [transactions, total] = await Promise.all([
                prisma.transaction.findMany({
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
                prisma.transaction.count({ where })
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
        } catch (error) {
            console.error('Get transactions error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Get platform statistics
    static async getStats(req: Request, res: Response): Promise<void> {
        try {
            // Get user growth over last 30 days
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            const userGrowth = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
                SELECT DATE(created_at) as date, COUNT(*)::integer as count
                FROM users
                WHERE created_at >= ${thirtyDaysAgo}
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `;

            const revenueGrowth = await prisma.$queryRaw<Array<{ date: Date; total: number }>>`
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
        } catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
