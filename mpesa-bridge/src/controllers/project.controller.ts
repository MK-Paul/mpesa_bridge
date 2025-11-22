import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import crypto from 'crypto';

export class ProjectController {

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const { name, callbackUrl } = req.body;

            if (!name) {
                res.status(400).json({ error: 'Project name is required' });
                return;
            }

            // Generate Keys
            const publicKey = `pk_live_${crypto.randomBytes(12).toString('hex')}`;
            const secretKey = `sk_live_${crypto.randomBytes(24).toString('hex')}`;

            const project = await prisma.project.create({
                data: {
                    name,
                    publicKey,
                    secretKey,
                    callbackUrl
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
}
