import dotenv from 'dotenv';

dotenv.config();

export const config = {
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
