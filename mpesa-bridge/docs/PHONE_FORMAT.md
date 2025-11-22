# Phone Number Auto-Format Examples

## ✅ Supported Formats (All Convert to `254XXXXXXXXX`)

### 1. Standard Kenyan Format (0 prefix)
```
Input:  0794040157
Output: 254794040157 ✅
```

### 2. International Format (+ prefix)
```
Input:  +254794040157
Output: 254794040157 ✅
```

### 3. Already Correct Format
```
Input:  254794040157
Output: 254794040157 ✅ (no change)
```

### 4. With Spaces
```
Input:  254 794 040 157
Output: 254794040157 ✅
```

### 5. With Dashes
```
Input:  254-794-040-157
Output: 254794040157 ✅
```

### 6. Safaricom Format (07)
```
Input:  0794040157
Output: 254794040157 ✅
```

### 7. Airtel Format (01)
```
Input:  0110123456
Output: 254110123456 ✅
```

---

## 🧪 Test in Postman

### Test Request:
```json
POST http://localhost:3000/api/v1/transactions/initiate
Headers:
  x-api-key: your-public-key
  Content-Type: application/json

Body:
{
  "phone": "0794040157",    ← Will auto-convert to 254794040157
  "amount": 10
}
```

### Expected Result:
✅ **Success!** Phone is automatically formatted and payment is initiated.

---

## ❌ Still Invalid (Will Reject)

These formats CANNOT be auto-fixed:

```
0794040157890  ← Too many digits
079404         ← Too few digits
255794040157   ← Wrong country code (Tanzania)
```

---

## 🔧 How It Works

**Order of Operations:**
1. **Sanitize** (clean up phone number) ← New!
2. **Validate** (check if valid format)
3. **Process** (initiate payment)

**Before:** Rejected `0794040157` with error
**Now:** Automatically converts to `254794040157` ✅

---

## 💡 User Experience

**Old Behavior:**
```
User enters: "0794 040 157"
Response: ❌ 400 Error "Phone must be 254..."
```

**New Behavior:**
```
User enters: "0794 040 157"
Auto-converts to: "254794040157"
Response: ✅ 200 Success "STK Push sent!"
```

**Much better UX!** 🎉
