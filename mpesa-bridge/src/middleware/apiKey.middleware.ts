import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export interface ApiKeyRequest extends Request {
    project?: any;
    apiKey?: string;
}

export const authenticateApiKey = async (
    req: ApiKeyRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const apiKey = req.headers['x-api-key'] as string;

        if (!apiKey) {
            res.status(401).json({ error: 'API key required. Include x-api-key header.' });
            return;
        }

        // Find project by API key (could be live or test key)
        const project = await prisma.project.findFirst({
            where: {
                OR: [
                    { publicKey: apiKey },
                    { testPublicKey: apiKey }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        status: true
                    }
                }
            }
        });

        if (!project) {
            res.status(401).json({ error: 'Invalid API key' });
            return;
        }

        // Check if user exists and is not banned
        if (!project.user) {
            res.status(403).json({ error: 'User account not found' });
            return;
        }

        if (project.user.status === 'BANNED') {
            res.status(403).json({ error: 'Account suspended. Contact support.' });
            return;
        }

        // Attach project and apiKey to request
        req.project = project;
        req.apiKey = apiKey;

        next();
    } catch (error) {
        console.error('API key authentication error:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
};
