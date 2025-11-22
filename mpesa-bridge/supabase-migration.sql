-- PostgreSQL Migration for Supabase
-- Run this in Supabase SQL Editor

-- CreateTable: projects
CREATE TABLE IF NOT EXISTS "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "public_key" TEXT NOT NULL UNIQUE,
    "secret_key" TEXT NOT NULL UNIQUE,
    "callback_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable: transactions
CREATE TABLE IF NOT EXISTS "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "merchant_request_id" TEXT UNIQUE,
    "checkout_request_id" TEXT UNIQUE,
    "amount" DOUBLE PRECISION NOT NULL,
    "phone_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "source" TEXT NOT NULL DEFAULT 'DIRECT_API',
    "metadata" TEXT,
    "mpesa_receipt" TEXT,
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transactions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "transactions_project_id_idx" ON "transactions"("project_id");
CREATE INDEX IF NOT EXISTS "transactions_status_idx" ON "transactions"("status");
