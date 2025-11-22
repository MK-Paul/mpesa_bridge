-- Complete Migration for M-Pesa Bridge
-- Run this in Supabase SQL Editor

-- 1. Create ApiCall table (for API usage tracking)
CREATE TABLE IF NOT EXISTS "api_calls" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "endpoint" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "status" INTEGER NOT NULL DEFAULT 200,
  "duration" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "api_calls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 2. Create Role and UserStatus enums (for Admin Dashboard)
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BANNED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Add role and status columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "Role" NOT NULL DEFAULT 'USER';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- 4. Verify Environment enum exists (for Sandbox Mode)
DO $$ BEGIN
  CREATE TYPE "Environment" AS ENUM ('LIVE', 'SANDBOX');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 5. Add environment column to transactions (if not exists)
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "environment" "Environment" NOT NULL DEFAULT 'LIVE';

-- 6. Add test keys to projects table (if not exists)
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "test_public_key" TEXT UNIQUE;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "test_secret_key" TEXT UNIQUE;

-- Success message
SELECT 'Migration completed successfully!' as message;

-- To set yourself as admin, run:
-- UPDATE "users" SET "role" = 'ADMIN' WHERE "email" = 'your@email.com';
