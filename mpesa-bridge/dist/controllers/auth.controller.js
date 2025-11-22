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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
                const jwtSecret = process.env.JWT_SECRET;
                if (!jwtSecret) {
                    throw new Error('JWT_SECRET not configured');
                }
                const token = jsonwebtoken_1.default.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });
                res.status(201).json({
                    message: 'User registered successfully',
                    token,
                    user
                });
            }
            catch (error) {
                console.error('Registration error:', error);
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
                // Validation
                if (!email || !password) {
                    res.status(400).json({ message: 'Email and password are required' });
                    return;
                }
                // Find user
                const user = yield prisma.user.findUnique({
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
                const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
                if (!isPasswordValid) {
                    res.status(401).json({ message: 'Invalid email or password' });
                    return;
                }
                // Generate JWT
                const jwtSecret = process.env.JWT_SECRET;
                if (!jwtSecret) {
                    throw new Error('JWT_SECRET not configured');
                }
                const token = jsonwebtoken_1.default.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });
                // Remove password from response
                const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
                res.status(200).json({
                    message: 'Login successful',
                    token,
                    user: userWithoutPassword
                });
            }
            catch (error) {
                console.error('Login error:', error);
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
                        createdAt: true,
                        updatedAt: true
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
