import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const apiKey = req.headers['x-api-key'] as string;

        if (!apiKey) {
            return res.status(401).json({ message: 'Unauthorized: API Key missing' });
        }

        // Find project by Public Key (which is used as the API Key)
        const project = await prisma.project.findUnique({
            where: { publicKey: apiKey }
        });

        if (!project) {
            return res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
        }

        // Attach project to request for later use
        (req as any).project = project;

        next();
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
