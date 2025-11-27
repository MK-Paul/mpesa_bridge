import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

const app: Application = express();

// Trust proxy - Required for Render/production deployment
app.set('trust proxy', 1);

import transactionRoutes from './routes/transaction.routes';
import callbackRoutes from './routes/callback.routes';
import projectRoutes from './routes/project.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import paymentLinkRoutes from './routes/paymentLink.routes';
import analyticsRoutes from './routes/analytics.routes';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import { analyticsMiddleware } from './middleware/analytics.middleware';

// Middleware
app.use(cors());
app.use(express.json());
app.use(analyticsMiddleware);
app.use(apiLimiter); // Apply general rate limiter to all routes

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/callbacks', callbackRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/payment-links', paymentLinkRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'M-Pesa Bridge API is running 🚀',
        version: '1.0.0'
    });
});

// API 404 Handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Error Handler (must be last)
app.use(errorHandler);

export default app;
