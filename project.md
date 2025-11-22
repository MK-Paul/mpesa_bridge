This is a complete **Developer Documentation** draft for your project. This is exactly what you would host at `docs.mpesabridge.com` to show investors or users.

It is professional, detailed, and covers the entire "Unified Brain" architecture we discussed.

-----

# 📘 M-Pesa Bridge Developer Documentation

**Version:** 1.0.0 | **Status:** Stable | **Base URL:** `https://api.mpesabridge.com/v1`

## 1\. Overview & Architecture

M-Pesa Bridge is a unified payment middleware that allows developers to integrate M-Pesa STK Push into **Web** and **Mobile** applications in minutes, without managing callback URLs, SSL certificates, or server downtime.

### The "Unified Brain" Architecture

We utilize a **Server-Centric** architecture. Your application (Web or Mobile) does not communicate with Safaricom directly.

1.  **Initiation:** Client sends a request to **M-Pesa Bridge**.
2.  **Processing:** Bridge holds the state and talks to Safaricom.
3.  **Confirmation:** Bridge receives the callback and updates the transaction status.
4.  **Synchronization:** Client (Web/Mobile) receives the status update via **WebSocket** (Web) or **Polling** (Mobile).

-----

## 2\. Authentication

All requests must be authenticated using your **Project Keys**. You can obtain these from the [Developer Dashboard](https://www.google.com/search?q=%23).

| Key Type | Variable Name | Safe for Client Side? | Use Case |
| :--- | :--- | :--- | :--- |
| **Public Key** | `pk_live_...` | ✅ YES | Used in Mobile Apps & Frontend JS. |
| **Secret Key** | `sk_live_...` | ❌ NO | Used ONLY on your backend server (if applicable). |

**Security Header Example:**

```http
Authorization: Bearer pk_live_123456789
```

-----

## 3\. Database Schema (The Backbone)

This is how we store data to ensure cross-platform tracking.

**Table: `transactions`**

```sql
| Column Name         | Type        | Description                                  |
| :---                | :---        | :---                                         |
| id                  | UUID        | Primary Key (e.g., '550e8400-e29b...')       |
| project_id          | String      | Links transaction to your specific app.      |
| merchant_request_id | String      | The unique ID from Safaricom (Tracking).     |
| checkout_request_id | String      | The unique ID from Safaricom (STK Push).     |
| amount              | Decimal     | Transaction amount (e.g., 1500.00).          |
| phone_number        | String      | Normalized format (2547XXXXXXXX).            |
| status              | Enum        | PENDING, COMPLETED, FAILED, CANCELLED.       |
| source              | Enum        | 'WEB_WIDGET', 'MOBILE_SDK', 'DIRECT_API'.    |
| metadata            | JSON        | Custom data (e.g., { "order_id": "55" }).    |
| created_at          | Timestamp   | When the user clicked "Pay".                 |
```

-----

## 4\. API Reference (REST)

If you are not using our SDKs, you can use the raw HTTP endpoints.

### A. Initiate Payment

**Endpoint:** `POST /transactions/initiate`
**Description:** Triggers the STK Push on the user's phone.

**Request Body:**

```json
{
  "phone": "0712345678",       // We automatically format this to 254...
  "amount": 1500,
  "reference": "Order #1029",  // Your internal order ID
  "callback_url": "https..."   // (Optional) We can hit your server too.
}
```

**Response (200 OK):**

```json
{
  "status": "PENDING",
  "transaction_id": "tx_998877", 
  "message": "STK Push sent to user."
}
```

### B. Check Status (Polling)

**Endpoint:** `GET /transactions/status/{transaction_id}`
**Description:** Mobile apps call this every 3 seconds to check if the user paid.

**Response:**

```json
{
  "id": "tx_998877",
  "status": "COMPLETED",       // This changes from PENDING -> COMPLETED
  "mpesa_receipt": "QKH12345", // The proof of payment
  "paid_at": "2025-11-21T10:00:00Z"
}
```

-----

## 5\. SDK Documentation

### 📱 Mobile SDK (Flutter)

**Installation:**
Add this to your `pubspec.yaml`:

```yaml
dependencies:
  mpesa_bridge: ^1.0.0
```

**Usage (Dynamic Implementation):**

```dart
import 'package:mpesa_bridge/mpesa_bridge.dart';

// 1. Initialize (Do this in main.dart)
void main() {
  MpesaBridge.init(publicKey: "pk_live_12345");
  runApp(MyApp());
}

// 2. Trigger Payment (Inside your Checkout Screen)
void handleCheckout(String userPhone, double cartTotal) async {
  
  try {
    MpesaPayment result = await MpesaBridge.pay(
      phone: userPhone,          // Dynamic Variable
      amount: cartTotal,         // Dynamic Variable
      reference: "ORDER-555",    // Dynamic Variable
      showLoadingModal: true     // We show a 'Waiting' spinner for you
    );

    if (result.isSuccessful) {
      print("Success! Receipt: ${result.receipt}");
      // Navigate to Success Screen
    } else {
      print("Failed: ${result.reason}"); 
      // Show Error: "User cancelled" or "Insufficient Funds"
    }
  } catch (e) {
    print("Network Error: $e");
  }
}
```

### 🌐 Web Widget (HTML/JS)

**Installation:**
Add this script to the `<head>` of your payment page.

```html
<script src="https://cdn.mpesabridge.com/v1/widget.js"></script>
```

**Usage:**

```javascript
// Call this when the user clicks "Pay Now"
MpesaBridge.open({
  key: 'pk_live_12345',
  amount: 1500,
  phone: '0712345678',
  reference: 'Order-555',
  
  onSuccess: function(data) {
    // Data contains: { receipt: "QKH...", id: "tx_..." }
    window.location.href = "/success-page";
  },
  
  onError: function(error) {
    alert("Payment Failed: " + error.message);
  },
  
  onClose: function() {
    console.log("User closed the popup");
  }
});
```

-----

## 6\. Error Codes (Standardized)

We translate Safaricom's complex errors into simple codes for your app to handle.

| Code | Message | Meaning | Suggested User Action |
| :--- | :--- | :--- | :--- |
| `ERR_USER_CANCEL` | Request cancelled by user | User denied the STK prompt. | "You cancelled the request. Please try again." |
| `ERR_INSUFFICIENT` | Insufficient funds | User wallet is low. | "Please top up your M-Pesa and try again." |
| `ERR_TIMEOUT` | Request expired | User took too long (\>20s). | "We didn't receive a PIN. Did you see the prompt?" |
| `ERR_NETWORK` | DS timeout | Safaricom is down. | "M-Pesa is currently slow. Please wait 2 minutes." |

-----

## 7\. Implementation Checklist

To integrate **M-Pesa Bridge** successfully:

  * [ ] Create an account at https://www.google.com/search?q=dashboard.mpesabridge.com.
  * [ ] Link your Paybill/Till Number (requires Consumer Key/Secret).
  * [ ] Copy your `pk_live_...` Public Key.
  * [ ] Install the SDK (Mobile) or Script (Web).
  * [ ] Test with a small amount (KES 10).
  * [ ] **Go Live!**

-----

## 8. Webhooks & Security

When a transaction completes, we send a POST request to your `callback_url`.

**Payload:**
```json
{
  "event": "transaction.completed",
  "data": {
    "id": "tx_998877",
    "status": "COMPLETED",
    "amount": 1500,
    "mpesa_receipt": "QKH12345"
  }
}
```

**Verifying Webhooks:**
To prevent spoofing, verify the `X-Bridge-Signature` header using your **Secret Key**.

-----

## 9. Testing (Sandbox)

Use your Test Keys (`pk_test_...`) to simulate transactions without using real money.

| Amount | Simulation Result |
| :--- | :--- |
| `100` | **Success** (Standard flow) |
| `101` | **Failed** (Insufficient Funds) |
| `102` | **Failed** (User Cancelled) |

-----

## 10. Roadmap & FAQ

**Q: Can I process refunds via the API?**
A: In Version 1.0, refunds must be initiated manually via the Safaricom Business Portal. Automated API-based reversals are planned for **Version 2.0** to ensure maximum security during the initial rollout.