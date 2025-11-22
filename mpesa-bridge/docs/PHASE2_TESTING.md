# Phase 2 Security Testing Guide - Postman

## 🧪 Complete Test Suite for All Phase 2 Features

---

## Prerequisites

1. ✅ Server running: `npm run dev` (port 3000)
2. ✅ Postman installed
3. ✅ Have your M-Pesa test credentials in `.env`

---

## Test Suite Overview

| Test # | Feature | Expected Result |
|--------|---------|-----------------|
| 1 | Project Creation (Valid) | ✅ 201 Created |
| 2 | Project Creation (Invalid Name) | ❌ 400 Validation Error |
| 3 | Project Creation (Rate Limit) | ❌ 429 Too Many Requests |
| 4 | Payment: No API Key | ❌ 401 Unauthorized |
| 5 | Payment: Invalid API Key | ❌ 401 Unauthorized |
| 6 | Payment: Phone Auto-Format (0794...) | ✅ 200 Success |
| 7 | Payment: Phone Auto-Format (+254...) | ✅ 200 Success |
| 8 | Payment: Phone with Spaces | ✅ 200 Success |
| 9 | Payment: Invalid Phone (Too Short) | ❌ 400 Validation Error |
| 10 | Payment: Invalid Amount (Too High) | ❌ 400 Validation Error |
| 11 | Payment: Invalid Amount (Negative) | ❌ 400 Validation Error |
| 12 | Payment: Rate Limiting | ❌ 429 Too Many Requests |
| 13 | Request Signature (Optional) | ✅ 200 Success |

---

## 🧪 TEST 1: Create Project (Valid)

**Purpose:** Verify project creation works and get API keys

```
Method: POST
URL: http://localhost:3000/api/v1/projects
Headers:
  Content-Type: application/json

Body (JSON):
{
  "name": "Test Shop",
  "callbackUrl": "https://example.com/callback"
}
```

**Expected Response (201):**
```json
{
  "id": "clx...",
  "name": "Test Shop",
  "publicKey": "pk_...",  ← SAVE THIS
  "secretKey": "sk_...",   ← SAVE THIS
  "callbackUrl": "https://example.com/callback"
}
```

✅ **Save the `publicKey` - you'll need it for all payment tests!**

---

## 🧪 TEST 2: Create Project (Invalid - Short Name)

**Purpose:** Test validation rejects short project names

```
Method: POST
URL: http://localhost:3000/api/v1/projects
Headers:
  Content-Type: application/json

Body (JSON):
{
  "name": "AB",  ← Only 2 characters (min is 3)
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

✅ **Validation working!**

---

## 🧪 TEST 3: Project Creation Rate Limit

**Purpose:** Test rate limiting (5 projects per hour)

```
Run TEST 1 six times in a row (same request 6 times)
```

**Expected:**
- First 5 requests: ✅ 201 Created
- 6th request: ❌ 429 "Too many project creation attempts"

**Response (429):**
```json
{
  "message": "Too many project creation attempts. Please try again later."
}
```

✅ **Rate limiting working!**

---

## 🧪 TEST 4: Payment Without API Key

**Purpose:** Verify authentication is required

```
Method: POST
URL: http://localhost:3000/api/v1/transactions/initiate
Headers:
  Content-Type: application/json
  (NO x-api-key header)

Body (JSON):
{
  "phone": "254794040157",
  "amount": 10
}
```

**Expected Response (401):**
```json
{
  "message": "Unauthorized: API Key missing"
}
```

✅ **Authentication working!**

---

## 🧪 TEST 5: Payment With Invalid API Key

**Purpose:** Verify invalid keys are rejected

```
Method: POST
URL: http://localhost:3000/api/v1/transactions/initiate
Headers:
  Content-Type: application/json
  x-api-key: pk_invalid_12345

Body (JSON):
{
  "phone": "254794040157",
  "amount": 10
}
```

**Expected Response (401):**
```json
{
  "message": "Unauthorized: Invalid API Key"
}
```

✅ **Key validation working!**

---

## 🧪 TEST 6: Phone Auto-Format (0794...)

**Purpose:** Test phone sanitization with 07 prefix

```
Method: POST
URL: http://localhost:3000/api/v1/transactions/initiate
Headers:
  Content-Type: application/json
  x-api-key: pk_... (your real publicKey from TEST 1)

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
  "transactionId": "clx..."
}
```

✅ **Phone was auto-converted to 254794040157!**
✅ **Check your phone for STK Push!**

---

## 🧪 TEST 7: Phone Auto-Format (+254...)

**Purpose:** Test phone sanitization with + prefix

```
Method: POST
URL: http://localhost:3000/api/v1/transactions/initiate
Headers:
  Content-Type: application/json
  x-api-key: pk_...

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

✅ **+ was removed, converted to 254794040157!**

---

## 🧪 TEST 8: Phone With Spaces

**Purpose:** Test phone sanitization removes spaces

```
Method: POST
URL: http://localhost:3000/api/v1/transactions/initiate
Headers:
  Content-Type: application/json
  x-api-key: pk_...

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

✅ **Spaces removed, converted to 254794040157!**

---

## 🧪 TEST 9: Invalid Phone (Too Short)

**Purpose:** Test validation rejects invalid phone numbers

```
Method: POST
URL: http://localhost:3000/api/v1/transactions/initiate
Headers:
  Content-Type: application/json
  x-api-key: pk_...

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

✅ **Validation caught invalid phone!**

---

## 🧪 TEST 10: Invalid Amount (Too High)

**Purpose:** Test amount validation (max 150,000 KES)

```
Method: POST
URL: http://localhost:3000/api/v1/transactions/initiate
Headers:
  Content-Type: application/json
  x-api-key: pk_...

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

✅ **Amount validation working!**

---

## 🧪 TEST 11: Invalid Amount (Negative)

**Purpose:** Test amount validation rejects negative

```
Method: POST
URL: http://localhost:3000/api/v1/transactions/initiate
Headers:
  Content-Type: application/json
  x-api-key: pk_...

Body (JSON):
{
  "phone": "254794040157",
  "amount": -50  ← Negative amount
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

✅ **Negative amounts rejected!**

---

## 🧪 TEST 12: Payment Rate Limiting

**Purpose:** Test payment rate limit (50 per 15 minutes)

```
Make 51 payment requests in quick succession (use same request from TEST 6)
```

**Expected:**
- First 50 requests: ✅ 200 Success
- 51st request: ❌ 429 "Too many payment requests"

**Response (429):**
```json
{
  "message": "Too many payment requests. Please try again later."
}
```

✅ **Payment rate limiting working!**

---

## 🧪 TEST 13: Request Signature (Optional Extra Security)

**Purpose:** Test request signing with secretKey

### Step 1: Generate Signature (use Node.js console or online tool)

```javascript
const crypto = require('crypto');

const payload = { phone: "254794040157", amount: 10 };
const secretKey = "sk_..."; // Your secretKey from TEST 1

const signature = crypto
  .createHmac('sha256', secretKey)
  .update(JSON.stringify(payload))
  .digest('hex');

console.log(signature); // Copy this
```

### Step 2: Make Request with Signature

```
Method: POST
URL: http://localhost:3000/api/v1/transactions/initiate
Headers:
  Content-Type: application/json
  x-api-key: pk_...
  x-signature: <paste generated signature here>

Body (JSON):
{
  "phone": "254794040157",
  "amount": 10
}
```

**Expected Response (200):**
```json
{
  "status": "PENDING",
  "message": "STK Push sent successfully"
}
```

✅ **Request signature verified!**
✅ **Logs will show: "Request signature verified for project..."**

---

## 📊 Test Results Checklist

| Test | Feature | Status |
|------|---------|--------|
| ✅ 1 | Project creation | PASS |
| ✅ 2 | Name validation | PASS |
| ✅ 3 | Project rate limit | PASS |
| ✅ 4 | API key required | PASS |
| ✅ 5 | Invalid key rejected | PASS |
| ✅ 6 | Phone auto-format (07) | PASS |
| ✅ 7 | Phone auto-format (+254) | PASS |
| ✅ 8 | Phone spaces removed | PASS |
| ✅ 9 | Invalid phone rejected | PASS |
| ✅ 10 | Amount max validation | PASS |
| ✅ 11 | Negative amount rejected | PASS |
| ✅ 12 | Payment rate limit | PASS |
| ✅ 13 | Request signature | PASS |

---

## 🎯 Quick Test Summary

**Must Pass (Critical):**
- Tests 1, 4, 5, 6, 10 ← These are essential

**Should Pass (Important):**
- Tests 2, 3, 7, 8, 9, 11, 12 ← Good to verify

**Nice to Have (Optional):**
- Test 13 ← Extra security layer

---

## 📝 Notes

1. **Rate Limits:** Wait 15-60 minutes to reset if you hit limits
2. **Phone Number:** Use your real Kenyan number for STK Push tests
3. **Logs:** Check `logs/error.log` if anything fails
4. **Callback/IP Whitelist:** Will test when deployed to Render

---

## ✅ All Tests Pass = Phase 2 VERIFIED! 🎉
