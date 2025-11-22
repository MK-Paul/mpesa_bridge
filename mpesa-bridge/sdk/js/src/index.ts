import axios, { AxiosInstance } from 'axios';
import { io, Socket } from 'socket.io-client';

export interface MpesaConfig {
    apiKey: string;
    baseUrl?: string; // Optional, defaults to production URL
}

export interface PaymentRequest {
    phone: string;
    amount: number;
    reference?: string;
}

export interface PaymentResponse {
    status: string;
    message: string;
    transactionId: string;
    providerData?: any;
}

export class MpesaBridge {
    private apiKey: string;
    private baseUrl: string;
    private client: AxiosInstance;
    private socket: Socket | null = null;

    constructor(config: MpesaConfig) {
        this.apiKey = config.apiKey;
        // Default to the deployed Render URL if not provided
        this.baseUrl = config.baseUrl || 'https://mpesa-bridge-khh4.onrender.com/api/v1';

        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey
            }
        });
    }

    /**
     * Initiate an STK Push payment
     */
    public async pay(data: PaymentRequest): Promise<PaymentResponse> {
        try {
            const response = await this.client.post('/transactions/initiate', data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || error.message);
        }
    }

    /**
     * Get transaction status
     */
    public async getStatus(transactionId: string): Promise<any> {
        try {
            const response = await this.client.get(`/transactions/status/${transactionId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || error.message);
        }
    }

    /**
     * Subscribe to real-time payment updates via WebSocket
     */
    public subscribeToUpdates(transactionId: string, onUpdate: (data: any) => void) {
        // Connect to the root URL (remove /api/v1)
        const socketUrl = this.baseUrl.replace('/api/v1', '');

        this.socket = io(socketUrl, {
            transports: ['websocket'],
            query: { apiKey: this.apiKey }
        });

        this.socket.on('connect', () => {
            console.log('🔌 Connected to M-Pesa Bridge Real-time');
            this.socket?.emit('subscribe', transactionId);
        });

        this.socket.on(`transaction:${transactionId}`, (data) => {
            onUpdate(data);
        });

        this.socket.on('error', (error) => {
            console.error('WebSocket Error:', error);
        });
    }

    /**
     * Disconnect WebSocket
     */
    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}
