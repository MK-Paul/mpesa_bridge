"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRequestSignature = exports.generateRequestSignature = exports.verifyWebhookSignature = exports.whitelistSafaricomIPs = void 0;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = __importDefault(require("../config/logger"));
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
const whitelistSafaricomIPs = (req, res, next) => {
    // Skip IP check in development
    if (process.env.NODE_ENV === 'development') {
        return next();
    }
    const clientIP = req.ip || req.connection.remoteAddress || '';
    // Check if IP is whitelisted
    if (SAFARICOM_IPS.includes(clientIP)) {
        logger_1.default.info(`Callback from whitelisted IP: ${clientIP}`);
        return next();
    }
    // Log unauthorized access attempt
    logger_1.default.warn({
        message: 'Unauthorized callback attempt from non-Safaricom IP',
        ip: clientIP,
        path: req.path,
    });
    res.status(403).json({
        status: 'error',
        message: 'Forbidden: Invalid source IP',
    });
};
exports.whitelistSafaricomIPs = whitelistSafaricomIPs;
/**
 * Verify webhook signature (for future M-Pesa webhook signatures)
 * Currently M-Pesa STK Push callbacks don't include signatures,
 * but this is ready for when they do or for other webhook sources
 */
const verifyWebhookSignature = (secret) => {
    return (req, res, next) => {
        const signature = req.headers['x-signature'];
        if (!signature) {
            // For now, just log and continue (M-Pesa doesn't send signatures yet)
            logger_1.default.debug('No webhook signature provided');
            return next();
        }
        try {
            // Generate expected signature
            const payload = JSON.stringify(req.body);
            const expectedSignature = crypto_1.default
                .createHmac('sha256', secret)
                .update(payload)
                .digest('hex');
            // Compare signatures
            if (signature === expectedSignature) {
                logger_1.default.info('Webhook signature verified');
                return next();
            }
            logger_1.default.warn('Invalid webhook signature');
            res.status(401).json({
                status: 'error',
                message: 'Invalid signature',
            });
        }
        catch (error) {
            logger_1.default.error('Signature verification error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Signature verification failed',
            });
        }
    };
};
exports.verifyWebhookSignature = verifyWebhookSignature;
/**
 * Generate request signature for client requests
 * Clients can sign their requests using their secretKey
 */
const generateRequestSignature = (payload, secretKey) => {
    return crypto_1.default
        .createHmac('sha256', secretKey)
        .update(JSON.stringify(payload))
        .digest('hex');
};
exports.generateRequestSignature = generateRequestSignature;
/**
 * Verify request signature (optional enhanced security)
 * Clients include x-signature header with their signed payload
 */
const verifyRequestSignature = (req, res, next) => {
    const signature = req.headers['x-signature'];
    const project = req.project;
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
        const expectedSignature = crypto_1.default
            .createHmac('sha256', project.secretKey)
            .update(payload)
            .digest('hex');
        if (signature === expectedSignature) {
            logger_1.default.info(`Request signature verified for project ${project.id}`);
            return next();
        }
        logger_1.default.warn(`Invalid request signature for project ${project.id}`);
        res.status(401).json({
            status: 'error',
            message: 'Invalid request signature',
        });
    }
    catch (error) {
        logger_1.default.error('Request signature verification error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Signature verification failed',
        });
    }
};
exports.verifyRequestSignature = verifyRequestSignature;
