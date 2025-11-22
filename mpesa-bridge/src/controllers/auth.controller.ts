import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth.middleware';
import { emailService } from '../services/email.service';

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
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '24h' }
            );

            // Send welcome email
            await emailService.sendWelcomeEmail(user.email, user.name);

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user
            });

        } catch (error) {
            console.error('Register error:', error);
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

            if (!email || !password) {
                res.status(400).json({ message: 'Email and password are required' });
                return;
            }

            // Find user
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }

            // Check if user is banned
            if (user.status === 'BANNED') {
                res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
                return;
            }

            // Generate JWT
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '24h' }
            );

            res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: user.status
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Forgot password
     * POST /api/v1/auth/forgot-password
     */
    static async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;

            if (!email) {
                res.status(400).json({ message: 'Email is required' });
                return;
            }

            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                // Don't reveal if user exists
                res.status(200).json({ message: 'If an account exists, a reset email has been sent' });
                return;
            }

            // Generate reset token
            const resetToken = jwt.sign(
                { userId: user.id, type: 'password-reset' },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '1h' }
            );

            // Send reset email
            const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
            await emailService.sendPasswordResetEmail(user.email, user.name, resetLink);

            res.status(200).json({ message: 'If an account exists, a reset email has been sent' });

        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Reset password with token
     * POST /api/v1/auth/reset-password
     */
    static async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                res.status(400).json({ message: 'Token and new password are required' });
                return;
            }

            if (newPassword.length < 6) {
                res.status(400).json({ message: 'Password must be at least 6 characters' });
                return;
            }

            // Verify token
            const jwtSecret = process.env.JWT_SECRET || 'default_secret';
            let decoded: any;
            try {
                decoded = jwt.verify(token, jwtSecret);
            } catch (err) {
                res.status(400).json({ message: 'Invalid or expired reset token' });
                return;
            }

            // Check if it's a password reset token
            if (decoded.type !== 'password-reset') {
                res.status(400).json({ message: 'Invalid token type' });
                return;
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            await prisma.user.update({
                where: { id: decoded.userId },
                data: { password: hashedPassword }
            });

            res.status(200).json({ message: 'Password reset successful' });

        } catch (error) {
            console.error('Reset password error:', error);
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
                    createdAt: true
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
