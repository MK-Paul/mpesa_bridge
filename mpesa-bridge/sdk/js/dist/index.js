"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpesaBridge = void 0;
const axios_1 = __importDefault(require("axios"));
const socket_io_client_1 = require("socket.io-client");
class MpesaBridge {
    constructor(config) {
        this.socket = null;
        this.apiKey = config.apiKey;
        // Default to the deployed Render URL if not provided
        this.baseUrl = config.baseUrl || 'https://mpesa-bridge-khh4.onrender.com/api/v1';
        this.client = axios_1.default.create({
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
    async pay(data) {
        try {
            const response = await this.client.post('/transactions/initiate', data);
            return response.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.error || error.message);
        }
    }
    /**
     * Get transaction status
     */
    async getStatus(transactionId) {
        try {
            const response = await this.client.get(`/transactions/status/${transactionId}`);
            return response.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.error || error.message);
        }
    }
    /**
     * Subscribe to real-time payment updates via WebSocket
     */
    subscribeToUpdates(transactionId, onUpdate) {
        // Connect to the root URL (remove /api/v1)
        const socketUrl = this.baseUrl.replace('/api/v1', '');
        this.socket = (0, socket_io_client_1.io)(socketUrl, {
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
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}
exports.MpesaBridge = MpesaBridge;
