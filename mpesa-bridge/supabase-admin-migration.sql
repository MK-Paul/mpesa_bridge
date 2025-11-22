-- Add Role and UserStatus enums
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BANNED');

-- Add role and status columns to users table
ALTER TABLE "users" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'USER';
ALTER TABLE "users" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- To manually set a user as admin, run:
-- UPDATE "users" SET "role" = 'ADMIN' WHERE "email" = 'youremail@example.com';
