export interface MpesaConfig {
    apiKey: string;
    baseUrl?: string;
}

export interface PaymentParams {
    phone: string;
    amount: number;
    reference: string;
    description?: string;
}

export interface PaymentResponse {
    success: boolean;
    message: string;
    transactionId: string;
    status: string;
}

export interface TransactionStatus {
    transactionId: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    mpesaReceipt?: string;
    message?: string;
    amount?: number;
    phoneNumber?: string;
    reference?: string;
}
