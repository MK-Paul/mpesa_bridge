"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkValidation = exports.validateProjectCreation = exports.validateTransactionInit = void 0;
const express_validator_1 = require("express-validator");
// Validation rules for transaction initiation
exports.validateTransactionInit = [
    (0, express_validator_1.body)('phone')
        .trim()
        .matches(/^254[17]\d{8}$/)
        .withMessage('Phone number must be a valid Kenyan number (254XXXXXXXXX)'),
    (0, express_validator_1.body)('amount')
        .isFloat({ min: 1, max: 150000 })
        .withMessage('Amount must be between 1 and 150,000 KES'),
    (0, express_validator_1.body)('reference')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Reference must be between 1 and 50 characters'),
];
// Validation rules for project creation
exports.validateProjectCreation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Project name must be between 3 and 100 characters'),
    (0, express_validator_1.body)('callbackUrl')
        .optional()
        .trim()
        .isURL()
        .withMessage('Callback URL must be a valid URL'),
];
// Middleware to check validation results
const checkValidation = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
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
exports.checkValidation = checkValidation;
