"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpesaService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
class MpesaService {
    /**
     * Generates an OAuth Access Token from Safaricom
     */
    static getAccessToken(creds) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const consumerKey = (creds === null || creds === void 0 ? void 0 : creds.consumerKey) || env_1.config.mpesa.consumerKey;
            const consumerSecret = (creds === null || creds === void 0 ? void 0 : creds.consumerSecret) || env_1.config.mpesa.consumerSecret;
            const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
            console.log('🔐 M-Pesa Auth Request:');
            console.log('  URL:', `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`);
            console.log('  Consumer Key:', (consumerKey === null || consumerKey === void 0 ? void 0 : consumerKey.substring(0, 10)) + '...');
            console.log('  Environment:', env_1.config.env);
            try {
                const response = yield axios_1.default.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
                    headers: {
                        Authorization: `Basic ${credentials}`,
                    },
                });
                console.log('✅ M-Pesa Auth Success!');
                return response.data.access_token;
            }
            catch (error) {
                console.error('❌ M-Pesa Auth Failed!');
                console.error('  Status Code:', (_a = error.response) === null || _a === void 0 ? void 0 : _a.status);
                console.error('  Status Text:', (_b = error.response) === null || _b === void 0 ? void 0 : _b.statusText);
                console.error('  Error Data:', JSON.stringify((_c = error.response) === null || _c === void 0 ? void 0 : _c.data, null, 2));
                console.error('  Request URL:', (_d = error.config) === null || _d === void 0 ? void 0 : _d.url);
                console.error('  Full Error:', error.message);
                throw new Error('Failed to authenticate with M-Pesa');
            }
        });
    }
    /**
     * Triggers the STK Push (Lipa na M-Pesa Online)
     */
    static sendSTKPush(phone, amount, reference, creds) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const token = yield this.getAccessToken(creds);
            const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
            const shortCode = (creds === null || creds === void 0 ? void 0 : creds.shortCode) || env_1.config.mpesa.shortcode;
            const passkey = (creds === null || creds === void 0 ? void 0 : creds.passkey) || env_1.config.mpesa.passkey;
            const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
            const payload = {
                BusinessShortCode: shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: amount,
                PartyA: phone, // The phone sending money
                PartyB: shortCode, // The paybill receiving money
                PhoneNumber: phone,
                CallBackURL: env_1.config.mpesa.callbackUrl,
                AccountReference: reference,
                TransactionDesc: `Payment for ${reference}`,
            };
            try {
                const response = yield axios_1.default.post(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                return response.data;
            }
            catch (error) {
                console.error('STK Push Error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                throw new Error('Failed to initiate STK Push');
            }
        });
    }
}
exports.MpesaService = MpesaService;
MpesaService.baseUrl = env_1.config.env === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
