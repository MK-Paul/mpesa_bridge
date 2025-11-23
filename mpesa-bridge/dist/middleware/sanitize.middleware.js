"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizePhoneNumber = void 0;
/**
 * Middleware to sanitize phone numbers to Kenyan format (254XXXXXXXXX)
 */
const sanitizePhoneNumber = (req, res, next) => {
    if (req.body.phoneNumber) {
        let phone = req.body.phoneNumber.toString().trim();
        // Remove all spaces, dashes, and parentheses
        phone = phone.replace(/[\s\-\(\)]/g, '');
        // Remove leading + if present
        if (phone.startsWith('+')) {
            phone = phone.substring(1);
        }
        // Convert 07XXXXXXXX to 254XXXXXXXXX
        if (phone.startsWith('07') && phone.length === 10) {
            phone = '254' + phone.substring(1);
        }
        // Convert 01XXXXXXXX to 254XXXXXXXXX
        if (phone.startsWith('01') && phone.length === 10) {
            phone = '254' + phone.substring(1);
        }
        // Update the request body with sanitized phone
        req.body.phoneNumber = phone;
    }
    next();
};
exports.sanitizePhoneNumber = sanitizePhoneNumber;
