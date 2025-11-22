import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import logger from '../config/logger';

/**
 * Safaricom M-Pesa IP addresses (for production)
 * These are the official Safaricom API server IPs
 */
const SAFARICOM_IPS = [
    '196.201.214.200',
    '196.201.214.206',
    '196.201.213.114',
    '196.201.214.207',
    '196.201.214.208',
    '196.201.213.44',
    '196.201.212.127',
    '196.201.212.138',
    '196.201.212.129',
    '196.201.212.136',
    '196.201.212.74',
    '196.201.212.69',
];

/**
 * Middleware to whitelist Safaricom IPs for M-Pesa callbacks
 * In development, this is bypassed
 */
export const whitelistSafaricomIPs = (req: Request, res: Response, next: NextFunction) => {
    // Skip IP check in development
    if (process.env.NODE_ENV === 'development') {
        return next();
    }

    const clientIP = req.ip || req.connection.remoteAddress || '';

    // Check if IP is whitelisted
    if (SAFARICOM_IPS.includes(clientIP)) {
        logger.info(`Callback from whitelisted IP: ${clientIP}`);
        return next();
    }

    // Log unauthorized access attempt
    logger.warn({
        message: 'Unauthorized callback attempt from non-Safaricom IP',
        ip: clientIP,
        path: req.path,
    });

    res.status(403).json({
        status: 'error',
        message: 'Forbidden: Invalid source IP',
    });
};

/**
 * Verify webhook signature (for future M-Pesa webhook signatures)
 * Currently M-Pesa STK Push callbacks don't include signatures,
 * but this is ready for when they do or for other webhook sources
 */
export const verifyWebhookSignature = (secret: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const signature = req.headers['x-signature'] as string;

        if (!signature) {
            // For now, just log and continue (M-Pesa doesn't send signatures yet)
            logger.debug('No webhook signature provided');
            return next();
        }

        try {
            // Generate expected signature
            const payload = JSON.stringify(req.body);
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(payload)
                .digest('hex');

            // Compare signatures
            if (signature === expectedSignature) {
                logger.info('Webhook signature verified');
                return next();
            }

            logger.warn('Invalid webhook signature');
            res.status(401).json({
                status: 'error',
                message: 'Invalid signature',
            });
        } catch (error) {
            logger.error('Signature verification error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Signature verification failed',
            });
        }
    };
};

/**
 * Generate request signature for client requests
 * Clients can sign their requests using their secretKey
 */
export const generateRequestSignature = (payload: any, secretKey: string): string => {
    return crypto
        .createHmac('sha256', secretKey)
        .update(JSON.stringify(payload))
        .digest('hex');
};

/**
 * Verify request signature (optional enhanced security)
 * Clients include x-signature header with their signed payload
 */
export const verifyRequestSignature = (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers['x-signature'] as string;
    const project = (req as any).project;

    // Signature is optional for now
    if (!signature) {
        return next();
    }

    if (!project || !project.secretKey) {
        return res.status(401).json({
            status: 'error',
            message: 'Project not authenticated',
        });
    }

    try {
        const payload = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', project.secretKey)
            .update(payload)
            .digest('hex');

        if (signature === expectedSignature) {
            logger.info(`Request signature verified for project ${project.id}`);
            return next();
        }

        logger.warn(`Invalid request signature for project ${project.id}`);
        res.status(401).json({
            status: 'error',
            message: 'Invalid request signature',
        });
    } catch (error) {
        logger.error('Request signature verification error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Signature verification failed',
        });
    }
};
