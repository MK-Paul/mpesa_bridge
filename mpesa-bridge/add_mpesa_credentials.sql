-- Add M-Pesa Production Credentials to Projects table
-- Run this in Supabase SQL Editor

ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "short_code" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "consumer_key" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "consumer_secret" TEXT;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "passkey" TEXT;

-- Success message
SELECT 'M-Pesa credentials columns added successfully!' as message;
