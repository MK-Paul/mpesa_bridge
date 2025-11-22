import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export class AuthController {
    /**
     * Register a new user
     * POST /api/v1/auth/register
     */
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, name, password } = req.body;

            // Validation
            if (!email || !name || !password) {
                res.status(400).json({ message: 'Email, name, and password are required' });
                return;
            }

            if (password.length < 6) {
                res.status(400).json({ message: 'Password must be at least 6 characters' });
                return;
            }

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                res.status(409).json({ message: 'User with this email already exists' });
                return;
            }

            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create user
            const user = await prisma.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    createdAt: true
                }
            });

            // Auto-create default project for user
            await prisma.project.create({
                data: {
                    name: `${user.name}'s Project`,
                    publicKey: `pk_live_${crypto.randomBytes(12).toString('hex')}`,
                    secretKey: `sk_live_${crypto.randomBytes(24).toString('hex')}`,
                    userId: user.id
                }
            });

            // Generate JWT
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                throw new Error('JWT_SECRET not configured');
            }

            const token = jwt.sign(
                { userId: user.id },
                jwtSecret,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Login user
     * POST /api/v1/auth/login
     */
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                res.status(400).json({ message: 'Email and password are required' });
                return;
            }

            // Find user
            const user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    password: true,
                    createdAt: true
                }
            });

            if (!user) {
                res.status(401).json({ message: 'Invalid email or password' });
                return;
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                res.status(401).json({ message: 'Invalid email or password' });
                return;
            }

            // Generate JWT
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                throw new Error('JWT_SECRET not configured');
            }

            const token = jwt.sign(
                { userId: user.id },
                jwtSecret,
                { expiresIn: '7d' }
            );

            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;

            res.status(200).json({
                message: 'Login successful',
                token,
                user: userWithoutPassword
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Get current user profile
     * GET /api/v1/auth/profile
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
}
