import axios from 'axios';
import { config } from '../config/env';

export class MpesaService {
    private static baseUrl = config.env === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

    /**
     * Generates an OAuth Access Token from Safaricom
     */
    public static async getAccessToken(creds?: { consumerKey: string; consumerSecret: string }): Promise<string> {
        const consumerKey = creds?.consumerKey || config.mpesa.consumerKey;
        const consumerSecret = creds?.consumerSecret || config.mpesa.consumerSecret;

        const credentials = Buffer.from(
            `${consumerKey}:${consumerSecret}`
        ).toString('base64');

        console.log('🔐 M-Pesa Auth Request:');
        console.log('  URL:', `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`);
        console.log('  Consumer Key:', consumerKey?.substring(0, 10) + '...');
        console.log('  Environment:', config.env);

        try {
            const response = await axios.get(
                `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
                {
                    headers: {
                        Authorization: `Basic ${credentials}`,
                    },
                }
            );
            console.log('✅ M-Pesa Auth Success!');
            return response.data.access_token;
        } catch (error: any) {
            console.error('❌ M-Pesa Auth Failed!');
            console.error('  Status Code:', error.response?.status);
            console.error('  Status Text:', error.response?.statusText);
            console.error('  Error Data:', JSON.stringify(error.response?.data, null, 2));
            console.error('  Request URL:', error.config?.url);
            console.error('  Full Error:', error.message);
            throw new Error('Failed to authenticate with M-Pesa');
        }
    }

    /**
     * Triggers the STK Push (Lipa na M-Pesa Online)
     */
    public static async sendSTKPush(
        phone: string,
        amount: number,
        reference: string,
        creds?: { consumerKey: string; consumerSecret: string; passkey: string; shortCode: string }
    ) {
        const token = await this.getAccessToken(creds);
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);

        const shortCode = creds?.shortCode || config.mpesa.shortcode;
        const passkey = creds?.passkey || config.mpesa.passkey;

        const password = Buffer.from(
            `${shortCode}${passkey}${timestamp}`
        ).toString('base64');

        const payload = {
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phone, // The phone sending money
            PartyB: shortCode, // The paybill receiving money
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
