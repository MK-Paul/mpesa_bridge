export interface Transaction {
    id: string;
    amount: number;
    phoneNumber: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    mpesaReceipt?: string | null;
    createdAt: string;
    updatedAt: string;
    failureReason?: string | null;
}

export interface Project {
    id: string;
    name: string;
    publicKey: string;
    secretKey: string;
    webhookUrl?: string;
    webhookSecret?: string;
    createdAt: string;
}
