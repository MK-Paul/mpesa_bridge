# API Key Authentication - Quick Reference

## Overview
The `/api/v1/transactions/initiate` endpoint is now protected by API key authentication.

## How It Works
1. Client must include `x-api-key` header with their project's `publicKey`
2. Middleware validates the key against the database
3. If valid, the project is attached to the request
4. Transaction is automatically linked to the authenticated project

## Testing with Postman

### Step 1: Create a Project (Get Your API Key)
```
POST http://localhost:3000/api/v1/projects
Content-Type: application/json

{
  "name": "My Shop",
  "callbackUrl": "https://your-ngrok-url.ngrok-free.dev/api/v1/callbacks/mpesa"
}
```

**Response** (Save the `publicKey`):
```json
{
  "id": "...",
  "publicKey": "pk_abc123...",  ← Use this as your API key
  "secretKey": "sk_xyz789..."
}
```

### Step 2: Initiate Payment (With API Key)
```
POST http://localhost:3000/api/v1/transactions/initiate
Content-Type: application/json
x-api-key: pk_abc123...  ← Add this header

{
  "phone": "254794040157",
  "amount": 10,
  "reference": "Order123"
}
```

**Note**: You NO LONGER need to include `projectId` in the request body. The system automatically uses the project linked to your API key.

## Error Responses

### Missing API Key
```json
{
  "message": "Unauthorized: API Key missing"
}
```

### Invalid API Key
```json
{
  "message": "Unauthorized: Invalid API Key"
}
```

## Security Note
- The `publicKey` acts as your API key
- The `secretKey` is reserved for future webhook signature verification
- Never expose your keys in client-side code (web browsers)
- Regenerate keys if they are compromised

## What Changed
- ✅ Before: Anyone could call `/initiate` without authentication  
- ✅ Now: Must provide valid `x-api-key` header
- ✅ `projectId` automatically determined from API key
- ✅ Prevents unauthorized transaction creation
