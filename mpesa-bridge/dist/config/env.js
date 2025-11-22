"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL,
    appSecret: process.env.APP_SECRET || 'default_secret',
    mpesa: {
        consumerKey: process.env.MPESA_CONSUMER_KEY || '',
        consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
        passkey: process.env.MPESA_PASSKEY || '',
        shortcode: process.env.MPESA_SHORTCODE || '174379',
        callbackUrl: process.env.MPESA_CALLBACK_URL || '',
    }
};
