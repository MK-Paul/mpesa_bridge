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
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        // For development, we can use Ethereal (fake SMTP) if env vars are missing
        // In production, these MUST be set
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
                pass: process.env.SMTP_PASS || 'ethereal.pass'
            }
        });
    }
    sendEmail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const info = yield this.transporter.sendMail({
                    from: process.env.FROM_EMAIL || '"M-Pesa Bridge" <noreply@mpesa-bridge.com>',
                    to: options.to,
                    subject: options.subject,
                    html: options.html
                });
                console.log(`Email sent: ${info.messageId}`);
                // If using Ethereal, log the preview URL
                if (!process.env.SMTP_HOST) {
                    console.log(`Preview URL: ${nodemailer_1.default.getTestMessageUrl(info)}`);
                }
            }
            catch (error) {
                console.error('Error sending email:', error);
                // Don't throw error to prevent blocking main flow, just log it
            }
        });
    }
    sendWelcomeEmail(to, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = this.getWelcomeTemplate(name);
            yield this.sendEmail({
                to,
                subject: 'Welcome to M-Pesa Bridge!',
                html
            });
        });
    }
    sendPasswordResetEmail(to, name, resetLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = this.getPasswordResetTemplate(resetLink);
            yield this.sendEmail({
                to,
                subject: 'Reset Your Password',
                html
            });
        });
    }
    getWelcomeTemplate(name) {
        return `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #0f172a; text-align: center;">Welcome to M-Pesa Bridge! 🚀</h2>
                <p>Hi ${name},</p>
                <p>Thank you for joining M-Pesa Bridge. We're excited to help you integrate M-Pesa payments into your applications seamlessly.</p>
                <p>Here's what you can do next:</p>
                <ul>
                    <li>Create your first project</li>
                    <li>Get your API keys</li>
                    <li>Test a payment in the sandbox</li>
                </ul>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.DASHBOARD_URL || 'http://localhost:5173'}/dashboard" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
                </div>
                <p style="color: #64748b; font-size: 14px;">If you have any questions, feel free to reply to this email.</p>
            </div>
        `;
    }
    getPasswordResetTemplate(resetLink) {
        return `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #0f172a;">Reset Your Password</h2>
                <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
                </div>
                <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour.</p>
            </div>
        `;
    }
    getTransactionSuccessTemplate(amount, receipt, phone) {
        return `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #16a34a; text-align: center;">Payment Received! 💰</h2>
                <p>You have received a new payment.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Amount:</strong> KES ${amount.toLocaleString()}</p>
                    <p style="margin: 5px 0;"><strong>Receipt:</strong> ${receipt}</p>
                    <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>
                </div>
                <div style="text-align: center;">
                    <a href="${process.env.DASHBOARD_URL || 'http://localhost:5173'}/dashboard/transactions" style="color: #3b82f6; text-decoration: none;">View in Dashboard</a>
                </div>
            </div>
        `;
    }
}
exports.emailService = new EmailService();
