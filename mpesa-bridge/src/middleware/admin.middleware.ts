import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Auth middleware should have already verified the token and attached userId
        const userId = (req as any).userId;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, status: true }
        });

        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        if (user.status === 'BANNED') {
            res.status(403).json({ message: 'Your account has been banned' });
            return;
        }

        if (user.role !== 'ADMIN') {
            res.status(403).json({ message: 'Admin access required' });
            return;
        }

        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
