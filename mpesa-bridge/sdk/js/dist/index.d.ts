export interface MpesaConfig {
    apiKey: string;
    baseUrl?: string;
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
export declare class MpesaBridge {
    private apiKey;
    private baseUrl;
    private client;
    private socket;
    constructor(config: MpesaConfig);
    /**
     * Initiate an STK Push payment
     */
    pay(data: PaymentRequest): Promise<PaymentResponse>;
    /**
     * Get transaction status
     */
    getStatus(transactionId: string): Promise<any>;
    /**
     * Subscribe to real-time payment updates via WebSocket
     */
    subscribeToUpdates(transactionId: string, onUpdate: (data: any) => void): void;
    /**
     * Disconnect WebSocket
     */
    disconnect(): void;
}
