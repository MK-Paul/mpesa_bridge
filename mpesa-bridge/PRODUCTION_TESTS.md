# Production API Testing - Postman

**Base URL:** `https://mpesa-bridge-khh4.onrender.com`

---

## ✅ TEST 1: Health Check

**Verify API is running**

```
Method: GET
URL: https://mpesa-bridge-khh4.onrender.com
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "M-Pesa Bridge API is running 🚀",
  "version": "1.0.0"
}
```

---

## ✅ TEST 2: Create Project (Get API Keys)

**Create a project and get your authentication keys**

```
Method: POST
URL: https://mpesa-bridge-khh4.onrender.com/api/v1/projects

Headers:
  Content-Type: application/json

Body (JSON):
{
  "name": "My Production Shop",
  "callbackUrl": "https://mpesa-bridge-khh4.onrender.com/api/v1/callbacks/mpesa"
}
```

**Expected Response (201):**
```json
{
  "id": "clx123...",
  "name": "My Production Shop",
  "publicKey": "pk_abc123...",  ← SAVE THIS!
  "secretKey": "sk_xyz789...",   ← SAVE THIS!
  "callbackUrl": "https://mpesa-bridge-khh4.onrender.com/api/v1/callbacks/mpesa",
  "createdAt": "2025-11-22T12:00:00.000Z"
}
```

**⚠️ SAVE YOUR KEYS!** Copy `publicKey` - you'll need it for all payment tests.

---

## ✅ TEST 3: Payment Without API Key (Should Fail)

**Verify authentication is required**

```
Method: POST
URL: https://mpesa-bridge-khh4.onrender.com/api/v1/transactions/initiate

Headers:
  Content-Type: application/json
  (NO x-api-key header)

Body (JSON):
{
  "phone": "254794040157",
  "amount": 1
}
```

**Expected Response (401):**
```json
{
  "message": "Unauthorized: API Key missing"
}
```

✅ **Pass if you get 401 error**

---

## ✅ TEST 4: Phone Auto-Format (0794 → 254794)

**Test phone number sanitization with Kenyan format**

```
Method: POST
URL: https://mpesa-bridge-khh4.onrender.com/api/v1/transactions/initiate

Headers:
  Content-Type: application/json
  x-api-key: pk_abc123...  ← Use your publicKey from TEST 2

Body (JSON):
{
  "phone": "0794040157",  ← Kenyan format (missing 254)
  "amount": 1
}
```

**Expected Response (200):**
```json
{
  "status": "PENDING",
  "message": "STK Push sent successfully",
  "transactionId": "clx456...",
  "checkoutRequestId": "ws_CO_221120251200000001"
}
```

**📱 Check your phone - You should receive an STK Push notification!**

✅ **Pass if:**
- Response is 200
- Phone auto-converted from `0794040157` to `254794040157`
- STK Push received on phone

---

## ✅ TEST 5: Phone with Spaces (Auto-Clean)

**Test that spaces are removed**

```
Method: POST
URL: https://mpesa-bridge-khh4.onrender.com/api/v1/transactions/initiate

Headers:
  Content-Type: application/json
  x-api-key: pk_abc123...

Body (JSON):
{
  "phone": "254 794 040 157",  ← With spaces
  "amount": 1
}
```

**Expected Response (200):**
```json
{
  "status": "PENDING",
  "message": "STK Push sent successfully"
}
```

✅ **Pass if spaces are removed and STK Push is sent**

---

## ✅ TEST 6: International Format (+254)

**Test + prefix is removed**

```
Method: POST
URL: https://mpesa-bridge-khh4.onrender.com/api/v1/transactions/initiate

Headers:
  Content-Type: application/json
  x-api-key: pk_abc123...

Body (JSON):
{
  "phone": "+254794040157",  ← International format
  "amount": 1
}
```

**Expected Response (200):**
```json
{
  "status": "PENDING",
  "message": "STK Push sent successfully"
}
```

✅ **Pass if + is removed and payment initiates**

---

## ✅ TEST 7: Invalid Phone (Too Short)

**Test validation rejects invalid phone**

```
Method: POST
URL: https://mpesa-bridge-khh4.onrender.com/api/v1/transactions/initiate

Headers:
  Content-Type: application/json
  x-api-key: pk_abc123...

Body (JSON):
{
  "phone": "254794",  ← Too short
  "amount": 1
}
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "phone",
      "message": "Phone number must be a valid Kenyan number (254XXXXXXXXX)"
    }
  ]
}
```

✅ **Pass if validation error is returned**

---

## ✅ TEST 8: Amount Too High (Max 150,000)

**Test amount validation**

```
Method: POST
URL: https://mpesa-bridge-khh4.onrender.com/api/v1/transactions/initiate

Headers:
  Content-Type: application/json
  x-api-key: pk_abc123...

Body (JSON):
{
  "phone": "254794040157",
  "amount": 200000  ← Exceeds max (150,000)
}
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be between 1 and 150,000 KES"
    }
  ]
}
```

✅ **Pass if validation error is returned**

---

## ✅ TEST 9: Negative Amount

**Test negative amounts are rejected**

```
Method: POST
URL: https://mpesa-bridge-khh4.onrender.com/api/v1/transactions/initiate

Headers:
  Content-Type: application/json
  x-api-key: pk_abc123...

Body (JSON):
{
  "phone": "254794040157",
  "amount": -50  ← Negative
}
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be between 1 and 150,000 KES"
    }
  ]
}
```

✅ **Pass if validation error is returned**

---

## ✅ TEST 10: Invalid Project Name (Too Short)

**Test project name validation**

```
Method: POST
URL: https://mpesa-bridge-khh4.onrender.com/api/v1/projects

Headers:
  Content-Type: application/json

Body (JSON):
{
  "name": "AB",  ← Only 2 chars (min is 3)
  "callbackUrl": "https://example.com/callback"
}
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Project name must be between 3 and 100 characters"
    }
  ]
}
```

✅ **Pass if validation error is returned**

---

## 📊 Test Results Summary

| Test | Feature | Status |
|------|---------|--------|
| 1 | Health check | ⬜ |
| 2 | Project creation | ⬜ |
| 3 | API key auth | ⬜ |
| 4 | Phone auto-format (07) | ⬜ |
| 5 | Phone spaces removed | ⬜ |
| 6 | Phone + prefix removed | ⬜ |
| 7 | Invalid phone rejected | ⬜ |
| 8 | Amount max validation | ⬜ |
| 9 | Negative amount rejected | ⬜ |
| 10 | Project name validation | ⬜ |

**Check ✅ as you complete each test!**

---

## 🎯 Success Criteria

**All Phase 2 Features Working:**
- ✅ API Key Authentication
- ✅ Phone Number Auto-Formatting
- ✅ Request Validation (phone, amount)
- ✅ Error Handling
- ✅ STK Push Initiation

**When all tests pass, you're PRODUCTION-READY!** 🎉

---

## 📱 Real Payment Test

Want to test a real small payment?

```
{
  "phone": "YOUR_REAL_NUMBER",
  "amount": 1  ← Just 1 KES
}
```

You'll get STK Push → Enter PIN → Payment completes → Callback received!

---

## 🚨 Troubleshooting

**STK Push not received?**
- Check M-Pesa is active on the number
- Verify it's a Safaricom number
- Try with `amount: 10` (sometimes 1 KES fails)

**401 Unauthorized?**
- Verify you copied the correct `publicKey` from TEST 2
- Check `x-api-key` header is set

**Connection timeout?**
- Wait 30 seconds - Render free tier may sleep
- Try again - first request wakes the server

---

## ✅ After All Tests Pass

You can:
1. **Build JavaScript SDK** (Phase 3)
2. **Create Admin Dashboard** (Phase 4)
3. **Share with developers** to integrate

**Your API is live and secure!** 🔒🚀
