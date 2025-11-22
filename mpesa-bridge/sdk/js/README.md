# M-Pesa Bridge SDK (JavaScript/TypeScript)

The official JavaScript SDK for integrating M-Pesa payments via the M-Pesa Bridge API.
Supports **Node.js**, **Web Browsers**, and **React Native**.

## 📦 Installation

```bash
npm install mpesa-bridge-sdk
# or
yarn add mpesa-bridge-sdk
```

## 🚀 Usage

### 1. Initialize the Client

```javascript
import { MpesaBridge } from 'mpesa-bridge-sdk';

const mpesa = new MpesaBridge({
    apiKey: 'pk_live_your_public_key_here',
    // Optional: Override base URL for testing
    // baseUrl: 'http://localhost:3000/api/v1' 
});
```

### 2. Initiate Payment (STK Push)

```javascript
try {
    const response = await mpesa.pay({
        phone: '0712345678', // Automatically formatted to 254...
        amount: 100,
        reference: 'Order #123'
    });

    console.log('Payment Initiated:', response.transactionId);
} catch (error) {
    console.error('Payment Failed:', error.message);
}
```

### 3. Real-time Updates (WebSocket)

Listen for payment completion events in real-time without polling.

```javascript
// Subscribe to updates for a specific transaction
mpesa.subscribeToUpdates(transactionId, (data) => {
    console.log('Payment Update:', data);
    
    if (data.status === 'COMPLETED') {
        console.log('✅ Payment Successful!');
        console.log('Receipt:', data.mpesaReceipt);
    } else if (data.status === 'FAILED') {
        console.error('❌ Payment Failed:', data.failureReason);
    }
});

// Don't forget to disconnect when done (e.g., component unmount)
// mpesa.disconnect();
```

### 4. Check Status Manually

```javascript
const status = await mpesa.getStatus(transactionId);
console.log('Current Status:', status.status);
```

## 📱 React Native Example

```javascript
import React, { useState } from 'react';
import { Button, Alert } from 'react-native';
import { MpesaBridge } from 'mpesa-bridge-sdk';

const mpesa = new MpesaBridge({ apiKey: 'pk_live_...' });

export default function PaymentScreen() {
    const handlePay = async () => {
        try {
            const res = await mpesa.pay({ phone: '0712345678', amount: 1 });
            
            // Listen for success
            mpesa.subscribeToUpdates(res.transactionId, (update) => {
                if (update.status === 'COMPLETED') {
                    Alert.alert('Success', 'Payment Received!');
                    mpesa.disconnect();
                }
            });
            
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return <Button title="Pay with M-Pesa" onPress={handlePay} />;
}
```

## 🛠️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | Required | Your Public API Key from the dashboard |
| `baseUrl` | string | Production URL | Override for local development |

## 📄 License

MIT
