import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation rules for transaction initiation
export const validateTransactionInit = [
    body('phoneNumber')
        .trim()
        .matches(/^254[17]\d{8}$/)
        .withMessage('Phone number must be a valid Kenyan number (254XXXXXXXXX)'),

    body('amount')
        .isFloat({ min: 1, max: 150000 })
        .withMessage('Amount must be between 1 and 150,000 KES'),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Description must be between 1 and 100 characters'),
];

// Validation rules for project creation
export const validateProjectCreation = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Project name must be between 3 and 100 characters'),

    body('callbackUrl')
        .optional()
        .trim()
        .isURL()
        .withMessage('Callback URL must be a valid URL'),
];

// Middleware to check validation results
export const checkValidation = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.type === 'field' ? err.path : 'unknown',
                message: err.msg
            }))
        });
    }

    next();
};
