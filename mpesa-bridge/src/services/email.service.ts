import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // For development, we can use Ethereal (fake SMTP) if env vars are missing
        // In production, these MUST be set
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
                pass: process.env.SMTP_PASS || 'ethereal.pass'
            }
        });
    }

    async sendEmail(options: EmailOptions): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.FROM_EMAIL || '"M-Pesa Bridge" <noreply@mpesa-bridge.com>',
                to: options.to,
                subject: options.subject,
                html: options.html
            });

            console.log(`Email sent: ${info.messageId}`);

            // If using Ethereal, log the preview URL
            if (!process.env.SMTP_HOST) {
                console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
        } catch (error) {
            console.error('Error sending email:', error);
            // Don't throw error to prevent blocking main flow, just log it
        }
    }

    async sendWelcomeEmail(to: string, name: string): Promise<void> {
        const html = this.getWelcomeTemplate(name);
        await this.sendEmail({
            to,
            subject: 'Welcome to M-Pesa Bridge!',
            html
        });
    }

    async sendPasswordResetEmail(to: string, name: string, resetLink: string): Promise<void> {
        const html = this.getPasswordResetTemplate(resetLink);
        await this.sendEmail({
            to,
            subject: 'Reset Your Password',
            html
        });
    }

    getWelcomeTemplate(name: string): string {
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

    getPasswordResetTemplate(resetLink: string): string {
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

    getTransactionSuccessTemplate(amount: number, receipt: string, phone: string): string {
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

export const emailService = new EmailService();
