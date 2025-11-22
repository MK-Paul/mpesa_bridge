import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict limiter for transaction initiation
export const transactionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit to 50 payment requests per 15 minutes per IP
    message: 'Too many payment requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Very strict limiter for project creation
export const projectCreationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit to 5 project creations per hour per IP
    message: 'Too many project creation attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
