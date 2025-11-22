import express, { Application, Request, Response } from 'express';
import cors from 'cors';

const app: Application = express();

import transactionRoutes from './routes/transaction.routes';
import callbackRoutes from './routes/callback.routes';
import projectRoutes from './routes/project.routes';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';

// Middleware
app.use(cors());
app.use(express.json());
app.use(apiLimiter); // Apply general rate limiter to all routes

// Routes
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/callbacks', callbackRoutes);
app.use('/api/v1/projects', projectRoutes);

// Health Check
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'M-Pesa Bridge API is running 🚀',
        version: '1.0.0'
    });
});

// Error Handler (must be last)
app.use(errorHandler);

export default app;
