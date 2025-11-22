import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const analyticsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Store original end function
    const originalEnd = res.end;

    // Override end function to capture status and duration
    // @ts-ignore
    res.end = function (chunk: any, encoding: any) {
        const duration = Date.now() - start;
        const userId = (req as any).user?.userId; // Assuming auth middleware attaches user

        // Only log if user is authenticated and it's an API request
        if (userId && req.path.startsWith('/api')) {
            // Fire and forget - don't await to avoid blocking response
            prisma.apiCall.create({
                data: {
                    userId,
                    endpoint: req.path,
                    method: req.method,
                    status: res.statusCode,
                    duration
                }
            }).catch(err => {
                console.error('Failed to log API call:', err);
            });
        }

        // Call original end
        // @ts-ignore
        originalEnd.apply(res, [chunk, encoding]);
    };

    next();
};
