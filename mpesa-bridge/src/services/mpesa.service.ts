import axios from 'axios';
import { config } from '../config/env';

export class MpesaService {
    private static baseUrl = config.env === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

    /**
     * Generates an OAuth Access Token from Safaricom
     */
    public static async getAccessToken(): Promise<string> {
        const credentials = Buffer.from(
            `${config.mpesa.consumerKey}:${config.mpesa.consumerSecret}`
        ).toString('base64');

        try {
            const response = await axios.get(
                `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
                {
                    headers: {
                        Authorization: `Basic ${credentials}`,
                    },
                }
            );
            return response.data.access_token;
        } catch (error: any) {
            console.error('M-Pesa Auth Error:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with M-Pesa');
        }
    }

    /**
     * Triggers the STK Push (Lipa na M-Pesa Online)
     */
    public static async sendSTKPush(phone: string, amount: number, reference: string) {
        const token = await this.getAccessToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
        const password = Buffer.from(
            `${config.mpesa.shortcode}${config.mpesa.passkey}${timestamp}`
        ).toString('base64');

        const payload = {
            BusinessShortCode: config.mpesa.shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phone, // The phone sending money
            PartyB: config.mpesa.shortcode, // The paybill receiving money
            PhoneNumber: phone,
            CallBackURL: config.mpesa.callbackUrl,
            AccountReference: reference,
            TransactionDesc: `Payment for ${reference}`,
        };

        try {
            const response = await axios.post(
                `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            console.error('STK Push Error:', error.response?.data || error.message);
            throw new Error('Failed to initiate STK Push');
        }
    }
}
