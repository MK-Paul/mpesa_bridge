import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

interface AuthRequest extends Request {
    userId?: string;
}

export class AnalyticsController {
    /**
     * Get analytics overview
     * GET /api/v1/analytics/overview?projectId=xxx&startDate=2025-01-01&endDate=2025-12-31
     */
    static async getOverview(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const { projectId, startDate, endDate, environment } = req.query;

            // Build date filter
            const dateFilter: any = {};
            if (startDate) {
                dateFilter.gte = new Date(startDate as string);
            }
            if (endDate) {
                dateFilter.lte = new Date(endDate as string);
            }

            // Build project filter
            const projectFilter: any = { userId };
            if (projectId) {
                projectFilter.id = projectId as string;
            }

            // Get user's projects
            const projects = await prisma.project.findMany({
                where: projectFilter,
                select: { id: true }
            });

            const projectIds = projects.map(p => p.id);

            if (projectIds.length === 0) {
                res.status(200).json({
                    totalRevenue: 0,
                    totalTransactions: 0,
                    successRate: 0,
                    averageValue: 0,
                    completedTransactions: 0
                });
                return;
            }

            // Build transaction filter
            const transactionFilter: any = {
                projectId: { in: projectIds }
            };
            if (environment) {
                transactionFilter.environment = environment as any;
            }
            if (Object.keys(dateFilter).length > 0) {
                transactionFilter.createdAt = dateFilter;
            }

            // Get transaction statistics
            const [totalStats, completedStats] = await Promise.all([
                prisma.transaction.aggregate({
                    where: transactionFilter,
                    _count: true,
                    _sum: { amount: true }
                }),
                prisma.transaction.aggregate({
                    where: {
                        ...transactionFilter,
                        status: 'COMPLETED'
                    },
                    _count: true,
                    _sum: { amount: true }
                })
            ]);

            const totalTransactions = totalStats._count || 0;
            const completedTransactions = completedStats._count || 0;
            const totalRevenue = completedStats._sum.amount || 0;
            const successRate = totalTransactions > 0
                ? Math.round((completedTransactions / totalTransactions) * 100)
                : 0;
            const averageValue = completedTransactions > 0
                ? totalRevenue / completedTransactions
                : 0;

            res.status(200).json({
                totalRevenue,
                totalTransactions,
                successRate,
                averageValue: Math.round(averageValue * 100) / 100,
                completedTransactions
            });
        } catch (error) {
            console.error('Get analytics overview error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Get time-series data
     * GET /api/v1/analytics/time-series?projectId=xxx&interval=day&startDate=xxx&endDate=xxx
     */
    static async getTimeSeries(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const { projectId, interval = 'day', startDate, endDate, environment } = req.query;

            // Build date filter - default to last 30 days
            const end = endDate ? new Date(endDate as string) : new Date();
            const start = startDate
                ? new Date(startDate as string)
                : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

            // Get user's projects
            const projectFilter: any = { userId };
            if (projectId) {
                projectFilter.id = projectId as string;
            }

            const projects = await prisma.project.findMany({
                where: projectFilter,
                select: { id: true }
            });

            const projectIds = projects.map(p => p.id);

            if (projectIds.length === 0) {
                res.status(200).json({ data: [] });
                return;
            }

            // Get all transactions in the date range
            const transactions = await prisma.transaction.findMany({
                where: {
                    projectId: { in: projectIds },
                    createdAt: {
                        gte: start,
                        lte: end
                    },
                    ...(environment ? { environment: environment as any } : {})
                },
                select: {
                    createdAt: true,
                    amount: true,
                    status: true
                },
                orderBy: { createdAt: 'asc' }
            });

            // Group by date
            const grouped: Record<string, any> = {};

            transactions.forEach(tx => {
                const dateKey = tx.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD

                if (!grouped[dateKey]) {
                    grouped[dateKey] = {
                        date: dateKey,
                        revenue: 0,
                        count: 0,
                        completed: 0
                    };
                }

                grouped[dateKey].count++;
                if (tx.status === 'COMPLETED') {
                    grouped[dateKey].revenue += tx.amount;
                    grouped[dateKey].completed++;
                }
            });

            // Convert to array and calculate success rate
            const data = Object.values(grouped).map((item: any) => ({
                date: item.date,
                revenue: Math.round(item.revenue * 100) / 100,
                count: item.count,
                successRate: item.count > 0
                    ? Math.round((item.completed / item.count) * 100)
                    : 0
            }));

            // Fill in missing dates with zeros
            const filledData = [];
            const currentDate = new Date(start);
            while (currentDate <= end) {
                const dateKey = currentDate.toISOString().split('T')[0];
                const existing = data.find(d => d.date === dateKey);

                filledData.push(existing || {
                    date: dateKey,
                    revenue: 0,
                    count: 0,
                    successRate: 0
                });

                currentDate.setDate(currentDate.getDate() + 1);
            }

            res.status(200).json({ data: filledData });
        } catch (error) {
            console.error('Get time-series data error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Get status breakdown
     * GET /api/v1/analytics/status-breakdown?projectId=xxx&startDate=xxx&endDate=xxx
     */
    static async getStatusBreakdown(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const { projectId, startDate, endDate, environment } = req.query;

            // Build date filter
            const dateFilter: any = {};
            if (startDate) {
                dateFilter.gte = new Date(startDate as string);
            }
            if (endDate) {
                dateFilter.lte = new Date(endDate as string);
            }

            // Get user's projects
            const projectFilter: any = { userId };
            if (projectId) {
                projectFilter.id = projectId as string;
            }

            const projects = await prisma.project.findMany({
                where: projectFilter,
                select: { id: true }
            });

            const projectIds = projects.map(p => p.id);

            if (projectIds.length === 0) {
                res.status(200).json({ data: [] });
                return;
            }

            // Build transaction filter
            const transactionFilter: any = {
                projectId: { in: projectIds }
            };
            if (environment) {
                transactionFilter.environment = environment as any;
            }
            if (Object.keys(dateFilter).length > 0) {
                transactionFilter.createdAt = dateFilter;
            }

            // Group by status
            const statusGroups = await prisma.transaction.groupBy({
                by: ['status'],
                where: transactionFilter,
                _count: true,
                _sum: {
                    amount: true
                }
            });

            const data = statusGroups.map(group => ({
                status: group.status,
                count: group._count,
                totalAmount: Math.round((group._sum.amount || 0) * 100) / 100
            }));

            res.status(200).json({ data });
        } catch (error) {
            console.error('Get status breakdown error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Get payment links performance
     * GET /api/v1/analytics/payment-links-performance?projectId=xxx&startDate=xxx&endDate=xxx
     */
    static async getPaymentLinksPerformance(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const { projectId, startDate, endDate, environment } = req.query;

            // Build date filter
            const dateFilter: any = {};
            if (startDate) {
                dateFilter.gte = new Date(startDate as string);
            }
            if (endDate) {
                dateFilter.lte = new Date(endDate as string);
            }

            // Get user's projects
            const projectFilter: any = { userId };
            if (projectId) {
                projectFilter.id = projectId as string;
            }

            const projects = await prisma.project.findMany({
                where: projectFilter,
                select: { id: true }
            });

            const projectIds = projects.map(p => p.id);

            if (projectIds.length === 0) {
                res.status(200).json({ data: [] });
                return;
            }

            // Get payment links with their transactions
            // @ts-ignore
            const paymentLinks = await prisma.paymentLink.findMany({
                where: {
                    projectId: { in: projectIds }
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    amount: true,
                    transactions: {
                        where: {
                            ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
                            ...(environment ? { environment: environment as any } : {})
                        },
                        select: {
                            status: true,
                            amount: true
                        }
                    }
                }
            });

            const data = paymentLinks.map((link: any) => {
                const totalTransactions = link.transactions.length;
                const completedTransactions = link.transactions.filter(
                    (t: any) => t.status === 'COMPLETED'
                ).length;
                const revenue = link.transactions
                    .filter((t: any) => t.status === 'COMPLETED')
                    .reduce((sum: number, t: any) => sum + t.amount, 0);
                const successRate = totalTransactions > 0
                    ? Math.round((completedTransactions / totalTransactions) * 100)
                    : 0;

                return {
                    id: link.id,
                    title: link.title,
                    slug: link.slug,
                    expectedAmount: link.amount,
                    revenue: Math.round(revenue * 100) / 100,
                    transactions: totalTransactions,
                    completedTransactions,
                    successRate
                };
            }).sort((a: any, b: any) => b.revenue - a.revenue); // Sort by revenue descending

            res.status(200).json({ data });
        } catch (error) {
            console.error('Get payment links performance error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
