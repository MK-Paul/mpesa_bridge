import axios, { AxiosInstance } from 'axios';
import { io, Socket } from 'socket.io-client';
import { MpesaConfig, PaymentParams, PaymentResponse, TransactionStatus } from './types';

export class MpesaBridge {
    private api: AxiosInstance;
    private socket: Socket | null = null;
    private config: MpesaConfig;

    constructor(config: MpesaConfig) {
        this.config = {
            baseUrl: 'https://mpesa-bridge.onrender.com/api/v1',
            ...config
        };

        this.api = axios.create({
            baseURL: this.config.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey
            }
        });
    }

    /**
     * Initiate an STK Push payment
     */
    async pay(params: PaymentParams): Promise<PaymentResponse> {
        try {
            const response = await this.api.post('/transactions/stk-push', {
                phoneNumber: params.phone,
                amount: params.amount,
                reference: params.reference,
                description: params.description || `Payment for ${params.reference}`
            });

            return {
                success: true,
                message: response.data.message,
                transactionId: response.data.data.transactionId,
                status: response.data.data.status
            };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || 'Payment initiation failed');
        }
    }

    /**
     * Subscribe to real-time transaction updates
     */
    subscribeToUpdates(transactionId: string, callback: (status: TransactionStatus) => void): () => void {
        // Initialize socket connection if not already active
        if (!this.socket) {
            // Connect to the root URL (remove /api/v1)
            const socketUrl = this.config.baseUrl?.replace('/api/v1', '') || '';
            this.socket = io(socketUrl, {
                transports: ['websocket'],
                autoConnect: true
            });
        }

        // Join the transaction room
        this.socket.emit('join-transaction', transactionId);

        // Listen for updates
        const listener = (data: any) => {
            if (data.transactionId === transactionId) {
                callback(data);
            }
        };

        this.socket.on('transaction-update', listener);

        // Return cleanup function
        return () => {
            if (this.socket) {
                this.socket.off('transaction-update', listener);
                // Optional: disconnect if no more listeners, but keeping it open is usually fine
            }
        };
    }

    /**
     * Manually check transaction status
     */
    async getStatus(transactionId: string): Promise<TransactionStatus> {
        try {
            const response = await this.api.get(`/transactions/${transactionId}`);
            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get status');
        }
    }
}
