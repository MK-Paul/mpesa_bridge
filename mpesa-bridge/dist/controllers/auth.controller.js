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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const email_service_1 = require("../services/email.service");
const prisma = new client_1.PrismaClient();
class AuthController {
    /**
     * Register a new user
     * POST /api/v1/auth/register
     */
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const existingUser = yield prisma.user.findUnique({
                    where: { email }
                });
                if (existingUser) {
                    res.status(409).json({ message: 'User with this email already exists' });
                    return;
                }
                // Hash password
                const saltRounds = 10;
                const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
                // Create user
                const user = yield prisma.user.create({
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
                yield prisma.project.create({
                    data: {
                        name: `${user.name}'s Project`,
                        publicKey: `pk_live_${crypto_1.default.randomBytes(12).toString('hex')}`,
                        secretKey: `sk_live_${crypto_1.default.randomBytes(24).toString('hex')}`,
                        userId: user.id
                    }
                });
                // Generate JWT
                const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '24h' });
                // Send welcome email
                yield email_service_1.emailService.sendWelcomeEmail(user.email, user.name);
                res.status(201).json({
                    message: 'User registered successfully',
                    token,
                    user
                });
            }
            catch (error) {
                console.error('Register error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    /**
     * Login user
     * POST /api/v1/auth/login
     */
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    res.status(400).json({ message: 'Email and password are required' });
                    return;
                }
                // Find user
                const user = yield prisma.user.findUnique({
                    where: { email }
                });
                if (!user) {
                    res.status(401).json({ message: 'Invalid credentials' });
                    return;
                }
                // Check password
                const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
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
                const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '24h' });
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
            }
            catch (error) {
                console.error('Login error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    /**
     * Forgot password
     * POST /api/v1/auth/forgot-password
     */
    static forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email) {
                    res.status(400).json({ message: 'Email is required' });
                    return;
                }
                const user = yield prisma.user.findUnique({
                    where: { email }
                });
                if (!user) {
                    // Don't reveal if user exists
                    res.status(200).json({ message: 'If an account exists, a reset email has been sent' });
                    return;
                }
                // Generate reset token (random hex string)
                const resetToken = crypto_1.default.randomBytes(32).toString('hex');
                const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
                // Save token hash to database
                // In a real app, you might want to hash this token before saving
                yield prisma.user.update({
                    where: { id: user.id },
                    data: {
                        resetToken,
                        resetTokenExpiry
                    }
                });
                // Send reset email
                const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
                yield email_service_1.emailService.sendPasswordResetEmail(user.email, user.name, resetLink);
                res.status(200).json({ message: 'If an account exists, a reset email has been sent' });
            }
            catch (error) {
                console.error('Forgot password error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    /**
     * Reset password with token
     * POST /api/v1/auth/reset-password
     */
    static resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                // Find user with valid token
                const user = yield prisma.user.findFirst({
                    where: {
                        resetToken: token,
                        resetTokenExpiry: {
                            gt: new Date()
                        }
                    }
                });
                if (!user) {
                    res.status(400).json({ message: 'Invalid or expired reset token' });
                    return;
                }
                // Hash new password
                const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
                // Update password and clear token
                yield prisma.user.update({
                    where: { id: user.id },
                    data: {
                        password: hashedPassword,
                        resetToken: null,
                        resetTokenExpiry: null
                    }
                });
                res.status(200).json({ message: 'Password reset successful' });
            }
            catch (error) {
                console.error('Reset password error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    /**
     * Get current user profile
     * GET /api/v1/auth/profile
     */
    static getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const user = yield prisma.user.findUnique({
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
            }
            catch (error) {
                console.error('Get profile error:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
}
exports.AuthController = AuthController;
